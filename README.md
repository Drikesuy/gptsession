# gptsession

![License](https://img.shields.io/badge/license-MIT-blue)
![Manifest](https://img.shields.io/badge/Manifest-V3-green)
![Chrome](https://img.shields.io/badge/Chrome-%3E%3D110-4285F4?logo=googlechrome&logoColor=white)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

> 一键静默注入 ChatGPT Session Token,实现免密登录的 Chrome 扩展(Manifest V3)。

粘贴或输入 ChatGPT 的 `__Secure-next-auth.session-token` 后,点击按钮即可写入浏览器 Cookie 数据库,并自动无感刷新 / 跳转至 ChatGPT 页面进入登录态。支持自动抓取剪贴板、Token 格式校验与清洗、本地历史账号管理。

---

## ⚠️ 免责声明(请务必阅读)

本项目**仅供学习与研究使用**,作为 Chrome Extension MV3 Cookie API 的技术演示,不得用于任何违反法律法规或第三方服务条款的场景。

- 使用本工具共享 / 转让 ChatGPT 账号**可能违反 OpenAI 服务条款**,存在账号被封锁的风险
- **禁止将本工具用于商业转售 ChatGPT 账号、批量注册、黑产账号交易等任何商业牟利行为**
- **本项目不针对 OpenAI 服务本身,不调用其任何 API,仅演示 Chrome 扩展如何读写指定域名的 Cookie**
- 因使用本工具产生的任何直接或间接损失(包括但不限于账号封禁、数据丢失、法律风险),作者**不承担任何责任**
- 使用者应确保自己拥有合法授权,并遵守所在地区法律法规
- 作者不对本工具的滥用行为负责,一切后果由使用者自行承担

### 🚫 关于 Chrome Web Store 上架

本扩展**仅供开发者通过"加载已解压的扩展程序"在本地自用,不在 Chrome Web Store 上架**。

原因:
- Chrome Web Store 政策明确禁止"账号共享 / 凭证注入"类扩展,提交将导致**扩展被拒、开发者账号可能被封**
- 本项目作者不提交至商店,也不会以任何形式发布到商店
- 如发现第三方将本仓库重新打包上架商店,与原作者无关,后果由第三方承担

---

## ✨ 功能特性

- **一键注入**:粘贴 Token → 点击按钮 → 自动写入 Cookie → 刷新 / 跳转
- **剪贴板自动吸附**:打开弹窗自动读取剪贴板,识别以 `eyJ` 开头的 JWT 并预填
- **格式清洗(防呆)**:自动剥离 `__Secure-next-auth.session-token=` 前缀、引号、空白;支持从 session API 的 JSON 响应中自动提取 `sessionToken`
- **Token 格式校验**:写入前校验是否为合法 JWT(`eyJ` 开头、多段 base64url),不合法直接拒绝
- **分片写入**:Token 超长时按 next-auth chunked cookie 机制自动分片(`.0` / `.1` / ...)
- **先删后写**:写入前动态查询并清理所有同名旧 Cookie(含历史分片),避免冲突
- **历史账号管理**:成功注入的 Token 保存到本地(最多 10 条),下拉快速切换;支持单条删除与**一键清空全部**
- **跨页跳转**:在任意页面点击注入,自动跳转至 `chatgpt.com`;若无活动标签页则提示手动打开
- **快捷操作**:`Ctrl+Enter`(Mac 为 `Cmd+Enter`)快速注入;输入框旁提供**复制**与**清空**按钮
- **状态提示自动消失**:成功 / 信息提示 3 秒、错误提示 5 秒后自动淡出
- **调试日志开关**:`background.js` 内置 `DEBUG` 常量,排查问题时设为 `true` 即可输出详细日志
- **工具栏 badge**:扩展图标右下角显示历史账号数量,一眼可见
- **无障碍支持**:状态提示 `role="alert"` 播报,按钮均有 `aria-label`
- **历史 label 带时间**:同 email 的多个 Token 可凭时间戳区分

---

## 📦 安装(开发者模式加载)

1. 下载 / 克隆本仓库到本地
2. 打开 Chrome,访问 `chrome://extensions/`
3. 右上角开启 **开发者模式**
4. 点击 **加载已解压的扩展程序**,选择本项目根目录(包含 `manifest.json` 的文件夹)
5. 扩展出现在列表中,工具栏会显示图标

> 支持 Chrome / Edge / 其他基于 Chromium 的浏览器(Manifest V3,最低版本 110)。

---

## 🚀 使用方法

1. 获取 ChatGPT 的 `__Secure-next-auth.session-token` 值(JWT 字符串,以 `eyJ` 开头)
2. 点击工具栏扩展图标打开弹窗
   - 如果剪贴板里已有以 `eyJ` 开头的文本,会自动预填
3. 将 Token 粘贴到输入框(支持带前缀 / 引号 / JSON 格式,会自动清洗)
4. 点击 **注入 Token**(或在输入框内按 `Ctrl+Enter`)
5. 成功后页面自动刷新 / 跳转至 ChatGPT,即进入登录态
6. 下次可从 **历史账号** 下拉中直接选择,无需重复粘贴
   - 点击 **删除** 移除单条;点击 **清空全部** 一键清空(带二次确认)

---

## 📁 目录结构

```
gptsession/
├── manifest.json                 # 扩展配置(Manifest V3)
├── popup.html                    # 弹窗 UI 界面
├── popup.css                     # 样式(暗黑风格)
├── popup.js                      # 前端交互、剪贴板、清洗、历史管理、快捷键
├── background.js                 # Service Worker:Cookie 读写、分片、校验、Tab 重载/跳转
├── icon16.png                    # 图标 16×16
├── icon48.png                    # 图标 48×48
├── icon128.png                   # 图标 128×128
├── AGENTS.md                     # AI 开发指令文档(项目设计规格)
├── package.json                  # npm 开发依赖(ESLint / Prettier)
├── .eslintrc.json                # ESLint 配置
├── .prettierrc.json              # Prettier 配置
├── .gitignore
├── .gitattributes
├── LICENSE
├── README.md                     # 项目说明(含安全策略与贡献指南)
└── .github/
    ├── PULL_REQUEST_TEMPLATE.md
    └── ISSUE_TEMPLATE/
        ├── bug_report.md
        └── feature_request.md
```

---

## 🔧 技术细节

### 权限

| 权限 | 用途 |
|---|---|
| `cookies` | 读写 `chatgpt.com` 的 session Cookie |
| `tabs` | 查询 / 重载 / 跳转当前标签页 |
| `storage` | 本地保存历史账号列表 |
| `clipboardRead` | 自动读取剪贴板预填 Token |

### 域名权限(严格限定)

仅请求 `https://chatgpt.com/*` 与 `https://*.chatgpt.com/*`,不会访问其他任何站点。

### Cookie 写入规格

- `name`: `__Secure-next-auth.session-token`(超长时自动分片为 `.0` / `.1` ...)
- `domain`: `.chatgpt.com`
- `path`: `/`
- `secure`: `true`
- `httpOnly`: `true`
- `sameSite`: `lax`
- `expirationDate`: 当前时间 + 365 天

---

## 🔒 隐私说明

- 本扩展**不收集、不上传**任何用户数据
- Token 与历史账号仅存储在本地 `chrome.storage.local`,**明文保存**,请确保使用环境可信
- 不含任何第三方统计 / 追踪 SDK
- 卸载扩展后,本地存储的数据会一并清除
- `clipboardRead` 权限仅在弹窗打开瞬间读取一次剪贴板用于自动预填,**不会在后台持续监听**

---

## 🎨 图标版权声明

仓库中的 `icon16.png` / `icon48.png` / `icon128.png` 为本项目原创作品(简单的抽象图形,非任何第三方商标),按 MIT 协议随代码一并开源。

**本项目不使用 OpenAI / ChatGPT 官方 logo**,以避免商标侵权。如需替换为自有图标,自行替换这三个文件即可。

---

## 🛠 开发(可选)

项目本身是纯静态的 Chrome 扩展,无需构建。如需使用代码风格工具:

```bash
# 安装开发依赖(package.json 已提供)
npm install

# 检查代码
npx eslint popup.js background.js

# 格式化代码
npx prettier --write "popup.js" "background.js" "popup.css" "popup.html"
```

配置见 `.eslintrc.json` 与 `.prettierrc.json`。

---

## 🧪 验收测试

详见 [AGENTS.md](./AGENTS.md) 第 5 节,共 6 项测试用例(权限、剪贴板容错、清洗、Cookie 完整性、无感刷新、跨页跳转)。

---

## 🔐 安全策略

### 报告漏洞

感谢你关注本项目的安全。如发现安全漏洞,请**私下反馈**,**不要在公开 Issue 中提交**。

**反馈渠道:**

- **GitHub Security Advisory**(推荐):仓库 → Security → Advisories → New draft advisory
- **邮箱**:请通过 GitHub 私人邮件联系仓库 Owner(在 GitHub 个人主页开启 "Send email" 即可)

反馈时请尽量包含:

- 漏洞影响的版本
- 复现步骤
- 期望行为与实际行为
- 如有 PoC 请附上(可加密或脱敏)

收到报告后,我会在 **7 天内**确认收到,并在评估后尽快给出修复计划。

### 已知设计(非漏洞)

以下行为是本项目**有意为之的设计**,不属于安全漏洞,**不接受作为 Issue 提交**:

1. **Token 明文存储** —— 历史账号列表以明文形式存储在 `chrome.storage.local`,为方便用户快速切换账号的有意设计。`chrome.storage.local` 的访问范围仅限本扩展自身,其他扩展 / 网站无法读取。若你不接受明文存储,请勿使用"历史账号"功能,或在使用后点击"清空全部"。
2. **剪贴板读取** —— 弹窗打开瞬间读取一次剪贴板,用于自动预填以 `eyJ` 开头的 Token,**不会在后台持续监听**;权限已在 `manifest.json` 中显式声明 `clipboardRead`。
3. **Cookie 写入** —— 本扩展的核心功能就是向 `chatgpt.com` 写入 session Cookie,是用户主动触发的行为,域名权限严格限定为 `chatgpt.com`,不会访问其他任何站点。

### 责任与免责

- 本项目按 MIT 协议 "AS IS" 提供,不承担任何保证责任
- 因本项目的已知设计(明文存储、剪贴板读取、Cookie 写入)产生的任何后果,由使用者自行承担
- 滥用本工具造成的账号封禁、数据丢失、法律风险等,作者不承担任何责任(详见上方"免责声明")

---

## 🤝 贡献指南

感谢你愿意为 gptsession 贡献代码!在开始之前,请阅读以下规范。

### 🚫 核心禁令(违反将直接关闭)

#### 1. 严禁在任何提交物中出现真实 Token

以下所有形式**严禁**包含真实账号的 Token(`eyJ` 开头的字符串):

- PR 的代码、注释、commit message
- Issue 描述、截图、日志
- 测试用例、示例数据

如需在代码中演示 Token 格式,请使用**伪造的占位符**:

```javascript
// ✅ 正确:使用明显的占位符
const sampleToken = "eyJFAKE.xxx.yyy-FOR-TEST-ONLY-DO-NOT-USE";

// ❌ 错误:粘贴真实 Token(即使是过期的)
const sampleToken = "eyJhbGciOi...<真实 JWT>...";
```

违反者:

- PR → 直接 close,并请作者**立即删除提交**(`git rebase` / 强推)以防泄露
- Issue → 直接关闭并删除

#### 2. 严禁提交调试产物

请确保 PR 中**不包含**以下文件(已加入 `.gitignore`,但请勿用 `git add -f` 强加):

- `*.token` / `token-*.txt` / `my-token*.txt`
- `cookies.json` / `chatgpt-session*.json` / `dump-*.json`
- `node_modules/` / `dist/` / `*.zip`

### 🛠 开发流程

```bash
git clone https://github.com/Drikesuy/gptsession.git
cd gptsession
npm install   # 安装 ESLint / Prettier(可选)
```

**代码规范:**

- 提交前请运行 `npm run lint` 确保无 ESLint 报错
- 运行 `npm run format` 统一代码风格(Prettier)
- JavaScript 使用双引号、分号结尾、2 空格缩进(配置见 `.eslintrc.json` / `.prettierrc.json`)

**提交规范(Conventional Commits):**

```
<type>(<scope>): <subject>

feat:     新功能
fix:      bug 修复
docs:     文档变更
style:    代码格式(不影响功能)
refactor: 重构(既不是 feat 也不是 fix)
chore:    构建 / 工具链变更
```

示例:

```
feat(popup): 支持从 JSON 响应自动提取 sessionToken
fix(background): 修复超长 Token 分片写入失败
docs: 完善 README 免责声明
```

### 🧪 测试

本项目无自动化测试。提交 PR 前,请按 [AGENTS.md](./AGENTS.md) 第 5 节的 6 项验收测试**手动验证**:

- [ ] 权限准确(无多余域名权限警告)
- [ ] 剪贴板容错(有 / 无内容均不报错)
- [ ] 容错清洗(带前缀 / 引号 / JSON 均能清洗)
- [ ] Cookie 完整性(Secure=true,过期=1 年后)
- [ ] 无感刷新(chatgpt.com 当前页刷新登录)
- [ ] 跨页跳转(其他网页跳转至 chatgpt.com)

### 📝 PR 流程

1. Fork 本仓库
2. 创建分支:`git checkout -b feat/your-feature`
3. 提交更改(遵循上述 commit 规范)
4. 推送:`git push origin feat/your-feature`
5. 在 GitHub 发起 PR,描述清晰(参考 [.github/PULL_REQUEST_TEMPLATE.md](./.github/PULL_REQUEST_TEMPLATE.md))

PR 标题前请加类型前缀,如 `feat:` / `fix:` / `docs:`。

### 🤔 关于本项目的边界

本项目**不会**新增以下功能(PR 提了也会被拒):

- 上架 Chrome Web Store(违反政策)
- 自动批量注册 / 自动登录多个 ChatGPT 账号
- 绕过 OpenAI 的任何风控、验证码、设备指纹
- 任何与黑产、商业转售账号相关的功能

欢迎的功能方向:

- 代码质量改进、bug 修复
- 兼容性增强(更多 Chromium 浏览器)
- 无障碍、国际化(i18n)
- 更好的 UI / UX(保持暗黑风格一致性)

### 💬 沟通

- Bug / 功能建议 → Issue(使用模板)
- 安全漏洞 → 按上方"安全策略"私下反馈
- 其他讨论 → GitHub Discussions(如未开启可先发 Issue)

---

## 📄 许可证

[MIT License](./LICENSE) © 2026 Drikesuy
