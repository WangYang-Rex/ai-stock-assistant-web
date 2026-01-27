/**
 * ============================================
 * QuoteChart - 行情图表容器组件
 * ============================================
 * 统一管理分时图、5日图、日K三种图表类型
 * 根据用户选择切换显示不同的图表组件
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Button, Radio, message } from 'antd';
import type { Stock } from '@/@types/stock';
import { quotesApi } from '@/lib/server/quoteApi';
import { trendsApi } from '@/lib/server/trendsApi';
import { klinesApi } from '@/lib/server/klineApi';
import dayjs from 'dayjs';
import type { Quote } from '@/@types/quote';
import type { Trend } from '@/@types/trend';
import type { Kline } from '@/@types/kline';
import { IntradayChart, FiveDayChart, CandlestickChart, CHART_COLORS, formatAmount } from './charts';

// 图表类型
type ChartType = 'todayK' | 'fiveDaysK' | 'dailyK';

/**
 * 计算分时图的起始时间
 * 如果当前时间早于当天9点，取昨天
 * 如果晚于9点，取今天
 */
const getTodayKStartTime = (): string => {
  const now = dayjs();
  const today9am = dayjs().hour(9).minute(0).second(0).millisecond(0);
  
  if (now.isBefore(today9am)) {
    return dayjs().subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss');
  } else {
    return dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss');
  }
};

/**
 * 根据图表类型获取时间范围
 */
const getTimeRange = (type: ChartType) => {
  const endTime = dayjs().format('YYYY-MM-DD 23:59:59');
  let startTime: string;
  
  switch (type) {
    case 'todayK':
      startTime = getTodayKStartTime();
      break;
    case 'fiveDaysK':
      startTime = dayjs().subtract(7, 'day').format('YYYY-MM-DD 00:00:00');
      break;
    case 'dailyK':
      startTime = dayjs().subtract(120, 'day').format('YYYY-MM-DD 00:00:00'); // 约半年数据
      break;
    default:
      startTime = getTodayKStartTime();
  }
  
  return { startTime, endTime };
};

interface QuoteChartProps {
  stock: Stock;
}

/**
 * QuoteChart - 行情图表容器
 */
const QuoteChart: React.FC<QuoteChartProps> = ({ stock }) => {
  const [refreshKey, setRefreshKey] = useState<string>(Date.now().toString());
  const [chartType, setChartType] = useState<ChartType>('todayK');
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取数据
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { startTime, endTime } = getTimeRange(chartType);
      
      if (chartType === 'todayK' || chartType === 'fiveDaysK') {
        const ndays = chartType === 'todayK' ? 1 : 7;
        const res = await trendsApi.list({
          code: stock.code,
          ndays,
          limit: 2000 // 足够覆盖1-5天的数据
        });
        
        let trends = res.trends;
        // 分时数据通常不需要过滤，API应该已经返回正确范围，但可以根据需要排序
        trends.sort((a, b) => dayjs(a.datetime).unix() - dayjs(b.datetime).unix());
        setDataList(trends);
      } else if (chartType === 'dailyK') {
        const res = await klinesApi.list({
          code: stock.code,
          period: 101, // 日线
          limit: 10000,
          orderBy: 'ASC'
        });
        setDataList(res.data);
      }
    } catch (error) {
      console.error('获取图表数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [stock.code, chartType]);

  // 同步最新数据
  const handleRefresh = async () => {
    setLoading(true);
    try {
      if (chartType === 'todayK' || chartType === 'fiveDaysK') {
        await trendsApi.syncFromApi({
          code: stock.code,
          market: Number(stock.market) || 1,
          ndays: chartType === 'todayK' ? 1 : 5
        });
      } else {
        await klinesApi.sync({
          code: stock.code,
          period: 'daily'
        });
      }
      message.success('同步成功');
      setRefreshKey(Date.now().toString());
      await fetchData();
    } catch (error) {
      console.error('同步失败:', error);
      message.error('同步失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换图表类型
  const handleTypeChange = (type: ChartType) => {
    setChartType(type);
  };

  // 加载数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 计算汇总数据
  const latestItem = dataList[dataList.length - 1];
  const firstItem = dataList[0];
  
  let previousClose = 0;
  let priceVal = 0;
  let totalVolume = 0;
  let totalAmount = 0;
  let changePercentVal = 0;

  if (latestItem) {
    if ('datetime' in latestItem) { // Trend
      priceVal = Number(latestItem.price) || 0;
      changePercentVal = Number(latestItem.pct) || 0;
      previousClose = priceVal / (1 + changePercentVal / 100);
      totalVolume = dataList.reduce((sum, q) => sum + (Number(q.volume) || 0), 0);
      totalAmount = dataList.reduce((sum, q) => sum + (Number(q.amount) || 0), 0);
    } else if ('date' in latestItem && 'open' in latestItem) { // Kline
      priceVal = Number(latestItem.close) || 0;
      changePercentVal = Number(latestItem.pct) || 0;
      previousClose = priceVal - (Number(latestItem.change) || 0);
      totalVolume = Number(latestItem.volume) || 0;
      totalAmount = Number(latestItem.amount) || 0;
    }
  }

  const priceChangeVal = priceVal - previousClose;

  const priceColor = Math.abs(priceChangeVal) < 0.01 
    ? CHART_COLORS.flat 
    : priceChangeVal > 0 ? CHART_COLORS.rise : CHART_COLORS.fall;

  // 渲染对应的图表组件
  const renderChart = () => {
    if (dataList.length === 0) {
      return (
        <div style={{ 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: CHART_COLORS.textSecondary 
        }}>
          {loading ? '加载中...' : '暂无数据'}
        </div>
      );
    }

    switch (chartType) {
      case 'todayK':
        return <IntradayChart quoteList={dataList} />;
      case 'fiveDaysK':
        return <FiveDayChart quoteList={dataList} />;
      case 'dailyK':
        return <CandlestickChart quoteList={dataList} />;
      default:
        return <IntradayChart quoteList={dataList} />;
    }
  };

  return (
    <div className="stock-content-chart" key={refreshKey}>
      {/* 股票信息栏 */}
      {dataList.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: '#FAFAFA',
          borderRadius: '4px',
          marginBottom: '12px',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          <div>
            <span style={{ fontSize: '14px', color: CHART_COLORS.textSecondary }}>最新价</span>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: priceColor,
              marginLeft: '8px'
            }}>
              {priceVal.toFixed(2)}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: CHART_COLORS.textSecondary }}>涨跌额</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: priceColor,
              marginLeft: '8px'
            }}>
              {priceChangeVal > 0 ? '+' : ''}{priceChangeVal.toFixed(2)}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: CHART_COLORS.textSecondary }}>涨跌幅</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: priceColor,
              marginLeft: '8px'
            }}>
              {changePercentVal > 0 ? '+' : ''}{changePercentVal.toFixed(2)}%
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: CHART_COLORS.textSecondary }}>成交量</span>
            <span style={{ fontSize: '14px', marginLeft: '8px', fontWeight: '500' }}>
              {(totalVolume / 10000).toFixed(2)}万手
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: CHART_COLORS.textSecondary }}>成交额</span>
            <span style={{ fontSize: '14px', marginLeft: '8px', fontWeight: '500' }}>
              {formatAmount(totalAmount)}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: CHART_COLORS.textSecondary }}>昨收</span>
            <span style={{ fontSize: '14px', marginLeft: '8px' }}>
              {previousClose.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* 工具栏 */}
      <div className="mb_12 t-FBH">
        <Radio.Group
          style={{ width: '300px' }}
          optionType="button"
          value={chartType}
          onChange={(e) => handleTypeChange(e.target.value)}
          options={[
            { label: '分时', value: 'todayK' },
            { label: '5日', value: 'fiveDaysK' },
            { label: '日K', value: 'dailyK' },
          ]}
        />
        <div className="t-FB1" />
        <Button type="primary" onClick={handleRefresh} loading={loading}>
          刷新
        </Button>
      </div>

      {/* 图表容器 */}
      {renderChart()}
    </div>
  );
};

export default QuoteChart;