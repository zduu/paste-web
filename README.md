# Paste Web - Cloudflare版本

一个现代化的网络剪贴板应用，专为Cloudflare部署优化，无需任何服务器配置。

## ✨ 特性

- 🚀 **零配置部署** - 只需Cloudflare账号即可部署
- 📱 **响应式设计** - 完美支持移动端和桌面端
- 🔒 **安全可靠** - 内置频率限制和XSS防护
- 📝 **Markdown支持** - 支持Markdown语法和LaTeX数学公式
- 🎯 **功能丰富** - 置顶、隐藏、删除、备注等功能
- ⚡ **高性能** - 基于Cloudflare Workers，全球CDN加速
- 🛠️ **管理员面板** - 完整的后台管理系统
- 🔐 **访问控制** - 可设置网站访问密码
- 👨‍💼 **权限管理** - 管理员可查看所有信息

## 🚀 快速部署

### 🌟 方式一：Cloudflare Pages + GitHub（推荐！）

**最简单的零配置部署方式：**

1. **Fork 这个仓库到你的 GitHub**
2. **连接 Cloudflare Pages**：
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Workers & Pages → Create Application → Pages → Connect to Git
   - 选择你 Fork 的仓库
3. **配置环境变量**：
   - `ADMIN_PASSWORD`: 管理员密码
   - `ACCESS_PASSWORD`: 网站访问密码（可选）
4. **创建并绑定 KV 存储**：
   - 创建名为 `PASTE_KV` 的 KV 命名空间
   - 在 Pages 设置中绑定 KV
5. **完成！** 每次推送代码都会自动部署

📖 **详细步骤**: [Cloudflare Pages 部署指南](CLOUDFLARE-PAGES.md)

### ⚡ 方式二：直接 Workers 部署

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Workers & Pages → Create Application → Workers
3. 复制 `worker.js` 内容到编辑器
4. 配置环境变量和 KV 存储
5. 保存并部署

### 🤖 方式三：GitHub Actions 自动部署

1. Fork 仓库并设置 Secrets：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. 推送代码自动部署

## 🔧 配置

### 环境变量
- `ADMIN_PASSWORD`: 管理员密码（默认：zhouzhou12203）
- `ACCESS_PASSWORD`: 网站访问密码（留空表示无需密码）
- `RATE_LIMIT_MAX`: 频率限制最大请求数（默认：5）
- `RATE_LIMIT_WINDOW`: 频率限制时间窗口秒数（默认：60）

### KV存储
应用使用Cloudflare KV存储数据，自动处理数据持久化。

## 📖 功能说明

1. **文本保存** - 支持长文本和Markdown格式
2. **置顶功能** - 重要内容可置顶显示
3. **隐藏功能** - 敏感内容可隐藏，复制时显示占位符
4. **删除功能** - 支持批量删除（需管理员密码）
5. **备注功能** - 为每条记录添加备注说明
6. **频率限制** - 防止恶意提交，可配置限制策略
7. **移动端优化** - 响应式设计，完美支持手机操作
8. **管理员面板** - 访问 `/admin` 进入管理后台

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 部署到Cloudflare
npm run deploy
```

## 📚 文档

- 🌟 [Cloudflare Pages 部署](CLOUDFLARE-PAGES.md) - 推荐的零配置部署方式
- 📖 [快速开始指南](QUICKSTART.md) - 5分钟快速部署
- 🚀 [详细部署指南](DEPLOY.md) - 完整部署说明
- 🛠️ [管理员配置指南](ADMIN-GUIDE.md) - 管理员功能说明
- 📋 [重构总结](REFACTOR-SUMMARY.md) - 技术重构详情

## 📝 更新日志

### v2.1.0 (Cloudflare Pages 支持)
- 🌟 新增 Cloudflare Pages 直接部署支持
- 🔄 GitHub 仓库自动构建和部署
- 📦 零配置部署体验
- 🚀 自动预览环境

### v2.0.0 (Cloudflare版本)
- 🔄 完全重构为Cloudflare Workers应用
- ⚡ 使用Cloudflare KV存储替代文件存储
- 🚀 支持一键部署，无需服务器配置
- 🔧 GitHub Actions自动部署支持
- 🛡️ 增强的安全性和性能优化
- 🛠️ 新增管理员面板和访问控制

### v1.x (PHP版本)
- 基础的剪贴板功能
- PHP + JSON文件存储
- Apache服务器部署

## 🎯 部署方式对比

| 特性 | Cloudflare Pages | Workers 部署 | GitHub Actions |
|------|------------------|--------------|----------------|
| **配置复杂度** | ⭐⭐⭐⭐⭐ 最简单 | ⭐⭐⭐ 简单 | ⭐⭐ 中等 |
| **自动部署** | ✅ GitHub 推送 | ❌ 手动 | ✅ GitHub 推送 |
| **预览环境** | ✅ 自动创建 | ❌ 无 | ❌ 无 |
| **自定义域名** | ✅ 免费 SSL | ✅ 免费 SSL | ✅ 免费 SSL |
| **适用场景** | 🏆 推荐所有用户 | 快速测试 | 团队协作 |

## 📄 许可证

MIT License

---

**🌟 推荐使用 Cloudflare Pages 部署，体验最佳的零配置部署流程！**
