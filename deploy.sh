#!/bin/bash

# Paste Web Cloudflare 部署脚本

echo "🚀 开始部署 Paste Web 到 Cloudflare Workers..."

# 检查是否安装了 wrangler
if ! command -v wrangler &> /dev/null; then
    echo "❌ 未找到 wrangler CLI，正在安装..."
    npm install -g wrangler
fi

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
    echo "🔐 请先登录 Cloudflare："
    wrangler login
fi

# 创建 KV 命名空间
echo "📦 创建 KV 命名空间..."
KV_ID=$(wrangler kv:namespace create "PASTE_KV" --preview false | grep -o 'id = "[^"]*"' | cut -d'"' -f2)
PREVIEW_KV_ID=$(wrangler kv:namespace create "PASTE_KV" --preview | grep -o 'id = "[^"]*"' | cut -d'"' -f2)

# 更新 wrangler.toml
echo "⚙️ 更新配置文件..."
sed -i "s/your-kv-namespace-id/$KV_ID/g" wrangler.toml
sed -i "s/your-preview-kv-namespace-id/$PREVIEW_KV_ID/g" wrangler.toml

# 部署
echo "🚀 部署到 Cloudflare Workers..."
wrangler deploy

echo "✅ 部署完成！"
echo "🌐 你的应用已部署到: https://paste-web.你的用户名.workers.dev"
echo ""
echo "📝 下一步："
echo "1. 在 Cloudflare Dashboard 中设置自定义域名（可选）"
echo "2. 修改 ADMIN_PASSWORD 环境变量来设置管理员密码"
echo "3. 根据需要调整频率限制参数"
