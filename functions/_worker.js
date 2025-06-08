// Cloudflare Pages Functions 入口文件
// 这个文件使 Paste Web 能够在 Cloudflare Pages 上运行

// 导入主要的 Worker 代码
import worker from '../worker.js';

// 导出默认处理函数，兼容 Cloudflare Pages Functions
export default {
  async fetch(request, env, ctx) {
    return worker.fetch(request, env, ctx);
  }
};
