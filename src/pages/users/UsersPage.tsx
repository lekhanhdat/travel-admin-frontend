import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Input, Popconfirm, message, Avatar, Row, Col, Card, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClearOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import type { Account } from '../../types';
import { usersService } from '../../services/users';
import type { UsersParams } from '../../services/users';
import UserForm from './UserForm';

const DEFAULT_AVATAR = 'https://firebasestorage.googleapis.com/v0/b/travel-app-2024.appspot.com/o/avatars%2Fdefault_avatar.png?alt=media';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('Id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<Account | null>(null);

  const fetchUsers = useCallback(async (params: UsersParams = {}) => {
    try {
      setLoading(true);
      const result = await usersService.getAll({
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        search: params.search !== undefined ? params.search : search,
        sort: params.sort || sortField,
        order: params.order || sortOrder,
      });
      setUsers(result.list || []);
      setPagination(prev => ({ ...prev, current: result.pageInfo?.page || 1, total: result.pageInfo?.totalRows || 0 }));
    } catch (error) { message.error('Failed to load users'); console.error(error); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, sortField, sortOrder]);

  useEffect(() => { fetchUsers({ page: 1 }); }, []);

  const handleTableChange = (paginationConfig: TablePaginationConfig, _: unknown, sorter: SorterResult<Account> | SorterResult<Account>[]) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const newSortField = s.field as string || 'Id';
    const newSortOrder = s.order === 'descend' ? 'desc' : 'asc';
    setSortField(newSortField);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, current: paginationConfig.current || 1, pageSize: paginationConfig.pageSize || 10 }));
    fetchUsers({ page: paginationConfig.current, limit: paginationConfig.pageSize, sort: newSortField, order: newSortOrder });
  };

  const handleSearch = () => fetchUsers({ page: 1, search });
  const handleClearFilters = () => { setSearch(''); fetchUsers({ page: 1, search: '' }); };
  const handleDelete = async (id: number) => { try { await usersService.delete(id); message.success('User deleted'); fetchUsers(); } catch { message.error('Failed to delete'); } };
  const handleAdd = () => { setEditingUser(null); setModalVisible(true); };
  const handleEdit = (user: Account) => { setEditingUser(user); setModalVisible(true); };
  const handleFormSuccess = () => fetchUsers();

  const formatBalance = (balance: number) => {
    if (!balance && balance !== 0) return '-';
    return new Intl.NumberFormat('vi-VN').format(balance) + 'd';
  };

  const getGenderTag = (gender: string) => {
    if (!gender) return '-';
    const colorMap: Record<string, string> = { Male: 'blue', Female: 'pink', Other: 'purple' };
    return <Tag color={colorMap[gender] || 'default'}>{gender}</Tag>;
  };

  const columns: ColumnsType<Account> = [
    { title: '#', key: 'rowNumber', width: 50, render: (_: unknown, __: Account, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1 },
    { title: 'Avatar', dataIndex: 'avatar', key: 'avatar', width: 70, render: (avatar: string) => <Avatar src={avatar || DEFAULT_AVATAR} icon={<UserOutlined />} size={40} /> },
    { title: 'Username', dataIndex: 'userName', key: 'userName', width: 140, sorter: true, render: (text: string) => <span style={{ fontWeight: 500, color: '#1890ff' }}>{text || '-'}</span> },
    { title: 'Full Name', dataIndex: 'fullName', key: 'fullName', width: 180, sorter: true, render: (text: string) => <span style={{ fontWeight: 500 }}>{text || '-'}</span> },
    { title: 'Email', dataIndex: 'email', key: 'email', width: 220, sorter: true },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 100, render: (gender: string) => getGenderTag(gender) },
    { title: 'Birthday', dataIndex: 'birthday', key: 'birthday', width: 120, render: (text: string) => text || '-' },
    { title: 'Donate', dataIndex: 'balance', key: 'balance', width: 120, sorter: true, render: (balance: number) => <span style={{ color: '#52c41a', fontWeight: 500 }}>{formatBalance(balance)}</span> },
    { title: 'Actions', key: 'actions', width: 100, render: (_: unknown, record: Account) => (<Space size="small"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} /><Popconfirm title="Delete this user?" onConfirm={() => handleDelete(record.Id)} okText="Yes" cancelText="No"><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space>) },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}><UserOutlined /> Users</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add User</Button>
      </div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={10}><Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={handleSearch} prefix={<SearchOutlined />} allowClear /></Col>
          <Col xs={24} sm={12} md={14}><Space><Button onClick={handleSearch}>Search</Button><Button icon={<ClearOutlined />} onClick={handleClearFilters}>Clear</Button></Space></Col>
        </Row>
      </Card>
      <Table columns={columns} dataSource={users} rowKey="Id" loading={loading} pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `Total ${total} users` }} onChange={handleTableChange} scroll={{ x: 1100 }} size="middle" />
      <UserForm visible={modalVisible} user={editingUser} onClose={() => setModalVisible(false)} onSuccess={handleFormSuccess} />
    </div>
  );
};

export default UsersPage;
