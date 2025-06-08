/**
 * Paste Web - Cloudflare Workers版本
 * 现代化的网络剪贴板应用
 */

// 频率限制类
class RateLimiter {
  constructor(kv, ip, maxRequests = 5, windowSeconds = 60) {
    this.kv = kv;
    this.ip = ip;
    this.maxRequests = maxRequests;
    this.windowSeconds = windowSeconds;
    this.key = `rate_limit:${ip}`;
  }

  async check() {
    const now = Math.floor(Date.now() / 1000);
    const data = await this.kv.get(this.key, 'json') || { count: 0, resetTime: now + this.windowSeconds };
    
    if (now > data.resetTime) {
      // 重置计数器
      data.count = 1;
      data.resetTime = now + this.windowSeconds;
    } else {
      data.count++;
    }
    
    // 保存到KV
    await this.kv.put(this.key, JSON.stringify(data), { expirationTtl: this.windowSeconds });
    
    return data.count <= this.maxRequests;
  }
}

// 获取客户端IP
function getClientIP(request) {
  const cfConnectingIP = request.headers.get('CF-Connecting-IP');
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  const xRealIP = request.headers.get('X-Real-IP');
  
  return cfConnectingIP || xForwardedFor?.split(',')[0]?.trim() || xRealIP || '0.0.0.0';
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// HTML转义
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// 验证管理员密码
function verifyPassword(inputPassword, correctPassword) {
  return inputPassword === correctPassword;
}



// 生成管理员页面
function generateAdminPage(env) {
  const adminHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>管理员配置 - Paste Web</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        :root {
            --bg-color: #1a1a1a;
            --card-bg: #2d2d2d;
            --text-color: #f0f0f0;
            --accent-color: #4a90e2;
            --success-color: #28a745;
            --warning-color: #ffc107;
            --danger-color: #dc3545;
        }

        body {
            background: var(--bg-color);
            color: var(--text-color);
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }

        .admin-container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .admin-header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: var(--card-bg);
            border-radius: 8px;
        }

        .admin-header h1 {
            color: var(--accent-color);
            margin: 0;
        }

        .admin-section {
            background: var(--card-bg);
            margin: 20px 0;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .admin-section h2 {
            color: var(--accent-color);
            border-bottom: 2px solid var(--accent-color);
            padding-bottom: 10px;
        }

        .form-group {
            margin: 15px 0;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .form-group input, .form-group select {
            width: 100%;
            padding: 10px;
            border: 1px solid #555;
            background: #333;
            color: var(--text-color);
            border-radius: 4px;
            font-size: 14px;
        }

        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: var(--accent-color);
            box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
        }

        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
            transition: all 0.2s;
        }

        .btn-primary {
            background: var(--accent-color);
            color: white;
        }

        .btn-success {
            background: var(--success-color);
            color: white;
        }

        .btn-warning {
            background: var(--warning-color);
            color: #000;
        }

        .btn-danger {
            background: var(--danger-color);
            color: white;
        }

        .btn:hover {
            opacity: 0.8;
            transform: translateY(-1px);
        }

        .entries-admin {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #555;
            border-radius: 4px;
            padding: 10px;
        }

        .entry-admin {
            background: #333;
            margin: 10px 0;
            padding: 15px;
            border-radius: 4px;
            border-left: 4px solid var(--accent-color);
        }

        .entry-admin.hidden {
            border-left-color: var(--warning-color);
            background: rgba(255, 193, 7, 0.1);
        }

        .entry-admin.pinned {
            border-left-color: var(--success-color);
            background: rgba(40, 167, 69, 0.1);
        }

        .entry-meta {
            font-size: 12px;
            color: #888;
            margin-bottom: 10px;
        }

        .entry-text {
            margin: 10px 0;
            padding: 10px;
            background: #222;
            border-radius: 4px;
            white-space: pre-wrap;
            word-break: break-word;
        }

        .entry-actions {
            margin-top: 10px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }

        .stat-card {
            background: #333;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }

        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: var(--accent-color);
        }

        .stat-label {
            color: #888;
            margin-top: 5px;
        }

        .alert {
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
            border-left: 4px solid;
        }

        .alert-success {
            background: rgba(40, 167, 69, 0.1);
            border-left-color: var(--success-color);
            color: var(--success-color);
        }

        .alert-danger {
            background: rgba(220, 53, 69, 0.1);
            border-left-color: var(--danger-color);
            color: var(--danger-color);
        }

        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
        }

        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
            border-radius: 34px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: var(--accent-color);
        }

        input:checked + .slider:before {
            transform: translateX(26px);
        }

        @media (max-width: 768px) {
            .admin-container {
                padding: 10px;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="admin-container">
        <div class="admin-header">
            <h1>🛠️ Paste Web 管理员面板</h1>
            <p>管理您的剪贴板应用配置和数据</p>
        </div>

        <div class="admin-section">
            <h2>📊 系统统计</h2>
            <div class="stats-grid" id="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" id="total-entries">-</div>
                    <div class="stat-label">总条目数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="pinned-entries">-</div>
                    <div class="stat-label">置顶条目</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="hidden-entries">-</div>
                    <div class="stat-label">隐藏条目</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="with-notes">-</div>
                    <div class="stat-label">带备注条目</div>
                </div>
            </div>
        </div>

        <div class="admin-section">
            <h2>🔐 安全配置</h2>
            <div class="form-group">
                <label>访问密码保护</label>
                <label class="toggle-switch">
                    <input type="checkbox" id="access-protection" onchange="toggleAccessProtection()">
                    <span class="slider"></span>
                </label>
                <small>启用后，访问网站需要输入密码</small>
            </div>

            <div class="form-group" id="access-password-group" style="display: none;">
                <label for="access-password">访问密码</label>
                <input type="password" id="access-password" placeholder="设置网站访问密码">
                <button class="btn btn-primary" onclick="updateAccessPassword()">更新访问密码</button>
            </div>

            <div class="form-group">
                <label for="admin-password">管理员密码</label>
                <input type="password" id="admin-password" placeholder="设置新的管理员密码">
                <button class="btn btn-warning" onclick="updateAdminPassword()">更新管理员密码</button>
            </div>
        </div>

        <div class="admin-section">
            <h2>⚙️ 系统配置</h2>
            <div class="form-group">
                <label for="rate-limit-max">频率限制 - 最大请求数</label>
                <input type="number" id="rate-limit-max" value="${env.RATE_LIMIT_MAX || '5'}" min="1" max="100">
            </div>

            <div class="form-group">
                <label for="rate-limit-window">频率限制 - 时间窗口（秒）</label>
                <input type="number" id="rate-limit-window" value="${env.RATE_LIMIT_WINDOW || '60'}" min="10" max="3600">
            </div>

            <button class="btn btn-success" onclick="updateSystemConfig()">保存系统配置</button>
        </div>

        <div class="admin-section">
            <h2>📝 数据管理</h2>
            <div style="margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="loadAllEntries()">刷新数据</button>
                <button class="btn btn-success" onclick="exportData()">导出数据</button>
                <button class="btn btn-warning" onclick="clearHiddenEntries()">清理隐藏条目</button>
                <button class="btn btn-danger" onclick="clearAllData()">清空所有数据</button>
            </div>

            <div class="entries-admin" id="entries-admin">
                <p>点击"刷新数据"加载所有条目...</p>
            </div>
        </div>

        <div class="admin-section">
            <h2>🔙 返回</h2>
            <button class="btn btn-primary" onclick="window.location.href='/'">返回主页</button>
        </div>
    </div>

    <script>
        // 加载所有条目（包括隐藏的）
        async function loadAllEntries() {
            try {
                const response = await fetch('/api/admin/entries', {
                    headers: {
                        'Authorization': 'Bearer ' + sessionStorage.getItem('adminToken')
                    }
                });

                if (!response.ok) {
                    throw new Error('获取数据失败');
                }

                const entries = await response.json();
                displayAdminEntries(entries);
                updateStats(entries);
            } catch (error) {
                showAlert('加载数据失败: ' + error.message, 'danger');
            }
        }

        // 显示管理员条目视图
        function displayAdminEntries(entries) {
            const container = document.getElementById('entries-admin');

            if (!entries || entries.length === 0) {
                container.innerHTML = '<p>暂无数据</p>';
                return;
            }

            const sorted = entries.sort((a, b) => {
                if (a.pinned === b.pinned) {
                    return new Date(b.time) - new Date(a.time);
                }
                return a.pinned ? -1 : 1;
            });

            container.innerHTML = sorted.map(entry => \`
                <div class="entry-admin \${entry.pinned ? 'pinned' : ''} \${entry.hidden ? 'hidden' : ''}">
                    <div class="entry-meta">
                        ID: \${entry.id} | 时间: \${entry.time} |
                        IP: \${entry.ipv4 || 'N/A'} |
                        状态: \${entry.pinned ? '📌置顶' : ''} \${entry.hidden ? '🙈隐藏' : '👁️显示'}
                    </div>
                    <div class="entry-text">\${entry.text}</div>
                    \${entry.note ? \`<div><strong>备注:</strong> \${entry.note}</div>\` : ''}
                    <div class="entry-actions">
                        <button class="btn btn-warning" onclick="toggleEntryPin('\${entry.id}', \${entry.pinned})">
                            \${entry.pinned ? '取消置顶' : '置顶'}
                        </button>
                        <button class="btn btn-primary" onclick="toggleEntryHidden('\${entry.id}', \${entry.hidden})">
                            \${entry.hidden ? '显示' : '隐藏'}
                        </button>
                        <button class="btn btn-danger" onclick="deleteEntry('\${entry.id}')">删除</button>
                    </div>
                </div>
            \`).join('');
        }

        // 更新统计信息
        function updateStats(entries) {
            document.getElementById('total-entries').textContent = entries.length;
            document.getElementById('pinned-entries').textContent = entries.filter(e => e.pinned).length;
            document.getElementById('hidden-entries').textContent = entries.filter(e => e.hidden).length;
            document.getElementById('with-notes').textContent = entries.filter(e => e.note).length;
        }

        // 切换访问保护
        function toggleAccessProtection() {
            const checkbox = document.getElementById('access-protection');
            const passwordGroup = document.getElementById('access-password-group');
            passwordGroup.style.display = checkbox.checked ? 'block' : 'none';
        }

        // 更新访问密码
        async function updateAccessPassword() {
            const password = document.getElementById('access-password').value;
            if (!password) {
                showAlert('请输入访问密码', 'danger');
                return;
            }

            try {
                const response = await fetch('/api/admin/config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('adminToken')
                    },
                    body: JSON.stringify({
                        action: 'updateAccessPassword',
                        password: password
                    })
                });

                if (response.ok) {
                    showAlert('访问密码更新成功', 'success');
                    document.getElementById('access-password').value = '';
                } else {
                    throw new Error('更新失败');
                }
            } catch (error) {
                showAlert('更新访问密码失败: ' + error.message, 'danger');
            }
        }

        // 更新管理员密码
        async function updateAdminPassword() {
            const password = document.getElementById('admin-password').value;
            if (!password) {
                showAlert('请输入新的管理员密码', 'danger');
                return;
            }

            try {
                const response = await fetch('/api/admin/config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('adminToken')
                    },
                    body: JSON.stringify({
                        action: 'updateAdminPassword',
                        password: password
                    })
                });

                if (response.ok) {
                    showAlert('管理员密码更新成功', 'success');
                    document.getElementById('admin-password').value = '';
                } else {
                    throw new Error('更新失败');
                }
            } catch (error) {
                showAlert('更新管理员密码失败: ' + error.message, 'danger');
            }
        }

        // 更新系统配置
        async function updateSystemConfig() {
            const rateLimitMax = document.getElementById('rate-limit-max').value;
            const rateLimitWindow = document.getElementById('rate-limit-window').value;

            try {
                const response = await fetch('/api/admin/config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('adminToken')
                    },
                    body: JSON.stringify({
                        action: 'updateSystemConfig',
                        rateLimitMax: rateLimitMax,
                        rateLimitWindow: rateLimitWindow
                    })
                });

                if (response.ok) {
                    showAlert('系统配置更新成功', 'success');
                } else {
                    throw new Error('更新失败');
                }
            } catch (error) {
                showAlert('更新系统配置失败: ' + error.message, 'danger');
            }
        }

        // 切换条目置顶状态
        async function toggleEntryPin(id, isPinned) {
            try {
                const response = await fetch('/api/admin/entry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('adminToken')
                    },
                    body: JSON.stringify({
                        action: 'pin',
                        id: id,
                        pinned: !isPinned
                    })
                });

                if (response.ok) {
                    loadAllEntries();
                } else {
                    throw new Error('操作失败');
                }
            } catch (error) {
                showAlert('置顶操作失败: ' + error.message, 'danger');
            }
        }

        // 切换条目隐藏状态
        async function toggleEntryHidden(id, isHidden) {
            try {
                const response = await fetch('/api/admin/entry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('adminToken')
                    },
                    body: JSON.stringify({
                        action: 'hide',
                        id: id,
                        hidden: !isHidden
                    })
                });

                if (response.ok) {
                    loadAllEntries();
                } else {
                    throw new Error('操作失败');
                }
            } catch (error) {
                showAlert('隐藏操作失败: ' + error.message, 'danger');
            }
        }

        // 删除条目
        async function deleteEntry(id) {
            if (!confirm('确定要删除这个条目吗？')) return;

            try {
                const response = await fetch('/api/admin/entry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('adminToken')
                    },
                    body: JSON.stringify({
                        action: 'delete',
                        id: id
                    })
                });

                if (response.ok) {
                    loadAllEntries();
                } else {
                    throw new Error('删除失败');
                }
            } catch (error) {
                showAlert('删除失败: ' + error.message, 'danger');
            }
        }

        // 导出数据
        async function exportData() {
            try {
                const response = await fetch('/api/admin/entries', {
                    headers: {
                        'Authorization': 'Bearer ' + sessionStorage.getItem('adminToken')
                    }
                });

                if (!response.ok) {
                    throw new Error('获取数据失败');
                }

                const entries = await response.json();

                // 创建完整的导出数据
                const exportData = {
                    exportTime: new Date().toISOString(),
                    totalEntries: entries.length,
                    exportedBy: 'admin',
                    entries: entries.map(entry => ({
                        id: entry.id,
                        text: entry.text,
                        note: entry.note || '',
                        time: entry.time,
                        pinned: entry.pinned || false,
                        hidden: entry.hidden || false
                    }))
                };

                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});

                const link = document.createElement('a');
                link.href = URL.createObjectURL(dataBlob);
                link.download = \`paste-web-backup-\${new Date().toISOString().split('T')[0]}.json\`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(dataBlob.href);

                showAlert('数据导出成功', 'success');
            } catch (error) {
                showAlert('导出失败: ' + error.message, 'danger');
            }
        }

        // 清理隐藏条目
        async function clearHiddenEntries() {
            if (!confirm('确定要删除所有隐藏的条目吗？此操作不可恢复！')) return;

            try {
                const response = await fetch('/api/admin/clear', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('adminToken')
                    },
                    body: JSON.stringify({
                        action: 'clearHidden'
                    })
                });

                if (response.ok) {
                    loadAllEntries();
                    showAlert('隐藏条目清理完成', 'success');
                } else {
                    throw new Error('清理失败');
                }
            } catch (error) {
                showAlert('清理失败: ' + error.message, 'danger');
            }
        }

        // 清空所有数据
        async function clearAllData() {
            if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return;
            if (!confirm('再次确认：这将删除所有剪贴板数据！')) return;

            try {
                const response = await fetch('/api/admin/clear', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + sessionStorage.getItem('adminToken')
                    },
                    body: JSON.stringify({
                        action: 'clearAll'
                    })
                });

                if (response.ok) {
                    loadAllEntries();
                    showAlert('所有数据已清空', 'success');
                } else {
                    throw new Error('清空失败');
                }
            } catch (error) {
                showAlert('清空失败: ' + error.message, 'danger');
            }
        }

        // 显示提示信息
        function showAlert(message, type) {
            const alertDiv = document.createElement('div');
            alertDiv.className = \`alert alert-\${type}\`;
            alertDiv.textContent = message;

            document.querySelector('.admin-container').insertBefore(alertDiv, document.querySelector('.admin-section'));

            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }

        // 页面加载时初始化
        document.addEventListener('DOMContentLoaded', function() {
            loadAllEntries();

            // 检查访问保护状态
            const accessProtection = ${env.ACCESS_PASSWORD ? 'true' : 'false'};
            document.getElementById('access-protection').checked = accessProtection;
            toggleAccessProtection();
        });
    </script>
</body>
</html>`;

  return adminHtml;
}

// 主要的请求处理函数
const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS处理
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 路由处理
      if (path === '/' && method === 'GET') {
        return await handleHomePage(request, env);
      } else if (path === '/test' && method === 'GET') {
        return await handleTestPage();
      } else if (path === '/admin' && method === 'GET') {
        return await handleAdminPage(request, env);
      } else if (path === '/api/admin/login' && method === 'POST') {
        return await handleAdminLogin(request, env, corsHeaders);
      } else if (path === '/api/admin/entries' && method === 'GET') {
        return await handleAdminGetEntries(request, env, corsHeaders);
      } else if (path === '/api/admin/config' && method === 'POST') {
        return await handleAdminConfig(request, env, corsHeaders);
      } else if (path === '/api/admin/entry' && method === 'POST') {
        return await handleAdminEntry(request, env, corsHeaders);
      } else if (path === '/api/admin/clear' && method === 'POST') {
        return await handleAdminClear(request, env, corsHeaders);
      } else if (path === '/api/verify-access' && method === 'POST') {
        return await handleVerifyAccess(request, env, corsHeaders);
      } else if (path === '/api/entries' && method === 'GET') {
        return await handleGetEntries(env.PASTE_KV, corsHeaders);
      } else if (path === '/api/save' && method === 'POST') {
        return await handleSave(request, env, corsHeaders);
      } else if (path === '/api/delete' && method === 'POST') {
        return await handleDelete(request, env, corsHeaders);
      } else if (path === '/api/hide' && method === 'POST') {
        return await handleHide(request, env, corsHeaders);
      } else if (path === '/api/pin' && method === 'POST') {
        return await handlePin(request, env, corsHeaders);
      } else {
        return new Response('Not Found', { status: 404, headers: corsHeaders });
      }
    } catch (error) {
      console.error('Error:', error);
      return new Response('Internal Server Error', { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};

// 处理首页
async function handleHomePage(request, env) {
  // 检查是否需要访问密码
  if (env.ACCESS_PASSWORD) {
    const accessToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const cookieHeader = request.headers.get('Cookie');
    const accessCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('access_token='))?.split('=')[1];

    if (!accessToken && !accessCookie) {
      return generateAccessPage();
    }

    // 验证访问令牌
    if (accessToken !== env.ACCESS_PASSWORD && accessCookie !== env.ACCESS_PASSWORD) {
      return generateAccessPage();
    }
  }
  const html = `<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.5/purify.min.js"></script>
    <meta charset="utf-8">
    <title>剪贴板管理工具</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        :root {
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-card: #334155;
            --text-primary: #f8fafc;
            --text-secondary: #cbd5e1;
            --text-muted: #94a3b8;
            --accent-primary: #3b82f6;
            --accent-secondary: #1d4ed8;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --border: #475569;
            --shadow: rgba(0, 0, 0, 0.25);
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, var(--bg-primary) 0%, #1e293b 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 2rem;
            padding: 2rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border);
            box-shadow: 0 4px 6px var(--shadow);
        }

        .header h1 {
            margin: 0 0 0.5rem 0;
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--accent-primary), #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 1.1rem;
        }

        .admin-link {
            position: absolute;
            top: 20px;
            right: 20px;
            padding: 8px 16px;
            background: var(--bg-card);
            color: var(--text-secondary);
            text-decoration: none;
            border-radius: 8px;
            border: 1px solid var(--border);
            font-size: 0.9rem;
            transition: all 0.2s ease;
        }

        .admin-link:hover {
            background: var(--accent-primary);
            color: white;
            transform: translateY(-1px);
        }
        .entries-container {
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border);
            box-shadow: 0 4px 6px var(--shadow);
            margin-bottom: 2rem;
            overflow: hidden;
        }

        .entries-header {
            padding: 1rem 1.5rem;
            background: var(--bg-card);
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .entries-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
        }

        .entries-count {
            background: var(--accent-primary);
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 500;
        }

        #entries {
            height: 60vh;
            overflow-y: auto;
            padding: 1rem;
        }

        .entry {
            margin: 0 0 1rem 0;
            padding: 1.25rem;
            border-radius: 12px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            position: relative;
            cursor: pointer;
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            /* 防止横向溢出 */
            max-width: 100%;
            box-sizing: border-box;
            overflow: hidden;
        }

        .entry:hover {
            background: var(--bg-primary);
            border-color: var(--accent-primary);
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
        }

        .entry-content {
            flex: 1;
            min-width: 0;
        }

        .entry-text {
            color: var(--text-primary);
            white-space: pre-wrap;
            word-break: break-word;
            word-wrap: break-word;
            overflow-wrap: anywhere;
            hyphens: auto;
            line-height: 1.5;
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
            max-width: 100%;
            overflow: hidden;
            /* 强制换行，防止横向溢出 */
            min-width: 0;
            box-sizing: border-box;
        }

        .entry-meta {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-top: 0.75rem;
            font-size: 0.8rem;
            color: var(--text-muted);
        }

        .entry-time {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }

        .entry-actions {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            flex-shrink: 0;
        }
        .btn {
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.8rem;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            text-decoration: none;
            min-width: 70px;
            justify-content: center;
        }

        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn-primary {
            background: var(--accent-primary);
            color: white;
        }

        .btn-primary:hover {
            background: var(--accent-secondary);
        }

        .btn-success {
            background: var(--success);
            color: white;
        }

        .btn-success:hover {
            background: #059669;
        }

        .btn-warning {
            background: var(--warning);
            color: white;
        }

        .btn-warning:hover {
            background: #d97706;
        }

        .btn-danger {
            background: var(--danger);
            color: white;
        }

        .btn-danger:hover {
            background: #dc2626;
        }

        .btn-secondary {
            background: var(--bg-card);
            color: var(--text-secondary);
            border: 1px solid var(--border);
        }

        .btn-secondary:hover {
            background: var(--bg-primary);
            color: var(--text-primary);
        }

        .entry-note {
            background: var(--bg-primary);
            color: var(--text-secondary);
            font-size: 0.85rem;
            margin-top: 0.5rem;
            padding: 0.5rem;
            border-radius: 6px;
            border-left: 3px solid var(--accent-primary);
            display: none;
        }

        .pinned {
            border-left: 4px solid var(--warning);
            background: rgba(245, 158, 11, 0.1);
        }

        .pinned::before {
            content: "📌";
            position: absolute;
            top: 1rem;
            left: 1rem;
            font-size: 0.9rem;
        }

        .hidden-text {
            color: var(--text-muted);
            font-style: italic;
            opacity: 0.7;
        }

        .form-container {
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border);
            box-shadow: 0 4px 6px var(--shadow);
            padding: 1.5rem;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-primary);
        }

        #new-text {
            width: 100%;
            height: 120px;
            padding: 1rem;
            border: 1px solid var(--border);
            background: var(--bg-card);
            border-radius: 12px;
            resize: vertical;
            color: var(--text-primary);
            font-family: inherit;
            font-size: 0.95rem;
            line-height: 1.5;
            transition: border-color 0.2s ease;
        }

        #new-text:focus {
            outline: none;
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        #new-text::placeholder {
            color: var(--text-muted);
        }

        .input-group {
            display: flex;
            gap: 1rem;
            align-items: flex-end;
        }

        .input-group input {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 1px solid var(--border);
            background: var(--bg-card);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 0.95rem;
            transition: border-color 0.2s ease;
        }

        .input-group input:focus {
            outline: none;
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-group input::placeholder {
            color: var(--text-muted);
        }
        /* 滚动条样式 */
        #entries::-webkit-scrollbar {
            width: 8px;
        }

        #entries::-webkit-scrollbar-track {
            background: var(--bg-secondary);
            border-radius: 4px;
        }

        #entries::-webkit-scrollbar-thumb {
            background: var(--border);
            border-radius: 4px;
        }

        #entries::-webkit-scrollbar-thumb:hover {
            background: var(--accent-primary);
        }

        /* 加载状态 */
        .loading {
            text-align: center;
            padding: 3rem;
            color: var(--text-muted);
        }

        .loading-spinner {
            width: 32px;
            height: 32px;
            border: 3px solid var(--border);
            border-top: 3px solid var(--accent-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .empty-state {
            text-align: center;
            padding: 3rem;
            color: var(--text-muted);
        }

        .empty-state h3 {
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }

            .header {
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }

            .header h1 {
                font-size: 2rem;
            }

            .admin-link {
                position: static;
                display: inline-block;
                margin-top: 1rem;
            }

            .entry {
                flex-direction: column;
                gap: 1rem;
                padding: 1rem;
            }

            .entry-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0.5rem;
                width: 100%;
            }

            .btn {
                min-width: 0;
                padding: 0.6rem 0.4rem;
                font-size: 0.8rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            #new-text {
                height: 100px;
                font-size: 16px; /* 防止 iOS 缩放 */
            }

            .input-group {
                flex-direction: column;
                gap: 0.75rem;
            }

            .input-group input {
                font-size: 16px; /* 防止 iOS 缩放 */
            }

            #entries {
                height: 50vh;
            }

            .entries-header {
                padding: 1rem;
            }

            .entries-title {
                font-size: 1.1rem;
            }
        }

        @media (max-width: 480px) {
            .header h1 {
                font-size: 1.75rem;
            }

            .entry-actions {
                grid-template-columns: 1fr 1fr;
                gap: 0.4rem;
            }

            .btn {
                font-size: 0.75rem;
                padding: 0.5rem 0.3rem;
            }

            .entry-text {
                font-size: 0.9rem;
            }

            .entry {
                padding: 0.8rem;
            }
        }

        /* 深色模式优化 */
        @media (prefers-color-scheme: dark) {
            :root {
                --shadow: rgba(0, 0, 0, 0.4);
            }
        }

        /* 高对比度模式 */
        @media (prefers-contrast: high) {
            :root {
                --border: #64748b;
                --text-muted: #64748b;
            }
        }

        /* 减少动画 */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    </style>
</head>
<body>
    <a href="/admin" class="admin-link">🛠️ 管理员</a>

    <div class="container">
        <div class="header">
            <h1>🗂️ Paste Web</h1>
            <p>现代化的网络剪贴板 • 支持 Markdown 和 LaTeX 公式</p>
        </div>

        <div class="entries-container">
            <div class="entries-header">
                <h2 class="entries-title">📋 剪贴板内容</h2>
                <span class="entries-count" id="entries-count">0</span>
            </div>
            <div class="search-container" style="padding: 1rem; border-bottom: 1px solid var(--border);">
                <input type="text" id="search-input" placeholder="🔍 搜索内容..."
                       style="width: 100%; padding: 0.5rem; border: 1px solid var(--border); background: var(--bg-card); color: var(--text-primary); border-radius: 6px; font-size: 0.9rem;"
                       oninput="filterEntries()">
            </div>
            <div id="entries">
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>正在连接服务器...</p>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">首次访问可能需要几秒钟</p>
                </div>
            </div>
        </div>

        <div class="form-container">
            <div class="form-group">
                <label for="new-text">✏️ 添加新内容</label>
                <textarea id="new-text" placeholder="输入文本内容...支持 Markdown 语法和 LaTeX 数学公式 ($E=mc^2$)" oninput="updateCharCount()"></textarea>
                <div style="text-align: right; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
                    <span id="char-count">0</span> 字符
                </div>
            </div>

            <div class="input-group">
                <input type="text" id="new-note" placeholder="💡 添加备注（可选）">
                <button class="btn btn-primary" onclick="saveEntry()">
                    💾 保存
                </button>
            </div>
        </div>
    </div>
    <script>
        // 加载条目（简化版本）
        function loadEntries() {
            fetch('/api/entries')
                .then(res => {
                    console.log('API 响应状态:', res.status, res.statusText);
                    if (!res.ok) {
                        throw new Error(\`HTTP \${res.status}: \${res.statusText}\`);
                    }
                    return res.json();
                })
                .then(data => {
                    console.log('获取到的数据:', data);
                    displayEntries(data);
                })
                .catch(error => {
                    console.error(\`加载失败 (尝试 \${retryCount + 1}/\${maxRetries + 1}):\`, error);

                    if (retryCount < maxRetries) {
                        // 显示重试信息
                        const entriesDiv = document.getElementById('entries');
                        entriesDiv.innerHTML = \`
                            <div class="loading">
                                <div class="loading-spinner"></div>
                                <p>连接中... (尝试 \${retryCount + 2}/\${maxRetries + 1})</p>
                                <p style="font-size: 0.8rem; color: var(--text-muted);">错误: \${error.message}</p>
                                <p style="font-size: 0.8rem; color: var(--text-muted);">Cloudflare Workers 冷启动需要几秒钟</p>
                            </div>\`;

                        // 延迟重试
                        setTimeout(() => {
                            loadEntries(retryCount + 1);
                        }, retryDelay);
                    } else {
                        // 最终失败
                        showError('加载失败，请检查网络连接或稍后重试');
                    }
                });
        }

        // 全局变量存储所有条目
        let allEntries = [];

        // 显示条目
        function displayEntries(data) {
            allEntries = data || []; // 保存到全局变量
            const entriesDiv = document.getElementById('entries');
            const countElement = document.getElementById('entries-count');

            // 更新计数
            countElement.textContent = allEntries.length;

            if (!allEntries || allEntries.length === 0) {
                entriesDiv.innerHTML = \`
                    <div class="empty-state">
                        <h3>📝 暂无内容</h3>
                        <p>开始添加你的第一条剪贴板内容吧！</p>
                    </div>\`;
                return;
            }

            renderEntries(allEntries);
        }

        // 渲染条目列表
        function renderEntries(entries) {
            const entriesDiv = document.getElementById('entries');

            const sorted = entries.sort((a, b) => {
                if (a.pinned === b.pinned) {
                    return new Date(b.time) - new Date(a.time);
                }
                return a.pinned ? -1 : 1;
            });

            entriesDiv.innerHTML = sorted.map(entry => {
                const isHidden = entry.hidden === true;
                const rawText = entry.text || '';
                            const mdHtml = marked.parse(rawText);
                const safeHtml = DOMPurify.sanitize(mdHtml);

                return \`
                <div class="entry \${entry.pinned ? 'pinned' : ''}"
                     data-id="\${entry.id}"
                     onclick="toggleNote(this)">
                    <div class="entry-content">
                        <div class="entry-text \${entry.hidden ? 'hidden-text' : ''}">
                            \${isHidden ? '🔒 内容已隐藏' : safeHtml}
                        </div>
                        \${entry.note ? \`<div class="entry-note">💡 \${escapeHtml(entry.note)}</div>\` : ''}
                        <div class="entry-meta">
                            <span class="entry-time">🕒 \${entry.time || '未知时间'}</span>
                            \${entry.pinned ? '<span>📌 已置顶</span>' : ''}
                            \${entry.hidden ? '<span>🙈 已隐藏</span>' : ''}
                        </div>
                    </div>
                    <div class="entry-actions">
                        <button class="btn btn-success"
                                data-text="\${rawText.replace(/"/g, '&quot;')}"
                                data-hidden="\${isHidden}"
                                onclick="copyText(this, event)">
                            📋 复制
                        </button>
                        <button class="btn btn-secondary" onclick="toggleHidden('\${entry.id}', \${entry.hidden}, event)">
                            \${entry.hidden ? '👁️ 显示' : '🙈 隐藏'}
                        </button>
                        <button class="btn btn-warning" onclick="togglePin('\${entry.id}', \${entry.pinned}, event)">
                            \${entry.pinned ? '📌 取消' : '📌 置顶'}
                        </button>
                        <button class="btn btn-danger" onclick="deleteEntry('\${entry.id}', event)">
                            🗑️ 删除
                        </button>
                    </div>
                </div>\`;
            }).join('');

            // 渲染数学公式
            setTimeout(() => {
                try {
                    // 检查 KaTeX 是否已加载
                    if (typeof window.renderMathInElement === 'function') {
                        renderMathInElement(entriesDiv, {
                            delimiters: [
                                {left: '$$', right: '$$', display: true},
                                {left: '$', right: '$', display: false},
                                {left: '\\(', right: '\\)', display: false},
                                {left: '\\[', right: '\\]', display: true}
                            ],
                            throwOnError: false,
                            errorColor: '#cc0000',
                            strict: false,
                            trust: false,
                            macros: {
                                "\\RR": "\\mathbb{R}",
                                "\\NN": "\\mathbb{N}",
                                "\\ZZ": "\\mathbb{Z}",
                                "\\QQ": "\\mathbb{Q}",
                                "\\CC": "\\mathbb{C}"
                            }
                        });
                    } else {
                        console.warn('KaTeX renderMathInElement 未加载，跳过数学公式渲染');
                    }
                } catch (error) {
                    console.warn('数学公式渲染失败:', error);
                }
            }, 150);
        }

        // 搜索过滤功能
        function filterEntries() {
            const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();

            if (!searchTerm) {
                renderEntries(allEntries);
                return;
            }

            const filtered = allEntries.filter(entry => {
                const text = (entry.text || '').toLowerCase();
                const note = (entry.note || '').toLowerCase();
                return text.includes(searchTerm) || note.includes(searchTerm);
            });

            renderEntries(filtered);

            // 更新显示的计数
            const countElement = document.getElementById('entries-count');
            countElement.textContent = \`\${filtered.length}/\${allEntries.length}\`;
        }

        // HTML 转义函数
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // 显示错误信息
        function showError(message) {
            const entriesDiv = document.getElementById('entries');
            entriesDiv.innerHTML = \`
                <div class="empty-state">
                    <h3>❌ 出错了</h3>
                    <p>\${message}</p>
                    <button class="btn btn-primary" onclick="loadEntries()">🔄 重试</button>
                    <button class="btn btn-secondary" onclick="window.location.reload()">🔄 刷新页面</button>
                </div>\`;
        }



        // 复制文本
        function copyText(button, event) {
            event.stopPropagation();

            const isHidden = button.dataset.hidden === 'true';
            const textToCopy = isHidden ?
                '🔒 内容已隐藏' :
                button.dataset.text.replace(/&quot;/g, '"');

            if (navigator.clipboard) {
                navigator.clipboard.writeText(textToCopy)
                    .then(() => showToast('✅ 已复制到剪贴板', 'success'))
                    .catch(() => showToast('❌ 复制失败', 'error'));
            } else {
                // 降级方案
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();

                try {
                    const success = document.execCommand('copy');
                    showToast(success ? '✅ 已复制！' : '❌ 复制失败', success ? 'success' : 'error');
                } catch {
                    showToast('❌ 复制操作不被支持', 'error');
                }

                document.body.removeChild(textarea);
            }
        }

        // 显示提示消息
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.style.cssText = \`
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                animation: slideIn 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                max-width: 300px;
            \`;

            const colors = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            };

            toast.style.background = colors[type] || colors.info;
            toast.textContent = message;

            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // 添加动画样式
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = \`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            \`;
            document.head.appendChild(style);
        }



        // 保存条目
        function saveEntry() {
            const text = document.getElementById('new-text').value.trim();
            const note = document.getElementById('new-note').value.trim();

            if (!text) {
                showToast('❌ 文本内容不能为空', 'error');
                return;
            }

            const saveBtn = document.querySelector('.btn-primary');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '⏳ 保存中...';
            saveBtn.disabled = true;

            fetch('/api/save', {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: \`text=\${encodeURIComponent(text)}&note=\${encodeURIComponent(note)}\`
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => Promise.reject(text));
                }
                return response.text();
            })
            .then(() => {
                document.getElementById('new-text').value = '';
                document.getElementById('new-note').value = '';
                showToast('✅ 保存成功', 'success');
                loadEntries();
            })
            .catch(error => {
                console.error('保存失败:', error);
                showToast(\`❌ 保存失败: \${error}\`, 'error');
            })
            .finally(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            });
        }

        // 删除条目
        function deleteEntry(id, event) {
            event.stopPropagation();

            if (!confirm('确定要删除这个条目吗？')) return;

            const password = prompt('🔐 请输入管理员密码：');
            if (!password) return;

            fetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: \`id=\${id}&password=\${encodeURIComponent(password)}\`
            })
            .then(response => response.text())
            .then(result => {
                if (result === 'OK') {
                    showToast('✅ 删除成功', 'success');
                    loadEntries();
                } else {
                    showToast(\`❌ 删除失败: \${result}\`, 'error');
                }
            })
            .catch(error => {
                showToast('❌ 网络错误', 'error');
            });
        }

        // 切换隐藏状态
        function toggleHidden(id, isHidden, event) {
            event.stopPropagation();

            const password = prompt('🔐 请输入管理员密码：');
            if (!password) return;

            fetch('/api/hide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: \`id=\${id}&hidden=\${!isHidden}&password=\${encodeURIComponent(password)}\`
            })
            .then(response => response.text())
            .then(result => {
                if (result === 'OK') {
                    showToast(isHidden ? '✅ 已显示内容' : '✅ 已隐藏内容', 'success');
                    loadEntries();
                } else {
                    showToast(\`❌ 操作失败: \${result}\`, 'error');
                }
            })
            .catch(error => {
                showToast('❌ 网络错误', 'error');
            });
        }

        // 切换置顶状态
        function togglePin(id, isPinned, event) {
            event.stopPropagation();

            const password = prompt('🔐 请输入管理员密码：');
            if (!password) return;

            fetch('/api/pin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: \`id=\${id}&pinned=\${!isPinned}&password=\${encodeURIComponent(password)}\`
            })
            .then(response => response.text())
            .then(result => {
                if (result === 'OK') {
                    showToast(isPinned ? '✅ 已取消置顶' : '✅ 已置顶', 'success');
                    loadEntries();
                } else {
                    showToast(\`❌ 操作失败: \${result}\`, 'error');
                }
            })
            .catch(error => {
                showToast('❌ 网络错误', 'error');
            });
        }

        // 切换备注显示
        function toggleNote(element) {
            const note = element.querySelector('.entry-note');
            if (note) {
                note.style.display = note.style.display === 'none' ? 'block' : 'none';
            }
        }



        // 导出数据功能（前端版本）
        function exportData() {
            if (!allEntries || allEntries.length === 0) {
                showToast('❌ 暂无数据可导出', 'warning');
                return;
            }

            try {
                // 创建导出数据
                const exportData = {
                    exportTime: new Date().toISOString(),
                    totalEntries: allEntries.length,
                    entries: allEntries.map(entry => ({
                        id: entry.id,
                        text: entry.text,
                        note: entry.note || '',
                        time: entry.time,
                        pinned: entry.pinned || false,
                        hidden: entry.hidden || false
                    }))
                };

                // 创建下载链接
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);

                const link = document.createElement('a');
                link.href = url;
                link.download = \`paste-web-export-\${new Date().toISOString().split('T')[0]}.json\`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                showToast('✅ 数据导出成功', 'success');
            } catch (error) {
                console.error('导出失败:', error);
                showToast('❌ 导出失败', 'error');
            }
        }

        // 更新字符计数
        function updateCharCount() {
            const textArea = document.getElementById('new-text');
            const charCount = document.getElementById('char-count');
            const length = textArea.value.length;
            charCount.textContent = length;

            // 根据长度改变颜色
            if (length > 5000) {
                charCount.style.color = 'var(--danger)';
            } else if (length > 2000) {
                charCount.style.color = 'var(--warning)';
            } else {
                charCount.style.color = 'var(--text-muted)';
            }
        }

        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
            // Ctrl+Enter 或 Cmd+Enter 保存
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                saveEntry();
            }

            // Ctrl+R 或 Cmd+R 刷新（阻止默认行为并重新加载）
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                loadEntries();
            }
        });

        // 初始化
        document.addEventListener('DOMContentLoaded', function() {
            loadEntries();

            // 自动聚焦到文本框
            const textArea = document.getElementById('new-text');
            if (textArea) {
                textArea.focus();
            }
        });

        // 页面可见性变化时重新加载（可选）
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                loadEntries();
            }
        });

        loadEntries();
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// 生成访问页面
function generateAccessPage() {
  const accessHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>访问验证 - Paste Web</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }

        .access-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }

        .access-container h1 {
            color: #333;
            margin-bottom: 30px;
        }

        .access-container input {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            margin-bottom: 20px;
            box-sizing: border-box;
        }

        .access-container input:focus {
            outline: none;
            border-color: #667eea;
        }

        .access-container button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .access-container button:hover {
            transform: translateY(-2px);
        }

        .error {
            color: #e74c3c;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="access-container">
        <h1>🔐 访问验证</h1>
        <p>请输入访问密码以继续</p>
        <input type="password" id="access-password" placeholder="请输入访问密码" onkeypress="handleKeyPress(event)">
        <button onclick="verifyAccess()">验证访问</button>
        <div id="error-message" class="error"></div>
    </div>

    <script>
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                verifyAccess();
            }
        }

        async function verifyAccess() {
            const password = document.getElementById('access-password').value;
            const errorDiv = document.getElementById('error-message');

            if (!password) {
                errorDiv.textContent = '请输入密码';
                return;
            }

            try {
                const response = await fetch('/api/verify-access', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: password })
                });

                if (response.ok) {
                    // 设置访问令牌
                    document.cookie = \`access_token=\${password}; path=/; max-age=86400\`;
                    window.location.href = '/';
                } else {
                    errorDiv.textContent = '密码错误，请重试';
                    document.getElementById('access-password').value = '';
                }
            } catch (error) {
                errorDiv.textContent = '验证失败，请重试';
            }
        }
    </script>
</body>
</html>`;

  return new Response(accessHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// 处理管理员页面
async function handleAdminPage(request, env) {
  // 验证管理员身份
  const adminToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  const cookieHeader = request.headers.get('Cookie');
  const adminCookie = cookieHeader?.split(';').find(c => c.trim().startsWith('admin_token='))?.split('=')[1];

  if (!adminToken && !adminCookie) {
    return generateAdminLoginPage();
  }

  // 验证管理员令牌
  const adminPassword = env.ADMIN_PASSWORD || 'zhouzhou12203';
  if (adminToken !== adminPassword && adminCookie !== adminPassword) {
    return generateAdminLoginPage();
  }

  return new Response(generateAdminPage(env), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// 生成管理员登录页面
function generateAdminLoginPage() {
  const loginHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>管理员登录 - Paste Web</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }

        .login-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }

        .login-container h1 {
            color: #2c3e50;
            margin-bottom: 30px;
        }

        .login-container input {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            margin-bottom: 20px;
            box-sizing: border-box;
        }

        .login-container input:focus {
            outline: none;
            border-color: #3498db;
        }

        .login-container button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .login-container button:hover {
            transform: translateY(-2px);
        }

        .error {
            color: #e74c3c;
            margin-top: 10px;
        }

        .back-link {
            margin-top: 20px;
        }

        .back-link a {
            color: #3498db;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>🛠️ 管理员登录</h1>
        <p>请输入管理员密码以访问管理面板</p>
        <input type="password" id="admin-password" placeholder="请输入管理员密码" onkeypress="handleKeyPress(event)">
        <button onclick="adminLogin()">登录</button>
        <div id="error-message" class="error"></div>
        <div class="back-link">
            <a href="/">← 返回主页</a>
        </div>
    </div>

    <script>
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
                adminLogin();
            }
        }

        async function adminLogin() {
            const password = document.getElementById('admin-password').value;
            const errorDiv = document.getElementById('error-message');

            if (!password) {
                errorDiv.textContent = '请输入管理员密码';
                return;
            }

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: password })
                });

                if (response.ok) {
                    const data = await response.json();
                    // 设置管理员令牌
                    document.cookie = \`admin_token=\${data.token}; path=/; max-age=86400\`;
                    sessionStorage.setItem('adminToken', data.token);
                    window.location.href = '/admin';
                } else {
                    errorDiv.textContent = '密码错误，请重试';
                    document.getElementById('admin-password').value = '';
                }
            } catch (error) {
                errorDiv.textContent = '登录失败，请重试';
            }
        }
    </script>
</body>
</html>`;

  return new Response(loginHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// 处理管理员登录
async function handleAdminLogin(request, env, corsHeaders) {
  try {
    const { password } = await request.json();
    const adminPassword = env.ADMIN_PASSWORD || 'zhouzhou12203';

    if (password === adminPassword) {
      return new Response(JSON.stringify({
        success: true,
        token: adminPassword
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: '密码错误'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '登录失败'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// 验证管理员权限
function verifyAdminAuth(request, env) {
  const adminToken = request.headers.get('Authorization')?.replace('Bearer ', '');
  const adminPassword = env.ADMIN_PASSWORD || 'zhouzhou12203';
  return adminToken === adminPassword;
}

// 处理管理员获取所有条目（包括隐藏的）
async function handleAdminGetEntries(request, env, corsHeaders) {
  if (!verifyAdminAuth(request, env)) {
    return new Response('Unauthorized', {
      status: 401,
      headers: corsHeaders
    });
  }

  try {
    const entries = await env.PASTE_KV.get('entries', 'json') || [];
    return new Response(JSON.stringify(entries), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response('[]', {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// 处理管理员配置更新
async function handleAdminConfig(request, env, corsHeaders) {
  if (!verifyAdminAuth(request, env)) {
    return new Response('Unauthorized', {
      status: 401,
      headers: corsHeaders
    });
  }

  try {
    const { action } = await request.json();

    // 注意：在 Cloudflare Workers 中，环境变量是只读的
    // 实际的密码更新需要在 Cloudflare Dashboard 中进行
    // 这里只是返回成功响应，提示用户在 Dashboard 中更新

    switch (action) {
      case 'updateAccessPassword':
        return new Response(JSON.stringify({
          success: true,
          message: '请在 Cloudflare Dashboard 的 Workers 设置中更新 ACCESS_PASSWORD 环境变量'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });

      case 'updateAdminPassword':
        return new Response(JSON.stringify({
          success: true,
          message: '请在 Cloudflare Dashboard 的 Workers 设置中更新 ADMIN_PASSWORD 环境变量'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });

      case 'updateSystemConfig':
        return new Response(JSON.stringify({
          success: true,
          message: '请在 Cloudflare Dashboard 的 Workers 设置中更新 RATE_LIMIT_MAX 和 RATE_LIMIT_WINDOW 环境变量'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });

      default:
        return new Response(JSON.stringify({
          success: false,
          message: '未知操作'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '配置更新失败'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// 处理管理员条目操作
async function handleAdminEntry(request, env, corsHeaders) {
  if (!verifyAdminAuth(request, env)) {
    return new Response('Unauthorized', {
      status: 401,
      headers: corsHeaders
    });
  }

  try {
    const { action, id, ...data } = await request.json();
    const entries = await env.PASTE_KV.get('entries', 'json') || [];

    switch (action) {
      case 'pin':
        const updatedEntriesPin = entries.map(entry => {
          if (entry.id === id) {
            return { ...entry, pinned: data.pinned };
          }
          return entry;
        });
        await env.PASTE_KV.put('entries', JSON.stringify(updatedEntriesPin));
        break;

      case 'hide':
        const updatedEntriesHide = entries.map(entry => {
          if (entry.id === id) {
            return { ...entry, hidden: data.hidden };
          }
          return entry;
        });
        await env.PASTE_KV.put('entries', JSON.stringify(updatedEntriesHide));
        break;

      case 'delete':
        const updatedEntriesDelete = entries.filter(entry => entry.id !== id);
        await env.PASTE_KV.put('entries', JSON.stringify(updatedEntriesDelete));
        break;

      default:
        return new Response(JSON.stringify({
          success: false,
          message: '未知操作'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
    }

    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '操作失败'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// 处理管理员清理操作
async function handleAdminClear(request, env, corsHeaders) {
  if (!verifyAdminAuth(request, env)) {
    return new Response('Unauthorized', {
      status: 401,
      headers: corsHeaders
    });
  }

  try {
    const { action } = await request.json();
    const entries = await env.PASTE_KV.get('entries', 'json') || [];

    switch (action) {
      case 'clearHidden':
        const visibleEntries = entries.filter(entry => !entry.hidden);
        await env.PASTE_KV.put('entries', JSON.stringify(visibleEntries));
        break;

      case 'clearAll':
        await env.PASTE_KV.put('entries', JSON.stringify([]));
        break;

      default:
        return new Response(JSON.stringify({
          success: false,
          message: '未知操作'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
    }

    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '清理失败'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// 处理访问验证
async function handleVerifyAccess(request, env, corsHeaders) {
  try {
    const { password } = await request.json();
    const accessPassword = env.ACCESS_PASSWORD;

    if (!accessPassword) {
      // 如果没有设置访问密码，则允许访问
      return new Response(JSON.stringify({
        success: true
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    if (password === accessPassword) {
      return new Response(JSON.stringify({
        success: true
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: '密码错误'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '验证失败'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// 处理获取条目
async function handleGetEntries(kv, corsHeaders) {
  try {
    console.log('handleGetEntries called');
    console.log('KV available:', !!kv);

    // 如果没有 KV，返回示例数据用于本地开发
    if (!kv) {
      console.warn('KV not available, returning sample data for local development');
      const sampleEntries = [
        {
          id: 'sample-1',
          text: '欢迎使用剪贴板管理工具！',
          note: '这是一个示例条目（本地开发模式）',
          time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
          pinned: false,
          hidden: false
        },
        {
          id: 'sample-2',
          text: '# Markdown 支持\n\n这是一个 **粗体** 文本和 *斜体* 文本的示例。\n\n- 列表项 1\n- 列表项 2\n\n数学公式：$E = mc^2$',
          note: 'Markdown 和 LaTeX 示例',
          time: new Date(Date.now() - 60000).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
          pinned: true,
          hidden: false
        }
      ];

      return new Response(JSON.stringify(sampleEntries), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    let entriesData;
    try {
      entriesData = await kv.get('entries', 'json') || [];
      console.log('Retrieved entries data:', entriesData);
    } catch (kvError) {
      console.error('KV get error:', kvError);
      // KV 访问失败时返回空数组
      entriesData = [];
    }

    // 确保 entriesData 是数组
    if (!Array.isArray(entriesData)) {
      console.warn('entriesData is not an array, converting:', entriesData);
      entriesData = [];
    }

    // 过滤隐藏条目的敏感信息
    const filteredEntries = entriesData.map(entry => {
      // 确保 entry 是对象
      if (!entry || typeof entry !== 'object') {
        console.warn('Invalid entry found:', entry);
        return null;
      }

      // 移除IP信息
      const { ipv4, ipv6, ...cleanEntry } = entry;

      if (entry.hidden) {
        return {
          ...cleanEntry,
          text: '🔒 内容已隐藏', // 保留占位符文本
          time: '2025-01-01 00:00:00' // 设置时间使隐藏内容下沉
        };
      }

      return cleanEntry;
    }).filter(entry => entry !== null); // 过滤掉无效条目

    console.log('Filtered entries count:', filteredEntries.length);

    return new Response(JSON.stringify(filteredEntries), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Error getting entries:', error);
    // 即使出错也返回空数组，确保前端能正常工作
    return new Response(JSON.stringify([]), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// 处理保存条目
async function handleSave(request, env, corsHeaders) {
  try {
    const clientIP = getClientIP(request);

    // 频率限制检查
    const rateLimiter = new RateLimiter(
      env.PASTE_KV,
      clientIP,
      parseInt(env.RATE_LIMIT_MAX) || 5,
      parseInt(env.RATE_LIMIT_WINDOW) || 60
    );

    if (!(await rateLimiter.check())) {
      return new Response('请求过于频繁，请等待1分钟后重试', {
        status: 429,
        headers: corsHeaders
      });
    }

    const formData = await request.formData();
    const text = formData.get('text')?.trim();
    const note = formData.get('note')?.trim() || '';

    if (!text) {
      return new Response('错误：文本内容不能为空', {
        status: 400,
        headers: corsHeaders
      });
    }

    // 输入验证
    if (text.length > 2000) {
      return new Response('文本长度超过2000字符限制', {
        status: 413,
        headers: corsHeaders
      });
    }

    if (/<script/i.test(text)) {
      return new Response('包含非法内容', {
        status: 400,
        headers: corsHeaders
      });
    }

    // 获取现有条目
    const entries = await env.PASTE_KV.get('entries', 'json') || [];

    // 创建新条目
    const newEntry = {
      id: generateId(),
      text: escapeHtml(text),
      note: escapeHtml(note),
      pinned: false,
      hidden: false,
      time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      ipv4: clientIP,
      ipv6: '::' // Cloudflare Workers通常提供IPv4
    };

    entries.push(newEntry);

    // 保存到KV
    await env.PASTE_KV.put('entries', JSON.stringify(entries));

    return new Response('OK', { headers: corsHeaders });
  } catch (error) {
    console.error('Error saving entry:', error);
    return new Response('服务器错误', {
      status: 500,
      headers: corsHeaders
    });
  }
}

// 处理删除条目
async function handleDelete(request, env, corsHeaders) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const password = formData.get('password');

    if (!verifyPassword(password, env.ADMIN_PASSWORD || 'zhouzhou12203')) {
      return new Response('错误：管理员密码错误', {
        status: 401,
        headers: corsHeaders
      });
    }

    if (!id) {
      return new Response('错误：缺少ID参数', {
        status: 400,
        headers: corsHeaders
      });
    }

    const entries = await env.PASTE_KV.get('entries', 'json') || [];
    const newEntries = entries.filter(entry => entry.id !== id);

    await env.PASTE_KV.put('entries', JSON.stringify(newEntries));

    return new Response('OK', { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return new Response('错误：删除失败', {
      status: 500,
      headers: corsHeaders
    });
  }
}

// 处理隐藏/取消隐藏条目
async function handleHide(request, env, corsHeaders) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const hidden = formData.get('hidden') === 'true';
    const password = formData.get('password');

    if (!verifyPassword(password, env.ADMIN_PASSWORD || 'zhouzhou12203')) {
      return new Response('错误：管理员密码错误', {
        status: 401,
        headers: corsHeaders
      });
    }

    const entries = await env.PASTE_KV.get('entries', 'json') || [];
    const updatedEntries = entries.map(entry => {
      if (entry.id === id) {
        return { ...entry, hidden };
      }
      return entry;
    });

    await env.PASTE_KV.put('entries', JSON.stringify(updatedEntries));

    return new Response('OK', { headers: corsHeaders });
  } catch (error) {
    console.error('Error hiding entry:', error);
    return new Response('错误：操作失败', {
      status: 500,
      headers: corsHeaders
    });
  }
}

// 处理置顶/取消置顶条目
async function handlePin(request, env, corsHeaders) {
  try {
    const formData = await request.formData();
    const id = formData.get('id');
    const pinned = formData.get('pinned') === 'true';
    const password = formData.get('password');

    if (!verifyPassword(password, env.ADMIN_PASSWORD || 'zhouzhou12203')) {
      return new Response('错误：管理员密码错误', {
        status: 401,
        headers: corsHeaders
      });
    }

    const entries = await env.PASTE_KV.get('entries', 'json') || [];
    const updatedEntries = entries.map(entry => {
      if (entry.id === id) {
        return { ...entry, pinned };
      }
      return entry;
    });

    await env.PASTE_KV.put('entries', JSON.stringify(updatedEntries));

    return new Response('OK', { headers: corsHeaders });
  } catch (error) {
    console.error('Error pinning entry:', error);
    return new Response('错误：操作失败', {
      status: 500,
      headers: corsHeaders
    });
  }
};

// 导出 worker 对象
export default worker;
