/**
 * ============================================
 * QuoteChart - 行情图表容器组件
 * ============================================
 * 统一管理分时图、5日图、日K三种图表类型
 * 每个图表组件自治管理自己的数据加载
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Radio, message } from 'antd';
import type { Stock } from '@/@types/stock';
import { trendsApi } from '@/lib/server/trendsApi';
import { klinesApi } from '@/lib/server/klineApi';
import { IntradayChart, FiveDayChart, CandlestickChart } from './charts';

// 图表类型
type ChartType = 'todayK' | 'fiveDaysK' | 'dailyK';

interface QuoteChartProps {
  stock: Stock;
}

/**
 * QuoteChart - 行情图表容器
 */
const QuoteChart: React.FC<QuoteChartProps> = ({ stock }) => {
  const [refreshKey, setRefreshKey] = useState<string>(Date.now().toString());
  const [chartType, setChartType] = useState<ChartType>('todayK');
  const [loading, setLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);

  // 同步数据核心逻辑
  const syncData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
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
    setRefreshKey(Date.now().toString());
  }, [stock.code, stock.market, chartType]);

  // 定时刷新逻辑 (仅在分时图模式下生效)
  useEffect(() => {
    let timer: any;
    if (chartType === 'todayK') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            syncData(true);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(60);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [chartType, syncData]);

  // 切换图表类型
  const handleTypeChange = (type: ChartType) => {
    setChartType(type);
  };

  // 渲染对应的图表组件
  const renderChart = () => {
    switch (chartType) {
      case 'todayK':
        return <IntradayChart stock={stock} />;
      case 'fiveDaysK':
        return <FiveDayChart stock={stock} />;
      case 'dailyK':
        return <CandlestickChart stock={stock} />;
      default:
        return <IntradayChart stock={stock} />;
    }
  };

  const handleManualRefresh = () => {
    syncData(false);
    setCountdown(60);
  };

  return (
    <div className="stock-content-chart" key={refreshKey}>
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
        {chartType === 'todayK' && (
          <div style={{ marginRight: '12px', color: '#999', fontSize: '12px', alignSelf: 'center' }}>
            下一次更新: <span style={{ fontWeight: 'bold', minWidth: '24px', display: 'inline-block' }}>{countdown}s</span>
          </div>
        )}
        <Button type="primary" onClick={handleManualRefresh} loading={loading}>
          刷新数据
        </Button>
      </div>

      {/* 图表容器 */}
      {renderChart()}
    </div>
  );
};

export default QuoteChart;