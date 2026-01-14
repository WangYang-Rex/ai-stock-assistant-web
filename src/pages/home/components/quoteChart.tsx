/**
 * ============================================
 * QuoteChart - 行情图表容器组件
 * ============================================
 * 统一管理分时图、5日图、日K三种图表类型
 * 根据用户选择切换显示不同的图表组件
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Button, Radio, DatePicker } from 'antd';
import type { Stock } from '@/@types/stock';
import { quotesApi } from '@/lib/server/quoteApi';
import dayjs from 'dayjs';
import type { Quote } from '@/@types/quote';
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
    return dayjs().subtract(1, 'day').format('YYYY-MM-DD 00:00:00');
  } else {
    return dayjs().format('YYYY-MM-DD 00:00:00');
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
  const [startTime, setStartTime] = useState<string>(getTodayKStartTime());
  const [endTime, setEndTime] = useState<string>(dayjs().format('YYYY-MM-DD 23:59:59'));
  const [quoteList, setQuoteList] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取行情数据
  const fetchQuoteList = useCallback(async (params?: { startTime: string; endTime: string }) => {
    setLoading(true);
    try {
      const res = await quotesApi.list({
        code: stock.code,
        marketCode: stock.marketCode?.toString() || '',
        startTime: params?.startTime || startTime,
        endTime: params?.endTime || endTime,
        page: 1,
        limit: 10000
      });
      
      let quotes = res.quotes;
      // 过滤交易时间内的数据 (09:30 - 15:00)
      quotes = quotes.filter(it => {
        const date = dayjs(it.snapshotTime).format('YYYY-MM-DD');
        const time = new Date(it.snapshotTime).getTime();
        return time >= new Date(`${date} 09:30:00`).getTime() && 
               time <= new Date(`${date} 15:00:00`).getTime();
      });
      // 按时间排序
      quotes.sort((a, b) => 
        new Date(a.snapshotTime || '').getTime() - new Date(b.snapshotTime || '').getTime()
      );
      
      setQuoteList(quotes);
    } catch (error) {
      console.error('获取行情数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [stock.code, stock.marketCode, startTime, endTime]);

  // 同步最新行情
  const handleRefresh = async () => {
    try {
      await quotesApi.syncStockQuotesFromAPI({
        code: stock.code,
        marketCode: stock.marketCode?.toString() || '',
      });
      setRefreshKey(Date.now().toString());
      await fetchQuoteList();
    } catch (error) {
      console.error('同步行情失败:', error);
    }
  };

  // 切换图表类型
  const handleTypeChange = (type: ChartType) => {
    const { startTime: newStart, endTime: newEnd } = getTimeRange(type);
    setStartTime(newStart);
    setEndTime(newEnd);
    setChartType(type);
    fetchQuoteList({ startTime: newStart, endTime: newEnd });
  };

  // 首次加载
  useEffect(() => {
    fetchQuoteList();
  }, [stock]);

  // 计算汇总数据
  const latestQuote = quoteList[quoteList.length - 1];
  const previousClose = Number(quoteList[0]?.previousClosePrice) || Number(quoteList[0]?.openPrice) || 0;
  const latestPrice = Number(latestQuote?.latestPrice) || previousClose || 0;
  const priceChange = latestPrice - previousClose;
  const changePercent = previousClose ? (priceChange / previousClose) * 100 : 0;
  const totalVolume = quoteList.reduce((sum, q) => sum + (Number(q.volume) || 0), 0);
  const totalAmount = quoteList.reduce((sum, q) => sum + (Number(q.volumeAmount) || 0), 0);

  const priceColor = Math.abs(priceChange) < 0.01 
    ? CHART_COLORS.flat 
    : priceChange > 0 ? CHART_COLORS.rise : CHART_COLORS.fall;

  // 渲染对应的图表组件
  const renderChart = () => {
    if (quoteList.length === 0) {
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
        return <IntradayChart quoteList={quoteList} />;
      case 'fiveDaysK':
        return <FiveDayChart quoteList={quoteList} />;
      case 'dailyK':
        return <CandlestickChart quoteList={quoteList} />;
      default:
        return <IntradayChart quoteList={quoteList} />;
    }
  };

  return (
    <div className="stock-content-chart" key={refreshKey}>
      {/* 股票信息栏 */}
      {quoteList.length > 0 && (
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
              {latestPrice.toFixed(2)}
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
              {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}
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
              {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
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
        <DatePicker.RangePicker
          className="mr_12"
          value={[dayjs(startTime), dayjs(endTime)]}
          onChange={(value) => {
            if (value && value[0] && value[1]) {
              const newStart = value[0].format('YYYY-MM-DD 00:00:00');
              const newEnd = value[1].format('YYYY-MM-DD 23:59:59');
              setStartTime(newStart);
              setEndTime(newEnd);
              fetchQuoteList({ startTime: newStart, endTime: newEnd });
            }
          }}
        />
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