# 🔧 部署问题修复指南

## 🚨 常见部署错误及解决方案

### 错误 1: KV namespace 'local-test-kv' is not valid

**原因**: 使用了本地测试的 KV 命名空间 ID

**解决方案**:

#### 对于 Cloudflare Pages 部署：
1. **不需要修改 wrangler.toml**
2. **在 Cloudflare Dashboard 中配置**：
   - 进入你的 Pages 项目
   - Settings → Functions → KV namespace bindings
   - 添加绑定：Variable name = `PASTE_KV`，选择你创建的 KV 命名空间

#### 对于 Workers 部署：
1. **创建真实的 KV 命名空间**：
   ```bash
   wrangler kv:namespace create "PASTE_KV"
   wrangler kv:namespace create "PASTE_KV" --preview
   ```

2. **更新 wrangler.toml**：
   ```toml
   [[kv_namespaces]]
   binding = "PASTE_KV"
   id = "你的KV命名空间ID"
   preview_id = "你的预览KV命名空间ID"
   ```

### 错误 2: CommonJS module warning

**原因**: ES 模块和 CommonJS 混用

**解决方案**: 已修复，移除了 CommonJS 兼容代码

### 错误 3: Wrangler 版本过旧

**原因**: 使用了过时的 Wrangler 版本

**解决方案**:
```bash
npm install --save-dev wrangler@4
```

## 🌟 推荐的部署方式

### 方式一：Cloudflare Pages（推荐）

**优势**: 零配置，自动处理 KV 绑定

1. **Fork 仓库到 GitHub**
2. **连接 Cloudflare Pages**：
   - Dashboard → Workers & Pages → Create Application → Pages
   - Connect to Git → 选择仓库
3. **配置设置**：
   - 项目名称: `paste-web`
   - 生产分支: `main`
   - 构建命令: (留空)
   - 构建输出目录: (留空)
4. **环境变量**：
   ```
   ADMIN_PASSWORD = zhouzhou12203
   ACCESS_PASSWORD = (可选)
   RATE_LIMIT_MAX = 5
   RATE_LIMIT_WINDOW = 60
   ```
5. **KV 绑定**：
   - 创建 KV 命名空间: `PASTE_KV`
   - 在 Functions 设置中绑定

### 方式二：Workers 部署

**需要手动配置 KV**

1. **创建 KV 命名空间**：
   ```bash
   wrangler kv:namespace create "PASTE_KV"
   wrangler kv:namespace create "PASTE_KV" --preview
   ```

2. **更新 wrangler.toml**：
   ```toml
   [[kv_namespaces]]
   binding = "PASTE_KV"
   id = "实际的KV命名空间ID"
   preview_id = "实际的预览KV命名空间ID"
   ```

3. **部署**：
   ```bash
   npm run deploy
   ```

## 🔍 调试步骤

### 1. 检查 KV 命名空间

```bash
# 列出所有 KV 命名空间
wrangler kv:namespace list

# 检查特定命名空间
wrangler kv:key list --binding PASTE_KV
```

### 2. 验证配置

```bash
# 检查 wrangler 配置
wrangler whoami

# 验证项目配置
wrangler dev --local
```

### 3. 查看部署日志

在 Cloudflare Dashboard 中：
- Pages: Deployments → 查看构建日志
- Workers: 查看部署历史和错误

## 🎯 快速修复命令

```bash
# 1. 更新依赖
npm install

# 2. 创建 KV 命名空间（仅 Workers 需要）
wrangler kv:namespace create "PASTE_KV"
wrangler kv:namespace create "PASTE_KV" --preview

# 3. 本地测试
npm run dev

# 4. 部署（根据方式选择）
npm run deploy  # Workers
# 或通过 Pages Dashboard 重新部署
```

## 📞 获取帮助

如果仍有问题：

1. **检查 Cloudflare Status**: https://www.cloudflarestatus.com/
2. **查看 Wrangler 文档**: https://developers.cloudflare.com/workers/wrangler/
3. **提交 Issue**: 在项目 GitHub 仓库中提交问题
4. **Cloudflare Discord**: 加入官方 Discord 社区

## ✅ 成功部署检查清单

- [ ] KV 命名空间已创建并正确绑定
- [ ] 环境变量已设置
- [ ] Wrangler 版本为 4.x
- [ ] 没有 CommonJS 警告
- [ ] 部署成功且应用可访问
- [ ] 管理员面板可正常使用
