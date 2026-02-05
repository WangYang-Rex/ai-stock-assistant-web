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
        limit: 10 // Increase limit for better view
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

  // 尾盘战法评估
  const handleEvaluateCloseAuction = async () => {
    if (!symbol) return;
    setEvaluating(true);
    try {
      await strategiesApi.evaluateBySymbol({ symbol });
      message.success('尾盘评估完成');
      fetchSignals(); // 刷新列表
    } catch (err: any) {
      message.error('尾盘评估失败: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  // 规则趋势评估
  const handleEvaluateRuleTrend = async () => {
    if (!symbol) return;
    setEvaluating(true);
    try {
      const result = await strategiesApi.evaluateRuleTrend({ code: symbol });
      if (result.success) {
        message.success(`趋势评估完成: ${result.decision?.action || '保持'}`);
      } else {
        message.warning('评估完成，但未生成明确决策: ' + (result.message || ''));
      }
      fetchSignals(); // 刷新列表
    } catch (err: any) {
      message.error('规则趋势评估失败: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const columns = [
    {
      title: '执行时间',
      dataIndex: 'evalTime',
      key: 'evalTime',
      width: 140,
      render: (text: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#94A3B8' }} />
          <span>{text ? dayjs(text).format('MM-DD HH:mm:ss') : '--'}</span>
        </Space>
      ),
    },
    {
      title: '策略',
      dataIndex: 'strategyCode',
      key: 'strategyCode',
      width: 150,
      render: (text: string) => {
        return <Tag color="blue" style={{ borderRadius: 4 }}>{strategyCodeMap[text] || text || '--'}</Tag>
      },
    },
    {
      title: '当前价格',
      dataIndex: 'price',
      key: 'price',
      width: 90,
      render: (price: any) => {
        const numPrice = Number(price);
        return (!isNaN(numPrice) && price !== null && price !== undefined) 
          ? <Text strong>{numPrice.toFixed(3)}</Text> 
          : '--';
      },
    },
    {
      title: '决策',
      dataIndex: 'allow',
      key: 'allow',
      width: 100,
      render: (allow: number, record: StrategySignal) => {
        // 对于趋势模型，决策可能在 extra 中有更详细信息
        const action = record.extra?.decision?.action || record.extra?.action;
        
        if (record.strategyCode === 'RULE_TREND_V1' && action) {
          const colorMap: Record<string, string> = {
            'ADD': 'success',
            'REDUCE': 'warning',
            'STOP': 'error',
            'HOLD': 'processing'
          };
          const textMap: Record<string, string> = {
            'ADD': '加仓/买入',
            'REDUCE': '减仓/卖出',
            'STOP': '止损/清仓',
            'HOLD': '继续持有'
          };
          return <Tag color={colorMap[action] || 'default'}>{textMap[action] || action}</Tag>;
        }

        return (
          <Space>
            {allow === 1 ? (
              <Tag icon={<CheckCircleOutlined />} color="success">允许买入</Tag>
            ) : (
              <Tag icon={<CloseCircleOutlined />} color="default">保持观望</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: '评分/置信度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 100,
      render: (val: number) => (
        <Text strong style={{ color: val > 70 ? '#10B981' : val > 40 ? '#F59E0B' : '#64748B' }}>
          {val ?? '--'}{val !== undefined ? '%' : ''}
        </Text>
      ),
    },
    {
      title: '评估分析',
      dataIndex: 'reasons',
      key: 'reasons',
      render: (reasons: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {reasons?.map((r, i) => (
            <Tag key={i} color="blue-inverse" style={{ fontSize: '11px', margin: 0 }}>{r}</Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="stock-strategy-signal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space align="center">
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: '50%', 
            background: 'rgba(249, 115, 22, 0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <ThunderboltOutlined style={{ color: '#F97316', fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>策略执行历史</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>AI 实时分析与回测记录</div>
          </div>
        </Space>
        <Space size="middle">
          <Button 
            size="small" 
            variant="text"
            icon={<SyncOutlined spin={loading} />} 
            onClick={fetchSignals}
          >
            刷新
          </Button>
          <Space.Compact size="small">
            <Tooltip title="立即执行尾盘评估算法">
              <Button 
                icon={<PlayCircleOutlined />} 
                loading={evaluating}
                onClick={handleEvaluateCloseAuction}
              >
                尾盘评估
              </Button>
            </Tooltip>
            <Tooltip title="立即执行趋势追踪模型评估">
              <Button 
                type="primary"
                icon={<ThunderboltOutlined />} 
                loading={evaluating}
                onClick={handleEvaluateRuleTrend}
              >
                趋势评估
              </Button>
            </Tooltip>
          </Space.Compact>
        </Space>
      </div>

      <Card size="small" styles={{ body: { padding: 0 } }} bordered={false}>
        <Table
          size="small"
          columns={columns}
          dataSource={latestSignals}
          rowKey="id"
          loading={loading}
          pagination={latestSignals.length > 5 ? { pageSize: 5, simple: true } : false}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无历史信号" /> }}
          rowClassName={(record) => record.allow === 1 ? 'row-signal-buy' : ''}
        />
      </Card>

      <style>{`
        .row-signal-buy {
          background-color: rgba(16, 185, 129, 0.02);
        }
        .stock-strategy-signal .ant-table-thead > tr > th {
          background-color: #F8FAFC;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default StockStrategySignal;
