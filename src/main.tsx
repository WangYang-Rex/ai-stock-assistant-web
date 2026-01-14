/**
 * ============================================
 * Application Entry Point
 * ============================================
 * 应用入口文件 - 初始化 React 应用
 */

import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from '@/App';

// 导入样式（按顺序：变量 -> 基础 -> 应用）
import '@/styles/base.less';
import '@/styles/app.less';

// 获取根元素
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

// 创建 React 根节点并渲染应用
const root = createRoot(rootElement);

root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
