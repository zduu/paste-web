#!/usr/bin/env node

/**
 * 数据迁移脚本：从PHP版本迁移到Cloudflare版本
 * 使用方法：node migrate.js <data.json文件路径>
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function showUsage() {
    log('📦 Paste Web 数据迁移工具', 'blue');
    log('');
    log('使用方法：');
    log('  node migrate.js <PHP版本的data.json文件路径>', 'yellow');
    log('');
    log('示例：');
    log('  node migrate.js ./12203data.json', 'yellow');
    log('  node migrate.js /path/to/your/data.json', 'yellow');
    log('');
    log('输出：');
    log('  - cloudflare-data.json (转换后的数据文件)');
    log('  - migration-report.txt (迁移报告)');
}

function validateEntry(entry, index) {
    const errors = [];
    
    if (!entry.id) {
        errors.push(`条目 ${index}: 缺少 ID`);
    }
    
    if (!entry.text && entry.text !== '') {
        errors.push(`条目 ${index}: 缺少文本内容`);
    }
    
    if (!entry.time) {
        errors.push(`条目 ${index}: 缺少时间戳`);
    }
    
    return errors;
}

function convertEntry(entry) {
    // 转换PHP版本的条目格式到Cloudflare版本
    return {
        id: entry.id,
        text: entry.text || '',
        note: entry.note || '',
        pinned: Boolean(entry.pinned),
        hidden: Boolean(entry.hidden),
        time: entry.time || new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
        // 移除敏感信息
        // ipv4: entry.ipv4,
        // ipv6: entry.ipv6
    };
}

function generateMigrationReport(originalData, convertedData, errors) {
    const report = [];
    
    report.push('='.repeat(50));
    report.push('Paste Web 数据迁移报告');
    report.push('='.repeat(50));
    report.push('');
    report.push(`迁移时间: ${new Date().toLocaleString('zh-CN')}`);
    report.push(`原始条目数量: ${originalData.length}`);
    report.push(`转换后条目数量: ${convertedData.length}`);
    report.push('');
    
    // 统计信息
    const stats = {
        pinned: convertedData.filter(e => e.pinned).length,
        hidden: convertedData.filter(e => e.hidden).length,
        withNotes: convertedData.filter(e => e.note).length
    };
    
    report.push('数据统计:');
    report.push(`  - 置顶条目: ${stats.pinned}`);
    report.push(`  - 隐藏条目: ${stats.hidden}`);
    report.push(`  - 带备注条目: ${stats.withNotes}`);
    report.push('');
    
    // 错误信息
    if (errors.length > 0) {
        report.push('⚠️  发现的问题:');
        errors.forEach(error => {
            report.push(`  - ${error}`);
        });
        report.push('');
    }
    
    // 安全提醒
    report.push('🔒 安全提醒:');
    report.push('  - IP地址信息已在迁移过程中移除');
    report.push('  - 请确保在Cloudflare中设置正确的管理员密码');
    report.push('  - 建议在部署前测试所有功能');
    report.push('');
    
    // 下一步操作
    report.push('📋 下一步操作:');
    report.push('  1. 检查 cloudflare-data.json 文件');
    report.push('  2. 使用 wrangler 部署到 Cloudflare Workers');
    report.push('  3. 在 Cloudflare Dashboard 中导入数据到 KV 存储');
    report.push('  4. 测试所有功能是否正常工作');
    report.push('');
    
    return report.join('\n');
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        showUsage();
        return;
    }
    
    const inputFile = args[0];
    
    // 检查输入文件
    if (!fs.existsSync(inputFile)) {
        log(`❌ 错误: 文件不存在 - ${inputFile}`, 'red');
        return;
    }
    
    try {
        log('🚀 开始数据迁移...', 'blue');
        log('');
        
        // 读取原始数据
        log('📖 读取原始数据文件...', 'yellow');
        const rawData = fs.readFileSync(inputFile, 'utf8');
        const originalData = JSON.parse(rawData);
        
        if (!Array.isArray(originalData)) {
            throw new Error('数据格式错误：期望数组格式');
        }
        
        log(`✅ 成功读取 ${originalData.length} 条记录`, 'green');
        
        // 验证数据
        log('🔍 验证数据完整性...', 'yellow');
        const allErrors = [];
        
        originalData.forEach((entry, index) => {
            const errors = validateEntry(entry, index + 1);
            allErrors.push(...errors);
        });
        
        if (allErrors.length > 0) {
            log(`⚠️  发现 ${allErrors.length} 个问题`, 'yellow');
        } else {
            log('✅ 数据验证通过', 'green');
        }
        
        // 转换数据
        log('🔄 转换数据格式...', 'yellow');
        const convertedData = originalData.map(convertEntry);
        
        // 输出转换后的数据
        const outputFile = 'cloudflare-data.json';
        fs.writeFileSync(outputFile, JSON.stringify(convertedData, null, 2), 'utf8');
        log(`✅ 转换完成，已保存到 ${outputFile}`, 'green');
        
        // 生成迁移报告
        log('📊 生成迁移报告...', 'yellow');
        const report = generateMigrationReport(originalData, convertedData, allErrors);
        const reportFile = 'migration-report.txt';
        fs.writeFileSync(reportFile, report, 'utf8');
        log(`✅ 迁移报告已保存到 ${reportFile}`, 'green');
        
        log('');
        log('🎉 迁移完成！', 'green');
        log('');
        log('📋 接下来的步骤：', 'blue');
        log('1. 检查生成的文件：', 'yellow');
        log(`   - ${outputFile} (转换后的数据)`);
        log(`   - ${reportFile} (迁移报告)`);
        log('');
        log('2. 部署到 Cloudflare：', 'yellow');
        log('   wrangler deploy');
        log('');
        log('3. 导入数据到 KV 存储：', 'yellow');
        log('   wrangler kv:key put "entries" --path cloudflare-data.json --binding PASTE_KV');
        log('');
        log('4. 测试应用功能', 'yellow');
        
    } catch (error) {
        log(`❌ 迁移失败: ${error.message}`, 'red');
        
        if (error.name === 'SyntaxError') {
            log('💡 提示: 请检查JSON文件格式是否正确', 'yellow');
        }
        
        process.exit(1);
    }
}

// 运行主函数
if (require.main === module) {
    main();
}

module.exports = {
    convertEntry,
    validateEntry,
    generateMigrationReport
};
