import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Row, Col, message } from 'antd';
import dayjs from 'dayjs';
import type { Trading } from '@/@types/trading';
import type { Stock } from '@/@types/stock';
import { tradingApi } from '@/lib/server/tradingApi';

interface TradeModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  editingRecord: Trading | null;
  stockList: Stock[];
}

/**
 * 交易记录添加/编辑弹窗组件
 */
const TradeModal: React.FC<TradeModalProps> = ({
  open,
  onCancel,
  onSuccess,
  editingRecord,
  stockList,
}) => {
  const [form] = Form.useForm();

  // 当编辑记录变化或打开状态变化时，重置表单
  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord,
          buy_date: editingRecord.buy_date ? dayjs(editingRecord.buy_date) : undefined,
          sell_date: editingRecord.sell_date ? dayjs(editingRecord.sell_date) : undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editingRecord, form]);

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: Trading = {
        code: values.code,
        name: values.name,
        buy_date: values.buy_date ? dayjs(values.buy_date).toISOString() : undefined,
        buy_price: values.buy_price ? Number(values.buy_price) : undefined,
        buy_volume: values.buy_volume ? Number(values.buy_volume) : undefined,
        sell_date: values.sell_date ? dayjs(values.sell_date).toISOString() : undefined,
        sell_price: values.sell_price ? Number(values.sell_price) : undefined,
        sell_volume: values.sell_volume ? Number(values.sell_volume) : undefined,
      };

      if (editingRecord) {
        await tradingApi.update({
          id: editingRecord.id!,
          updateData: data,
        });
        message.success('更新成功');
      } else {
        await tradingApi.create(data);
        message.success('添加成功');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit Error:', error);
      // message.error 由调用方处理或在此统一处理
    }
  };

  /**
   * 当选择股票时自动填充名称
   */
  const handleCodeChange = (value: string) => {
    const stock = stockList.find(s => s.code === value);
    if (stock) {
      form.setFieldsValue({ name: stock.name });
    }
  };

  return (
    <Modal
      title={editingRecord ? '编辑交易记录' : '添加交易记录'}
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      width={700}
      okText="确定"
      cancelText="取消"
      className="trade-modal"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="股票代码"
              name="code"
              rules={[{ required: true, message: '请选择或输入股票代码' }]}
            >
              <Select
                showSearch
                placeholder="搜索或选择股票"
                optionFilterProp="label"
                onChange={handleCodeChange}
                options={stockList.map(stock => ({
                  value: stock.code,
                  label: `${stock.name} (${stock.code})`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="股票名称"
              name="name"
              rules={[{ required: true, message: '请输入股票名称' }]}
            >
              <Input placeholder="选择代码后自动填充" />
            </Form.Item>
          </Col>
        </Row>

        <div className="form-section-title" style={{ marginBottom: 12, fontWeight: 600, color: '#ef4444' }}>买入信息</div>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="买入时间"
              name="buy_date"
              rules={[{ required: true, message: '请选择买入时间' }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="买入价格"
              name="buy_price"
              rules={[{ required: true, message: '请输入价格' }]}
            >
              <Input type="number" step="0.01" prefix="¥" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="买入数量"
              name="buy_volume"
              rules={[{ required: true, message: '请输入数量' }]}
            >
              <Input type="number" suffix="股" />
            </Form.Item>
          </Col>
        </Row>

        <div className="form-section-title" style={{ marginBottom: 12, marginTop: 12, fontWeight: 600, color: '#10b981' }}>卖出信息（可选）</div>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="卖出时间" name="sell_date">
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="卖出价格" name="sell_price">
              <Input type="number" step="0.01" prefix="¥" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="卖出数量" name="sell_volume">
              <Input type="number" suffix="股" placeholder="默认同买入数量" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TradeModal;
