# 🛠️ 管理员配置指南

## 📋 概述

新版本的 Paste Web 增加了完整的管理员系统，包括：

- 🔐 **访问密码保护** - 可设置网站访问密码
- 👨‍💼 **管理员面板** - 完整的后台管理界面
- 📊 **数据统计** - 查看系统使用情况
- 🔧 **配置管理** - 修改系统参数
- 📝 **数据管理** - 查看、编辑、删除所有数据

## 🚀 快速开始

### 1. 访问管理员面板

在浏览器中访问：`https://你的域名/admin`

### 2. 默认密码

- **管理员密码**：`zhouzhou12203`
- **访问密码**：未设置（无需密码即可访问网站）

## ⚙️ 配置选项

### 环境变量配置

在 Cloudflare Dashboard 的 Workers 设置中配置以下环境变量：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `ADMIN_PASSWORD` | `zhouzhou12203` | 管理员密码 |
| `ACCESS_PASSWORD` | `""` (空) | 网站访问密码，留空则无需密码 |
| `RATE_LIMIT_MAX` | `5` | 频率限制：最大请求数 |
| `RATE_LIMIT_WINDOW` | `60` | 频率限制：时间窗口（秒） |

### 本地开发配置

在 `wrangler.toml` 文件中：

```toml
[vars]
ADMIN_PASSWORD = "你的管理员密码"
ACCESS_PASSWORD = "你的访问密码"  # 留空表示不需要访问密码
RATE_LIMIT_MAX = "5"
RATE_LIMIT_WINDOW = "60"
```

## 🔐 安全功能

### 1. 访问密码保护

启用后，用户访问网站需要输入密码：

```toml
# 启用访问保护
ACCESS_PASSWORD = "your-access-password"

# 禁用访问保护
ACCESS_PASSWORD = ""
```

### 2. 管理员权限

管理员可以：
- ✅ 查看所有条目（包括隐藏的）
- ✅ 查看完整的条目信息（包括IP地址、时间戳）
- ✅ 置顶/取消置顶任何条目
- ✅ 隐藏/显示任何条目
- ✅ 删除任何条目
- ✅ 批量清理数据
- ✅ 导出所有数据
- ✅ 修改系统配置

## 📊 管理员面板功能

### 1. 系统统计

- 📈 总条目数
- 📌 置顶条目数
- 🙈 隐藏条目数
- 📝 带备注条目数

### 2. 安全配置

- 🔐 访问密码保护开关
- 🔑 访问密码设置
- 👨‍💼 管理员密码修改

### 3. 系统配置

- ⚡ 频率限制设置
- 🎛️ 其他系统参数

### 4. 数据管理

- 📋 查看所有条目（包括隐藏的）
- ✏️ 编辑条目状态
- 🗑️ 删除条目
- 📤 导出数据
- 🧹 批量清理

## 🔧 配置步骤

### 步骤 1: 设置管理员密码

1. **本地开发**：
   ```toml
   # 在 wrangler.toml 中
   [vars]
   ADMIN_PASSWORD = "your-new-admin-password"
   ```

2. **生产环境**：
   - 登录 Cloudflare Dashboard
   - 进入 Workers & Pages
   - 选择你的 Worker
   - 进入 Settings → Variables
   - 编辑 `ADMIN_PASSWORD` 变量

### 步骤 2: 设置访问密码（可选）

1. **启用访问保护**：
   ```toml
   ACCESS_PASSWORD = "your-access-password"
   ```

2. **禁用访问保护**：
   ```toml
   ACCESS_PASSWORD = ""
   ```

### 步骤 3: 调整频率限制

```toml
RATE_LIMIT_MAX = "10"      # 允许更多请求
RATE_LIMIT_WINDOW = "120"  # 更长的时间窗口
```

## 🎯 使用场景

### 场景 1: 个人使用

```toml
ADMIN_PASSWORD = "my-secret-password"
ACCESS_PASSWORD = ""  # 无需访问密码
RATE_LIMIT_MAX = "20"
RATE_LIMIT_WINDOW = "60"
```

### 场景 2: 团队使用

```toml
ADMIN_PASSWORD = "admin-password"
ACCESS_PASSWORD = "team-access-password"  # 团队成员需要密码
RATE_LIMIT_MAX = "50"
RATE_LIMIT_WINDOW = "60"
```

### 场景 3: 公开使用

```toml
ADMIN_PASSWORD = "super-secret-admin-password"
ACCESS_PASSWORD = ""  # 公开访问
RATE_LIMIT_MAX = "5"   # 严格限制
RATE_LIMIT_WINDOW = "60"
```

## 🛡️ 安全建议

### 1. 密码安全

- ✅ 使用强密码（至少12位，包含大小写字母、数字、特殊字符）
- ✅ 定期更换密码
- ✅ 不要在代码中硬编码密码
- ✅ 使用环境变量存储敏感信息

### 2. 访问控制

- ✅ 根据需要启用访问密码保护
- ✅ 定期检查访问日志
- ✅ 监控异常访问行为

### 3. 数据保护

- ✅ 定期备份数据
- ✅ 谨慎使用批量删除功能
- ✅ 重要数据设置为置顶状态

## 🔍 故障排除

### 问题 1: 无法访问管理员面板

**解决方案**：
1. 检查管理员密码是否正确
2. 清除浏览器缓存和 Cookie
3. 确认环境变量设置正确

### 问题 2: 访问密码不生效

**解决方案**：
1. 确认 `ACCESS_PASSWORD` 环境变量已设置
2. 重新部署 Worker
3. 清除浏览器缓存

### 问题 3: 配置更新不生效

**解决方案**：
1. 在 Cloudflare Dashboard 中更新环境变量
2. 重新部署 Worker
3. 等待几分钟让配置生效

## 📞 技术支持

如果遇到问题：

1. 📖 查看 [部署指南](DEPLOY.md)
2. 🔍 检查浏览器控制台错误
3. 📋 查看 Worker 日志：`wrangler tail`
4. 🐛 在 GitHub 提交 Issue

## 🎉 享受管理

现在您拥有了一个功能完整的管理员系统！可以：

- 🔐 保护您的剪贴板应用
- 📊 监控使用情况
- 🛠️ 灵活配置系统
- 📝 高效管理数据

祝您使用愉快！ 🚀
