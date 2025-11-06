import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';

// 懒加载组件
// const Demo = lazy(() => import(/* webpackChunkName:"demo" */ "@/pages/demo/App"));
// const JsErrorList = lazy(() => import(/* webpackChunkName:"jserror" */ "@/pages/jserror/list"));

const router = [
  {
    path: '/',
    component: lazy(() => import(/* webpackChunkName:"home" */ "@/pages/home/home")),
  },
  {
    path: '/vite',
    component: lazy(() => import(/* webpackChunkName:"home" */ "@/pages/vite/vite")),
  },
  // {
  //   path: '/demo',
  //   component: Demo,
  // },
  // {
  //   path: '/jserror/list',
  //   component: JsErrorList,
  // },
];

// 加载中组件
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
    <Spin size="large" />
  </div>
);

const Routers = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      {router.map(({ component: Component, path }) => {
        return <Route key={path} path={path} element={<Component />} />;
      })}
    </Routes>
  </Suspense>
);

export default Routers;
