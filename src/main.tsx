// import React, { StrictMode } from 'react' // StrictMode 已注释，React 不需要导入
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom';
import App from '@/App'
import '@/styles/base.less';
import '@/styles/app.less';

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    {/* <StrictMode> */}
    <App />
    {/* </StrictMode> */}
  </HashRouter>
)
