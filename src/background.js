// ==================== Configuration ====================
const DEBUG = false; // Debug log toggle: false for release, set to true when troubleshooting

const COOKIE_URL = "https://chatgpt.com/";
const COOKIE_NAME = "__Secure-next-auth.session-token";
const MAX_CHUNK_SIZE = 3900; // Leave headroom to avoid cookie size limits

// ==================== Debug Logging ====================
function log(...args) {
  if (DEBUG) console.log("[TokenInjector]", ...args);
}

// ==================== Token Validation ====================
// Supports two formats:
// - JWT: eyJxxx.eyJxxx.signature (3 segments, all non-empty)
// - JWE: eyJxxx..iv.ciphertext.tag (5 segments; with dir algorithm the encrypted_key segment is empty, hence "..")
// ChatGPT's __Secure-next-auth.session-token is actually a JWE (alg=dir, enc=A256GCM)
function isValidToken(token) {
  if (typeof token !== "string" || token.length < 20) return false;
  if (!token.startsWith("eyJ")) return false;
  const parts = token.split(".");
  // At least 2 segments (header.payload); JWE has 5 segments
  if (parts.length < 2) return false;
  // Allow empty segments (JWE encrypted_key is empty under dir algorithm)
  const base64urlRe = /^[A-Za-z0-9_-]*$/;
  return parts.every((p) => base64urlRe.test(p));
}

// ==================== Message Listener ====================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "injectToken" && message.token) {
    handleInjectToken(message.token)
      .then((result) => sendResponse({ success: true, ...result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // Keep the message channel open for async response
  }
});

// ==================== Core Logic: Chunked Cookie Writing ====================
async function handleInjectToken(token) {
  // 0. Validate token format (last line of defense)
  if (!isValidToken(token)) {
    throw new Error("error_invalid_token");
  }

  log("Token received, length:", token.length);

  // 1. Remove old cookies (including any legacy chunked cookies)
  await removeOldCookies();

  // 2. Split into chunks per MAX_CHUNK_SIZE (next-auth chunked cookie convention)
  const chunks = [];
  for (let i = 0; i < token.length; i += MAX_CHUNK_SIZE) {
    chunks.push(token.slice(i, i + MAX_CHUNK_SIZE));
  }
  log("Chunk count:", chunks.length, "Chunk lengths:", chunks.map((c) => c.length));

  // 3. Write chunks one by one (with domain and httpOnly to match real ChatGPT cookies)
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

    log("Writing chunk", i, "name:", cookieName, "value length:", chunks[i].length);

    const cookie = await chrome.cookies.set(cookieDetails);
    if (!cookie) {
      throw new Error("error_chunk_write_failed:" + i);
    }
    log("Chunk", i, "written successfully");
  }

  // 4. Verify cookies were actually written to the cookie store
  const allCookies = await chrome.cookies.getAll({ domain: "chatgpt.com" });
  const sessionCookies = allCookies.filter(
    (c) => c.name.indexOf("__Secure-next-auth.session-token") === 0
  );
  log(
    "Session cookies in store:",
    sessionCookies.map((c) => ({
      name: c.name,
      valueLen: c.value.length,
      domain: c.domain,
      httpOnly: c.httpOnly,
      secure: c.secure,
    }))
  );

  if (sessionCookies.length === 0) {
    throw new Error("error_cookie_verify_failed");
  }

  // 5. Wait 500ms to ensure cookies are fully persisted
  await new Promise((r) => setTimeout(r, 500));

  // 6. Query active tab and reload/redirect
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];

  if (!currentTab || !currentTab.url) {
    // Cookies written but no active tab to reload/redirect
    return { noTab: true };
  }

  if (currentTab.url.includes("chatgpt.com")) {
    await chrome.tabs.reload(currentTab.id);
    log("ChatGPT page reloaded");
  } else {
    await chrome.tabs.update(currentTab.id, { url: COOKIE_URL });
    log("Redirected to ChatGPT");
  }

  return {};
}

// ==================== Cleanup Old Cookies (dynamically query all matching chunks) ====================
async function removeOldCookies() {
  // Query all __Secure-next-auth.session-token* cookies (including legacy .0/.1/... chunks)
  const allCookies = await chrome.cookies.getAll({ domain: "chatgpt.com" });
  const stale = allCookies.filter(
    (c) => c.name.indexOf("__Secure-next-auth.session-token") === 0
  );

  for (const c of stale) {
    try {
      await chrome.cookies.remove({ url: COOKIE_URL, name: c.name });
    } catch (_e) {
      // Individual removal failure should not block the flow
    }
  }

  // Also clean up possible test cookies
  try {
    await chrome.cookies.remove({
      url: COOKIE_URL,
      name: "__Secure-next-auth.session-token-test",
    });
  } catch (_e) {
    // Ignore
  }

  log("Old cookies cleaned, count:", stale.length);
}
