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

访问 `http://localhost:8787` 即可开始使用！

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
- **API 测试**: 所有 API 端点都可正常使用
- **会话管理**: 可以测试多设备登录和强制退出功能

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
npm run dev          # 启动开发服务器
npm run deploy       # 部署到 Cloudflare
npm run logs         # 查看实时日志（需要部署后）
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
