/**
 * ============================================
 * NewHeader Component
 * ============================================
 * 顶部导航栏组件 - 现代 Fintech 风格
 */

import { BellOutlined, QuestionCircleOutlined, SettingOutlined } from '@ant-design/icons';
import './NewHeader.less';
import viteLogo from '@/images/svg/vite.svg';

/**
 * NewHeader - 应用顶部导航栏
 * @description 包含 Logo、中央导航区域和用户操作区
 */
const NewHeader = (props: { themeClass?: string }) => {
  return (
    <header className={`newheader ${props.themeClass || ''}`}>
      {/* Logo 区域 */}
      <div className="logo">
        <img src={viteLogo} alt="AI Stock Assistant Logo" />
        <span className="logo-text">AI STOCK ASSISTANT</span>
      </div>

      {/* 中央区域 - 可扩展 */}
      <div className="t-center-wrap">
        {/* 可添加搜索框或其他中央元素 */}
      </div>

      {/* 右侧用户信息区域 */}
      <div className="header-info">
        {/* 通知按钮 */}
        <div className="header-action" title="通知">
          <BellOutlined style={{ fontSize: 18 }} />
        </div>
        
        {/* 帮助按钮 */}
        <div className="header-action" title="帮助">
          <QuestionCircleOutlined style={{ fontSize: 18 }} />
        </div>
        
        {/* 设置按钮 */}
        <div className="header-action" title="设置">
          <SettingOutlined style={{ fontSize: 18 }} />
        </div>
      </div>
    </header>
  );
};

export default NewHeader;