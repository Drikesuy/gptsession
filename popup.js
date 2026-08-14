// ==================== 常量 ====================
const STORAGE_KEY = "token_history";
const STATUS_TIMEOUT = { success: 3000, info: 3000, error: 5000 };

// ==================== DOM 元素 ====================
const tokenInput = document.getElementById("tokenInput");
const injectBtn = document.getElementById("injectBtn");
const statusBox = document.getElementById("statusBox");
const historyGroup = document.getElementById("historyGroup");
const historySelect = document.getElementById("historySelect");
const deleteHistoryBtn = document.getElementById("deleteHistoryBtn");
const clearAllHistoryBtn = document.getElementById("clearAllHistoryBtn");
const copyTokenBtn = document.getElementById("copyTokenBtn");
const clearInputBtn = document.getElementById("clearInputBtn");

let statusTimer = null;

// ==================== 初始化 ====================
document.addEventListener("DOMContentLoaded", () => {
  loadHistory();
  autoFillFromClipboard();
});

// ==================== 工具函数 ====================
// 格式化时间戳为 MM-DD HH:mm
function formatTime(ts) {
  return new Date(ts).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 更新工具栏图标 badge 显示历史账号数量
function updateBadge(count) {
  try {
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#7b2ff7" });
  } catch (_e) {
    // action API 不可用时静默（极端兼容场景）
  }
}

// ==================== 剪贴板自动读取 ====================
async function autoFillFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && text.trim().startsWith("eyJ")) {
      tokenInput.value = text.trim();
      showStatus("已自动抓取剪贴板 Token", "info");
    }
  } catch (_e) {
    // 静默捕获异常，不抛错卡死
  }
}

// ==================== 状态提示（自动消失） ====================
function showStatus(msg, type) {
  statusBox.style.display = "block";
  statusBox.textContent = msg;
  statusBox.className = "status-box " + type;
  if (statusTimer) clearTimeout(statusTimer);
  const delay = STATUS_TIMEOUT[type] || 4000;
  statusTimer = setTimeout(hideStatus, delay);
}

function hideStatus() {
  statusBox.style.display = "none";
  if (statusTimer) {
    clearTimeout(statusTimer);
    statusTimer = null;
  }
}

// ==================== Token 清洗 ====================
// 返回 { token, label, message } 或 null
function cleanToken(raw) {
  let cleaned = raw.trim();
  let label = "";
  let message = "";

  // 尝试解析为 JSON（用户可能粘贴了 session API 的完整响应）
  try {
    const json = JSON.parse(cleaned);
    if (json.user && json.user.email) {
      label = json.user.email;
    } else if (json.user && json.user.name) {
      label = json.user.name;
    }

    // 优先提取 sessionToken（即 __Secure-next-auth.session-token 的值）
    if (json.sessionToken && typeof json.sessionToken === "string") {
      message = "已从 JSON 中自动提取 sessionToken" + (label ? "（" + label + "）" : "");
      return { token: json.sessionToken.trim(), label: label, message: message };
    }
    // 备选：提取 accessToken（但这不是 session cookie，只是 API token）
    if (json.accessToken && typeof json.accessToken === "string") {
      message = "警告：提取的是 accessToken 而非 sessionToken，可能无法用于登录";
      return { token: json.accessToken.trim(), label: label, message: message };
    }
  } catch (_e) {
    // 不是 JSON，继续常规清洗
  }

  // 剥离 __Secure-next-auth.session-token= 前缀
  cleaned = cleaned.replace(/^__Secure-next-auth\.session-token\s*=\s*/i, "");
  // 剥离包裹的双引号或单引号
  cleaned = cleaned.replace(/^["']|["']$/g, "");
  // 去除多余空白和换行
  cleaned = cleaned.replace(/\s+/g, "");

  return { token: cleaned, label: "", message: "" };
}

// ==================== 注入 Token ====================
async function injectToken() {
  hideStatus();

  const raw = tokenInput.value;
  if (!raw || !raw.trim()) {
    showStatus("请先输入 Token", "error");
    return;
  }

  const result = cleanToken(raw);
  if (!result || !result.token) {
    showStatus("Token 清洗后为空，请检查输入内容", "error");
    return;
  }

  if (result.message) {
    showStatus(result.message, "info");
  }

  const token = result.token;
  const label = result.label;

  // 按钮禁用防重复点击
  injectBtn.disabled = true;
  injectBtn.textContent = "注入中...";

  try {
    const response = await chrome.runtime.sendMessage({
      action: "injectToken",
      token: token,
    });

    if (response && response.success) {
      if (response.noTab) {
        showStatus("Token 已写入，但未找到活动标签页，请手动打开 chatgpt.com", "info");
      } else {
        showStatus("Token 注入成功！页面即将刷新/跳转...", "success");
      }
      // 保存到历史记录（带 email 标签）
      await saveToHistory(token, label);
    } else if (response && response.error) {
      showStatus("注入失败: " + response.error, "error");
    } else {
      // response 为 undefined：后台未响应（service worker 异常 / 扩展未运行）
      showStatus("扩展后台未响应，请到扩展管理页重新加载本扩展", "error");
    }
  } catch (err) {
    showStatus("通信异常: " + (err.message || "请检查扩展是否正常运行"), "error");
  } finally {
    injectBtn.disabled = false;
    injectBtn.textContent = "注入 Token";
  }
}

// ==================== 复制 Token ====================
async function copyToken() {
  const raw = tokenInput.value;
  if (!raw || !raw.trim()) {
    showStatus("输入框为空，无可复制内容", "info");
    return;
  }
  // 复制清洗后的纯 Token
  const result = cleanToken(raw);
  const text = result && result.token ? result.token : raw.trim();
  try {
    await navigator.clipboard.writeText(text);
    showStatus("Token 已复制到剪贴板", "success");
  } catch (_e) {
    showStatus("复制失败，请手动选择复制", "error");
  }
}

// ==================== 清空输入 ====================
function clearInput() {
  tokenInput.value = "";
  tokenInput.focus();
  hideStatus();
}

// ==================== 历史记录管理 ====================
async function loadHistory() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const history = result[STORAGE_KEY] || [];

    // 同步工具栏 badge 数量
    updateBadge(history.length);

    if (history.length === 0) {
      historyGroup.style.display = "none";
      return;
    }

    historyGroup.style.display = "flex";
    historySelect.innerHTML = '<option value="">-- 选择历史账号 --</option>';

    history.forEach((entry, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = entry.label || ("账号 " + (index + 1));
      historySelect.appendChild(option);
    });
  } catch (_e) {
    // 静默处理
  }
}

async function saveToHistory(token, accountLabel) {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    let history = result[STORAGE_KEY] || [];

    // 检查是否已存在相同 Token，存在则跳过
    const exists = history.some((entry) => entry.token === token);
    if (exists) {
      await loadHistory();
      return;
    }

    // label 始终带时间，便于区分同 email 的多个 Token
    const timeStr = formatTime(Date.now());
    const label = accountLabel ? accountLabel + " (" + timeStr + ")" : timeStr;

    history.push({
      token: token,
      label: label,
      timestamp: Date.now(),
    });

    // 最多保留 10 条
    if (history.length > 10) {
      history = history.slice(-10);
    }

    await chrome.storage.local.set({ [STORAGE_KEY]: history });
    await loadHistory();
  } catch (_e) {
    // 静默处理
  }
}

async function deleteHistory() {
  const selectedIndex = historySelect.value;
  if (selectedIndex === "") return;

  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    let history = result[STORAGE_KEY] || [];
    const idx = parseInt(selectedIndex, 10);

    if (idx >= 0 && idx < history.length) {
      history.splice(idx, 1);
      await chrome.storage.local.set({ [STORAGE_KEY]: history });
      await loadHistory();
      showStatus("历史账号已删除", "info");
    }
  } catch (_e) {
    // 静默处理
  }
}

async function clearAllHistory() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const history = result[STORAGE_KEY] || [];

    if (history.length === 0) {
      showStatus("历史记录已为空", "info");
      return;
    }

    // 二次确认
    if (!confirm("确定要清空全部 " + history.length + " 条历史账号吗？此操作不可恢复。")) {
      return;
    }

    await chrome.storage.local.set({ [STORAGE_KEY]: [] });
    await loadHistory();
    showStatus("已清空全部历史账号", "info");
  } catch (_e) {
    showStatus("清空失败", "error");
  }
}

// ==================== 事件绑定 ====================
injectBtn.addEventListener("click", injectToken);
deleteHistoryBtn.addEventListener("click", deleteHistory);
clearAllHistoryBtn.addEventListener("click", clearAllHistory);
copyTokenBtn.addEventListener("click", copyToken);
clearInputBtn.addEventListener("click", clearInput);

historySelect.addEventListener("change", () => {
  const selectedIndex = historySelect.value;
  if (selectedIndex === "") {
    tokenInput.value = "";
    return;
  }

  chrome.storage.local
    .get(STORAGE_KEY)
    .then((result) => {
      const history = result[STORAGE_KEY] || [];
      const idx = parseInt(selectedIndex, 10);
      if (idx >= 0 && idx < history.length) {
        tokenInput.value = history[idx].token;
        showStatus("已加载历史账号: " + history[idx].label, "info");
      }
    })
    .catch(() => {});
});

// 键盘快捷键：Ctrl+Enter（Mac 为 Cmd+Enter）快速注入
tokenInput.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    injectToken();
  }
});
