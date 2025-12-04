import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Input, Switch, Popconfirm, message, Tag, Rate, Select, Row, Col, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import type { Location } from '../../types';
import { locationsService } from '../../services/locations';
import type { LocationsParams } from '../../services/locations';
import LocationForm from './LocationForm';

const LocationsPage: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('Id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterTypes, setFilterTypes] = useState<string>('');
  const [filterMarker, setFilterMarker] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const fetchLocations = useCallback(async (params: LocationsParams = {}) => {
    try {
      setLoading(true);
      const result = await locationsService.getAll({
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        search: params.search !== undefined ? params.search : search,
        sort: params.sort || sortField,
        order: params.order || sortOrder,
        types: params.types !== undefined ? params.types : filterTypes,
        hasMarker: params.hasMarker !== undefined ? params.hasMarker : filterMarker,
      });
      setLocations(result.list || []);
      setPagination(prev => ({ ...prev, current: result.pageInfo?.page || 1, total: result.pageInfo?.totalRows || 0 }));
    } catch (error) { message.error('Failed to load locations'); console.error(error); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, sortField, sortOrder, filterTypes, filterMarker]);

  useEffect(() => { fetchLocations({ page: 1 }); }, []);

  const handleTableChange = (paginationConfig: TablePaginationConfig, _: unknown, sorter: SorterResult<Location> | SorterResult<Location>[]) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    // Map 'calculated_rating' to 'rating' for backend sorting
    let newSortField = s.field as string || 'Id';
    if (newSortField === 'calculated_rating') {
      newSortField = 'rating';
    }
    const newSortOrder = s.order === 'descend' ? 'desc' : 'asc';
    setSortField(newSortField);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, current: paginationConfig.current || 1, pageSize: paginationConfig.pageSize || 10 }));
    fetchLocations({ page: paginationConfig.current, limit: paginationConfig.pageSize, sort: newSortField, order: newSortOrder });
  };

  const handleSearch = () => fetchLocations({ page: 1, search });
  const handleFilter = () => fetchLocations({ page: 1, types: filterTypes, hasMarker: filterMarker });
  const handleClearFilters = () => { setSearch(''); setFilterTypes(''); setFilterMarker(''); fetchLocations({ page: 1, search: '', types: '', hasMarker: '' }); };

  const handleDelete = async (id: number) => { try { await locationsService.delete(id); message.success('Location deleted'); fetchLocations(); } catch { message.error('Failed to delete'); } };
  const handleMarkerToggle = async (id: number, checked: boolean) => { try { await locationsService.toggleMarker(id, checked); message.success('Marker updated'); fetchLocations(); } catch { message.error('Failed to update marker'); } };
  const handleAdd = () => { setEditingLocation(null); setModalVisible(true); };
  const handleEdit = (location: Location) => { setEditingLocation(location); setModalVisible(true); };
  const handleFormSuccess = () => fetchLocations();

  const typeOptions = ['cafe', 'nature', 'scenic', 'attraction', 'historical', 'museum', 'beach', 'mountain', 'temple', 'pagoda', 'shopping', 'traditional', 'craft', 'food'].map(t => ({ label: t, value: t }));

  const columns: ColumnsType<Location> = [
    { title: 'ID', dataIndex: 'Id', key: 'Id', width: 60, sorter: true, defaultSortOrder: 'ascend' },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 200, sorter: true },
    { title: 'Address', dataIndex: 'address', key: 'address', width: 250, render: (text: string) => text || '-' },
    { title: 'Types', dataIndex: 'types_display', key: 'types', width: 200, render: (text: string) => (<span>{(text || '').split(',').filter(Boolean).slice(0, 3).map((type, idx) => (<Tag key={idx} color="blue">{type.trim()}</Tag>))}</span>) },
    { 
      title: 'Rating', 
      dataIndex: 'calculated_rating',
      key: 'rating', 
      width: 140, 
      sorter: true, 
      align: 'center',
      render: (_: unknown, record: Location) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
          <Rate disabled value={record.calculated_rating || 0} allowHalf style={{ fontSize: 14 }} />
          <span style={{ fontSize: 12, color: '#666' }}>{record.review_count || 0} review(s)</span>
        </div>
      ) 
    },
    { title: 'Marker', dataIndex: 'marker', key: 'marker', width: 80, render: (marker: boolean, record: Location) => (<Switch size="small" checked={marker} onChange={(checked) => handleMarkerToggle(record.Id, checked)} />) },
    { title: 'Actions', key: 'actions', width: 100, render: (_: unknown, record: Location) => (<Space size="small"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} /><Popconfirm title="Delete this location?" onConfirm={() => handleDelete(record.Id)} okText="Yes" cancelText="No"><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space>) },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Locations Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Location</Button>
      </div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}><Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={handleSearch} prefix={<SearchOutlined />} allowClear /></Col>
          <Col xs={24} sm={12} md={5}><Select placeholder="Filter by type" value={filterTypes || undefined} onChange={setFilterTypes} options={typeOptions} allowClear style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={12} md={5}><Select placeholder="Filter by marker" value={filterMarker || undefined} onChange={setFilterMarker} options={[{ label: 'Visible on map', value: 'true' }, { label: 'Hidden', value: 'false' }]} allowClear style={{ width: '100%' }} /></Col>
          <Col xs={24} sm={12} md={8}><Space><Button icon={<FilterOutlined />} onClick={handleFilter}>Apply Filters</Button><Button icon={<ClearOutlined />} onClick={handleClearFilters}>Clear</Button></Space></Col>
        </Row>
      </Card>
      <Table columns={columns} dataSource={locations} rowKey="Id" loading={loading} pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `Total ${total} locations` }} onChange={handleTableChange} scroll={{ x: 900 }} size="middle" />
      <LocationForm visible={modalVisible} location={editingLocation} onClose={() => setModalVisible(false)} onSuccess={handleFormSuccess} />
    </div>
  );
};

export default LocationsPage;
