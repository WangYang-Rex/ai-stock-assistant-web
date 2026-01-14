/**
 * ============================================
 * App Component
 * ============================================
 * 应用主入口组件 - 处理布局结构和路由
 */

import { useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Routers from '@/router';
import NewHeader from '@/components/newheader/NewHeader';
import LeftNewNav from '@/components/leftnav/LeftNewNav';

/**
 * Ant Design 亮色主题配置
 * 专业 Fintech Light Mode 风格
 */
const lightThemeConfig = {
  token: {
    // 主色调 - Trust Blue
    colorPrimary: '#3B82F6',
    colorPrimaryHover: '#2563EB',
    colorPrimaryActive: '#1D4ED8',
    
    // 成功/危险/警告/信息
    colorSuccess: '#10B981',
    colorError: '#EF4444',
    colorWarning: '#F59E0B',
    colorInfo: '#0EA5E9',
    
    // 背景色 - Light Mode
    colorBgBase: '#F8FAFC',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F8FAFC',
    colorBgSpotlight: '#F1F5F9',
    
    // 文本色
    colorText: '#1E293B',
    colorTextSecondary: '#475569',
    colorTextTertiary: '#64748B',
    colorTextQuaternary: '#94A3B8',
    
    // 边框色
    colorBorder: '#E2E8F0',
    colorBorderSecondary: '#CBD5E1',
    
    // 字体
    fontFamily: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    
    // 圆角
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    
    // 阴影
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 10px 20px rgba(0, 0, 0, 0.12)',
  },
  components: {
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      itemSelectedBg: 'rgba(59, 130, 246, 0.1)',
      itemHoverBg: '#F1F5F9',
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemSelectedColor: '#3B82F6',
    },
    Table: {
      headerBg: '#F1F5F9',
      rowHoverBg: '#F8FAFC',
      borderColor: '#E2E8F0',
    },
    Card: {
      colorBgContainer: '#FFFFFF',
      colorBorderSecondary: '#E2E8F0',
    },
    Modal: {
      contentBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      titleColor: '#1E293B',
    },
    Input: {
      colorBgContainer: '#FFFFFF',
      colorBorder: '#E2E8F0',
      hoverBorderColor: '#3B82F6',
      activeBorderColor: '#3B82F6',
    },
    Select: {
      colorBgContainer: '#FFFFFF',
      colorBgElevated: '#FFFFFF',
      optionSelectedBg: 'rgba(59, 130, 246, 0.1)',
    },
    Button: {
      primaryShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
    },
  },
};

/**
 * App - 应用主组件
 * @description 根据路由决定是否显示导航布局
 */
const App = () => {
  const location = useLocation();
  const { pathname } = location;
  
  // 不需要导航布局的路由
  const noLayoutRoutes = ['login', 'register', 'forgot-password'];
  const shouldShowLayout = !noLayoutRoutes.some(route => pathname.includes(route));

  // 渲染内容
  let appContent: React.ReactNode = null;
  
  if (!shouldShowLayout) {
    // 无布局页面（登录等）
    appContent = (
      <div className="pageMain t-FBH">
        <Routers />
      </div>
    );
  } else {
    // 带布局的主页面
    appContent = (
      <div className="pageMain-wrap t-FBV">
        <NewHeader />
        <div className="pageMain t-FBH" style={{ top: '56px' }}>
          <LeftNewNav />
          <div className="main-content t-FB1 t-FBV">
            <Routers />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ConfigProvider
      locale={zhCN}
      theme={lightThemeConfig}
    >
      {appContent}
    </ConfigProvider>
  );
};

export default App;
