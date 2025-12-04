import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import {
  EnvironmentOutlined,
  CalendarOutlined,
  UserOutlined,
  TrophyOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { dashboardService } from '../services/dashboard';
import type { DashboardStats } from '../services/dashboard';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      message.error('Failed to load dashboard statistics');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Locations', value: stats?.locations || 0, icon: <EnvironmentOutlined style={{ fontSize: 24, color: '#1890ff' }} />, color: '#e6f7ff' },
    { title: 'Total Festivals', value: stats?.festivals || 0, icon: <CalendarOutlined style={{ fontSize: 24, color: '#52c41a' }} />, color: '#f6ffed' },
    { title: 'Total Users', value: stats?.accounts || 0, icon: <UserOutlined style={{ fontSize: 24, color: '#faad14' }} />, color: '#fffbe6' },
    { title: 'Total Items', value: stats?.items || 0, icon: <TrophyOutlined style={{ fontSize: 24, color: '#722ed1' }} />, color: '#f9f0ff' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <ReloadOutlined style={{ fontSize: 20, cursor: 'pointer' }} spin={loading} onClick={fetchStats} />
      </div>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {statCards.map((card, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card style={{ backgroundColor: card.color }} bordered={false}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {card.icon}
                  <Statistic title={card.title} value={card.value} valueStyle={{ fontWeight: 'bold' }} />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Quick Stats Summary">
            <p>Welcome to the Travel Admin Dashboard. Use the sidebar to manage locations, festivals, users, and more.</p>
            <ul>
              <li>Manage {stats?.locations || 0} tourist locations</li>
              <li>Organize {stats?.festivals || 0} festivals and events</li>
              <li>View {stats?.accounts || 0} registered users</li>
              <li>Track {stats?.items || 0} objectives and rewards</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
