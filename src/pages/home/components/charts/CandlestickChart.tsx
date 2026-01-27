/**
 * ============================================
 * CandlestickChart - 日K线图组件
 * ============================================
 * 显示日K线蜡烛图，包含：
 * - OHLC蜡烛图
 * - 成交量柱状图
 * - MA5/MA10/MA20均线
 * - 支持缩放和拖动
 */

import React, { useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import echarts from '@/lib/echartUtil';
import type { Quote } from '@/@types/quote';
import type { Kline } from '@/@types/kline';
import { 
  CHART_COLORS,
  formatVolume,
  getBaseTooltipConfig
} from './chartConfig';

interface CandlestickChartProps {
  quoteList: (Quote | Kline)[];
}

/**
 * 将数据转换为统一的日K格式
 */
const processToDailyData = (list: (Quote | Kline)[]) => {
  if (list.length === 0) return [];

  // 判断是否已经是 Kline 格式 (包含 date 字段)
  if ('date' in list[0]) {
    return (list as Kline[]).map(k => ({
      date: k.date,
      open: Number(k.open) || 0,
      close: Number(k.close) || 0,
      high: Number(k.high) || 0,
      low: Number(k.low) || 0,
      volume: Number(k.volume) || 0,
      amount: Number(k.amount) || 0
    }));
  }

  // 否则按照 Quote 数据聚合 (分时聚合为日线)
  const quoteList = list as Quote[];
  const dailyMap = new Map<string, {
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    amount: number;
  }>();

  quoteList.forEach(quote => {
    const date = dayjs(quote.updateTime * 1000).format('YYYY-MM-DD');
    const price = Number(quote.price) || 0;
    const volume = Number(quote.volume) || 0;
    const amount = Number(quote.amount) || 0;

    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        open: price,
        close: price,
        high: price,
        low: price,
        volume: 0,
        amount: 0
      });
    }

    const day = dailyMap.get(date)!;
    day.close = price;
    day.high = Math.max(day.high, price);
    day.low = Math.min(day.low, price);
    day.volume += volume;
    day.amount += amount;
  });

  return Array.from(dailyMap.values()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

/**
 * 计算移动平均线
 */
const calculateMA = (data: any[], period: number) => {
  const result: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      result.push(Number((sum / period).toFixed(2)));
    }
  }
  return result;
};

/**
 * 日K线图组件 - 专业蜡烛图展示
 */
const CandlestickChart: React.FC<CandlestickChartProps> = ({ quoteList }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // 转换/获取日K数据
  const dailyData = useMemo(() => processToDailyData(quoteList), [quoteList]);

  const chartInit = useCallback(() => {
    if (!chartRef.current || dailyData.length === 0) {
      return;
    }

    // 日期序列
    const dates = dailyData.map(d => d.date);
    
    // OHLC数据 [open, close, low, high]
    const ohlcData = dailyData.map(d => [d.open, d.close, d.low, d.high]);
    
    // 成交量数据
    const volumeData = dailyData.map((d, i) => {
      const isRising = d.close >= d.open;
      return {
        value: d.volume,
        itemStyle: { color: isRising ? CHART_COLORS.rise : CHART_COLORS.fall, opacity: 0.7 }
      };
    });

    // 均线数据
    const ma5 = calculateMA(dailyData, 5);
    const ma10 = calculateMA(dailyData, 10);
    const ma20 = calculateMA(dailyData, 20);

    const option = {
      backgroundColor: CHART_COLORS.bg,
      legend: {
        data: ['日K', 'MA5', 'MA10', 'MA20'],
        top: 10,
        left: 'center',
        textStyle: { color: CHART_COLORS.text, fontSize: 12 },
        itemWidth: 14,
        itemHeight: 8
      },
      tooltip: {
        ...getBaseTooltipConfig(),
        trigger: 'axis',
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';
          
          const dataIndex = params[0].dataIndex;
          const day = dailyData[dataIndex];
          if (!day) return '';
          
          const changeVal = day.close - day.open;
          const changePercent = day.open ? (changeVal / day.open) * 100 : 0;
          const color = changeVal >= 0 ? CHART_COLORS.rise : CHART_COLORS.fall;
          const sign = changeVal >= 0 ? '+' : '';
          
          let result = `<div style="margin-bottom: 8px; font-weight: bold; border-bottom: 1px solid ${CHART_COLORS.grid}; padding-bottom: 6px;">${day.date}</div>`;
          
          result += `<div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; align-items: center;">`;
          result += `<span style="color:${CHART_COLORS.textSecondary}">开盘</span><span style="font-weight:500">${day.open.toFixed(2)}</span>`;
          result += `<span style="color:${CHART_COLORS.textSecondary}">收盘</span><span style="color:${color};font-weight:bold">${day.close.toFixed(2)}</span>`;
          result += `<span style="color:${CHART_COLORS.textSecondary}">最高</span><span style="color:${CHART_COLORS.rise}">${day.high.toFixed(2)}</span>`;
          result += `<span style="color:${CHART_COLORS.textSecondary}">最低</span><span style="color:${CHART_COLORS.fall}">${day.low.toFixed(2)}</span>`;
          result += `<span style="color:${CHART_COLORS.textSecondary}">涨跌</span><span style="color:${color}">${sign}${changeVal.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)</span>`;
          result += `<span style="color:${CHART_COLORS.textSecondary}">成交量</span><span>${formatVolume(day.volume)}</span>`;
          result += `</div>`;
          
          // 均线数据
          params.forEach((param: any) => {
            // 确保 param.value 是有效的数字类型才格式化
            if (param.seriesName.startsWith('MA') && typeof param.value === 'number' && param.value !== null) {
              result += `<div style="margin-top:4px"><span style="color:${param.color}">${param.seriesName}: ${param.value.toFixed(2)}</span></div>`;
            }
          });
          
          return result;
        }
      },
      grid: [
        {
          left: '3%',
          right: '3%',
          top: '12%',
          height: '55%',
          containLabel: false,
          show: true,
          borderColor: CHART_COLORS.border
        },
        {
          left: '3%',
          right: '3%',
          top: '72%',
          height: '20%',
          containLabel: false,
          show: true,
          borderColor: CHART_COLORS.border
        }
      ],
      xAxis: [
        {
          type: 'category',
          data: dates,
          gridIndex: 0,
          axisLine: { lineStyle: { color: CHART_COLORS.border } },
          axisTick: { show: false },
          axisLabel: {
            color: CHART_COLORS.text,
            fontSize: 11,
            margin: 8,
            formatter: (value: string, index: number) => {
              // 智能显示日期
              if (dates.length <= 10) return dayjs(value).format('MM-DD');
              if (dates.length <= 30 && index % 5 === 0) return dayjs(value).format('MM-DD');
              if (dates.length <= 60 && index % 10 === 0) return dayjs(value).format('MM-DD');
              if (index % 20 === 0) return dayjs(value).format('MM-DD');
              return '';
            }
          },
          splitLine: { show: false },
          boundaryGap: true
        },
        {
          type: 'category',
          data: dates,
          gridIndex: 1,
          axisLine: { lineStyle: { color: CHART_COLORS.border } },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
          boundaryGap: true
        }
      ],
      yAxis: [
        {
          type: 'value',
          gridIndex: 0,
          position: 'left',
          scale: true,
          splitNumber: 4,
          axisLabel: { fontSize: 11, color: CHART_COLORS.text, formatter: (v: number) => v.toFixed(2), margin: 8 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: true, lineStyle: { color: CHART_COLORS.grid, type: 'dashed' } }
        },
        {
          type: 'value',
          gridIndex: 1,
          scale: true,
          splitNumber: 2,
          axisLabel: { fontSize: 11, color: CHART_COLORS.textSecondary, formatter: formatVolume },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: true, lineStyle: { color: CHART_COLORS.grid, type: 'dashed' } }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: dailyData.length > 60 ? 100 - (60 / dailyData.length) * 100 : 0,
          end: 100
        },
        {
          type: 'slider',
          xAxisIndex: [0, 1],
          top: '95%',
          height: 15,
          start: dailyData.length > 60 ? 100 - (60 / dailyData.length) * 100 : 0,
          end: 100,
          borderColor: CHART_COLORS.border,
          fillerColor: 'rgba(59, 130, 246, 0.1)',
          handleStyle: { color: CHART_COLORS.text, borderColor: CHART_COLORS.border },
          textStyle: { color: CHART_COLORS.text, fontSize: 10 }
        }
      ],
      series: [
        {
          name: '日K',
          type: 'candlestick',
          data: ohlcData,
          itemStyle: {
            color: CHART_COLORS.rise,        // 阳线填充色
            color0: CHART_COLORS.fall,       // 阴线填充色
            borderColor: CHART_COLORS.rise,  // 阳线边框色
            borderColor0: CHART_COLORS.fall  // 阴线边框色
          }
        },
        {
          name: 'MA5',
          type: 'line',
          data: ma5,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 1, color: CHART_COLORS.ma5 }
        },
        {
          name: 'MA10',
          type: 'line',
          data: ma10,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 1, color: CHART_COLORS.ma10 }
        },
        {
          name: 'MA20',
          type: 'line',
          data: ma20,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 1, color: CHART_COLORS.ma20 }
        },
        {
          name: '成交量',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumeData,
          barMaxWidth: 20
        }
      ]
    };

    const myChart = echarts.init(chartRef.current);
    myChart.setOption(option, true);

    const handleResize = () => myChart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  }, [dailyData]);

  useLayoutEffect(() => {
    const cleanup = chartInit();
    return cleanup;
  }, [chartInit]);

  return <div ref={chartRef} className="ai-report-card-chart-container" />;
};

export default CandlestickChart;
