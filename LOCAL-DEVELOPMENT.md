# 🛠️ 本地开发指南

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- Git

### 一键启动

#### 所有平台通用
```bash
# 1. 克隆项目
git clone https://github.com/your-username/paste-web.git
cd paste-web

# 2. 安装依赖
npm install

# 3. 启动本地开发服务器
npm run dev
```

#### Windows 用户注意事项

**如果遇到 PowerShell 执行策略错误或"正在连接服务器..."问题，有以下解决方案：**

**方案一：使用批处理文件（最简单）**
```cmd
# 双击运行 dev.bat 文件，或在命令行中运行：
.\dev.bat
```

**方案二：设置执行策略**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**方案三：使用 CMD 命令行**
```cmd
# 在 CMD 中运行（不是 PowerShell）
npm run dev
```

**方案四：直接运行 wrangler**
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
ADMIN_PASSWORD = "zhouzhou12203"
ACCESS_PASSWORD = ""  // 无访问密码
RATE_LIMIT_MAX = "5"
RATE_LIMIT_WINDOW = "60"
```

### 📝 测试功能
- **主页面**: `http://localhost:8787`
- **管理员面板**: `http://localhost:8787/admin`
- **API 测试**: 所有 API 端点都可正常使用

## 🧪 功能测试

### 基础功能测试
1. **添加内容** - 测试文本保存功能
2. **Markdown 渲染** - 测试 Markdown 语法支持
3. **LaTeX 公式** - 测试数学公式渲染
4. **复制功能** - 测试剪贴板复制
5. **管理操作** - 测试置顶、隐藏、删除功能

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

### LaTeX 公式测试示例
```latex
行内公式：$E = mc^2$

块级公式：
$$\sum_{i=1}^{n} x_i = \frac{1}{n}\sum_{i=1}^{n} x_i$$

分数：$\frac{a}{b}$
根号：$\sqrt{x^2 + y^2}$
积分：$\int_{0}^{\infty} e^{-x} dx$
```

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
**A**: 本地开发默认密码是 `zhouzhou12203`

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
