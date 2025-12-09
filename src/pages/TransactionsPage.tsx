import React, { useEffect, useState, useCallback } from 'react';
import { Table, Card, Row, Col, Statistic, Input, Select, Space, Tag, Button } from 'antd';
import { DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, SearchOutlined, ClearOutlined, TransactionOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { Transaction, TransactionStats } from '../types';
import { transactionsService } from '../services/transactions';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const data = await transactionsService.getStats();
      setStats(data);
    } catch (error) { console.error('Failed to load stats', error); }
  }, []);

  const fetchTransactions = useCallback(async (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
    try {
      setLoading(true);
      const result = await transactionsService.getAll({
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        search: params.search !== undefined ? params.search : search,
        status: params.status !== undefined ? params.status : statusFilter,
      });
      setTransactions(result.list || []);
      setPagination(prev => ({ ...prev, current: result.pageInfo?.page || 1, total: result.pageInfo?.totalRows || 0 }));
    } catch (error) { console.error('Failed to load transactions', error); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, statusFilter]);

  useEffect(() => { fetchStats(); fetchTransactions({ page: 1 }); }, []);

  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    setPagination(prev => ({ ...prev, current: paginationConfig.current || 1, pageSize: paginationConfig.pageSize || 10 }));
    fetchTransactions({ page: paginationConfig.current, limit: paginationConfig.pageSize });
  };

  const handleSearch = () => fetchTransactions({ page: 1, search, status: statusFilter });
  const handleStatusChange = (value: string) => { setStatusFilter(value); fetchTransactions({ page: 1, status: value }); };
  const handleClearFilters = () => { setSearch(''); setStatusFilter(''); fetchTransactions({ page: 1, search: '', status: '' }); };

  const formatAmount = (amount: number) => new Intl.NumberFormat('vi-VN').format(amount) + 'd';

  const getStatusTag = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'paid' || s === 'success' || s === 'completed') return <Tag color="green">Paid</Tag>;
    if (s === 'pending') return <Tag color="orange">Pending</Tag>;
    if (s === 'failed' || s === 'cancelled') return <Tag color="red">Failed</Tag>;
    return <Tag>{status}</Tag>;
  };

  const columns: ColumnsType<Transaction> = [
    { title: '#', key: 'rowNumber', width: 60, render: (_: unknown, __: Transaction, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1 },
    { title: 'Order Code', dataIndex: 'orderCode', key: 'orderCode', width: 150 },
    { title: 'User', dataIndex: 'userDisplay', key: 'userDisplay', width: 200, render: (text: string) => text || '-' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', width: 120, render: (amount: number) => <span style={{ fontWeight: 500, color: '#52c41a' }}>{formatAmount(amount)}</span> },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (text: string) => <div style={{ whiteSpace: 'pre-wrap' }}>{text || '-'}</div> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100, render: (status: string) => getStatusTag(status) },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Transactions</h1>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Total Transactions" value={stats?.totalTransactions || 0} prefix={<TransactionOutlined />} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Total Amount" value={stats?.totalAmount || 0} prefix={<DollarOutlined />} suffix="d" formatter={(value) => new Intl.NumberFormat('vi-VN').format(Number(value))} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Successful" value={stats?.successfulTransactions || 0} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} md={6}><Card><Statistic title="Pending" value={stats?.pendingTransactions || 0} prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}><Input placeholder="Search by order code or user..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={handleSearch} prefix={<SearchOutlined />} allowClear /></Col>
          <Col xs={24} sm={12} md={6}><Select placeholder="Filter by status" value={statusFilter || undefined} onChange={handleStatusChange} allowClear style={{ width: '100%' }} options={[{ label: 'Paid', value: 'PAID' }, { label: 'Pending', value: 'pending' }, { label: 'Failed', value: 'failed' }]} /></Col>
          <Col xs={24} sm={24} md={10}><Space><Button onClick={handleSearch}>Search</Button><Button icon={<ClearOutlined />} onClick={handleClearFilters}>Clear</Button></Space></Col>
        </Row>
      </Card>
      <Table columns={columns} dataSource={transactions} rowKey="Id" loading={loading} pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `Total ${total} transactions` }} onChange={handleTableChange} scroll={{ x: 800 }} size="middle" />
    </div>
  );
};

export default TransactionsPage;
