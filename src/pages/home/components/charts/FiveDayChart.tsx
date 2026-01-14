/**
 * ============================================
 * FiveDayChart - 5日分时图组件
 * ============================================
 * 显示近5个交易日的分时走势，特点：
 * - 横跨多日的价格走势
 * - 日期分隔显示
 * - 每日开盘/收盘时间标注
 */

import React, { useLayoutEffect, useRef, useCallback } from 'react';
import dayjs from 'dayjs';
import echarts from '@/lib/echartUtil';
import type { Quote } from '@/@types/quote';
import { 
  CHART_COLORS, 
  getBreakData,
  formatVolume,
  getBaseTooltipConfig,
  getDualGridConfig,
  BREAK_GAP
} from './chartConfig';

interface FiveDayChartProps {
  quoteList: Quote[];
}

/**
 * 5日分时图组件 - 专为跨日走势优化
 */
const FiveDayChart: React.FC<FiveDayChartProps> = ({ quoteList }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const chartInit = useCallback(() => {
    if (!chartRef.current || quoteList.length === 0) {
      return;
    }

    // 获取第一天的昨收价作为基准
    const previousClose = Number(quoteList[0]?.previousClosePrice) || Number(quoteList[0]?.openPrice) || 0;
    const breakData = getBreakData(quoteList, true); // 包含隔天间断

    // 价格数据
    const priceData = quoteList.map(it => [
      new Date(it.snapshotTime).getTime(), 
      Number(it.latestPrice) || 0
    ]);

    // 成交量数据
    const volumeData = quoteList.map((it, index) => {
      const latestPrice = Number(it.latestPrice) || 0;
      const currentVolume = Number(it.volume) || 0;
      
      let priceDirection = 0;
      if (index > 0) {
        const prevPrice = Number(quoteList[index - 1].latestPrice) || 0;
        priceDirection = latestPrice > prevPrice ? 1 : latestPrice < prevPrice ? -1 : 0;
      } else {
        priceDirection = latestPrice >= previousClose ? 1 : -1;
      }
      
      return [new Date(it.snapshotTime).getTime(), currentVolume, priceDirection];
    });

    // 提取所有交易日
    const tradingDays = [...new Set(quoteList.map(q => q.snapshotDate))].sort();

    // 计算Y轴范围
    const allPrices = quoteList.map(q => Number(q.latestPrice) || 0).filter(p => p > 0);
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : previousClose;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : previousClose;
    
    const priceRange = maxPrice - minPrice;
    const yAxisMin = minPrice - priceRange * 0.05;
    const yAxisMax = maxPrice + priceRange * 0.05;

    // 判断整体涨跌
    const latestPrice = Number(quoteList[quoteList.length - 1]?.latestPrice) || previousClose;
    const isRising = latestPrice >= previousClose;

    const option = {
      backgroundColor: CHART_COLORS.bg,
      tooltip: {
        ...getBaseTooltipConfig(),
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';

          const time = dayjs(params[0].value[0]).format('MM-DD HH:mm');
          let result = `<div style="margin-bottom: 8px; font-weight: bold; border-bottom: 1px solid ${CHART_COLORS.grid}; padding-bottom: 6px;">${time}</div>`;

          params.forEach((param: any) => {
            if (param.seriesName === '价格') {
              const price = param.value[1];
              const change = price - previousClose;
              const changePercent = (change / previousClose) * 100;
              const color = changePercent > 0 ? CHART_COLORS.rise : changePercent < 0 ? CHART_COLORS.fall : CHART_COLORS.flat;
              const sign = changePercent > 0 ? '+' : '';
              result += `<div style="margin-top: 6px; display: flex; justify-content: space-between;">
                <span style="color: ${CHART_COLORS.textSecondary};">价格</span>
                <span>
                  <span style="color:${color};font-weight:bold;">${price.toFixed(2)}</span>
                  <span style="color:${color};margin-left:8px;font-size:12px;">${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)</span>
                </span>
              </div>`;
            } else if (param.seriesName === '成交量') {
              const volume = param.value[1];
              const direction = param.value[2];
              const color = direction > 0 ? CHART_COLORS.rise : direction < 0 ? CHART_COLORS.fall : CHART_COLORS.textSecondary;
              result += `<div style="margin-top: 6px; display: flex; justify-content: space-between;">
                <span style="color: ${CHART_COLORS.textSecondary};">成交量</span>
                <span style="color:${color};font-weight:bold;">${formatVolume(volume)}</span>
              </div>`;
            }
          });

          return result;
        }
      },
      grid: getDualGridConfig(),
      xAxis: [
        {
          type: 'time',
          gridIndex: 0,
          axisLine: { lineStyle: { color: CHART_COLORS.border, width: 1 } },
          axisTick: { show: true, lineStyle: { color: CHART_COLORS.border }, length: 4 },
          axisLabel: {
            color: CHART_COLORS.text,
            fontSize: 11,
            margin: 8,
            hideOverlap: true,
            formatter: (value: number, index: number, extra: any) => {
              const time = dayjs(value);
              const hour = time.hour();
              const minute = time.minute();
              
              // 跨天时显示日期
              if (extra?.break && hour === 9 && minute === 30) {
                return time.format('HH:mm') + '\n' + time.format('MM-DD');
              }
              
              // 每天只显示开盘和收盘时间
              if (hour === 9 && minute === 30) {
                return time.format('MM-DD');
              }
              if (hour === 15 && minute === 0) {
                return '15:00';
              }
              
              return '';
            },
            showMinLabel: true,
            showMaxLabel: true
          },
          splitLine: { show: true, lineStyle: { color: CHART_COLORS.grid, type: 'dashed', opacity: 0.6 } },
          breaks: breakData,
          breakArea: { expandOnClick: false, zigzagAmplitude: 0, zigzagZ: 200, itemStyle: { borderColor: 'none', opacity: 0 } }
        },
        {
          type: 'time',
          gridIndex: 1,
          axisLine: { lineStyle: { color: CHART_COLORS.border, width: 1 } },
          axisTick: { show: false },
          axisLabel: { show: false },
          splitLine: { show: false },
          breaks: breakData,
          breakArea: { expandOnClick: false, zigzagAmplitude: 0, itemStyle: { opacity: 0 } }
        }
      ],
      yAxis: [
        {
          type: 'value',
          gridIndex: 0,
          position: 'left',
          min: yAxisMin,
          max: yAxisMax,
          splitNumber: 4,
          axisLabel: { fontSize: 11, color: CHART_COLORS.text, formatter: (v: number) => v.toFixed(2), margin: 8 },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: true, lineStyle: { color: CHART_COLORS.grid, type: 'dashed' } }
        },
        {
          type: 'value',
          gridIndex: 0,
          position: 'right',
          min: yAxisMin,
          max: yAxisMax,
          splitNumber: 4,
          axisLabel: {
            fontSize: 11,
            color: (value: number) => {
              const pct = ((value - previousClose) / previousClose) * 100;
              return Math.abs(pct) < 0.01 ? CHART_COLORS.flat : pct > 0 ? CHART_COLORS.rise : CHART_COLORS.fall;
            },
            formatter: (value: number) => {
              const pct = ((value - previousClose) / previousClose) * 100;
              return `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`;
            },
            margin: 8
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false }
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
      dataZoom: [{ type: 'inside', xAxisIndex: [0, 1], start: 0, end: 100 }],
      series: [
        {
          name: '价格',
          type: 'line',
          data: priceData,
          symbolSize: 0,
          smooth: false,
          sampling: 'lttb',
          lineStyle: { width: 1.5, color: isRising ? CHART_COLORS.rise : CHART_COLORS.fall },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: isRising ? 'rgba(255, 77, 79, 0.2)' : 'rgba(63, 201, 86, 0.2)' },
                { offset: 1, color: 'rgba(255, 255, 255, 0)' }
              ]
            }
          },
          markLine: {
            symbol: 'none',
            silent: true,
            label: { show: true, position: 'insideEndTop', formatter: `基准 ${previousClose.toFixed(2)}`, fontSize: 11, color: CHART_COLORS.flat },
            data: [{ yAxis: previousClose, lineStyle: { color: CHART_COLORS.flat, type: 'dashed', width: 1, opacity: 0.6 } }]
          }
        },
        {
          name: '成交量',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 2,
          data: volumeData,
          itemStyle: {
            color: (params: any) => {
              const direction = params.value[2];
              if (direction > 0) return CHART_COLORS.rise;
              if (direction < 0) return CHART_COLORS.fall;
              return CHART_COLORS.neutral;
            },
            opacity: 0.8
          },
          barMaxWidth: 4,
          barCategoryGap: '5%'
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
  }, [quoteList]);

  useLayoutEffect(() => {
    const cleanup = chartInit();
    return cleanup;
  }, [chartInit]);

  return <div ref={chartRef} className="ai-report-card-chart-container" />;
};

export default FiveDayChart;
