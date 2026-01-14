/**
 * ============================================
 * Router Configuration
 * ============================================
 * 应用路由配置 - 懒加载和路由映射
 */

import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';

// 路由配置
const routes = [
  {
    path: '/',
    component: lazy(() => import(/* webpackChunkName: "home" */ '@/pages/home/home')),
  },
  {
    path: '/trade',
    component: lazy(() => import(/* webpackChunkName: "trade" */ '@/pages/trade/trade')),
  },
  {
    path: '/vite',
    component: lazy(() => import(/* webpackChunkName: "vite" */ '@/pages/vite/vite')),
  },
];

/**
 * Loading - 加载中占位组件
 * @description 页面懒加载时显示的加载动画
 */
const Loading = () => (
  <div 
    style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '300px',
      width: '100%',
      background: 'transparent',
    }}
  >
    <Spin 
      size="large" 
      tip="加载中..."
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    />
  </div>
);

/**
 * Routers - 路由组件
 * @description 配置应用的所有路由，支持懒加载
 */
const Routers = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      {routes.map(({ component: Component, path }) => (
        <Route 
          key={path} 
          path={path} 
          element={<Component />} 
        />
      ))}
    </Routes>
  </Suspense>
);

export default Routers;
