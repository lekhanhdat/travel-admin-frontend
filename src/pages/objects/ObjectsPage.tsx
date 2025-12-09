import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Input, Popconfirm, message, Row, Col, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import type { AIObject } from '../../types';
import { objectsService } from '../../services/objects';
import type { ObjectsParams } from '../../services/objects';
import ObjectForm from './ObjectForm';

const ObjectsPage: React.FC = () => {
  const [objects, setObjects] = useState<AIObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('Id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingObject, setEditingObject] = useState<AIObject | null>(null);

  const fetchObjects = useCallback(async (params: ObjectsParams = {}) => {
    try {
      setLoading(true);
      const result = await objectsService.getAll({
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        search: params.search !== undefined ? params.search : search,
        sort: params.sort || sortField,
        order: params.order || sortOrder,
      });
      setObjects(result.list || []);
      setPagination(prev => ({ ...prev, current: result.pageInfo?.page || 1, total: result.pageInfo?.totalRows || 0 }));
    } catch (error) { message.error('Failed to load objects'); console.error(error); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, sortField, sortOrder]);

  useEffect(() => { fetchObjects({ page: 1 }); }, []);

  const handleTableChange = (paginationConfig: TablePaginationConfig, _: unknown, sorter: SorterResult<AIObject> | SorterResult<AIObject>[]) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const newSortField = s.field as string || 'Id';
    const newSortOrder = s.order === 'descend' ? 'desc' : 'asc';
    setSortField(newSortField);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, current: paginationConfig.current || 1, pageSize: paginationConfig.pageSize || 10 }));
    fetchObjects({ page: paginationConfig.current, limit: paginationConfig.pageSize, sort: newSortField, order: newSortOrder });
  };

  const handleSearch = () => fetchObjects({ page: 1, search });
  const handleClearFilters = () => { setSearch(''); fetchObjects({ page: 1, search: '' }); };
  const handleDelete = async (id: number) => { try { await objectsService.delete(id); message.success('Object deleted'); fetchObjects(); } catch { message.error('Failed to delete'); } };
  const handleAdd = () => { setEditingObject(null); setModalVisible(true); };
  const handleEdit = (obj: AIObject) => { setEditingObject(obj); setModalVisible(true); };
  const handleFormSuccess = () => fetchObjects();

  const columns: ColumnsType<AIObject> = [
    { title: '#', key: 'rowNumber', width: 60, render: (_: unknown, __: AIObject, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1 },
    { title: 'Title', dataIndex: 'title', key: 'title', width: 250, sorter: true },
    { title: 'Content', dataIndex: 'content', key: 'content', render: (text: string) => <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text || '-'}</div> },
    { title: 'Actions', key: 'actions', width: 100, render: (_: unknown, record: AIObject) => (<Space size="small"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} /><Popconfirm title="Delete this object?" onConfirm={() => handleDelete(record.Id)} okText="Yes" cancelText="No"><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space>) },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>AI Recognition Objects</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Object</Button>
      </div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={10}><Input placeholder="Search by title or content..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={handleSearch} prefix={<SearchOutlined />} allowClear /></Col>
          <Col xs={24} sm={12} md={14}><Space><Button onClick={handleSearch}>Search</Button><Button icon={<ClearOutlined />} onClick={handleClearFilters}>Clear</Button></Space></Col>
        </Row>
      </Card>
      <Table columns={columns} dataSource={objects} rowKey="Id" loading={loading} pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `Total ${total} objects` }} onChange={handleTableChange} scroll={{ x: 600 }} size="middle" />
      <ObjectForm visible={modalVisible} object={editingObject} onClose={() => setModalVisible(false)} onSuccess={handleFormSuccess} />
    </div>
  );
};

export default ObjectsPage;
