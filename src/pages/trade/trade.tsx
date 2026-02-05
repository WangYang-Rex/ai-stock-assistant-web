import React, { useEffect, useState } from 'react';
import { Button, Table, Select, Space, message, Popconfirm, Card, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, RiseOutlined, FallOutlined, BarChartOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import type { Trading, TradingStats } from '@/@types/trading';
import type { Stock } from '@/@types/stock';
import { tradingApi } from '@/lib/server/tradingApi';
import { stockApi } from '@/lib/server/stockApi';
import dayjs from 'dayjs';
import TradeModal from './components/TradeModal';
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

  // 筛选条件
  const [filterCode, setFilterCode] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<'open' | 'closed' | undefined>(undefined);

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
   * 打开添加弹窗
   */
  const handleAdd = () => {
    setEditingTrading(null);
    setIsModalVisible(true);
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = (record: Trading) => {
    setEditingTrading(record);
    setIsModalVisible(true);
  };

  /**
   * 删除交易记录
   */
  const handleDelete = async (id: number) => {
    try {
      await tradingApi.delete({ id });
      message.success('删除成功');
      refreshData();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  /**
   * 刷新数据
   */
  const refreshData = () => {
    loadTradingList();
    loadStats();
  };

  /**
   * 获取筛选后的交易列表
   */
  const getFilteredTradingList = () => {
    let filtered = [...tradingList];

    if (filterCode) {
      filtered = filtered.filter(t => t.code === filterCode);
    }

    if (filterStatus) {
      if (filterStatus === 'open') {
        filtered = filtered.filter(t => !t.sell_date);
      } else {
        filtered = filtered.filter(t => !!t.sell_date);
      }
    }

    return filtered;
  };

  /**
   * 表格列定义
   */
  const columns: TableProps<Trading>['columns'] = [
    {
      title: '股票',
      dataIndex: 'code',
      key: 'code',
      width: 150,
      fixed: 'left',
      render: (value: string, record: Trading) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937' }}>{record.name}</div>
          <div style={{ color: '#6b7280', fontSize: '12px' }}>{value}</div>
        </div>
      ),
    },
    {
      title: '买入详情',
      key: 'buy_info',
      children: [
        {
          title: '日期',
          dataIndex: 'buy_date',
          key: 'buy_date',
          width: 120,
          render: (value: string) => value ? dayjs(value).format('MM-DD HH:mm') : '-',
        },
        {
          title: '价格',
          dataIndex: 'buy_price',
          key: 'buy_price',
          width: 100,
          render: (value: any) => {
            const num = Number(value);
            return !isNaN(num) && value !== null && value !== undefined ? `¥${num.toFixed(2)}` : '-';
          },
        },
        {
          title: '数量',
          dataIndex: 'buy_volume',
          key: 'buy_volume',
          width: 100,
          render: (value: number) => value ? value.toLocaleString() : '-',
        },
      ],
    },
    {
      title: '卖出详情',
      key: 'sell_info',
      children: [
        {
          title: '日期',
          dataIndex: 'sell_date',
          key: 'sell_date',
          width: 120,
          render: (value: string) => value ? dayjs(value).format('MM-DD HH:mm') : '-',
        },
        {
          title: '价格',
          dataIndex: 'sell_price',
          key: 'sell_price',
          width: 100,
          render: (value: any) => {
            const num = Number(value);
            return !isNaN(num) && value !== null && value !== undefined ? `¥${num.toFixed(2)}` : '-';
          },
        },
        {
          title: '数量',
          dataIndex: 'sell_volume',
          key: 'sell_volume',
          width: 100,
          render: (value: number) => value ? value.toLocaleString() : '-',
        },
      ],
    },
    {
      title: '盈亏',
      key: 'profit',
      width: 120,
      render: (_, record) => {
        if (!record.buy_price || !record.buy_volume || !record.sell_price) return '-';
        const buyAmount = record.buy_price * record.buy_volume;
        const sellAmount = record.sell_price * (record.sell_volume || record.buy_volume);
        const profit = sellAmount - buyAmount;
        const profitRate = (profit / buyAmount) * 100;
        const color = profit >= 0 ? '#ef4444' : '#10b981';
        return (
          <div style={{ color, fontWeight: 500 }}>
            <div>{profit >= 0 ? '+' : ''}{Number(profit).toFixed(2)}</div>
            <div style={{ fontSize: '12px' }}>{profit >= 0 ? '+' : ''}{Number(profitRate).toFixed(2)}%</div>
          </div>
        );
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <span className={record.sell_date ? 'trade-type-sell' : 'trade-type-buy'}>
          {record.sell_date ? '已平仓' : '持仓中'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} size="small">编辑</Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这条交易记录吗？"
            onConfirm={() => handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">删除</Button>
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
            style={{ width: 220 }}
            allowClear
            showSearch
            optionFilterProp="label"
            value={filterCode}
            onChange={setFilterCode}
            options={stockList.map(stock => ({
              value: stock.code,
              label: `${stock.name} (${stock.code})`,
            }))}
          />
          <Select
            placeholder="交易状态"
            style={{ width: 120 }}
            allowClear
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'open', label: '持仓中' },
              { value: 'closed', label: '已平仓' },
            ]}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="flex-center"
          >
            新增长线记录
          </Button>
        </Space>
      </div>

      {/* 内容区域 */}
      <div className="trade-content">
        {/* 统计信息 */}
        {stats && (
          <div className="trade-section mb_20">
            <div className="trade-section-title">交易统计</div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="总交易笔数"
                    value={stats.totalTrades}
                    prefix={<BarChartOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="总买入金额"
                    value={stats.totalBuyAmount}
                    precision={2}
                    prefix={<RiseOutlined />}
                    valueStyle={{ color: '#ef4444' }}
                    suffix="元"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="总卖出金额"
                    value={stats.totalSellAmount}
                    precision={2}
                    prefix={<FallOutlined />}
                    valueStyle={{ color: '#10b981' }}
                    suffix="元"
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="累计盈亏"
                    value={stats.totalProfit}
                    precision={2}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: stats.totalProfit >= 0 ? '#ef4444' : '#10b981' }}
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
            size="middle"
            pagination={{
              pageSize: 10,
              showTotal: (total) => `共 ${total} 条记录`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            scroll={{ x: 1000 }}
          />
        </div>
      </div>

      {/* 添加/编辑弹窗组件 */}
      <TradeModal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={() => {
          setIsModalVisible(false);
          refreshData();
        }}
        editingRecord={editingTrading}
        stockList={stockList}
      />
    </div>
  );
};

export default Trade;
