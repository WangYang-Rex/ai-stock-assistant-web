import React, { useEffect, useState, useCallback } from 'react';
import { List, Badge, Card, Typography, Space, Button, Empty, Skeleton, message, Tooltip } from 'antd';
import { 
  ReloadOutlined, 
  CheckCircleFilled, 
  CloseCircleFilled, 
  ClockCircleOutlined,
  ThunderboltOutlined,
  PercentageOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { strategiesApi } from '@/lib/server/strategiesApi';
import type { StrategySignal } from '@/@types/strategy';
import MarkdownCmp from "@/components/markdownCmp/markdownCmp";
import closeAuctionMd from './close_auction.md?raw';
import './index.less';

const { Title, Text, Paragraph } = Typography;

const StrategySignalPage: React.FC = () => {
  const [signals, setSignals] = useState<StrategySignal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    try {
      // 获取全市场最新 50 条信号
      const data = await strategiesApi.getLatestSignals({ limit: 50 });
      setSignals(data);
      setLastUpdated(dayjs().format('HH:mm:ss'));
    } catch (err: any) {
      message.error(err?.message || '获取信号失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals();
    // 每 1 分钟自动刷新
    const timer = setInterval(fetchSignals, 60000);
    return () => clearInterval(timer);
  }, [fetchSignals]);

  const formatPrice = (val?: number | string) => {
    if (val === undefined || val === null) return '--';
    const num = Number(val);
    return isNaN(num) ? '--' : num.toFixed(3);
  };

  const renderSignalCard = (signal: StrategySignal) => {
    const isAllow = signal.allow === 1;
    
    return (
      <Card className="signal-card" bordered={false}>
        <div className="card-header">
          <div className="stock-info">
            <div className="stock-name">
              {/* 这里假设 signal 以后会有 stockName，目前先用 symbol 代替 */}
              {signal.symbol} 
            </div>
            <div className="stock-code">{signal.symbol}</div>
          </div>
          <div className="strategy-type">
            <ThunderboltOutlined /> {signal.strategyCode || '尾盘策略'}
          </div>
        </div>

        <div className="card-body">
          <div className="signal-main">
            <div className={`signal-indicator ${isAllow ? 'allow' : 'refuse'}`}>
              <div className="icon">
                {isAllow ? <CheckCircleFilled /> : <CloseCircleFilled />}
              </div>
              <div className="text">{isAllow ? '允许执行' : '信号拒绝'}</div>
            </div>
            
            <div className="confidence-score">
              <span className="label">置信度</span>
              <span className="value">
                {signal.confidence ?? '--'}
                <PercentageOutlined style={{ fontSize: 12 }} />
              </span>
            </div>
          </div>

          <div className="price-info">
            <div className="info-item">
              <span className="label">最新价格</span>
              <span className="value">¥{formatPrice(signal.price)}</span>
            </div>
            <div className="info-item">
              <span className="label">VWAP</span>
              <span className="value">¥{formatPrice(signal.vwap)}</span>
            </div>
          </div>

          <div className="reasons-list">
            {signal.reasons && signal.reasons.length > 0 ? (
              signal.reasons.map((reason, idx) => (
                <span key={idx} className="reason-tag">{reason}</span>
              ))
            ) : (
              <span className="reason-tag" style={{ borderStyle: 'dashed' }}>系统自动判别</span>
            )}
          </div>
        </div>

        <div className="card-footer">
          <div className="time">
            <ClockCircleOutlined />
            {signal.evalTime ? dayjs(signal.evalTime).format('MM-DD HH:mm') : '--'}
          </div>
          <Tooltip title="查看详情">
            <Button size="small" type="text" icon={<InfoCircleOutlined />} />
          </Tooltip>
        </div>
      </Card>
    );
  };

  const strategyGuideContent = closeAuctionMd;

  return (
    <div className="strategy-signal-page">
      <div className="page-header">
        <div className="title-section">
          <h1>全市场策略信号</h1>
          <p>实时监控所有已配置策略生成的信号流</p>
        </div>
        <Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            最后更新: {lastUpdated}
          </Text>
          <Button 
            icon={<ReloadOutlined spin={loading} />} 
            onClick={fetchSignals}
            loading={loading}
          >
            刷新信号
          </Button>
        </Space>
      </div>

      <div className="signal-grid">
        {loading && signals.length === 0 ? (
          <List
            grid={{ gutter: 24, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
            dataSource={[1, 2, 3, 4, 1, 2, 3, 4]}
            renderItem={() => (
              <List.Item>
                <Card style={{ borderRadius: 16 }}>
                  <Skeleton active avatar paragraph={{ rows: 3 }} />
                </Card>
              </List.Item>
            )}
          />
        ) : signals.length > 0 ? (
          <List
            grid={{ gutter: 24, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
            dataSource={signals}
            renderItem={(item) => (
              <List.Item>
                {renderSignalCard(item)}
              </List.Item>
            )}
          />
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="当前暂无策略信号"
            style={{ padding: '100px 0' }}
          />
        )}
      </div>

      <div className="strategy-info-section">
        <div className="section-title">策略-尾盘战法</div>
        <div className="markdown-container">
          <MarkdownCmp content={strategyGuideContent} />
        </div>
      </div>
    </div>
  );
};

export default StrategySignalPage;
