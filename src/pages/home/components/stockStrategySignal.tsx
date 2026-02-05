import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Button, Space, message, Typography, Tooltip, Empty } from 'antd';
import { 
  ThunderboltOutlined, 
  PlayCircleOutlined, 
  HistoryOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { strategiesApi } from '@/lib/server/strategiesApi';
import type { StrategySignal } from '@/@types/strategy';

const { Text } = Typography;

const strategyCodeMap: Record<string, string> = {
  'CLOSE_AUCTION_T1': '尾盘战法策略',
  'RULE_TREND_V1': '规则型股票趋势模型'
}

interface StockStrategySignalProps {
  symbol: string;
}

const StockStrategySignal: React.FC<StockStrategySignalProps> = ({ symbol }) => {
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [latestSignals, setLatestSignals] = useState<StrategySignal[]>([]);

  const fetchSignals = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    try {
      const data = await strategiesApi.getLatestSignals({ 
        symbol, 
        limit: 5
      });
      setLatestSignals(data);
    } catch (err: any) {
      message.error('获取信号失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  const handleEvaluate = async () => {
    if (!symbol) return;
    setEvaluating(true);
    try {
      const result = await strategiesApi.evaluateBySymbol({ symbol });
      message.success('评估完成');
      fetchSignals(); // 刷新列表
    } catch (err: any) {
      message.error('评估失败: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const columns = [
    {
      title: '执行时间',
      dataIndex: 'evalTime',
      key: 'evalTime',
      width: 120,
      render: (text: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#94A3B8' }} />
          <span>{text ? dayjs(text).format('MM-DD HH:mm') : '--'}</span>
        </Space>
      ),
    },
    {
      title: '策略',
      dataIndex: 'strategyCode',
      key: 'strategyCode',
      width: 120,
      render: (text: string) => {
        return <Tag color="blue">{strategyCodeMap[text] || text || '尾盘策略'}</Tag>
      },
    },
    {
      title: '决策',
      dataIndex: 'allow',
      key: 'allow',
      width: 120,
      render: (allow: number) => (
        <Space>
          {allow === 1 ? (
            <Tag icon={<CheckCircleOutlined />} color="success">允许买入</Tag>
          ) : (
            <Tag icon={<CloseCircleOutlined />} color="default">保持观望</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 100,
      render: (val: number) => (
        <Text strong style={{ color: val > 70 ? '#10B981' : '#64748B' }}>
          {val ?? '--'}%
        </Text>
      ),
    },
    {
      title: '原因',
      dataIndex: 'reasons',
      key: 'reasons',
      width: 240,
      render: (reasons: string[]) => (
        <div style={{ maxWidth: 200 }}>
          {reasons?.map((r, i) => (
            <Tag key={i} style={{ marginBottom: 4 }}>{r}</Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="stock-strategy-signal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Space>
          <ThunderboltOutlined style={{ color: '#F97316' }} />
          <span style={{ fontWeight: 600 }}>策略执行历史</span>
        </Space>
        <Space>
          <Button 
            size="small" 
            icon={<SyncOutlined spin={loading} />} 
            onClick={fetchSignals}
          >
            刷新
          </Button>
          <Button 
            type="primary" 
            size="small" 
            icon={<PlayCircleOutlined />} 
            loading={evaluating}
            onClick={handleEvaluate}
          >
            立即评估 (尾盘)
          </Button>
        </Space>
      </div>

      <Table
        size="small"
        columns={columns}
        dataSource={latestSignals}
        rowKey="id"
        loading={loading}
        pagination={false}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无历史信号" /> }}
      />
    </div>
  );
};

export default StockStrategySignal;
