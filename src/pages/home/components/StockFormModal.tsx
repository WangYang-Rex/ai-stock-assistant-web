/**
 * ============================================
 * StockFormModal - 股票新增模态框
 * ============================================
 * 股票表单组件，用于添加新股票
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Form, Input, Select, message, Spin } from 'antd';
import { stockApi } from '@/lib/server/stockApi';

// ==================== 常量配置 ====================

/** 市场类型选项 */
const MARKET_OPTIONS = [
  { value: 0, label: '深圳' },
  { value: 1, label: '上海' },
] as const;

/** 表单默认值 */
const DEFAULT_FORM_VALUES = {
  market: 1,
};

// ==================== 类型定义 ====================

interface StockFormModalProps {
  /** 是否显示模态框 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 成功回调 */
  onSuccess: () => void;
}

/** 表单字段类型 */
interface StockFormValues {
  code: string;
  market: number;
}

// ==================== 组件实现 ====================

/**
 * 股票表单模态框组件
 */
const StockFormModal: React.FC<StockFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<StockFormValues>();
  const [loading, setLoading] = useState(false);

  /**
   * 初始化表单数据
   */
  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue(DEFAULT_FORM_VALUES);
    }
  }, [visible, form]);

  /**
   * 提交新增股票
   */
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 同步股票基础信息
      await stockApi.sync({
        code: values.code,
        market: values.market,
      });

      message.success('股票添加成功');
      onSuccess();
      onClose();
    } catch (error: any) {
      // 表单验证错误，不需要额外提示
      if (error?.errorFields) return;
      message.error(error?.message || '添加失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [form, onSuccess, onClose]);

  /**
   * 处理取消/关闭
   */
  const handleCancel = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  return (
    <Modal
      title="添加股票"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="添加"
      cancelText="取消"
      destroyOnClose
      maskClosable={false}
      width={480}
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          requiredMark="optional"
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="股票代码"
            name="code"
            rules={[
              { required: true, message: '请输入股票代码' },
              { pattern: /^\d{6}$/, message: '请输入6位数字的股票代码' },
            ]}
          >
            <Input 
              placeholder="请输入6位股票代码，如 588080" 
              maxLength={6}
            />
          </Form.Item>

          <Form.Item
            label="市场"
            name="market"
            rules={[{ required: true, message: '请选择市场' }]}
          >
            <Select 
              placeholder="请选择市场"
              options={MARKET_OPTIONS as any}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default StockFormModal;
