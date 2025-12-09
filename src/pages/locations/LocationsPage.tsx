import React, { useEffect, useState, useCallback } from 'react';
import { Table, Button, Space, Input, Select, Popconfirm, message, Tag, Switch, Row, Col, Card, Rate } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ClearOutlined, EnvironmentOutlined } from '@ant-design/icons';
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
  const [typeFilter, setTypeFilter] = useState('');
  const [markerFilter, setMarkerFilter] = useState('');
  const [sortField, setSortField] = useState<string>('Id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [typeOptions, setTypeOptions] = useState<{ label: string; value: string }[]>([]);

  const fetchTypes = useCallback(async () => {
    try {
      const types = await locationsService.getTypes();
      setTypeOptions(types.map(t => ({ label: t, value: t })));
    } catch (error) { console.error('Failed to load types', error); }
  }, []);

  const fetchLocations = useCallback(async (params: LocationsParams = {}) => {
    try {
      setLoading(true);
      const result = await locationsService.getAll({
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        search: params.search !== undefined ? params.search : search,
        types: params.types !== undefined ? params.types : typeFilter,
        hasMarker: params.hasMarker !== undefined ? params.hasMarker : markerFilter,
        sort: params.sort || sortField,
        order: params.order || sortOrder,
      });
      setLocations(result.list || []);
      setPagination(prev => ({ ...prev, current: result.pageInfo?.page || 1, total: result.pageInfo?.totalRows || 0 }));
    } catch (error) { message.error('Failed to load locations'); console.error(error); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search, typeFilter, markerFilter, sortField, sortOrder]);

  useEffect(() => { fetchTypes(); fetchLocations({ page: 1 }); }, []);

  const handleTableChange = (paginationConfig: TablePaginationConfig, _: unknown, sorter: SorterResult<Location> | SorterResult<Location>[]) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    const newSortField = s.field as string || 'Id';
    const newSortOrder = s.order === 'descend' ? 'desc' : 'asc';
    setSortField(newSortField);
    setSortOrder(newSortOrder);
    setPagination(prev => ({ ...prev, current: paginationConfig.current || 1, pageSize: paginationConfig.pageSize || 10 }));
    fetchLocations({ page: paginationConfig.current, limit: paginationConfig.pageSize, sort: newSortField, order: newSortOrder });
  };

  const handleSearch = () => fetchLocations({ page: 1, search });
  const handleTypeChange = (value: string) => { setTypeFilter(value); fetchLocations({ page: 1, types: value }); };
  const handleMarkerChange = (value: string) => { setMarkerFilter(value); fetchLocations({ page: 1, hasMarker: value }); };
  const handleClearFilters = () => { setSearch(''); setTypeFilter(''); setMarkerFilter(''); fetchLocations({ page: 1, search: '', types: '', hasMarker: '' }); };
  const handleDelete = async (id: number) => { try { await locationsService.delete(id); message.success('Location deleted'); fetchLocations(); } catch { message.error('Failed to delete'); } };
  const handleToggleMarker = async (id: number, checked: boolean) => { try { await locationsService.toggleMarker(id, checked); message.success('Marker updated'); fetchLocations(); } catch { message.error('Failed to update marker'); } };
  const handleAdd = () => { setEditingLocation(null); setModalVisible(true); };
  const handleEdit = (loc: Location) => { setEditingLocation(loc); setModalVisible(true); };
  const handleFormSuccess = () => { fetchLocations(); fetchTypes(); };

  const columns: ColumnsType<Location> = [
    { title: '#', key: 'rowNumber', width: 50, render: (_: unknown, __: Location, index: number) => (pagination.current - 1) * pagination.pageSize + index + 1 },
    { title: 'Name', dataIndex: 'name', key: 'name', width: 200, sorter: true, render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span> },
    { title: 'Types', dataIndex: 'types_display', key: 'types', width: 200, render: (text: string) => (<span>{(text || '').split(',').filter(Boolean).map((type, idx) => (<Tag key={idx} color="blue">{type.trim()}</Tag>))}</span>) },
    { title: 'Address', dataIndex: 'address', key: 'address', width: 250, ellipsis: true },
    { title: 'Rating', dataIndex: 'calculated_rating', key: 'rating', width: 150, sorter: true, render: (rating: number, record: Location) => (<Space><Rate disabled allowHalf value={rating || 0} style={{ fontSize: 14 }} /><span>({record.review_count || 0})</span></Space>) },
    { title: 'Marker', dataIndex: 'marker', key: 'marker', width: 80, render: (marker: boolean, record: Location) => (<Switch checked={marker} onChange={(checked) => handleToggleMarker(record.Id, checked)} size="small" />) },
    { title: 'Actions', key: 'actions', width: 100, render: (_: unknown, record: Location) => (<Space size="small"><Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} /><Popconfirm title="Delete this location?" onConfirm={() => handleDelete(record.Id)} okText="Yes" cancelText="No"><Button type="text" size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space>) },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}><EnvironmentOutlined /> Locations</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Location</Button>
      </div>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}><Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} onPressEnter={handleSearch} prefix={<SearchOutlined />} allowClear /></Col>
          <Col xs={24} sm={12} md={5}><Select placeholder="Filter by type" value={typeFilter || undefined} onChange={handleTypeChange} allowClear style={{ width: '100%' }} options={typeOptions} showSearch /></Col>
          <Col xs={24} sm={12} md={5}><Select placeholder="Filter by marker" value={markerFilter || undefined} onChange={handleMarkerChange} allowClear style={{ width: '100%' }} options={[{ label: 'With Marker', value: 'true' }, { label: 'Without Marker', value: 'false' }]} /></Col>
          <Col xs={24} sm={12} md={8}><Space><Button onClick={handleSearch}>Search</Button><Button icon={<ClearOutlined />} onClick={handleClearFilters}>Clear</Button></Space></Col>
        </Row>
      </Card>
      <Table columns={columns} dataSource={locations} rowKey="Id" loading={loading} pagination={{ ...pagination, showSizeChanger: true, showTotal: (total) => `Total ${total} locations` }} onChange={handleTableChange} scroll={{ x: 1000 }} size="middle" />
      <LocationForm visible={modalVisible} location={editingLocation} onClose={() => setModalVisible(false)} onSuccess={handleFormSuccess} />
    </div>
  );
};

export default LocationsPage;
