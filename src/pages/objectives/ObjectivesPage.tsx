import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Input, Popconfirm, message, Tag, Select, Row, Col, Card, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined, ClearOutlined, TrophyOutlined, GiftOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import type { Item } from '../../types';
import { objectivesService } from '../../services/objectives';
import type { ObjectivesParams } from '../../services/objectives';
import ObjectiveForm from './ObjectiveForm';

const ObjectivesPage: React.FC = () => {
  const [objectives, setObjectives] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [sortField, setSortField] = useState<string>('Id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Item | null>(null);

  const fetchObjectives = useCallback(async (params: ObjectivesParams = {}) => {
    try {
      setLoading(true);
      const result = await objectivesService.getAll({
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        search: params.search !== undefined ? params.search : search,
        sort: params.sort || sortField,
        order: params.order || sortOrder,
        type: params.type !== undefined ? params.type : filterType,
      });
      setObjectives(result.list || []);
      setPagination(prev => ({ ...prev, current: result.pageInfo?.page || 1, total: result.pageInfo?.totalRows || 0 }));
    } catch (error) { message.error('Failed to load objectives'); console.error(error); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, sortField, sortOrder, filterType]);

  useEffect(() => { fetchObjectives({ page: 1 }); }, []);

  const handleTableChange = (paginationConfig: TablePaginationConfig, _: unknown, sorter: SorterResult<Item> | SorterResult<Item>[]) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const newSortField = s.field as string || 'Id';
    const newSortOrder = s.order === 'descend' ? 'desc' : 'asc';
    setSortField(newSortField);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, current: paginationConfig.current || 1, pageSize: paginationConfig.pageSize || 10 }));
    fetchObjectives({ page: paginationConfig.current, limit: paginationConfig.pageSize, sort: newSortField, order: newSortOrder });
  };

  const handleSearch = () => fetchObjectives({ page: 1, search });
  const handleFilter = () => fetchObjectives({ page: 1, type: filterType });
  const handleClearFilters = () => { setSearch(''); setFilterType(''); fetchObjectives({ page: 1, search: '', type: '' }); };
  const handleDelete = async (id: number) => { try { await objectivesService.delete(id); message.success('Objective deleted'); fetchObjectives(); } catch { message.error('Failed to delete'); } };
  const handleAdd = () => { setEditingObjective(null); setModalVisible(true); };
  const handleEdit = (obj: Item) => { setEditingObjective(obj); setModalVisible(true); };
  const handleFormSuccess = () => fetchObjectives();

  const columns: ColumnsType<Item> = [
    { title: '#', key: 'rowNumber', width: 60, render: (_: unknown, __: Item, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1 },
    { title: 'Image', dataIndex: 'image', key: 'image', width: 80, render: (url: string) => url ? <Image src={url} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} preview={{ mask: 'View' }} /> : '-' },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 200, sorter: true },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 120, render: (type: string) => <Tag color={type === 'objective' ? 'blue' : 'green'} icon={type === 'objective' ? <TrophyOutlined /> : <GiftOutlined />}>{type}</Tag> },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true, render: (text: string) => text || '-' },
    { title: 'Points', dataIndex: 'points', key: 'points', width: 100, sorter: true, align: 'center', render: (points: number) => (<span style={{ fontWeight: 'bold', color: '#faad14' }}>{points || 0}</span>) },
    { title: 'Actions', key: 'actions', width: 100, render: (_: unknown, record: Item) => (<Space size="small"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} /><Popconfirm title="Delete this objective?" onConfirm={() => handleDelete(record.Id)} okText="Yes" cancelText="No"><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space>) },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Objectives & Rewards</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Item</Button>
      </div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}><Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={handleSearch} prefix={<SearchOutlined />} allowClear /></Col>
          <Col xs={24} sm={12} md={6}><Select placeholder="Filter by type" value={filterType || undefined} onChange={setFilterType} options={[{ label: 'Objective', value: 'objective' }, { label: 'Reward', value: 'reward' }]} allowClear style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={12} md={10}><Space><Button icon={<FilterOutlined />} onClick={handleFilter}>Apply Filters</Button><Button icon={<ClearOutlined />} onClick={handleClearFilters}>Clear</Button></Space></Col>
        </Row>
      </Card>
      <Table columns={columns} dataSource={objectives} rowKey="Id" loading={loading} pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `Total ${total} items` }} onChange={handleTableChange} scroll={{ x: 800 }} size="middle" />
      <ObjectiveForm visible={modalVisible} objective={editingObjective} onClose={() => setModalVisible(false)} onSuccess={handleFormSuccess} />
    </div>
  );
};

export default ObjectivesPage;
