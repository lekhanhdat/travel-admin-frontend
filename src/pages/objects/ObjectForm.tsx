import React, { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import type { AIObject } from '../../types';
import { objectsService } from '../../services/objects';

interface ObjectFormProps {
  visible: boolean;
  object: AIObject | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ObjectForm: React.FC<ObjectFormProps> = ({ visible, object, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const isEditing = !!object;

  useEffect(() => {
    if (visible) {
      if (object) {
        form.setFieldsValue({ title: object.title, content: object.content });
      } else {
        form.resetFields();
      }
    }
  }, [visible, object, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (isEditing && object) {
        await objectsService.update(object.Id, values);
        message.success('Object updated successfully');
      } else {
        await objectsService.create(values);
        message.success('Object created successfully');
      }
      onClose();
      onSuccess();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'errorFields' in error) return;
      message.error('Failed to save object');
      console.error(error);
    }
  };

  return (
    <Modal title={isEditing ? 'Edit Object' : 'Add Object'} open={visible} onOk={handleSubmit} onCancel={onClose} okText={isEditing ? 'Update' : 'Create'} width={600} destroyOnClose>
      <Form form={form} layout="vertical" initialValues={{ title: '', content: '' }}>
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter a title' }]}>
          <Input placeholder="Enter object title" />
        </Form.Item>
        <Form.Item name="content" label="Content">
          <Input.TextArea rows={6} placeholder="Enter object content/description" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ObjectForm;
