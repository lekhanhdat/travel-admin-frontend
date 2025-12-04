import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, message, Row, Col } from 'antd';
import type { Location } from '../../types';
import { locationsService } from '../../services/locations';
import type { LocationFormData } from '../../services/locations';

const { TextArea } = Input;

interface LocationFormProps {
  visible: boolean;
  location: Location | null;
  onClose: () => void;
  onSuccess: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ visible, location, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const isEdit = !!location;

  useEffect(() => {
    if (visible) {
      if (location) {
        form.setFieldsValue({
          name: location.name,
          types: location.types_display || '',
          description: location.description,
          long_description: location.long_description || '',
          address: location.address || '',
          lat: location.lat || 0,
          long: location.long || 0,
          phone: location.phone || '',
          website: location.website || '',
          opening_hours: location.opening_hours || '',
          images: location.images_display || '',
          videos: location.videos_display || '',
          advise: location.advise_display || '',
          marker: location.marker !== false,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ marker: true, lat: 0, long: 0 });
      }
    }
  }, [visible, location, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: LocationFormData = {
        name: values.name,
        types: values.types || '',
        description: values.description || '',
        long_description: values.long_description || '',
        address: values.address || '',
        lat: values.lat || 0,
        long: values.long || 0,
        phone: values.phone || '',
        website: values.website || '',
        opening_hours: values.opening_hours || '',
        images: values.images || '',
        videos: values.videos || '',
        advise: values.advise || '',
        marker: values.marker !== false,
      };

      if (isEdit && location) {
        await locationsService.update(location.Id, data);
        message.success('Location updated successfully');
      } else {
        await locationsService.create(data);
        message.success('Location created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save location';
      message.error(errorMessage);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Location' : 'Add New Location'} open={visible} onOk={handleSubmit} onCancel={onClose} width={800} okText={isEdit ? 'Update' : 'Create'}>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter location name' }]}>
          <Input placeholder="Enter location name" />
        </Form.Item>
        <Form.Item name="types" label="Types" rules={[{ required: true, message: 'Please enter at least one type' }]} help="Comma-separated (e.g., cafe, nature, scenic, attraction)">
          <Input placeholder="cafe, nature, scenic, attraction" />
        </Form.Item>
        <Form.Item name="description" label="Short Description" rules={[{ required: true, message: 'Please enter description' }]}>
          <TextArea rows={2} placeholder="Brief description of the location" />
        </Form.Item>
        <Form.Item name="long_description" label="Long Description">
          <TextArea rows={4} placeholder="Detailed description for the location detail page" />
        </Form.Item>
        <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please enter address' }]}>
          <Input placeholder="Full address of the location" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="lat" label="Latitude" rules={[{ required: true, message: 'Required' }]}>
              <InputNumber style={{ width: '100%' }} step={0.000001} placeholder="e.g., 16.0544" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="long" label="Longitude" rules={[{ required: true, message: 'Required' }]}>
              <InputNumber style={{ width: '100%' }} step={0.000001} placeholder="e.g., 108.2022" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}><Form.Item name="phone" label="Phone"><Input placeholder="Phone number" /></Form.Item></Col>
          <Col span={12}><Form.Item name="website" label="Website"><Input placeholder="https://example.com" /></Form.Item></Col>
        </Row>
        <Form.Item name="opening_hours" label="Opening Hours">
          <Input placeholder="e.g., 7:00 AM - 10:00 PM" />
        </Form.Item>
        <Form.Item name="images" label="Images" help="One image URL per line">
          <TextArea rows={3} placeholder="https://example.com/image1.jpg" />
        </Form.Item>
        <Form.Item name="videos" label="YouTube Video IDs" help="One video ID per line (e.g., dQw4w9WgXcQ, not full URL)">
          <TextArea rows={2} placeholder="dQw4w9WgXcQ" />
        </Form.Item>
        <Form.Item name="advise" label="Travel Advice" help="One tip per line">
          <TextArea rows={3} placeholder="Bring sunscreen and comfortable shoes" />
        </Form.Item>
        <Form.Item name="marker" label="Show on Map" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default LocationForm;
