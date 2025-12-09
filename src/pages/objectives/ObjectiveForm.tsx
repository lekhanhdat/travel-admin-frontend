import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import type { Item } from '../../types';
import { objectivesService } from '../../services/objectives';
import type { ObjectiveFormData } from '../../services/objectives';

const { TextArea } = Input;

interface ObjectiveFormProps {
  visible: boolean;
  objective: Item | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ObjectiveForm: React.FC<ObjectiveFormProps> = ({ visible, objective, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const isEdit = !!objective;

  useEffect(() => {
    if (visible) {
      if (objective) {
        form.setFieldsValue({
          name: objective.name,
          type: objective.type,
          description: objective.description || '',
          points: objective.points || 0,
          image: objective.image || '',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ type: 'objective', points: 0 });
      }
    }
  }, [visible, objective, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: ObjectiveFormData = {
        name: values.name,
        type: values.type,
        description: values.description || '',
        points: values.points || 0,
        image: values.image || '',
      };

      if (isEdit && objective) {
        await objectivesService.update(objective.Id, data);
        message.success('Item updated successfully');
      } else {
        await objectivesService.create(data);
        message.success('Item created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save item';
      message.error(errorMessage);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Item' : 'Add New Item'} open={visible} onOk={handleSubmit} onCancel={onClose} width={600} okText={isEdit ? 'Update' : 'Create'}>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
          <Input placeholder="Enter objective/reward name" />
        </Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: true, message: 'Please select type' }]}>
          <Select options={[{ label: 'Objective', value: 'objective' }, { label: 'Reward', value: 'reward' }]} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea rows={3} placeholder="Description of the objective or reward" />
        </Form.Item>
        <Form.Item name="points" label="Points" rules={[{ required: true, message: 'Please enter points value' }]}>
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Points value" />
        </Form.Item>
        <Form.Item name="image" label="Image URL">
          <Input placeholder="https://example.com/image.jpg" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ObjectiveForm;
