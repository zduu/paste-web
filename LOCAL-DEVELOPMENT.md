# 🛠️ 本地开发指南

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- Git

### 一键启动

#### 所有平台通用
```bash
# 1. 克隆项目
git clone https://github.com/zduu/paste-web.git
cd paste-web

# 2. 安装依赖
npm install

# 3. 启动本地开发服务器
npm run dev

# 或者启动支持局域网访问的服务器
npm run dev:lan
```

#### Windows 用户注意事项

**如果遇到 PowerShell 执行策略错误或"正在连接服务器..."问题，有以下解决方案：**

**方案一：设置执行策略**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**方案二：使用 CMD 命令行**
```cmd
# 在 CMD 中运行（不是 PowerShell）
npm run dev
```

**方案三：直接运行 wrangler**
```cmd
# 在 CMD 中运行
node_modules\.bin\wrangler dev --local
```

**方案四：启动局域网访问**
```cmd
# 使用 npm 脚本启动局域网访问
npm run dev:lan
```

访问 `http://localhost:8787` 即可开始使用！

### 🌐 局域网访问
本地开发服务器支持局域网访问，方便在其他设备上测试：

1. **启动服务器后**，在命令行中查找显示的 IP 地址
2. **获取本机 IP**：
   ```bash
   # Windows
   ipconfig | findstr "IPv4"

   # macOS/Linux
   ifconfig | grep "inet "
   ```
3. **局域网访问地址**：`http://[本机IP]:8787`
   - 例如：`http://192.168.1.100:8787`
   - 手机、平板等设备可通过此地址访问

**注意事项：**
- 确保防火墙允许 8787 端口访问
- 局域网内的设备需要连接到同一网络
- 某些企业网络可能限制设备间通信

## 📋 本地开发特性

### 🔧 无需配置
- **无需 KV 存储** - 本地开发时自动使用内存存储
- **无需环境变量** - 使用默认配置即可运行
- **热重载** - 代码修改后自动重新加载

### 🎯 默认配置
```javascript
// 本地开发默认配置
ADMIN_PASSWORD = "123456"        // 管理员密码
ACCESS_PASSWORD = "123456"       // 网站访问密码（可在 wrangler.toml 中修改为空）
RATE_LIMIT_MAX = "5"            // 频率限制：最大请求数
RATE_LIMIT_WINDOW = "60"        // 频率限制：时间窗口（秒）
```

### 📝 测试功能
- **主页面**: `http://localhost:8787`
- **管理员面板**: `http://localhost:8787/admin`
- **局域网访问**: `http://[本机IP]:8787`（如 `http://192.168.1.100:8787`）
- **API 测试**: 所有 API 端点都可正常使用
- **会话管理**: 可以测试多设备登录和强制退出功能
- **跨设备测试**: 在手机、平板等设备上测试响应式设计

## 🔨 构建测试

### 本地构建验证
在提交到 Cloudflare 之前，建议进行本地构建测试以确保代码质量：

#### 1. 语法检查
```bash
# 检查 JavaScript 语法
node -c worker.js

# 或使用 wrangler 进行语法验证
npx wrangler dev --dry-run
```

#### 2. 本地部署测试
```bash
# 模拟生产环境部署
npx wrangler dev --local --env production

# 测试不同环境配置
npx wrangler dev --local --env development
```

#### 3. API 端点测试
```bash
# 测试主要 API 端点
curl -X GET http://localhost:8787/api/entries
curl -X POST http://localhost:8787/api/save -d "text=测试内容"

# 测试管理员 API（需要先登录获取 token）
curl -X POST http://localhost:8787/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"123456"}'
```

#### 4. 配置验证
```bash
# 验证 wrangler.toml 配置
npx wrangler config list

# 检查环境变量
npx wrangler secret list
```

#### 5. 自动化测试
```bash
# 运行完整的测试套件
npm run test

# 仅进行语法验证
npm run validate

# 模拟部署测试
npm run deploy:dry

# 基础连通性测试
npm run test:basic
```

#### 6. 性能测试
```bash
# 简单的负载测试
for i in {1..10}; do
  curl -s http://localhost:8787 > /dev/null && echo "请求 $i 成功"
done

# 测试并发请求
curl -X POST http://localhost:8787/api/save -d "text=并发测试1" &
curl -X POST http://localhost:8787/api/save -d "text=并发测试2" &
wait
```

### 部署前检查清单
- [ ] 本地开发服务器正常启动 (`npm run dev`)
- [ ] 语法验证通过 (`npm run validate`)
- [ ] 自动化测试通过 (`npm run test`)
- [ ] 模拟部署成功 (`npm run deploy:dry`)
- [ ] 所有 API 端点响应正常
- [ ] 管理员功能测试通过
- [ ] 响应式设计在不同设备上正常
- [ ] 无 JavaScript 错误
- [ ] KV 存储操作正常
- [ ] 环境变量配置正确

### 快速测试流程
```bash
# 1. 启动本地服务器
npm run dev

# 2. 在新终端中运行测试
npm run test

# 3. 验证语法
npm run validate

# 4. 模拟部署
npm run deploy:dry

# 5. 如果所有测试通过，可以安全部署
npm run deploy
```

## 🧪 功能测试

### 基础功能测试
1. **添加内容** - 测试文本保存功能，验证字符统计
2. **Markdown 渲染** - 测试 Markdown 语法支持和链接样式
3. **LaTeX 公式** - 测试数学公式渲染
4. **复制功能** - 测试剪贴板复制
5. **管理操作** - 测试置顶、隐藏、删除功能
6. **搜索功能** - 测试内容和备注的实时搜索
7. **管理员功能** - 测试登录、会话管理、数据导入导出

### Markdown 测试示例
```markdown
# 标题测试
**粗体** *斜体* ~~删除线~~

- 列表项 1
- 列表项 2

> 引用文本测试

`代码片段测试`

[链接测试](https://example.com)
```

### 🎨 链接样式测试
测试链接在深色背景下的显示效果：
```markdown
访问 [GitHub](https://github.com) 查看源码
搜索 [Google](https://google.com) 获取信息
查看 [文档](https://example.com/docs) 了解更多
```
- 链接应显示为明亮的青蓝色 (#00d4ff)
- 悬停时应有发光效果和微动画
- 已访问链接应显示为明亮粉色 (#ff6b9d)

### LaTeX 公式测试示例
```latex
行内公式：$E = mc^2$

块级公式：
$$\sum_{i=1}^{n} x_i = \frac{1}{n}\sum_{i=1}^{n} x_i$$

分数：$\frac{a}{b}$
根号：$\sqrt{x^2 + y^2}$
积分：$\int_{0}^{\infty} e^{-x} dx$
```

### 🔐 管理员功能测试
测试管理员面板的各项功能：

#### 登录测试
1. 访问 `http://localhost:8787/admin`
2. 使用默认密码 `123456` 登录
3. 验证登录成功后跳转到管理面板

#### 会话管理测试
1. 在不同浏览器或无痕模式下登录
2. 在管理面板中查看活跃会话
3. 测试强制退出所有设备功能

#### 数据管理测试
1. 测试数据导出功能
2. 测试数据导入（粘贴和文件两种方式）
3. 测试清理隐藏条目功能
4. 测试清空所有数据功能（注意：会删除所有数据）

#### 安全测试
1. 测试输入包含 `<script>` 标签的内容（应被拒绝）
2. 测试频率限制（快速提交多次请求）
3. 测试未授权访问管理员接口

## 🔧 开发工具

### 常用命令
```bash
npm run dev          # 启动开发服务器（仅本地访问）
npm run dev:lan      # 启动开发服务器（支持局域网访问）
npm run deploy       # 部署到 Cloudflare
npm run logs         # 查看实时日志（需要部署后）
npm run test         # 基础功能测试
```

### 构建和部署命令
```bash
# 语法检查
node -c worker.js

# 模拟部署（不实际部署）
npx wrangler deploy --dry-run

# 本地生产环境测试
npx wrangler dev --local --env production

# 检查配置
npx wrangler config list

# 验证 KV 绑定
npx wrangler kv:namespace list
```

### 局域网开发命令
```bash
# 获取本机 IP 地址
ipconfig | findstr "IPv4"                    # Windows
ifconfig | grep "inet " | grep -v 127.0.0.1  # macOS/Linux

# 开放防火墙端口（Windows）
netsh advfirewall firewall add rule name="Wrangler Dev" dir=in action=allow protocol=TCP localport=8787

# 测试局域网连接
ping [本机IP]                                # 测试网络连通性
telnet [本机IP] 8787                        # 测试端口开放
```

### 调试技巧
1. **浏览器控制台** - 查看 JavaScript 错误
2. **网络面板** - 检查 API 请求
3. **Wrangler 日志** - 查看服务器端日志

### 代码结构
```
paste-web/
├── worker.js              # 主要应用代码
├── wrangler.toml          # Cloudflare 配置
├── package.json           # 项目配置
├── functions/             # Cloudflare Pages 函数
│   ├── [[path]].js       # 通配符路由
│   └── _worker.js        # 入口文件
└── README.md             # 项目说明
```

## 🐛 常见问题

### Q: Windows PowerShell 执行策略错误
**A**: 运行以下命令解决：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Q: 页面显示"正在连接服务器..."不消失
**A**: 这通常表示本地开发服务器没有正确启动，解决方案：
```bash
# 1. 确认服务器是否启动
# 查看命令行是否显示 "Ready on http://127.0.0.1:8787"

# 2. Windows 用户使用批处理文件
.\dev.bat

# 3. 检查端口是否被占用
netstat -ano | findstr :8787

# 4. 尝试不同的启动方式
node_modules\.bin\wrangler dev --local
```

### Q: npm run dev 启动失败
**A**: 尝试以下解决方案：
```bash
# 1. 清理缓存
npm cache clean --force

# 2. 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 3. 直接使用 wrangler
npx wrangler dev
```

### Q: 本地开发时数据丢失
**A**: 本地开发使用内存存储，重启服务器会丢失数据，这是正常现象。

### Q: KV 命名空间错误
**A**: 本地开发不需要真实的 KV 命名空间，wrangler 会自动创建临时存储。

### Q: Markdown 不渲染
**A**: 检查网络连接，确保能访问 CDN 资源：
- marked.js: `https://cdn.jsdelivr.net/npm/marked/marked.min.js`
- DOMPurify: `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.5/purify.min.js`

### Q: 数学公式不显示
**A**: 检查 KaTeX 资源是否正常加载：
- KaTeX CSS: `https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css`
- KaTeX JS: `https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js`
- Auto-render: `https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js`

### Q: 管理员密码错误
**A**: 本地开发默认密码是 `123456`

### Q: 局域网无法访问
**A**: 检查以下几个方面：
```bash
# 1. 确认服务器绑定到 0.0.0.0
# wrangler.toml 中应包含：ip = "0.0.0.0"

# 2. 检查防火墙设置
# Windows 防火墙
netsh advfirewall firewall add rule name="Wrangler Dev" dir=in action=allow protocol=TCP localport=8787

# 3. 获取正确的本机 IP
ipconfig | findstr "IPv4"

# 4. 测试端口是否开放
telnet [本机IP] 8787
```

### Q: 手机无法访问局域网地址
**A**: 确保手机和电脑连接到同一 WiFi 网络，并检查：
- 路由器是否启用了 AP 隔离（需要关闭）
- 企业网络可能限制设备间通信
- 尝试使用 HTTPS（某些浏览器要求）

### Q: 如何进行构建测试
**A**: 在部署前进行以下测试：
```bash
# 1. 语法检查
node -c worker.js

# 2. 模拟部署测试
npx wrangler deploy --dry-run

# 3. 本地生产环境测试
npx wrangler dev --local --env production

# 4. API 功能测试
npm run test
```

### Q: 部署前如何验证配置
**A**: 检查以下配置项：
```bash
# 检查 wrangler.toml 配置
cat wrangler.toml

# 验证环境变量
npx wrangler secret list

# 检查 KV 命名空间
npx wrangler kv:namespace list

# 验证路由配置
npx wrangler config list
```

### Q: 本地测试与生产环境不一致
**A**: 可能的原因和解决方案：
- **环境变量差异**: 检查本地和生产环境的环境变量设置
- **KV 存储差异**: 本地使用内存存储，生产使用真实 KV
- **网络环境**: 生产环境可能有不同的网络限制
- **Cloudflare 特性**: 某些 Cloudflare 特性仅在生产环境可用

## 🚀 部署到生产环境

开发完成后，可以选择以下方式部署：

### 1. Cloudflare Pages（推荐）
- Fork 项目到 GitHub
- 连接 Cloudflare Pages
- 自动部署

### 2. 命令行部署
```bash
# 登录 Cloudflare
npx wrangler login

# 创建 KV 存储
npx wrangler kv:namespace create "PASTE_KV"

# 更新 wrangler.toml 配置

# 部署
npx wrangler deploy
```

## 📞 获取帮助

- 📖 查看 [README.md](README.md) 了解完整功能
- 🐛 在 GitHub 提交 Issue
- 💬 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

---

**🎉 开始你的本地开发之旅吧！**
