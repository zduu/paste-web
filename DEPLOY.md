# Paste Web - Cloudflare 部署指南

本指南将帮助您将 Paste Web 部署到 Cloudflare Workers，实现零配置的全球化部署。

## 🎯 部署方式选择

### 方式一：一键脚本部署（推荐新手）

1. **克隆仓库**
   ```bash
   git clone https://github.com/your-username/paste-web.git
   cd paste-web
   ```

2. **运行部署脚本**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **按提示完成配置**
   - 脚本会自动安装依赖
   - 引导您登录 Cloudflare
   - 自动创建 KV 存储
   - 完成部署

### 方式二：手动部署（推荐有经验用户）

#### 步骤 1: 准备环境

1. **安装 Node.js**（版本 16+）
   ```bash
   # 检查版本
   node --version
   npm --version
   ```

2. **安装 Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

3. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

#### 步骤 2: 配置项目

1. **克隆并进入项目**
   ```bash
   git clone https://github.com/your-username/paste-web.git
   cd paste-web
   npm install
   ```

2. **创建 KV 命名空间**
   ```bash
   # 生产环境
   wrangler kv:namespace create "PASTE_KV"
   # 预览环境
   wrangler kv:namespace create "PASTE_KV" --preview
   ```

3. **更新 wrangler.toml**
   将创建的 KV 命名空间 ID 填入 `wrangler.toml` 文件：
   ```toml
   [[kv_namespaces]]
   binding = "PASTE_KV"
   id = "你的KV命名空间ID"
   preview_id = "你的预览KV命名空间ID"
   ```

#### 步骤 3: 部署

```bash
# 部署到生产环境
wrangler deploy

# 或部署到开发环境
wrangler deploy --env development
```

### 方式三：GitHub Actions 自动部署

1. **Fork 仓库**
   在 GitHub 上 Fork 这个仓库到您的账户

2. **获取 Cloudflare 凭据**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
   - 创建 API Token，权限包括：
     - Zone:Zone:Read
     - Zone:Zone Settings:Edit
     - Account:Cloudflare Workers:Edit
   - 获取您的 Account ID

3. **配置 GitHub Secrets**
   在您的 GitHub 仓库中，进入 Settings → Secrets and variables → Actions，添加：
   - `CLOUDFLARE_API_TOKEN`: 您的 API Token
   - `CLOUDFLARE_ACCOUNT_ID`: 您的 Account ID

4. **推送代码**
   ```bash
   git push origin main
   ```
   GitHub Actions 会自动部署到 Cloudflare Workers

## ⚙️ 配置选项

### 环境变量

在 Cloudflare Dashboard 的 Workers 设置中配置：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `ADMIN_PASSWORD` | `zhouzhou12203` | 管理员密码 |
| `RATE_LIMIT_MAX` | `5` | 频率限制：最大请求数 |
| `RATE_LIMIT_WINDOW` | `60` | 频率限制：时间窗口（秒） |

### 自定义域名

1. 在 Cloudflare Dashboard 中进入您的 Worker
2. 点击 "Triggers" 标签
3. 点击 "Add Custom Domain"
4. 输入您的域名并完成验证

## 🔧 高级配置

### 修改样式主题

编辑 `worker.js` 中的 CSS 变量：
```css
:root {
    --bg-color: #47494d;        /* 背景色 */
    --card-bg: #272424;         /* 卡片背景 */
    --text-color: #f7f7f7;      /* 文字颜色 */
    --accent-color: #4a90e2;    /* 强调色 */
}
```

### 调整频率限制

修改环境变量或直接在代码中调整：
```javascript
const rateLimiter = new RateLimiter(
  env.PASTE_KV, 
  clientIP, 
  5,  // 最大请求数
  60  // 时间窗口（秒）
);
```

### 数据备份

使用 Wrangler CLI 备份 KV 数据：
```bash
# 导出所有数据
wrangler kv:key list --binding PASTE_KV
wrangler kv:key get "entries" --binding PASTE_KV
```

## 🚨 故障排除

### 常见问题

1. **部署失败：权限错误**
   - 检查 API Token 权限
   - 确认 Account ID 正确

2. **KV 存储访问失败**
   - 确认 KV 命名空间已创建
   - 检查 wrangler.toml 中的绑定配置

3. **频率限制过于严格**
   - 调整 `RATE_LIMIT_MAX` 和 `RATE_LIMIT_WINDOW`
   - 或在代码中修改限制逻辑

4. **样式显示异常**
   - 检查 CDN 资源是否可访问
   - 确认 CSP 策略允许外部资源

### 日志查看

```bash
# 查看实时日志
wrangler tail

# 查看特定时间段的日志
wrangler tail --since 1h
```

## 📞 支持

如果遇到问题，请：
1. 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
2. 在 GitHub 仓库中提交 Issue
3. 检查 Cloudflare Dashboard 中的错误日志

## 🎉 完成

部署成功后，您将获得：
- 全球 CDN 加速的剪贴板应用
- 零服务器维护成本
- 自动 HTTPS 和安全防护
- 高可用性和扩展性

享受您的现代化剪贴板应用吧！ 🚀
