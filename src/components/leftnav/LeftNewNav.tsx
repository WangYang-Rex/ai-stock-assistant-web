
import React, { useState } from 'react';
import type { MenuProps } from 'antd';
import { Button, Menu } from 'antd';
import {
  FundProjectionScreenOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import './LeftNewNav.less';

const menuMap = [
  {
    key: 'home',
    label: '实时行情',
    route: '/',
    icon: <HomeOutlined />,
  },
  {
    key: 'news',
    label: '实时新闻',
    route: '/stock',
    icon: <HomeOutlined />,
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
  },
]

type MenuItem = Required<MenuProps>['items'][number];
const LeftNewNav = (props: any) => {
  
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const items: MenuItem[] = menuMap.map((item) => {
    return {
      key: item.key,
      label: item.label,
      icon: item.icon || <SettingOutlined />,
    }
  }).concat([{
    key: 'sub1',
    label: 'Navigation One',
    icon: <SettingOutlined />,
    children: [
      { key: '1', label: 'Option 9' },
      { key: '2', label: 'Option 10' },
      { key: '3', label: 'Option 11' },
      { key: '4', label: 'Option 12' },
    ],
  }])

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
    const target = menuMap.find((item) => item.key === e.key);
    if (target) {
      location.hash = target.route;
    }
  };

  return (
    <div className={`leftnav t-FBV ${props.themeClass}`}>
      <Menu
        className="t-FB1 menu-ctn"
        onClick={onClick}
        style={{ width: collapsed ? '70px' : '180px' }}
        defaultSelectedKeys={['home']}
        defaultOpenKeys={['sub1']}
        mode="inline"
        inlineCollapsed={collapsed}
        items={items}
      />
      <div className="center collBtn t-FBH">
        <div className="t-FB1"></div>
        <Button type="text" onClick={toggleCollapsed} style={{ marginBottom: 16 }}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
      </div>
    </div>
  );
}

export default LeftNewNav;