// Cloudflare Pages Functions 通配符路由
// 处理所有路径的请求

import worker from '../worker.js';

export async function onRequest(context) {
  // context 包含:
  // - request: Request 对象
  // - env: 环境变量和绑定
  // - params: 路径参数
  // - waitUntil: 用于延长执行时间
  // - next: 调用下一个函数
  // - data: 在函数之间共享数据

  return worker.fetch(context.request, context.env, context);
}
