import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Input, Select, Popconfirm, message, Tag, Row, Col, Card, Rate } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClearOutlined, CalendarOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import type { Festival } from '../../types';
import { festivalsService } from '../../services/festivals';
import type { FestivalsParams } from '../../services/festivals';
import FestivalForm from './FestivalForm';

const FestivalsPage: React.FC = () => {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortField, setSortField] = useState<string>('Id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFestival, setEditingFestival] = useState<Festival | null>(null);
  const [typeOptions, setTypeOptions] = useState<{ label: string; value: string }[]>([]);

  const fetchTypes = useCallback(async () => {
    try {
      const types = await festivalsService.getTypes();
      setTypeOptions(types.map(t => ({ label: t, value: t })));
    } catch (error) { console.error('Failed to load types', error); }
  }, []);

  const fetchFestivals = useCallback(async (params: FestivalsParams = {}) => {
    try {
      setLoading(true);
      const result = await festivalsService.getAll({
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        search: params.search !== undefined ? params.search : search,
        types: params.types !== undefined ? params.types : typeFilter,
        sort: params.sort || sortField,
        order: params.order || sortOrder,
      });
      setFestivals(result.list || []);
      setPagination(prev => ({ ...prev, current: result.pageInfo?.page || 1, total: result.pageInfo?.totalRows || 0 }));
    } catch (error) { message.error('Failed to load festivals'); console.error(error); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, typeFilter, sortField, sortOrder]);

  useEffect(() => { fetchTypes(); fetchFestivals({ page: 1 }); }, []);

  const handleTableChange = (paginationConfig: TablePaginationConfig, _: unknown, sorter: SorterResult<Festival> | SorterResult<Festival>[]) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const newSortField = s.field as string || 'Id';
    const newSortOrder = s.order === 'descend' ? 'desc' : 'asc';
    setSortField(newSortField);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, current: paginationConfig.current || 1, pageSize: paginationConfig.pageSize || 10 }));
    fetchFestivals({ page: paginationConfig.current, limit: paginationConfig.pageSize, sort: newSortField, order: newSortOrder });
  };

  const handleSearch = () => fetchFestivals({ page: 1, search });
  const handleTypeChange = (value: string) => { setTypeFilter(value); fetchFestivals({ page: 1, types: value }); };
  const handleClearFilters = () => { setSearch(''); setTypeFilter(''); fetchFestivals({ page: 1, search: '', types: '' }); };
  const handleDelete = async (id: number) => { try { await festivalsService.delete(id); message.success('Festival deleted'); fetchFestivals(); } catch { message.error('Failed to delete'); } };
  const handleAdd = () => { setEditingFestival(null); setModalVisible(true); };
  const handleEdit = (fest: Festival) => { setEditingFestival(fest); setModalVisible(true); };
  const handleFormSuccess = () => { fetchFestivals(); fetchTypes(); };

  const columns: ColumnsType<Festival> = [
    { title: '#', key: 'rowNumber', width: 50, render: (_: unknown, __: Festival, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1 },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 200, sorter: true, render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span> },
    { title: 'Types', dataIndex: 'types_display', key: 'types', width: 200, render: (text: string) => (<span>{(text || '').split(',').filter(Boolean).map((type, idx) => (<Tag key={idx} color="green">{type.trim()}</Tag>))}</span>) },
    { title: 'Location', dataIndex: 'location', key: 'location', width: 200, ellipsis: true },
    { title: 'Event Time', dataIndex: 'event_time', key: 'event_time', width: 150 },
    { title: 'Rating', dataIndex: 'calculated_rating', key: 'rating', width: 150, sorter: true, render: (rating: number, record: Festival) => (<Space><Rate disabled allowHalf value={rating || 0} style={{ fontSize: 14 }} /><span>({record.review_count || 0})</span></Space>) },
    { title: 'Actions', key: 'actions', width: 100, render: (_: unknown, record: Festival) => (<Space size="small"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} /><Popconfirm title="Delete this festival?" onConfirm={() => handleDelete(record.Id)} okText="Yes" cancelText="No"><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space>) },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}><CalendarOutlined /> Festivals</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Festival</Button>
      </div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}><Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={handleSearch} prefix={<SearchOutlined />} allowClear /></Col>
          <Col xs={24} sm={12} md={6}><Select placeholder="Filter by type" value={typeFilter || undefined} onChange={handleTypeChange} allowClear style={{ width: '100%' }} options={typeOptions} showSearch /></Col>
          <Col xs={24} sm={24} md={10}><Space><Button onClick={handleSearch}>Search</Button><Button icon={<ClearOutlined />} onClick={handleClearFilters}>Clear</Button></Space></Col>
        </Row>
      </Card>
      <Table columns={columns} dataSource={festivals} rowKey="Id" loading={loading} pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `Total ${total} festivals` }} onChange={handleTableChange} scroll={{ x: 1000 }} size="middle" />
      <FestivalForm visible={modalVisible} festival={editingFestival} onClose={() => setModalVisible(false)} onSuccess={handleFormSuccess} />
    </div>
  );
};

export default FestivalsPage;
