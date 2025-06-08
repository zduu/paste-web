#!/usr/bin/env node

/**
 * Paste Web Cloudflare 配置向导
 * 帮助用户快速配置和部署应用
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 创建命令行接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// 检查命令是否存在
function commandExists(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// 检查Node.js版本
function checkNodeVersion() {
  const version = process.version;
  const majorVersion = parseInt(version.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    log('❌ 需要 Node.js 16 或更高版本', 'red');
    log(`当前版本: ${version}`, 'yellow');
    return false;
  }
  
  log(`✅ Node.js 版本检查通过: ${version}`, 'green');
  return true;
}

// 安装依赖
async function installDependencies() {
  log('\n📦 安装项目依赖...', 'blue');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    log('✅ 依赖安装完成', 'green');
    return true;
  } catch (error) {
    log('❌ 依赖安装失败', 'red');
    return false;
  }
}

// 安装Wrangler
async function installWrangler() {
  if (commandExists('wrangler')) {
    log('✅ Wrangler 已安装', 'green');
    return true;
  }
  
  log('\n🔧 安装 Wrangler CLI...', 'blue');
  const install = await question('是否安装 Wrangler CLI? (y/n): ');
  
  if (install.toLowerCase() === 'y') {
    try {
      execSync('npm install -g wrangler', { stdio: 'inherit' });
      log('✅ Wrangler 安装完成', 'green');
      return true;
    } catch (error) {
      log('❌ Wrangler 安装失败', 'red');
      return false;
    }
  }
  
  return false;
}

// 配置Cloudflare
async function configureCloudflare() {
  log('\n☁️  配置 Cloudflare...', 'blue');
  
  const login = await question('是否需要登录 Cloudflare? (y/n): ');
  if (login.toLowerCase() === 'y') {
    try {
      execSync('wrangler login', { stdio: 'inherit' });
      log('✅ Cloudflare 登录完成', 'green');
    } catch (error) {
      log('❌ Cloudflare 登录失败', 'red');
      return false;
    }
  }
  
  return true;
}

// 配置项目
async function configureProject() {
  log('\n⚙️  配置项目设置...', 'blue');
  
  const config = {};
  
  // 项目名称
  config.name = await question('输入项目名称 (默认: paste-web): ') || 'paste-web';
  
  // 管理员密码
  config.adminPassword = await question('设置管理员密码 (默认: zhouzhou12203): ') || 'zhouzhou12203';
  
  // 频率限制
  config.rateLimitMax = await question('设置频率限制-最大请求数 (默认: 5): ') || '5';
  config.rateLimitWindow = await question('设置频率限制-时间窗口/秒 (默认: 60): ') || '60';
  
  // 更新wrangler.toml
  const wranglerConfig = `name = "${config.name}"
main = "worker.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# KV存储绑定
[[kv_namespaces]]
binding = "PASTE_KV"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"

# 环境变量
[vars]
ADMIN_PASSWORD = "${config.adminPassword}"
RATE_LIMIT_MAX = "${config.rateLimitMax}"
RATE_LIMIT_WINDOW = "${config.rateLimitWindow}"

# 生产环境配置
[env.production]
name = "${config.name}-prod"

# 开发环境配置  
[env.development]
name = "${config.name}-dev"`;

  fs.writeFileSync('wrangler.toml', wranglerConfig);
  log('✅ 项目配置完成', 'green');
  
  return config;
}

// 创建KV命名空间
async function createKVNamespace() {
  log('\n🗄️  创建 KV 存储命名空间...', 'blue');
  
  const create = await question('是否创建 KV 命名空间? (y/n): ');
  if (create.toLowerCase() !== 'y') {
    log('⚠️  跳过 KV 命名空间创建', 'yellow');
    return false;
  }
  
  try {
    // 创建生产环境KV
    log('创建生产环境 KV 命名空间...', 'yellow');
    const prodResult = execSync('wrangler kv:namespace create "PASTE_KV"', { encoding: 'utf8' });
    const prodId = prodResult.match(/id = "([^"]+)"/)?.[1];
    
    // 创建预览环境KV
    log('创建预览环境 KV 命名空间...', 'yellow');
    const previewResult = execSync('wrangler kv:namespace create "PASTE_KV" --preview', { encoding: 'utf8' });
    const previewId = previewResult.match(/id = "([^"]+)"/)?.[1];
    
    if (prodId && previewId) {
      // 更新wrangler.toml中的KV ID
      let config = fs.readFileSync('wrangler.toml', 'utf8');
      config = config.replace('your-kv-namespace-id', prodId);
      config = config.replace('your-preview-kv-namespace-id', previewId);
      fs.writeFileSync('wrangler.toml', config);
      
      log('✅ KV 命名空间创建完成', 'green');
      log(`生产环境 ID: ${prodId}`, 'cyan');
      log(`预览环境 ID: ${previewId}`, 'cyan');
      return true;
    }
  } catch (error) {
    log('❌ KV 命名空间创建失败', 'red');
    log('请手动创建并更新 wrangler.toml 文件', 'yellow');
    return false;
  }
  
  return false;
}

// 部署应用
async function deployApp() {
  log('\n🚀 部署应用...', 'blue');
  
  const deploy = await question('是否立即部署到 Cloudflare Workers? (y/n): ');
  if (deploy.toLowerCase() !== 'y') {
    log('⚠️  跳过部署', 'yellow');
    return false;
  }
  
  try {
    execSync('wrangler deploy', { stdio: 'inherit' });
    log('✅ 部署完成！', 'green');
    return true;
  } catch (error) {
    log('❌ 部署失败', 'red');
    return false;
  }
}

// 显示完成信息
function showCompletionInfo(config, deployed) {
  log('\n🎉 配置完成！', 'green');
  log('='.repeat(50), 'blue');
  
  log('\n📋 配置摘要:', 'blue');
  log(`项目名称: ${config.name}`, 'cyan');
  log(`管理员密码: ${config.adminPassword}`, 'cyan');
  log(`频率限制: ${config.rateLimitMax} 请求/${config.rateLimitWindow} 秒`, 'cyan');
  
  log('\n📝 下一步操作:', 'blue');
  
  if (!deployed) {
    log('1. 手动部署应用:', 'yellow');
    log('   wrangler deploy', 'cyan');
  }
  
  log('2. 访问你的应用:', 'yellow');
  log(`   https://${config.name}.你的用户名.workers.dev`, 'cyan');
  
  log('3. 可选配置:', 'yellow');
  log('   - 在 Cloudflare Dashboard 中设置自定义域名', 'cyan');
  log('   - 调整环境变量', 'cyan');
  log('   - 配置访问策略', 'cyan');
  
  log('\n📚 有用的命令:', 'blue');
  log('wrangler dev          # 本地开发', 'cyan');
  log('wrangler tail         # 查看日志', 'cyan');
  log('wrangler kv:key list  # 查看KV数据', 'cyan');
  
  log('\n🆘 需要帮助?', 'blue');
  log('- 查看 DEPLOY.md 获取详细部署指南', 'cyan');
  log('- 访问 https://developers.cloudflare.com/workers/', 'cyan');
}

// 主函数
async function main() {
  log('🚀 Paste Web Cloudflare 配置向导', 'blue');
  log('='.repeat(50), 'blue');
  
  try {
    // 环境检查
    log('\n🔍 检查环境...', 'blue');
    if (!checkNodeVersion()) {
      process.exit(1);
    }
    
    // 安装依赖
    if (!await installDependencies()) {
      process.exit(1);
    }
    
    // 安装Wrangler
    if (!await installWrangler()) {
      log('⚠️  请手动安装 Wrangler: npm install -g wrangler', 'yellow');
    }
    
    // 配置Cloudflare
    if (!await configureCloudflare()) {
      log('⚠️  请稍后手动登录 Cloudflare', 'yellow');
    }
    
    // 配置项目
    const config = await configureProject();
    
    // 创建KV命名空间
    await createKVNamespace();
    
    // 部署应用
    const deployed = await deployApp();
    
    // 显示完成信息
    showCompletionInfo(config, deployed);
    
  } catch (error) {
    log(`❌ 配置过程中出现错误: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// 运行主函数
if (require.main === module) {
  main();
}
