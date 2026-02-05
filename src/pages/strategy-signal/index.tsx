import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  List, 
  Badge, 
  Card, 
  Typography, 
  Space, 
  Button, 
  Empty, 
  Skeleton, 
  message, 
  Tooltip, 
  Form, 
  Input, 
  Select, 
  Checkbox, 
  Slider,
  Pagination,
  Tag,
  Divider
} from 'antd';
import { 
  ReloadOutlined, 
  CheckCircleFilled, 
  CloseCircleFilled, 
  ClockCircleOutlined,
  ThunderboltOutlined,
  PercentageOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { strategiesApi } from '@/lib/server/strategiesApi';
import type { QuerySignalDto } from '@/lib/server/strategiesApi';
import type { StrategySignal } from '@/@types/strategy';
import MarkdownCmp from "@/components/markdownCmp/markdownCmp";
import closeAuctionMd from './close_auction.md?raw';
import './index.less';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const StrategySignalPage: React.FC = () => {
  const [form] = Form.useForm();
  const [signals, setSignals] = useState<StrategySignal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [query, setQuery] = useState<QuerySignalDto>({
    page: 1,
    pageSize: 12,
  });

  const fetchSignals = useCallback(async (currentQuery: QuerySignalDto) => {
    setLoading(true);
    try {
      const response = await strategiesApi.querySignals(currentQuery);
      setSignals(response.list || []);
      setTotal(response.total || 0);
      setLastUpdated(dayjs().format('HH:mm:ss'));
    } catch (err: any) {
      message.error(err?.message || '获取信号失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignals(query);
    // 每 2 分钟自动刷新 (根据当前查询条件)
    const timer = setInterval(() => fetchSignals(query), 120000);
    return () => clearInterval(timer);
  }, [fetchSignals, query]);

  const handleSearch = (values: any) => {
    setQuery(prev => ({
      ...prev,
      ...values,
      page: 1, // 重置到第一页
    }));
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setQuery(prev => ({
      ...prev,
      page,
      pageSize,
    }));
  };

  const formatPrice = (val?: number | string) => {
    if (val === undefined || val === null) return '--';
    const num = Number(val);
    return isNaN(num) ? '--' : num.toFixed(3);
  };

  const getStrategyTagColor = (code?: string) => {
    switch (code) {
      case 'close_auction': return 'gold';
      case 'rule_trend': return 'blue';
      default: return 'default';
    }
  };

  const getDisplayAction = (signal: StrategySignal) => {
    // 优先从 extra 中提取详细决策
    const decision = signal.extra?.decision || signal.extra?.position;
    if (decision?.action) {
      const actionMap: Record<string, { text: string; color: string; status: 'success'|'error'|'warning'|'processing'|'default' }> = {
        'ADD': { text: '建议加仓', color: '#52c41a', status: 'success' },
        'BUY': { text: '建议买入', color: '#52c41a', status: 'success' },
        'REDUCE': { text: '建议减仓', color: '#faad14', status: 'warning' },
        'SELL': { text: '建议减持', color: '#ff4d4f', status: 'error' },
        'HOLD': { text: '继续持仓', color: '#1890ff', status: 'processing' },
        'STOP': { text: '触发止损', color: '#f5222d', status: 'error' },
        'NONE': { text: '暂无动作', color: '#d9d9d9', status: 'default' },
      };
      return actionMap[decision.action as string] || (signal.allow === 1 ? { text: '允许买入', color: '#52c41a', status: 'success' } : { text: '观望拒绝', color: '#d9d9d9', status: 'default' });
    }
    
    // 兜底逻辑
    return signal.allow === 1 
      ? { text: '建议买入', color: '#52c41a', status: 'success' as const } 
      : { text: '观望拒绝', color: '#d9d9d9', status: 'default' as const };
  };

  const renderSignalCard = (signal: StrategySignal) => {
    const isAllow = signal.allow === 1;
    const actionInfo = getDisplayAction(signal);
    const strategyName = signal.extra?.strategyName || 
                        (signal.strategyCode === 'close_auction' ? '尾盘共振战法' : 
                         signal.strategyCode === 'rule_trend' ? '规则趋势跟踪' : 
                         (signal.strategyCode || '未知策略'));
    
    return (
      <Card 
        className={`signal-card ${isAllow ? 'allow-border' : 'refuse-border'}`} 
        hoverable
        bordered={false}
        actions={[
          <Tooltip title="数据回测" key="backtest">
            <ThunderboltOutlined />
          </Tooltip>,
          <Tooltip title="详情分析" key="detail">
            <EyeOutlined />
          </Tooltip>,
          <div className="time-footer" key="time">
            <ClockCircleOutlined /> {signal.evalTime ? dayjs(signal.evalTime).format('HH:mm:ss') : '--'}
          </div>
        ]}
      >
        <div className="card-header-new">
          <div className="stock-info">
             <div className="stock-identity">
                <Text strong className="stock-symbol">{signal.symbol}</Text>
                {signal.extra?.stockName && (
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>{signal.extra.stockName}</Text>
                )}
             </div>
             <div className="strategy-tag-row">
                <Tag color={getStrategyTagColor(signal.strategyCode)} bordered={false}>
                  {strategyName}
                </Tag>
             </div>
          </div>
          <div className="signal-result-badge">
            <Badge 
              status={actionInfo.status} 
              text={<Text style={{ color: actionInfo.color }} strong>{actionInfo.text}</Text>} 
            />
          </div>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <div className="card-body-metrics">
          <div className="metric-item confidence-score">
            <div className="label">置信度</div>
            <div className={`value ${isAllow ? 'text-allow' : 'text-refuse'}`}>
              {signal.confidence ?? '--'}<span className="unit">%</span>
            </div>
          </div>
          
          <div className="metric-row">
            <div className="metric-sub">
              <span className="label">实时价</span>
              <span className="value">¥{formatPrice(signal.price)}</span>
            </div>
            <div className="metric-sub">
              <span className="label">VWAP</span>
              <span className="value">¥{formatPrice(signal.vwap)}</span>
            </div>
          </div>
        </div>

        <div className="reasons-container">
          {signal.reasons && signal.reasons.length > 0 ? (
            signal.reasons.slice(0, 3).map((reason, idx) => (
              <Tag key={idx} className="reason-tag-new" color={isAllow ? 'green' : 'red'}>{reason}</Tag>
            ))
          ) : (
            <Text type="secondary" italic style={{ fontSize: 12 }}>系统评分逻辑判别</Text>
          )}
        </div>
      </Card>
    );
  };

  const strategyGuideContent = closeAuctionMd;

  return (
    <div className="strategy-signal-page">
      <div className="page-header">
        <div className="title-section">
          <h1>策略信号中心</h1>
          <p>多维度实时监控全市场量化策略生成的决策信号</p>
        </div>
        <div className="header-actions">
           <Text type="secondary" className="update-time">
            最后更新: {lastUpdated}
          </Text>
          <Button 
            type="primary"
            icon={<ReloadOutlined spin={loading} />} 
            onClick={() => fetchSignals(query)}
            loading={loading}
          >
            手动刷新
          </Button>
        </div>
      </div>

      <Card className="filter-card" bordered={false}>
        <Form 
          form={form} 
          layout="inline" 
          onFinish={handleSearch}
          initialValues={{ strategyCode: undefined, allowOnly: false, minConfidence: 0 }}
        >
          <Form.Item name="strategyCode" label="策略类型">
            <Select placeholder="全部策略" allowClear style={{ width: 150 }}>
              <Option value="close_auction">尾盘战法</Option>
              <Option value="rule_trend">规则趋势</Option>
            </Select>
          </Form.Item>
          <Form.Item name="symbol" label="股票代码">
            <Input placeholder="输入代码搜索" allowClear prefix={<SearchOutlined />} style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="allowOnly" valuePropName="checked">
            <Checkbox>仅看买入建议</Checkbox>
          </Form.Item>
          <Form.Item label="最低置信度" style={{ marginRight: 0 }}>
             <Space size={12}>
                <Form.Item name="minConfidence" noStyle>
                   <Slider style={{ width: 120 }} min={0} max={100} />
                </Form.Item>
                <Text type="secondary" style={{ width: 30 }}>{Form.useWatch('minConfidence', form)}%</Text>
             </Space>
          </Form.Item>
          <Form.Item className="ml_20">
            <Button type="primary" htmlType="submit" icon={<FilterOutlined />}>
              筛选
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <div className="signal-content">
        {loading && signals.length === 0 ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
            dataSource={[1, 2, 3, 4, 5, 6, 7, 8]}
            renderItem={() => (
              <List.Item>
                <Card bordered={false} style={{ borderRadius: 12 }}>
                  <Skeleton active paragraph={{ rows: 4 }} />
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <>
            <div className="signals-grid-wrapper">
              {signals.length > 0 ? (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 }}
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
                  description="在当前筛选条件下未发现信号"
                  style={{ padding: '80px 0', background: '#fff', borderRadius: 12 }}
                />
              )}
            </div>
            
            <div className="pagination-container">
              <Pagination
                current={query.page}
                pageSize={query.pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger
                showTotal={(total) => `共 ${total} 条信号`}
              />
            </div>
          </>
        )}
      </div>

      <div className="strategy-info-section">
        <div className="section-title">
          <ThunderboltOutlined /> 策略执行指南：尾盘战法 (Close Auction Strategy)
        </div>
        <div className="markdown-container">
          <MarkdownCmp content={strategyGuideContent} />
        </div>
      </div>
    </div>
  );
};

export default StrategySignalPage;

