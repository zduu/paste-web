#!/bin/bash

# Paste Web Cloudflare Pages 部署脚本

echo "🌟 Cloudflare Pages 部署向导"
echo "================================"

# 检查是否在正确的目录
if [ ! -f "worker.js" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo ""
echo "📋 部署前检查..."

# 检查必要文件
echo "🔍 检查必要文件..."
files=("worker.js" "package.json" "functions/_worker.js" "functions/[[path]].js" "_routes.json" "index.html")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file 缺失"
        exit 1
    fi
done

echo ""
echo "🎯 部署步骤:"
echo ""
echo "1. 📁 Fork 仓库到你的 GitHub 账户"
echo "   - 访问项目的 GitHub 页面"
echo "   - 点击右上角的 'Fork' 按钮"
echo ""
echo "2. 🔗 连接 Cloudflare Pages"
echo "   - 登录 https://dash.cloudflare.com/"
echo "   - 进入 Workers & Pages"
echo "   - 点击 'Create Application' → 'Pages' → 'Connect to Git'"
echo "   - 选择你 Fork 的仓库"
echo ""
echo "3. ⚙️  配置构建设置"
echo "   项目名称: paste-web"
echo "   生产分支: main"
echo "   构建命令: (留空)"
echo "   构建输出目录: (留空)"
echo ""
echo "4. 🔐 设置环境变量"
echo "   在 Pages 设置中添加:"
echo "   - ADMIN_PASSWORD = zhouzhou12203"
echo "   - ACCESS_PASSWORD = (留空或设置访问密码)"
echo "   - RATE_LIMIT_MAX = 5"
echo "   - RATE_LIMIT_WINDOW = 60"
echo ""
echo "5. 🗄️  创建并绑定 KV 存储"
echo "   - 在 Cloudflare Dashboard 中创建 KV 命名空间: PASTE_KV"
echo "   - 在 Pages 设置的 Functions → KV namespace bindings 中绑定"
echo ""
echo "6. 🚀 部署完成!"
echo "   每次推送代码到 GitHub 都会自动部署"
echo ""

# 提供有用的链接
echo "🔗 有用的链接:"
echo "   - Cloudflare Dashboard: https://dash.cloudflare.com/"
echo "   - 详细部署指南: ./CLOUDFLARE-PAGES.md"
echo "   - 快速开始指南: ./QUICKSTART.md"
echo ""

# 检查是否有 git 仓库
if [ -d ".git" ]; then
    echo "📊 当前 Git 状态:"
    git status --porcelain
    if [ $? -eq 0 ]; then
        echo "✅ Git 仓库状态正常"
    fi
    echo ""
    echo "💡 提示: 确保所有更改都已提交并推送到 GitHub"
    echo "   git add ."
    echo "   git commit -m '准备部署到 Cloudflare Pages'"
    echo "   git push origin main"
else
    echo "⚠️  警告: 当前目录不是 Git 仓库"
    echo "   请先初始化 Git 仓库并推送到 GitHub"
fi

echo ""
echo "🎉 准备就绪! 按照上述步骤在 Cloudflare Pages 中部署你的应用。"
