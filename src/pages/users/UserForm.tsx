import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message, Row, Col } from 'antd';
import type { Account } from '../../types';
import { usersService } from '../../services/users';
import type { UserFormData } from '../../services/users';

interface UserFormProps {
  visible: boolean;
  user: Account | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ visible, user, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const isEdit = !!user;

  useEffect(() => {
    if (visible) {
      if (user) {
        form.setFieldsValue({
          userName: user.userName || '',
          email: user.email,
          fullName: user.fullName || '',
          avatar: user.avatar || '',
          phone: user.phone || '',
          address: user.address || '',
          birthday: user.birthday || '',
          gender: user.gender || undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: UserFormData = {
        userName: values.userName || '',
        email: values.email,
        fullName: values.fullName || '',
        avatar: values.avatar || '',
        phone: values.phone || '',
        address: values.address || '',
        birthday: values.birthday || '',
        gender: values.gender || '',
      };

      if (!isEdit) {
        data.password = values.password;
      } else if (values.password) {
        data.password = values.password;
      }

      if (isEdit && user) {
        await usersService.update(user.Id, data);
        message.success('User updated successfully');
      } else {
        await usersService.create(data);
        message.success('User created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save user';
      message.error(errorMessage);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit User' : 'Add New User'} open={visible} onOk={handleSubmit} onCancel={onClose} width={700} okText={isEdit ? 'Update' : 'Create'}>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="userName" label="Username" rules={[{ required: true, message: 'Please enter username' }]}>
              <Input placeholder="johndoe" disabled={isEdit} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Please enter a valid email' }]}>
              <Input placeholder="user@example.com" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="password" label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'} rules={isEdit ? [] : [{ required: true, message: 'Please enter password' }]}>
              <Input.Password placeholder={isEdit ? 'Leave blank to keep current' : 'Enter password'} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="fullName" label="Full Name">
              <Input placeholder="John Doe" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="gender" label="Gender">
              <Select placeholder="Select gender" allowClear options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }, { label: 'Other', value: 'Other' }]} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="birthday" label="Birthday">
              <Input placeholder="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="phone" label="Phone">
              <Input placeholder="+84 123 456 789" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="address" label="Address">
          <Input placeholder="123 Main St, City, Country" />
        </Form.Item>
        <Form.Item name="avatar" label="Avatar URL">
          <Input placeholder="https://example.com/avatar.jpg" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;
