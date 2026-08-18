// ==================== Constants ====================
const STORAGE_KEY = "token_history";
const LANG_KEY = "ui_language";
const STATUS_TIMEOUT = { success: 3000, info: 3000, error: 5000 };
const SESSION_URL = "https://chatgpt.com/api/auth/session";

// ==================== i18n String Tables ====================
const I18N = {
  en: {
    // Static HTML elements (data-i18n)
    subtitle: "One-click Session Token injection for passwordless login",
    copyBtn: "Copy",
    clearInputBtn: "Clear",
    hint: "Tip: Ctrl+Enter to inject quickly",
    tokenHelpLabel: "Get token:",
    copyUrlBtn: "Copy",
    openUrlBtn: "Open",
    copyUrlTitle: "Copy session API URL",
    copyUrlAria: "Copy session API URL",
    openUrlTitle: "Open session API in new tab (login required)",
    openUrlAria: "Open session API URL",
    msgUrlCopied: "URL copied to clipboard",
    msgUrlOpened: "Opened session API in new tab",
    historyLabel: "Account History",
    historyPlaceholder: "-- Select account --",
    deleteBtn: "Delete",
    clearAllBtn: "Clear All",
    injectBtn: "Inject Token",
    // Title/aria attributes (data-i18n-title, data-i18n-aria)
    copyTitle: "Copy token from input",
    copyAria: "Copy token",
    clearInputTitle: "Clear input",
    clearInputAria: "Clear input",
    deleteHistoryTitle: "Delete selected account",
    deleteHistoryAria: "Delete selected account",
    clearAllTitle: "Clear all saved accounts",
    clearAllAria: "Clear all saved accounts",
    historyAria: "Account history list",
    // Placeholder (data-i18n-placeholder)
    tokenPlaceholder: "Paste __Secure-next-auth.session-token or JWT string...",
    // Dynamic status messages
    msgClipboardDetected: "Token auto-detected from clipboard",
    msgExtractedFromJson: "sessionToken auto-extracted from JSON",
    msgExtractedAccessToken: "Warning: extracted accessToken instead of sessionToken; may not work for login",
    msgPleaseEnterToken: "Please enter a token first",
    msgTokenEmptyAfterClean: "Token is empty after cleaning, please check your input",
    msgNoActiveTab: "Token written, but no active tab found. Please open chatgpt.com manually",
    msgInjectSuccess: "Token injected successfully! Page will reload/redirect...",
    msgInjectFailed: "Injection failed: ",
    msgBgNotResponding: "Extension background not responding. Please reload this extension on the extensions page",
    msgCommError: "Communication error: ",
    msgPleaseCheckExtension: "Please check if the extension is running properly",
    msgInjecting: "Injecting...",
    msgInputEmpty: "Input is empty, nothing to copy",
    msgTokenCopied: "Token copied to clipboard",
    msgCopyFailed: "Copy failed, please copy manually",
    msgAccountPrefix: "Account ",
    msgHistoryDeleted: "Account deleted",
    msgHistoryEmpty: "History is already empty",
    msgClearConfirm: "Are you sure you want to clear all {count} saved accounts? This cannot be undone.",
    msgAllCleared: "All saved accounts cleared",
    msgClearFailed: "Clear failed",
    msgHistoryLoaded: "Loaded account: {label}",
    // Background error keys
    error_invalid_token: "Invalid token format (must be a JWT string starting with eyJ)",
    error_cookie_verify_failed: "Cookie verification failed: session cookie not found in store",
    // Lang toggle
    langToggleLabel: "Switch language",
    langSwitchTo: "中文",
    langCode: "EN",
    // Locale for date formatting
    dateLocale: "en-US",
    // Chunk error (with index)
    msgChunkFailed: "Chunk {index} write failed (chrome.cookies.set returned null)",
  },
  zh: {
    // Static HTML elements (data-i18n)
    subtitle: "一键注入 Session Token，免密登录",
    copyBtn: "复制",
    clearInputBtn: "清空",
    hint: "提示：Ctrl+Enter 快速注入",
    tokenHelpLabel: "获取 Token：",
    copyUrlBtn: "复制",
    openUrlBtn: "打开",
    copyUrlTitle: "复制 Session API 地址",
    copyUrlAria: "复制 Session API 地址",
    openUrlTitle: "在新标签页打开 Session API（需已登录）",
    openUrlAria: "打开 Session API 地址",
    msgUrlCopied: "地址已复制到剪贴板",
    msgUrlOpened: "已在新标签页打开 Session API",
    historyLabel: "历史账号",
    historyPlaceholder: "-- 选择历史账号 --",
    deleteBtn: "删除",
    clearAllBtn: "清空全部",
    injectBtn: "注入 Token",
    // Title/aria attributes (data-i18n-title, data-i18n-aria)
    copyTitle: "复制输入框中的 Token",
    copyAria: "复制 Token",
    clearInputTitle: "清空输入框",
    clearInputAria: "清空输入框",
    deleteHistoryTitle: "删除选中的历史账号",
    deleteHistoryAria: "删除选中的历史账号",
    clearAllTitle: "清空全部历史账号",
    clearAllAria: "清空全部历史账号",
    historyAria: "历史账号列表",
    // Placeholder (data-i18n-placeholder)
    tokenPlaceholder: "粘贴 __Secure-next-auth.session-token 或 JWT 字符串...",
    // Dynamic status messages
    msgClipboardDetected: "已自动抓取剪贴板 Token",
    msgExtractedFromJson: "已从 JSON 中自动提取 sessionToken",
    msgExtractedAccessToken: "警告：提取的是 accessToken 而非 sessionToken，可能无法用于登录",
    msgPleaseEnterToken: "请先输入 Token",
    msgTokenEmptyAfterClean: "Token 清洗后为空，请检查输入内容",
    msgNoActiveTab: "Token 已写入，但未找到活动标签页，请手动打开 chatgpt.com",
    msgInjectSuccess: "Token 注入成功！页面即将刷新/跳转...",
    msgInjectFailed: "注入失败: ",
    msgBgNotResponding: "扩展后台未响应，请到扩展管理页重新加载本扩展",
    msgCommError: "通信异常: ",
    msgPleaseCheckExtension: "请检查扩展是否正常运行",
    msgInjecting: "注入中...",
    msgInputEmpty: "输入框为空，无可复制内容",
    msgTokenCopied: "Token 已复制到剪贴板",
    msgCopyFailed: "复制失败，请手动选择复制",
    msgAccountPrefix: "账号 ",
    msgHistoryDeleted: "历史账号已删除",
    msgHistoryEmpty: "历史记录已为空",
    msgClearConfirm: "确定要清空全部 {count} 条历史账号吗？此操作不可恢复。",
    msgAllCleared: "已清空全部历史账号",
    msgClearFailed: "清空失败",
    msgHistoryLoaded: "已加载历史账号: {label}",
    // Background error keys
    error_invalid_token: "Token 格式不合法（应为以 eyJ 开头的 JWT 字符串）",
    error_cookie_verify_failed: "Cookie 验证失败：数据库中未找到 session Cookie",
    // Lang toggle
    langToggleLabel: "切换语言",
    langSwitchTo: "EN",
    langCode: "中",
    // Locale for date formatting
    dateLocale: "zh-CN",
    // Chunk error (with index)
    msgChunkFailed: "分片 {index} 写入失败（chrome.cookies.set 返回 null）",
  },
};

let currentLang = "en";

// ==================== i18n Core ====================
function t(key, params) {
  const table = I18N[currentLang] || I18N.en;
  let str = table[key] || I18N.en[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp("\\{" + k + "\\}", "g"), String(v));
    }
  }
  return str;
}

// Translate background error keys (may have colon-suffixed params like "error_chunk_write_failed:0")
function translateError(errKey) {
  if (!errKey) return t("msgPleaseCheckExtension");
  if (errKey.startsWith("error_chunk_write_failed:")) {
    const idx = errKey.split(":")[1];
    return t("msgChunkFailed", { index: idx });
  }
  // Check if it's a known i18n key
  if (I18N.en[errKey]) return t(errKey);
  // Fallback: return raw string (may be an unexpected error)
  return errKey;
}

function applyI18n() {
  // Update document lang attribute
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";

  // Elements with data-i18n (textContent)
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });

  // Elements with data-i18n-placeholder
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(key);
  });

  // Elements with data-i18n-title
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    el.title = t(key);
  });

  // Elements with data-i18n-aria
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    el.setAttribute("aria-label", t(key));
  });

  // Update language toggle button
  updateLangToggle();

  // Re-render history dropdown (labels may change)
  refreshHistoryLabels();
}

function updateLangToggle() {
  const btn = document.getElementById("langToggle");
  if (!btn) return;
  btn.textContent = t("langSwitchTo");
  btn.title = t("langToggleLabel");
  btn.setAttribute("aria-label", t("langToggleLabel"));
}

async function setLanguage(lang) {
  currentLang = lang;
  try {
    await chrome.storage.local.set({ [LANG_KEY]: lang });
  } catch (_e) {
    // Storage may fail in some edge cases; continue with in-memory lang
  }
  applyI18n();
}

async function toggleLanguage() {
  const newLang = currentLang === "en" ? "zh" : "en";
  await setLanguage(newLang);
}

async function loadLanguage() {
  try {
    const result = await chrome.storage.local.get(LANG_KEY);
    if (result[LANG_KEY] === "zh" || result[LANG_KEY] === "en") {
      currentLang = result[LANG_KEY];
    } else {
      // Default to browser language: if Chinese, use zh; otherwise en
      const browserLang = (navigator.language || "en").toLowerCase();
      currentLang = browserLang.startsWith("zh") ? "zh" : "en";
    }
  } catch (_e) {
    currentLang = "en";
  }
}

// ==================== DOM Elements ====================
const tokenInput = document.getElementById("tokenInput");
const injectBtn = document.getElementById("injectBtn");
const statusBox = document.getElementById("statusBox");
const historyGroup = document.getElementById("historyGroup");
const historySelect = document.getElementById("historySelect");
const deleteHistoryBtn = document.getElementById("deleteHistoryBtn");
const clearAllHistoryBtn = document.getElementById("clearAllHistoryBtn");
const copyTokenBtn = document.getElementById("copyTokenBtn");
const clearInputBtn = document.getElementById("clearInputBtn");
const langToggleBtn = document.getElementById("langToggle");
const copyUrlBtn = document.getElementById("copyUrlBtn");
const openUrlBtn = document.getElementById("openUrlBtn");
const sessionUrlText = document.getElementById("sessionUrlText");

let statusTimer = null;
let historyCache = []; // Cached history entries for label re-rendering on lang switch

// ==================== Initialization ====================
document.addEventListener("DOMContentLoaded", async () => {
  await loadLanguage();
  applyI18n();
  loadHistory();
  autoFillFromClipboard();
});

// ==================== Utility Functions ====================
// Format timestamp to locale-appropriate date/time string
function formatTime(ts) {
  return new Date(ts).toLocaleString(t("dateLocale"), {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Update toolbar badge to show history count
function updateBadge(count) {
  try {
    chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#7b2ff7" });
  } catch (_e) {
    // action API may be unavailable in edge cases; fail silently
  }
}

// ==================== Clipboard Auto-Detect ====================
async function autoFillFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && text.trim().startsWith("eyJ")) {
      tokenInput.value = text.trim();
      showStatus(t("msgClipboardDetected"), "info");
    }
  } catch (_e) {
    // Silently catch; clipboard access may be denied
  }
}

// ==================== Status Messages (auto-fade) ====================
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

// ==================== Token Cleaning ====================
// Returns { token, label, message } or null
// Robustly extracts a token from:
//  - Raw JWT/JWE string
//  - Cookie-prefixed string (__Secure-next-auth.session-token=eyJ...)
//  - Complete JSON (session API response, token export file, ...)
//  - Partial/incomplete JSON or arbitrary text containing a JWT
// Supports both camelCase (sessionToken) and snake_case (session_token) keys.
function cleanToken(raw) {
  let cleaned = raw.trim();
  let label = "";
  let message = "";

  // Try parsing as JSON (user may have pasted the full session API response)
  let parsed = null;
  try {
    parsed = JSON.parse(cleaned);
  } catch (_e) {
    // Not valid JSON (possibly incomplete); fall through to regex extraction
  }

  if (parsed && typeof parsed === "object") {
    // Extract label (email or name) from common locations
    if (parsed.user && parsed.user.email) {
      label = parsed.user.email;
    } else if (parsed.user && parsed.user.name) {
      label = parsed.user.name;
    } else if (typeof parsed.email === "string") {
      label = parsed.email;
    } else if (typeof parsed.name === "string") {
      label = parsed.name;
    }

    // Prefer sessionToken (the actual __Secure-next-auth.session-token value)
    // Support both camelCase and snake_case keys
    const sessionToken = parsed.sessionToken || parsed.session_token;
    if (sessionToken && typeof sessionToken === "string") {
      message = t("msgExtractedFromJson") + (label ? " (" + label + ")" : "");
      return { token: sessionToken.trim(), label: label, message: message };
    }
    // Fallback: extract accessToken (not a session cookie, just an API token)
    const accessToken = parsed.accessToken || parsed.access_token;
    if (accessToken && typeof accessToken === "string") {
      message = t("msgExtractedAccessToken");
      return { token: accessToken.trim(), label: label, message: message };
    }
    // Fallback: extract idToken (OpenID identity token, not a session cookie)
    const idToken = parsed.idToken || parsed.id_token;
    if (idToken && typeof idToken === "string") {
      message = t("msgExtractedAccessToken");
      return { token: idToken.trim(), label: label, message: message };
    }
  }

  // Regex fallback: extract a JWT/JWE string from arbitrary (possibly incomplete) text.
  // Matches "eyJ" + base64url chars, then one or more dot-separated base64url segments.
  const jwtMatch = cleaned.match(/eyJ[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+/);
  if (jwtMatch) {
    return { token: jwtMatch[0], label: "", message: "" };
  }

  // Strip __Secure-next-auth.session-token= prefix
  cleaned = cleaned.replace(/^__Secure-next-auth\.session-token\s*=\s*/i, "");
  // Strip surrounding double or single quotes
  cleaned = cleaned.replace(/^["']|["']$/g, "");
  // Remove extra whitespace and newlines
  cleaned = cleaned.replace(/\s+/g, "");

  return { token: cleaned, label: "", message: "" };
}

// ==================== Token Injection ====================
async function injectToken() {
  hideStatus();

  const raw = tokenInput.value;
  if (!raw || !raw.trim()) {
    showStatus(t("msgPleaseEnterToken"), "error");
    return;
  }

  const result = cleanToken(raw);
  if (!result || !result.token) {
    showStatus(t("msgTokenEmptyAfterClean"), "error");
    return;
  }

  if (result.message) {
    showStatus(result.message, "info");
  }

  const token = result.token;
  const label = result.label;

  // Disable button to prevent double-clicks
  injectBtn.disabled = true;
  injectBtn.textContent = t("msgInjecting");

  try {
    const response = await chrome.runtime.sendMessage({
      action: "injectToken",
      token: token,
    });

    if (response && response.success) {
      if (response.noTab) {
        showStatus(t("msgNoActiveTab"), "info");
      } else {
        showStatus(t("msgInjectSuccess"), "success");
      }
      // Save to history (with email label if available)
      await saveToHistory(token, label);
    } else if (response && response.error) {
      showStatus(t("msgInjectFailed") + translateError(response.error), "error");
    } else {
      // response is undefined: background not responding (service worker crashed / extension not loaded)
      showStatus(t("msgBgNotResponding"), "error");
    }
  } catch (err) {
    showStatus(t("msgCommError") + (err.message || t("msgPleaseCheckExtension")), "error");
  } finally {
    injectBtn.disabled = false;
    injectBtn.textContent = t("injectBtn");
  }
}

// ==================== Copy Token ====================
async function copyToken() {
  const raw = tokenInput.value;
  if (!raw || !raw.trim()) {
    showStatus(t("msgInputEmpty"), "info");
    return;
  }
  // Copy the cleaned pure token
  const result = cleanToken(raw);
  const text = result && result.token ? result.token : raw.trim();
  try {
    await navigator.clipboard.writeText(text);
    showStatus(t("msgTokenCopied"), "success");
  } catch (_e) {
    showStatus(t("msgCopyFailed"), "error");
  }
}

// ==================== Clear Input ====================
function clearInput() {
  tokenInput.value = "";
  tokenInput.focus();
  hideStatus();
}

// ==================== Session URL Helpers ====================
async function copySessionUrl() {
  try {
    await navigator.clipboard.writeText(SESSION_URL);
    showStatus(t("msgUrlCopied"), "success");
  } catch (_e) {
    showStatus(t("msgCopyFailed"), "error");
  }
}

function openSessionUrl() {
  chrome.tabs.create({ url: SESSION_URL });
  showStatus(t("msgUrlOpened"), "info");
}

// ==================== History Management ====================
function buildHistoryLabel(entry, index) {
  const baseLabel = entry.label || t("msgAccountPrefix") + (index + 1);
  return baseLabel;
}

function refreshHistoryLabels() {
  if (!historyCache || historyCache.length === 0) return;
  // Rebuild the select options with current language labels
  historySelect.innerHTML = '<option value="">' + t("historyPlaceholder") + "</option>";
  historyCache.forEach((entry, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = buildHistoryLabel(entry, index);
    historySelect.appendChild(option);
  });
}

async function loadHistory() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const history = result[STORAGE_KEY] || [];
    historyCache = history;

    // Sync toolbar badge count
    updateBadge(history.length);

    if (history.length === 0) {
      historyGroup.style.display = "none";
      return;
    }

    historyGroup.style.display = "flex";
    refreshHistoryLabels();
  } catch (_e) {
    // Fail silently
  }
}

async function saveToHistory(token, accountLabel) {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    let history = result[STORAGE_KEY] || [];

    // Skip if the same token already exists
    const exists = history.some((entry) => entry.token === token);
    if (exists) {
      await loadHistory();
      return;
    }

    // Always append timestamp to label for distinguishing multiple tokens for the same email
    const timeStr = formatTime(Date.now());
    const label = accountLabel ? accountLabel + " (" + timeStr + ")" : timeStr;

    history.push({
      token: token,
      label: label,
      timestamp: Date.now(),
    });

    // Keep at most 10 entries
    if (history.length > 10) {
      history = history.slice(-10);
    }

    await chrome.storage.local.set({ [STORAGE_KEY]: history });
    await loadHistory();
  } catch (_e) {
    // Fail silently
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
      showStatus(t("msgHistoryDeleted"), "info");
    }
  } catch (_e) {
    // Fail silently
  }
}

async function clearAllHistory() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const history = result[STORAGE_KEY] || [];

    if (history.length === 0) {
      showStatus(t("msgHistoryEmpty"), "info");
      return;
    }

    // Double-confirm
    if (!confirm(t("msgClearConfirm", { count: history.length }))) {
      return;
    }

    await chrome.storage.local.set({ [STORAGE_KEY]: [] });
    await loadHistory();
    showStatus(t("msgAllCleared"), "info");
  } catch (_e) {
    showStatus(t("msgClearFailed"), "error");
  }
}

// ==================== Event Bindings ====================
injectBtn.addEventListener("click", injectToken);
deleteHistoryBtn.addEventListener("click", deleteHistory);
clearAllHistoryBtn.addEventListener("click", clearAllHistory);
copyTokenBtn.addEventListener("click", copyToken);
clearInputBtn.addEventListener("click", clearInput);
langToggleBtn.addEventListener("click", toggleLanguage);
copyUrlBtn.addEventListener("click", copySessionUrl);
openUrlBtn.addEventListener("click", openSessionUrl);
sessionUrlText.addEventListener("click", openSessionUrl);

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
        showStatus(t("msgHistoryLoaded", { label: buildHistoryLabel(history[idx], idx) }), "info");
      }
    })
    .catch(() => {});
});

// Keyboard shortcut: Ctrl+Enter (or Cmd+Enter on Mac) for quick injection
tokenInput.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    injectToken();
  }
});
