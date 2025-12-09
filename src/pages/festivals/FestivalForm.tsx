import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, message, Row, Col } from 'antd';
import type { Festival } from '../../types';
import { festivalsService } from '../../services/festivals';
import type { FestivalFormData } from '../../services/festivals';

const { TextArea } = Input;

interface FestivalFormProps {
  visible: boolean;
  festival: Festival | null;
  onClose: () => void;
  onSuccess: () => void;
}

const FestivalForm: React.FC<FestivalFormProps> = ({ visible, festival, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const isEdit = !!festival;

  useEffect(() => {
    if (visible) {
      if (festival) {
        form.setFieldsValue({
          name: festival.name,
          types: festival.types_display || '',
          description: festival.description,
          event_time: festival.event_time || '',
          location: festival.location || '',
          price_level: festival.price_level || 1,
          images: festival.images_display || '',
          videos: festival.videos_display || '',
          advise: festival.advise || '',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ price_level: 1 });
      }
    }
  }, [visible, festival, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: FestivalFormData = {
        name: values.name,
        types: values.types || '',
        description: values.description || '',
        event_time: values.event_time || '',
        location: values.location || '',
        price_level: values.price_level || 1,
        images: values.images || '',
        videos: values.videos || '',
        advise: values.advise || '',
      };

      if (isEdit && festival) {
        await festivalsService.update(festival.Id, data);
        message.success('Festival updated successfully');
      } else {
        await festivalsService.create(data);
        message.success('Festival created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save festival';
      message.error(errorMessage);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Festival' : 'Add New Festival'} open={visible} onOk={handleSubmit} onCancel={onClose} width={800} okText={isEdit ? 'Update' : 'Create'}>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter festival name' }]}>
          <Input placeholder="Enter festival name" />
        </Form.Item>
        <Form.Item name="types" label="Types" rules={[{ required: true, message: 'Please enter at least one type' }]} help="Comma-separated (e.g., cultural, traditional, music)">
          <Input placeholder="cultural, traditional, music" />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter description' }]}>
          <TextArea rows={3} placeholder="Description of the festival" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="event_time" label="Event Time" rules={[{ required: true, message: 'Please enter event time' }]}>
              <Input placeholder="e.g., March 15-20, 2025 or Annual in Spring" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="price_level" label="Price Level (1-5)">
              <InputNumber min={1} max={5} style={{ width: '100%' }} placeholder="1-5" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Please enter location' }]}>
          <Input placeholder="Venue or location of the festival" />
        </Form.Item>
        <Form.Item name="images" label="Images" help="One image URL per line">
          <TextArea rows={3} placeholder="https://example.com/image1.jpg" />
        </Form.Item>
        <Form.Item name="videos" label="YouTube Video IDs" help="One video ID per line (e.g., dQw4w9WgXcQ, not full URL)">
          <TextArea rows={2} placeholder="dQw4w9WgXcQ" />
        </Form.Item>
        <Form.Item name="advise" label="Travel Advice">
          <TextArea rows={3} placeholder="Tips and advice for attendees" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FestivalForm;
