// ==================== 配置 ====================
const DEBUG = false; // 调试日志开关：发布时 false，排查问题时改 true

const COOKIE_URL = "https://chatgpt.com/";
const COOKIE_NAME = "__Secure-next-auth.session-token";
const MAX_CHUNK_SIZE = 3900; // 留出余量

// ==================== 调试日志 ====================
function log(...args) {
  if (DEBUG) console.log("[TokenInjector]", ...args);
}

// ==================== Token 格式校验 ====================
// 兼容两种格式：
// - JWT：eyJxxx.eyJxxx.signature（3 段，均非空）
// - JWE：eyJxxx..iv.ciphertext.tag（5 段，dir 算法下 encrypted_key 段为空，故出现 ".."）
// ChatGPT 的 __Secure-next-auth.session-token 实为 JWE（alg=dir, enc=A256GCM）
function isValidToken(token) {
  if (typeof token !== "string" || token.length < 20) return false;
  if (!token.startsWith("eyJ")) return false;
  const parts = token.split(".");
  // 至少 2 段（header.payload）；JWE 为 5 段
  if (parts.length < 2) return false;
  // * 允许空段（JWE 的 encrypted_key 在 dir 算法下为空）
  const base64urlRe = /^[A-Za-z0-9_-]*$/;
  return parts.every((p) => base64urlRe.test(p));
}

// ==================== 消息监听 ====================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "injectToken" && message.token) {
    handleInjectToken(message.token)
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

// ==================== 核心逻辑：分片写入 Cookie ====================
async function handleInjectToken(token) {
  // 0. 校验 Token 格式（最后防线）
  if (!isValidToken(token)) {
    throw new Error("Token 格式不合法（应为以 eyJ 开头的 JWT 字符串）");
  }

  log("收到 Token，长度:", token.length);

  // 1. 删除旧 Cookie（包括可能存在的分片 Cookie）
  await removeOldCookies();

  // 2. 按 MAX_CHUNK_SIZE 分片（next-auth chunked cookie 机制）
  const chunks = [];
  for (let i = 0; i < token.length; i += MAX_CHUNK_SIZE) {
    chunks.push(token.slice(i, i + MAX_CHUNK_SIZE));
  }
  log("分片数量:", chunks.length, "各片长度:", chunks.map((c) => c.length));

  // 3. 逐片写入（含 domain 和 httpOnly，与真实 ChatGPT Cookie 一致）
  for (let i = 0; i < chunks.length; i++) {
    const cookieName = chunks.length > 1 ? COOKIE_NAME + "." + i : COOKIE_NAME;

    const cookieDetails = {
      url: COOKIE_URL,
      name: cookieName,
      value: chunks[i],
      domain: ".chatgpt.com",
      path: "/",
      secure: true,
      sameSite: "lax",
      httpOnly: true,
      expirationDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    };

    log("正在写入分片", i, "名称:", cookieName, "值长度:", chunks[i].length);

    const cookie = await chrome.cookies.set(cookieDetails);
    if (!cookie) {
      throw new Error("分片 " + i + " 写入失败（chrome.cookies.set 返回 null）");
    }
    log("分片", i, "写入成功");
  }

  // 4. 验证 Cookie 是否真正写入 Cookie 数据库
  const allCookies = await chrome.cookies.getAll({ domain: "chatgpt.com" });
  const sessionCookies = allCookies.filter(
    (c) => c.name.indexOf("__Secure-next-auth.session-token") === 0
  );
  log(
    "数据库中的 session Cookie:",
    sessionCookies.map((c) => ({
      name: c.name,
      valueLen: c.value.length,
      domain: c.domain,
      httpOnly: c.httpOnly,
      secure: c.secure,
    }))
  );

  if (sessionCookies.length === 0) {
    throw new Error("Cookie 验证失败：数据库中未找到 session Cookie");
  }

  // 5. 等待 500ms 确保 Cookie 写入完成
  await new Promise((r) => setTimeout(r, 500));

  // 6. 查询当前活跃 Tab 并执行重载/跳转
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];

  if (!currentTab || !currentTab.url) {
    // Cookie 已写入，但无活动标签页可刷新/跳转
    return { noTab: true };
  }

  if (currentTab.url.includes("chatgpt.com")) {
    await chrome.tabs.reload(currentTab.id);
    log("已刷新 ChatGPT 页面");
  } else {
    await chrome.tabs.update(currentTab.id, { url: COOKIE_URL });
    log("已跳转至 ChatGPT");
  }

  return {};
}

// ==================== 清理旧 Cookie（动态查询所有同名分片） ====================
async function removeOldCookies() {
  // 查询所有 __Secure-next-auth.session-token* Cookie（含历史分片 .0/.1/...）
  const allCookies = await chrome.cookies.getAll({ domain: "chatgpt.com" });
  const stale = allCookies.filter(
    (c) => c.name.indexOf("__Secure-next-auth.session-token") === 0
  );

  for (const c of stale) {
    try {
      await chrome.cookies.remove({ url: COOKIE_URL, name: c.name });
    } catch (_e) {
      // 单条删除失败不阻断流程
    }
  }

  // 兼容清理可能的测试 Cookie
  try {
    await chrome.cookies.remove({
      url: COOKIE_URL,
      name: "__Secure-next-auth.session-token-test",
    });
  } catch (_e) {
    // 忽略
  }

  log("旧 Cookie 已清理，共", stale.length, "条");
}
