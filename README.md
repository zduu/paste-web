# 🗂️ Paste Web - 现代化网络剪贴板

一个功能强大的网络剪贴板应用，专为 Cloudflare 部署优化，支持 Markdown 和 LaTeX 数学公式。

## ✨ 核心特性

### 🎨 现代化界面
- 🌟 **深色主题设计** - 护眼舒适的现代化界面，优化的链接对比度
- 📱 **完美响应式** - 移动端和桌面端完美适配，智能布局调整
- ⚡ **流畅动画** - 优雅的交互动画和过渡效果
- 🎯 **直观操作** - 简洁明了的用户体验，一键复制功能

### 📝 强大功能
- 📝 **Markdown 完整支持** - 支持所有标准 Markdown 语法，实时渲染
- 🧮 **LaTeX 数学公式** - 使用 KaTeX 渲染数学公式 `$E=mc^2$`
- 📌 **智能管理** - 置顶、隐藏、删除、备注等丰富功能
- 🔍 **实时搜索** - 支持内容和备注的实时搜索过滤
- ⌨️ **快捷键支持** - `Ctrl+Enter` 保存，`Ctrl+R` 刷新
- 📊 **字符统计** - 实时显示字符数量，颜色提示

### 🛡️ 安全可靠
- 🔒 **多层安全防护** - XSS 防护、频率限制、输入验证、脚本过滤
- 🛠️ **完整管理员面板** - 数据管理、会话管理、系统配置
- 🔐 **双重访问控制** - 网站访问密码 + 管理员密码
- 👨‍💼 **会话管理** - 支持多设备登录管理和强制退出
- 🚫 **智能重试** - 自动处理 Cloudflare Workers 冷启动

### ⚡ 高性能部署
- 🌍 **零配置部署** - 只需 Cloudflare 账号即可部署
- 🚀 **全球 CDN 加速** - 基于 Cloudflare Workers 边缘计算
- 💰 **零成本运行** - 免费额度足够个人和小团队使用
- 🔄 **自动化部署** - GitHub 推送自动部署

## 🚀 快速部署

### 🌟 方式一：Cloudflare Pages（推荐）

**零配置部署，最简单的方式：**

1. **Fork 仓库** - 将项目 Fork 到你的 GitHub
2. **连接 Cloudflare Pages**：
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Workers & Pages → Create Application → Pages → Connect to Git
   - 选择你 Fork 的仓库
3. **配置环境变量**：
   ```
   ADMIN_PASSWORD = 123456
   ACCESS_PASSWORD = (留空或设置访问密码)
   RATE_LIMIT_MAX = 5
   RATE_LIMIT_WINDOW = 60
   ```
4. **创建 KV 存储**：
   - 创建名为 `PASTE_KV` 的 KV 命名空间
   - 在 Pages 设置中绑定 KV
5. **完成！** 每次推送代码都会自动部署

### ⚡ 方式二：Workers 直接部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Workers & Pages → Create Application → Workers
3. 复制 `worker.js` 内容到编辑器
4. 配置环境变量和 KV 存储
5. 保存并部署

### 🤖 方式三：命令行部署

```bash
# 克隆仓库
git clone https://github.com/zduu/paste-web.git
cd paste-web

# 安装依赖
npm install

# 登录 Cloudflare
npx wrangler login

# 创建 KV 存储
npx wrangler kv:namespace create "PASTE_KV"
npx wrangler kv:namespace create "PASTE_KV" --preview

# 更新 wrangler.toml 中的 KV ID，然后部署
npx wrangler deploy
```

## ⚙️ 配置说明

### 环境变量
| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `ADMIN_PASSWORD` | `123456` | 管理员密码，用于访问管理面板 |
| `ACCESS_PASSWORD` | `""` (空) | 网站访问密码，留空则无需密码访问 |
| `RATE_LIMIT_MAX` | `5` | 频率限制：每个时间窗口的最大请求数 |
| `RATE_LIMIT_WINDOW` | `60` | 频率限制：时间窗口长度（秒） |

### KV 存储
应用使用 Cloudflare KV 存储数据，自动处理数据持久化和全球同步。

## 📖 功能特性

### 📝 内容管理
- **文本保存** - 支持长文本和完整 Markdown 语法，自动 HTML 转义
- **数学公式** - 支持 LaTeX 数学公式，如 `$\sum_{i=1}^n x_i$`
- **实时搜索** - 快速搜索文本内容和备注，支持实时过滤
- **置顶功能** - 重要内容可置顶显示，带视觉标识
- **隐藏功能** - 敏感内容可隐藏，复制时显示占位符
- **备注功能** - 为每条记录添加备注说明，支持搜索
- **字符统计** - 实时显示输入字符数量，颜色提示超长内容
- **IP 记录** - 自动记录提交者 IP 地址（管理员可见）

### 🛠️ 管理功能
- **管理员面板** - 访问 `/admin` 进入后台管理
- **会话管理** - 支持多设备登录，可查看活跃会话并强制退出
- **数据导出** - 前端和管理员面板都支持数据导出（JSON格式）
- **数据导入** - 管理员面板支持粘贴导入和文件导入，可选择合并或覆盖
- **批量清理** - 支持清理隐藏条目或清空所有数据
- **系统统计** - 显示总条目数、置顶数、隐藏数等统计信息
- **访问控制** - 双重密码保护（网站访问 + 管理员）

### 🔒 安全特性
- **频率限制** - 防止恶意提交，可配置限制策略
- **XSS 防护** - 内置 DOMPurify 防护 + 脚本标签过滤
- **输入验证** - 严格的数据验证和 HTML 转义
- **会话令牌** - 使用安全的会话令牌替代密码传输
- **IP 追踪** - 记录操作来源 IP，便于安全审计

## 🛠️ 本地开发与调试

### 快速开始
```bash
# 1. 克隆项目
git clone https://github.com/zduu/paste-web.git
cd paste-web

# 2. 安装依赖
npm install

# 3. 本地开发（无需 KV 配置）
npm run dev

# Windows 用户如遇到执行策略错误，请先运行：
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 本地调试说明
- **无需 KV 配置** - 本地开发时会使用内存存储，无需创建真实的 KV 命名空间
- **热重载** - 代码修改后自动重新加载
- **访问地址** - 默认在 `http://localhost:8787` 访问
- **管理员面板** - 访问 `http://localhost:8787/admin` 测试管理功能

### 常用命令
```bash
npm run dev          # 本地开发服务器
npm run deploy       # 部署到生产环境
npm run logs         # 查看实时日志
npm run kv:list      # 查看 KV 数据
npm run kv:backup    # 备份数据
npm run kv:create    # 创建 KV 命名空间
```

### 功能测试
- **本地测试** - 启动 `npm run dev` 后访问 `http://localhost:8787`
- **Markdown 测试** - 在文本框中输入 Markdown 语法测试渲染
- **LaTeX 测试** - 输入数学公式如 `$E=mc^2$` 测试渲染
- **API 测试** - 所有 API 端点在本地开发时都可正常使用

## 📚 Markdown 和 LaTeX 支持

### Markdown 语法示例
```markdown
# 标题
**粗体** *斜体* ~~删除线~~

- 列表项 1
- 列表项 2

> 引用文本

`代码片段`

[链接](https://example.com)
```

### LaTeX 数学公式示例
```latex
行内公式：$E = mc^2$

块级公式：
$$\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n$$

分数：$\frac{a}{b}$

根号：$\sqrt{x^2 + y^2}$

积分：$\int_{0}^{\infty} e^{-x} dx$
```

## 🔧 故障排除

### 常见问题

**Q: 本地开发时 KV 存储错误**
- 本地开发无需配置真实 KV，会自动使用内存存储

**Q: 数学公式不显示**
- 检查网络连接，确保能访问 CDN 资源
- 确认公式语法正确，使用 `$...$` 或 `$$...$$`

**Q: Markdown 不渲染**
- 检查 marked.js 和 DOMPurify 是否正常加载
- 确认内容没有被 XSS 过滤器误删

**Q: 部署后访问 404**
- 检查 KV 命名空间是否正确绑定
- 确认环境变量配置正确

### 📚 相关文档
- 📖 [功能特性详解](FEATURES.md) - 详细的功能说明和使用示例
- 🛠️ [本地开发指南](LOCAL-DEVELOPMENT.md) - 本地开发和调试
- 🌟 [Cloudflare Pages 部署](CLOUDFLARE-PAGES.md) - 零配置部署指南

### 获取帮助
- 📖 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- 🐛 在 GitHub 仓库提交 Issue
- 💬 查看项目文档获取更多信息

## 📝 更新日志

### v2.1.1 (当前版本)
- 🎨 **链接样式优化** - 修复深色背景下链接可读性问题
  - 使用明亮的青蓝色 (#00d4ff) 确保高对比度
  - 悬停时添加发光效果和微动画
  - 已访问链接使用明亮粉色 (#ff6b9d) 进行区分
  - 同时优化主页面和管理员页面的链接显示


---

**🚀 开始使用 Paste Web，享受现代化的剪贴板体验！**
