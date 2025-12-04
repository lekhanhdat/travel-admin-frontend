import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  StarOutlined,
  UserOutlined,
  FlagOutlined,
  DollarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/locations', icon: <EnvironmentOutlined />, label: 'Locations' },
  { key: '/festivals', icon: <CalendarOutlined />, label: 'Festivals' },
  { key: '/reviews', icon: <StarOutlined />, label: 'Reviews' },
  { key: '/users', icon: <UserOutlined />, label: 'Users' },
  { key: '/objectives', icon: <FlagOutlined />, label: 'Objectives' },
  { key: '/transactions', icon: <DollarOutlined />, label: 'Transactions' },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={240}
      collapsedWidth={80}
      trigger={null}
      style={{ minHeight: '100vh' }}
    >
      <div style={{ 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#fff',
        fontSize: collapsed ? 16 : 20,
        fontWeight: 'bold',
      }}>
        {collapsed ? 'TA' : 'Travel Admin'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        {collapsed ? (
          <MenuUnfoldOutlined
            style={{ color: '#fff', fontSize: 18, cursor: 'pointer' }}
            onClick={() => setCollapsed(false)}
          />
        ) : (
          <MenuFoldOutlined
            style={{ color: '#fff', fontSize: 18, cursor: 'pointer' }}
            onClick={() => setCollapsed(true)}
          />
        )}
      </div>
    </Sider>
  );
};

export default Sidebar;
