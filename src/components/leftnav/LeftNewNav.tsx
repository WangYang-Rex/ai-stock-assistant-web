/**
 * ============================================
 * LeftNewNav Component
 * ============================================
 * 左侧导航栏组件 - 现代侧边栏导航
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { Button, Menu } from 'antd';
import {
  FundProjectionScreenOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  SwapOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import './LeftNewNav.less';

/**
 * 菜单配置
 * @description 定义导航菜单项及其路由映射
 */
const menuMap = [
  {
    key: 'home',
    label: '实时行情',
    route: '/',
    icon: <HomeOutlined />,
  },
  {
    key: 'trade',
    label: '实时交易',
    route: '/trade',
    icon: <SwapOutlined />,
  },
  {
    key: 'news',
    label: '实时新闻',
    route: '/news',
    icon: <FileTextOutlined />,
  },
  {
    key: 'stock',
    label: '智能投顾',
    route: '/stock',
    icon: <FundProjectionScreenOutlined />,
  },
  {
    key: 'vite',
    label: 'Vite',
    route: '/vite',
    icon: <FundProjectionScreenOutlined />,
  },
];

type MenuItem = Required<MenuProps>['items'][number];

interface LeftNewNavProps {
  themeClass?: string;
}

/**
 * LeftNewNav - 左侧导航栏组件
 * @description 支持折叠/展开，高亮当前路由
 */
const LeftNewNav = (props: LeftNewNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('home');

  // 根据当前路由设置选中的菜单项
  useEffect(() => {
    const currentPath = location.hash.replace('#', '') || '/';
    const matchedMenu = menuMap.find(item => item.route === currentPath);
    if (matchedMenu) {
      setSelectedKey(matchedMenu.key);
    }
  }, [location.hash]);

  // 切换折叠状态
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // 构建菜单项
  const items: MenuItem[] = [
    ...menuMap.map((item) => ({
      key: item.key,
      label: item.label,
      icon: item.icon,
    })),
    {
      type: 'divider',
    },
    {
      key: 'sub1',
      label: '系统设置',
      icon: <SettingOutlined />,
      children: [
        { key: 'settings-profile', label: '个人信息' },
        { key: 'settings-security', label: '安全设置' },
        { key: 'settings-notification', label: '通知设置' },
      ],
    },
  ];

  // 菜单点击处理
  const onClick: MenuProps['onClick'] = (e) => {
    const target = menuMap.find((item) => item.key === e.key);
    if (target) {
      setSelectedKey(e.key);
      // 使用 hash 路由导航
      window.location.hash = target.route;
    }
  };

  return (
    <div className={`leftnav t-FBV ${props.themeClass || ''}`}>
      <Menu
        className="t-FB1 menu-ctn"
        onClick={onClick}
        style={{ width: collapsed ? '72px' : '240px' }}
        selectedKeys={[selectedKey]}
        defaultOpenKeys={['sub1']}
        mode="inline"
        inlineCollapsed={collapsed}
        items={items}
      />
      <div className="collBtn t-FBH">
        <Button 
          type="text" 
          onClick={toggleCollapsed}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        >
          {!collapsed && '收起菜单'}
        </Button>
      </div>
    </div>
  );
};

export default LeftNewNav;