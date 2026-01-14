import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Select, DatePicker, Space, message, Popconfirm, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, RiseOutlined, FallOutlined, BarChartOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { Trading, TradingInput, TradingStats } from '@/@types/trading';
import type { Stock } from '@/@types/stock';
import { tradingApi } from '@/lib/server/tradingApi';
import { stockApi } from '@/lib/server/stockApi';
import dayjs from 'dayjs';
import './trade.less';

/**
 * 实时交易页面
 * 支持交易记录的增删改查功能
 */
const Trade = () => {
  // 状态管理
  const [tradingList, setTradingList] = useState<Trading[]>([]);
  const [stockList, setStockList] = useState<Stock[]>([]);
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTrading, setEditingTrading] = useState<Trading | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 筛选条件
  const [filterSymbol, setFilterSymbol] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<'buy' | 'sell' | undefined>(undefined);

  useEffect(() => {
    loadTradingList();
    loadStats();
    loadStockList();
  }, []);

  /**
   * 加载交易记录列表
   */
  const loadTradingList = async () => {
    try {
      setLoading(true);
      const res = await tradingApi.list();
      setTradingList(res);
    } catch (error) {
      message.error('加载交易记录失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 加载股票列表
   */
  const loadStockList = async () => {
    try {
      const res = await stockApi.list();
      setStockList(res);
    } catch (error) {
      console.error('加载股票列表失败', error);
    }
  };

  /**
   * 加载统计信息
   */
  const loadStats = async () => {
    try {
      const res = await tradingApi.stats();
      setStats(res);
    } catch (error) {
      console.error('加载统计信息失败', error);
    }
  };

  /**
   * 打开添加/编辑弹窗
   */
  const handleAdd = () => {
    setEditingTrading(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = (record: Trading) => {
    setEditingTrading(record);
    form.setFieldsValue({
      ...record,
      tradingTime: record.tradingTime ? dayjs(record.tradingTime) : undefined,
    });
    setIsModalVisible(true);
  };

  /**
   * 删除交易记录
   */
  const handleDelete = async (id: number) => {
    try {
      await tradingApi.delete({ id });
      message.success('删除成功');
      loadTradingList();
      loadStats();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  /**
   * 提交表单（添加/编辑）
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data: TradingInput = {
        symbol: values.symbol,
        name: values.name,
        type: values.type,
        tradingTime: values.tradingTime ? dayjs(values.tradingTime).toISOString() : '',
        quantity: Number(values.quantity),
        price: Number(values.price),
        amount: Number(values.quantity) * Number(values.price), // 计算交易金额
        relatedTradingId: values.relatedTradingId ? Number(values.relatedTradingId) : undefined,
        remarks: values.remarks,
      };

      if (editingTrading) {
        // 更新
        await tradingApi.update({
          id: editingTrading.id!,
          updateData: data,
        });
        message.success('更新成功');
      } else {
        // 创建
        await tradingApi.create(data);
        message.success('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      loadTradingList();
      loadStats();
    } catch (error) {
      message.error(editingTrading ? '更新失败' : '添加失败');
      console.error(error);
    }
  };

  /**
   * 当选择股票时自动填充名称
   */
  const handleSymbolChange = (value: string) => {
    const stock = stockList.find(s => s.code === value);
    if (stock) {
      form.setFieldsValue({ name: stock.name });
    }
  };

  /**
   * 获取筛选后的交易列表
   */
  const getFilteredTradingList = () => {
    let filtered = [...tradingList];

    if (filterSymbol) {
      filtered = filtered.filter(t => t.symbol === filterSymbol);
    }

    if (filterType) {
      filtered = filtered.filter(t => t.type === filterType);
    }

    return filtered;
  };

  /**
   * 获取唯一的股票代码列表
   */
  const getUniqueSymbols = () => {
    const symbols = tradingList.map(t => t.symbol);
    return Array.from(new Set(symbols));
  };

  /**
   * 表格列定义
   */
  const columns: TableProps<Trading>['columns'] = [
    {
      title: '股票代码',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 120,
      render: (value: string, record: Trading) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          <div style={{ color: '#999', fontSize: '12px' }}>{value}</div>
        </div>
      ),
    },
    {
      title: '交易类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (value: string) => (
        <span className={value === 'buy' ? 'text-color-red' : 'text-color-green'}>
          {value === 'buy' ? '买入' : '卖出'}
        </span>
      ),
    },
    {
      title: '交易时间',
      dataIndex: 'tradingTime',
      key: 'tradingTime',
      width: 180,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '数量(股)',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (value: any) => Number(value || 0).toLocaleString(),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (value: any) => `¥${Number(value || 0).toFixed(2)}`,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (value: any) => `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>
            <EditOutlined /> 编辑
          </a>
          <Popconfirm
            title="确认删除"
            description="确定要删除这条交易记录吗？"
            onConfirm={() => handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <a style={{ color: '#ff4d4f' }}>
              <DeleteOutlined /> 删除
            </a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="tradePage main p_12">
      {/* 筛选和操作区域 */}
      <div className="trade-filter mb_12">
        <Space size="middle">
          <Select
            placeholder="选择股票"
            style={{ width: 200 }}
            allowClear
            showSearch
            optionFilterProp="label"
            value={filterSymbol}
            onChange={setFilterSymbol}
            options={stockList.map(stock => ({
              value: stock.code,
              label: `${stock.name} (${stock.code})`,
            }))}
          />
          <Select
            placeholder="交易类型"
            style={{ width: 120 }}
            allowClear
            value={filterType}
            onChange={setFilterType}
            options={[
              { value: 'buy', label: '买入' },
              { value: 'sell', label: '卖出' },
            ]}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加交易
          </Button>
        </Space>
      </div>

      {/* 内容区域 */}
      <div className="trade-content">
        {/* 统计信息 */}
        {stats && (
          <div className="trade-section mb_20">
            <div className="trade-section-title">交易统计</div>
            <Row gutter={16}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="总交易次数"
                    value={Number(stats.totalTrades || 0)}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="买入次数"
                    value={Number(stats.buyTrades || 0)}
                    prefix={<RiseOutlined />}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="卖出次数"
                    value={Number(stats.sellTrades || 0)}
                    prefix={<FallOutlined />}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="总金额"
                    value={Number(stats.totalAmount || 0)}
                    precision={2}
                    prefix={<DollarOutlined />}
                    suffix="元"
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* 交易列表 */}
        <div className="trade-section">
          <div className="trade-section-title">交易记录</div>
          <Table
            columns={columns}
            dataSource={getFilteredTradingList()}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `共 ${total} 条记录`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            scroll={{ x: 1200 }}
          />
        </div>
      </div>

      {/* 添加/编辑弹窗 */}
      <Modal
        title={editingTrading ? '编辑交易记录' : '添加交易记录'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText="确定"
        cancelText="取消"
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
                name="symbol"
                rules={[{ required: true, message: '请选择或输入股票代码' }]}
              >
                <Select
                  showSearch
                  placeholder="搜索或选择股票"
                  optionFilterProp="label"
                  onChange={handleSymbolChange}
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="交易类型"
                name="type"
                rules={[{ required: true, message: '请选择交易类型' }]}
              >
                <Select
                  placeholder="请选择"
                  options={[
                    { value: 'buy', label: '买入' },
                    { value: 'sell', label: '卖出' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="交易时间"
                name="tradingTime"
                rules={[{ required: true, message: '请选择交易时间' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  style={{ width: '100%' }}
                  placeholder="选择日期时间"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="数量(股)"
                name="quantity"
                rules={[
                  { required: true, message: '请输入数量' },
                  // { type: 'number', min: 0, message: '数量必须大于0' },
                ]}
              >
                <Input type="number" placeholder="例如：100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="价格"
                name="price"
                rules={[
                  { required: true, message: '请输入价格' },
                  // { type: 'number', min: 0.01, message: '价格必须大于0.01' },
                ]}
              >
                <Input type="number" step="0.01" placeholder="例如：1680.50" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="关联交易ID"
            name="relatedTradingId"
            tooltip="用于关联买入和卖出交易"
          >
            <Input type="number" placeholder="选填" />
          </Form.Item>

          <Form.Item
            label="备注"
            name="remarks"
          >
            <Input.TextArea
              rows={3}
              placeholder="例如：止盈卖出"
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Trade;
