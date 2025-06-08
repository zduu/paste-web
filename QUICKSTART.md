# 🚀 快速开始指南

只需5分钟，即可将 Paste Web 部署到 Cloudflare！

## 📋 前置要求

- ✅ Cloudflare 账号（免费）
- ✅ Node.js 16+ 
- ✅ Git

## 🎯 四种部署方式

### 🌟 方式一：Cloudflare Pages + GitHub（推荐！零配置）

**最简单的部署方式，无需任何配置！**

1. **Fork 仓库到你的 GitHub**
   - 访问项目仓库
   - 点击右上角 "Fork" 按钮

2. **连接 Cloudflare Pages**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "Workers & Pages"
   - 点击 "Create Application" → "Pages" → "Connect to Git"
   - 选择你 Fork 的仓库
   - 点击 "Begin setup"

3. **配置构建设置**
   ```
   项目名称: paste-web (或自定义)
   生产分支: main
   构建命令: (留空)
   构建输出目录: (留空)
   ```

4. **环境变量设置**
   在 Pages 设置中添加：
   ```
   ADMIN_PASSWORD = zhouzhou12203
   ACCESS_PASSWORD = (留空或设置访问密码)
   RATE_LIMIT_MAX = 5
   RATE_LIMIT_WINDOW = 60
   ```

5. **创建 KV 存储**
   - 在 Cloudflare Dashboard 中创建 KV 命名空间
   - 名称：`PASTE_KV`
   - 在 Pages 设置的 "Functions" → "KV namespace bindings" 中绑定

6. **部署完成！**
   - 每次推送代码到 GitHub 都会自动部署
   - 访问你的自定义域名或 Cloudflare 提供的域名

### 🔥 方式二：一键配置（推荐新手）

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/paste-web.git
cd paste-web

# 2. 运行配置向导
npm run setup
```

配置向导会自动：
- ✅ 安装所有依赖
- ✅ 配置 Cloudflare 登录
- ✅ 创建 KV 存储
- ✅ 部署应用

### ⚡ 方式三：手动部署（推荐有经验用户）

```bash
# 1. 克隆并安装
git clone https://github.com/your-username/paste-web.git
cd paste-web
npm install

# 2. 安装 Wrangler
npm install -g wrangler

# 3. 登录 Cloudflare
wrangler login

# 4. 创建 KV 存储
wrangler kv:namespace create "PASTE_KV"
wrangler kv:namespace create "PASTE_KV" --preview

# 5. 更新 wrangler.toml 中的 KV ID

# 6. 部署
wrangler deploy
```

### 🤖 方式四：GitHub Actions（推荐团队）

1. **Fork 仓库**
2. **设置 Secrets**：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. **推送代码** → 自动部署

## ⚙️ 基础配置

### 修改管理员密码

在 `wrangler.toml` 中：
```toml
[vars]
ADMIN_PASSWORD = "你的新密码"
```

### 设置访问密码保护

```toml
[vars]
ACCESS_PASSWORD = "网站访问密码"  # 启用访问保护
# ACCESS_PASSWORD = ""           # 禁用访问保护
```

### 调整频率限制

```toml
[vars]
RATE_LIMIT_MAX = "10"      # 最大请求数
RATE_LIMIT_WINDOW = "60"   # 时间窗口（秒）
```

### 自定义域名

1. 在 Cloudflare Dashboard 中进入你的 Worker
2. 点击 "Triggers" → "Add Custom Domain"
3. 输入域名并验证

## 📊 数据迁移

从 PHP 版本迁移：

```bash
# 迁移数据
npm run migrate /path/to/12203data.json

# 导入到 Cloudflare
wrangler kv:key put "entries" --path cloudflare-data.json --binding PASTE_KV
```

## 🛠️ 常用命令

```bash
# 本地开发
npm run dev

# 查看日志
npm run logs

# 备份数据
npm run kv:backup

# 测试基础功能
npm run test

# 测试管理员功能
npm run test:admin

# 查看 KV 数据
npm run kv:list

# 部署到生产环境
npm run deploy:prod
```

## 🎨 自定义样式

编辑 `worker.js` 中的 CSS 变量：

```css
:root {
    --bg-color: #47494d;        /* 背景色 */
    --card-bg: #272424;         /* 卡片背景 */
    --text-color: #f7f7f7;      /* 文字颜色 */
    --accent-color: #4a90e2;    /* 强调色 */
}
```

## 🔧 故障排除

### 常见问题

**Q: 部署失败，提示权限错误**
```bash
# 重新登录
wrangler logout
wrangler login
```

**Q: KV 存储访问失败**
```bash
# 检查 KV 绑定
wrangler kv:namespace list
```

**Q: 应用无法访问**
```bash
# 检查部署状态
wrangler deployments list
```

### 获取帮助

- 📖 [详细部署指南](DEPLOY.md)
- 🌐 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- 🐛 [提交 Issue](https://github.com/your-username/paste-web/issues)

## ✨ 功能特性

- 📝 **Markdown 支持** - 支持完整的 Markdown 语法
- 🧮 **LaTeX 数学公式** - 使用 KaTeX 渲染数学公式
- 📌 **置顶功能** - 重要内容可置顶显示
- 🔒 **隐藏功能** - 敏感内容可隐藏
- 📱 **移动端优化** - 完美支持手机操作
- ⚡ **全球 CDN** - Cloudflare 全球加速
- 🛡️ **安全防护** - 内置 XSS 防护和频率限制
- 🛠️ **管理员面板** - 完整的后台管理系统
- 🔐 **访问控制** - 可设置网站访问密码
- 👨‍💼 **权限管理** - 管理员可查看所有信息

## 🎉 完成！

部署成功后，你将获得：
- 🌍 全球访问的剪贴板应用
- 💰 零服务器成本
- 🔒 自动 HTTPS 和安全防护
- 📈 高可用性和扩展性

**访问你的应用：** `https://paste-web.你的用户名.workers.dev`

---

**需要帮助？** 查看 [DEPLOY.md](DEPLOY.md) 获取详细说明，或在 GitHub 上提交 Issue。
