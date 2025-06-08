# 🌟 Cloudflare Pages 部署指南

使用 Cloudflare Pages 部署 Paste Web 是最简单的方式，真正实现零配置部署！

## 🚀 为什么选择 Cloudflare Pages？

- ✅ **零配置部署** - 直接连接 GitHub，自动构建
- ✅ **自动更新** - 推送代码自动部署
- ✅ **免费额度** - 慷慨的免费使用额度
- ✅ **全球 CDN** - 自动全球分发
- ✅ **自定义域名** - 免费 SSL 证书
- ✅ **预览部署** - 每个 PR 都有预览环境

## 📋 部署步骤

### 步骤 1: 准备 GitHub 仓库

1. **Fork 项目仓库**
   - 访问项目的 GitHub 页面
   - 点击右上角的 "Fork" 按钮
   - 选择你的 GitHub 账户

2. **克隆到本地（可选）**
   ```bash
   git clone https://github.com/你的用户名/paste-web.git
   cd paste-web
   ```

### 步骤 2: 连接 Cloudflare Pages

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 登录你的 Cloudflare 账户

2. **创建 Pages 项目**
   - 点击左侧菜单 "Workers & Pages"
   - 点击 "Create Application"
   - 选择 "Pages" 标签
   - 点击 "Connect to Git"

3. **授权 GitHub**
   - 选择 "GitHub" 作为 Git 提供商
   - 授权 Cloudflare 访问你的 GitHub 账户
   - 选择你 Fork 的 `paste-web` 仓库

4. **配置构建设置**
   ```
   项目名称: paste-web (或你喜欢的名称)
   生产分支: main
   构建命令: (留空)
   构建输出目录: (留空)
   根目录: (留空)
   ```

5. **点击 "Save and Deploy"**

### 步骤 3: 配置环境变量

1. **进入项目设置**
   - 部署完成后，进入项目的 "Settings" 页面
   - 点击 "Environment variables" 标签

2. **添加环境变量**
   
   **生产环境变量：**
   ```
   ADMIN_PASSWORD = zhouzhou12203
   ACCESS_PASSWORD = (留空或设置你的访问密码)
   RATE_LIMIT_MAX = 5
   RATE_LIMIT_WINDOW = 60
   ```

   **预览环境变量（可选）：**
   ```
   ADMIN_PASSWORD = test123
   ACCESS_PASSWORD = 
   RATE_LIMIT_MAX = 10
   RATE_LIMIT_WINDOW = 60
   ```

### 步骤 4: 配置 KV 存储

1. **创建 KV 命名空间**
   - 在 Cloudflare Dashboard 中，点击 "Workers & Pages"
   - 点击 "KV" 标签
   - 点击 "Create a namespace"
   - 命名为 `PASTE_KV`

2. **绑定 KV 到 Pages**
   - 回到你的 Pages 项目
   - 进入 "Settings" → "Functions"
   - 找到 "KV namespace bindings"
   - 点击 "Add binding"
   - Variable name: `PASTE_KV`
   - KV namespace: 选择刚创建的 `PASTE_KV`
   - 点击 "Save"

### 步骤 5: 重新部署

1. **触发重新部署**
   - 进入 "Deployments" 页面
   - 点击最新部署旁的 "Retry deployment"
   - 或者推送一个新的提交到 GitHub

2. **验证部署**
   - 等待部署完成
   - 访问提供的 URL
   - 测试所有功能

## 🎯 自动部署流程

配置完成后，你的工作流程将是：

1. **本地开发**
   ```bash
   git clone https://github.com/你的用户名/paste-web.git
   cd paste-web
   # 修改代码
   git add .
   git commit -m "更新功能"
   git push origin main
   ```

2. **自动部署**
   - Cloudflare Pages 检测到推送
   - 自动构建和部署
   - 几分钟后新版本上线

3. **预览部署**
   - 创建 Pull Request
   - Cloudflare 自动创建预览环境
   - 在合并前测试更改

## 🔧 高级配置

### 自定义域名

1. **添加自定义域名**
   - 在 Pages 项目设置中点击 "Custom domains"
   - 点击 "Set up a custom domain"
   - 输入你的域名
   - 按照指示配置 DNS

2. **SSL 证书**
   - Cloudflare 自动提供免费 SSL 证书
   - 支持通配符证书

### 分支部署

```
main 分支 → 生产环境
develop 分支 → 预览环境
feature/* 分支 → 临时预览环境
```

### 构建钩子

在项目根目录创建 `_build.sh`（如果需要）：
```bash
#!/bin/bash
echo "开始构建 Paste Web..."
# 这里可以添加自定义构建步骤
echo "构建完成！"
```

## 🐛 故障排除

### 常见问题

**Q: 部署失败 - KV namespace 'local-test-kv' is not valid**
- 这是配置问题，不影响 Pages 部署
- 在 Pages 中，KV 通过 Dashboard 绑定，不需要 wrangler.toml 配置
- 确保在 Functions 设置中正确绑定了 KV 命名空间

**Q: 部署成功但访问 404**
- 检查 `_routes.json` 文件是否正确
- 确认 `functions/_worker.js` 和 `functions/[[path]].js` 文件存在
- 等待几分钟让部署完全生效

**Q: KV 存储错误**
- 确认 KV 命名空间已创建并绑定
- 检查绑定的变量名是否为 `PASTE_KV`
- 重新部署项目

**Q: 环境变量不生效**
- 在 Pages 设置中检查环境变量配置
- 重新部署项目
- 检查变量名是否正确（区分大小写）

**Q: 自定义域名无法访问**
- 检查 DNS 配置
- 等待 DNS 传播（最多 24 小时）
- 确认域名已在 Cloudflare 中验证

**Q: CommonJS 模块警告**
- 这是警告，不影响功能
- 已在最新版本中修复

### 调试技巧

1. **查看部署日志**
   - 在 "Deployments" 页面查看构建日志
   - 检查错误信息

2. **使用预览环境**
   - 在 PR 中测试更改
   - 避免直接在生产环境调试

3. **实时日志**
   ```bash
   # 使用 wrangler 查看实时日志
   wrangler pages deployment tail
   ```

## 🎉 完成！

现在你拥有了一个完全自动化的部署流程：

- 🔄 **自动部署** - 推送代码即部署
- 🌍 **全球访问** - Cloudflare 全球 CDN
- 🔒 **安全可靠** - 自动 HTTPS 和安全防护
- 💰 **零成本** - 使用免费额度
- 📈 **高性能** - 边缘计算优化

享受你的现代化剪贴板应用吧！ 🚀

## 📞 需要帮助？

- 📖 查看 [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- 🐛 在 GitHub 仓库提交 Issue
- 💬 加入 Cloudflare Discord 社区
