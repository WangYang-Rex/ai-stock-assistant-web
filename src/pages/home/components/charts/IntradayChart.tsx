import React, { useLayoutEffect, useRef, useCallback, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import echarts from '@/lib/echartUtil';
import { trendsApi } from '@/lib/server/trendsApi';
import type { Stock } from '@/@types/stock';
import type { Quote } from '@/@types/quote';
import type { Trend } from '@/@types/trend';
import { 
  CHART_COLORS, 
  getBreakData, 
  calculateAveragePrice, 
  formatVolume,
  getBaseTooltipConfig,
  getDualGridConfig
} from './chartConfig';

interface IntradayChartProps {
  stock: Stock;
}

/**
 * 分时图组件 - 专为单日分时走势优化
 */
const IntradayChart: React.FC<IntradayChartProps> = ({ stock }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [quoteList, setQuoteList] = useState<(Quote | Trend)[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await trendsApi.list({
        code: stock.code,
        ndays: 1,
        limit: 1000
      });
      const trends = res.trends || [];
      trends.sort((a, b) => {
        const timeA = 'datetime' in a ? dayjs(a.datetime).unix() : (a as any).updateTime;
        const timeB = 'datetime' in b ? dayjs(b.datetime).unix() : (b as any).updateTime;
        return timeA - timeB;
      });
      setQuoteList(trends);
    } catch (error) {
      console.error('IntradayChart fetchData failed:', error);
    } finally {
      setLoading(false);
    }
  }, [stock.code]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartInit = useCallback(() => {
    if (!chartRef.current || quoteList.length === 0) {
      return;
    }

    // 获取昨收价作为基准
    let previousClose = 0;
    const first = quoteList[0] as any;
    if ('preClose' in first && first.preClose) {
      previousClose = Number(first.preClose);
    } else if ('pct' in first) {
      // 从 Trend 计算: preClose = price / (1 + pct/100)
      previousClose = Number(first.price) / (1 + (Number(first.pct) || 0) / 100);
    } else if ('open' in first) {
      previousClose = Number(first.open);
    }

    const breakData = getBreakData(quoteList, false); // 单日不需要隔天间断

    // 分时价格数据
    const priceData = quoteList.map(it => {
      const time = 'updateTime' in it ? it.updateTime * 1000 : dayjs(it.datetime).valueOf();
      return [time, Number(it.price) || 0];
    });

    // 分时均价数据
    const avgPriceData = calculateAveragePrice(quoteList);

    // 成交量数据 - 红绿柱
    const volumeData = quoteList.map((it, index) => {
      const time = 'updateTime' in it ? it.updateTime * 1000 : dayjs(it.datetime).valueOf();
      const currentPrice = Number(it.price) || 0;
      const currentVolume = Number(it.volume) || 0;
      
      let priceDirection = 0;
      if (index > 0) {
        const prevPrice = Number(quoteList[index - 1].price) || 0;
        priceDirection = currentPrice > prevPrice ? 1 : currentPrice < prevPrice ? -1 : 0;
      } else {
        priceDirection = currentPrice >= previousClose ? 1 : -1;
      }
      
      return [time, currentVolume, priceDirection];
    });

    // 计算Y轴对称范围（以昨收价为中心）
    const allPrices = quoteList.map(q => Number(q.price) || 0).filter(p => p > 0);
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : previousClose;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : previousClose;
    
    const maxChangePercent = Math.max(
      Math.abs((maxPrice - previousClose) / (previousClose || 1)),
      Math.abs((minPrice - previousClose) / (previousClose || 1))
    );
    
    const yAxisMin = previousClose * (1 - (maxChangePercent || 0.01) * 1.1);
    const yAxisMax = previousClose * (1 + (maxChangePercent || 0.01) * 1.1);

    // 获取涨跌状态
    const latestPriceVal = Number(quoteList[quoteList.length - 1]?.price) || previousClose;
    const isRising = latestPriceVal >= previousClose;

    // 最高/最低点
    const highPriceVal = Math.max(...allPrices);
    const lowPriceVal = Math.min(...allPrices);

    const option = {
      backgroundColor: CHART_COLORS.bg,
      tooltip: {
        ...getBaseTooltipConfig(),
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';

          const time = dayjs(params[0].value[0]).format('HH:mm');
          let result = `<div style="margin-bottom: 8px; font-weight: bold; border-bottom: 1px solid ${CHART_COLORS.grid}; padding-bottom: 6px;">${time}</div>`;

          params.forEach((param: any) => {
            if (param.seriesName === '价格') {
              const price = param.value[1];
              const change = price - previousClose;
              const changePct = previousClose ? (change / previousClose) * 100 : 0;
              const color = changePct > 0 ? CHART_COLORS.rise : changePct < 0 ? CHART_COLORS.fall : CHART_COLORS.flat;
              const sign = changePct > 0 ? '+' : '';
              result += `<div style="margin-top: 6px; display: flex; justify-content: space-between;">
                <span style="color: ${CHART_COLORS.textSecondary};">价格</span>
                <span>
                  <span style="color:${color};font-weight:bold;">${price.toFixed(2)}</span>
                  <span style="color:${color};margin-left:8px;font-size:12px;">${sign}${changePct.toFixed(2)}%</span>
                </span>
              </div>`;
            } else if (param.seriesName === '均价') {
              result += `<div style="margin-top: 6px; display: flex; justify-content: space-between;">
                <span style="color: ${CHART_COLORS.textSecondary};">均价</span>
                <span style="color:${CHART_COLORS.average};font-weight:bold;">${param.value[1].toFixed(2)}</span>
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
          minInterval: 1000 * 60 * 60,
          axisLine: { lineStyle: { color: CHART_COLORS.border, width: 1 } },
          axisTick: { show: true, lineStyle: { color: CHART_COLORS.border }, length: 4 },
          axisLabel: {
            color: CHART_COLORS.text,
            fontSize: 11,
            margin: 8,
            hideOverlap: true,
            formatter: (value: number) => {
              const time = dayjs(value);
              const hour = time.hour();
              const minute = time.minute();
              const timeStr = time.format('HH:mm');
              
              // 只显示 09:30、11:30、15:00 三个关键时间点
              if (hour === 9 && minute === 30) return timeStr;   // 开盘
              if (hour === 11 && minute === 30) return timeStr;  // 午休前
              if (hour === 15 && minute === 0) return timeStr;   // 收盘
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
          interval: yAxisMax - previousClose,
          splitNumber: 2,
          axisLabel: { 
            inside: true, 
            fontSize: 10, 
            color: CHART_COLORS.text, 
            formatter: (v: number) => v.toFixed(2), 
            margin: 0,
            padding: [0, 0, 2, 4],
            verticalAlign: 'bottom'
          },
          axisLine: { show: false },
          axisTick: { show: false },
          z: 10,
          splitLine: {
            show: true,
            lineStyle: {
              color: (value: number) => Math.abs(value - previousClose) < 0.01 ? CHART_COLORS.flat : CHART_COLORS.grid,
              type: (value: number) => Math.abs(value - previousClose) < 0.01 ? 'solid' : 'dashed',
              width: (value: number) => Math.abs(value - previousClose) < 0.01 ? 1.5 : 1
            }
          }
        },
        {
          type: 'value',
          gridIndex: 0,
          position: 'right',
          min: yAxisMin,
          max: yAxisMax,
          interval: yAxisMax - previousClose,
          splitNumber: 2,
          axisLabel: {
            inside: true,
            fontSize: 10,
            color: (value: number) => {
              const pct = previousClose ? ((value - previousClose) / previousClose) * 100 : 0;
              return Math.abs(pct) < 0.01 ? CHART_COLORS.flat : pct > 0 ? CHART_COLORS.rise : CHART_COLORS.fall;
            },
            formatter: (value: number) => {
              const pct = previousClose ? ((value - previousClose) / previousClose) * 100 : 0;
              return `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`;
            },
            margin: 0,
            padding: [0, 4, 2, 0],
            verticalAlign: 'bottom'
          },
          axisLine: { show: false },
          axisTick: { show: false },
          z: 10,
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
          // markLine: {
          //   symbol: 'none',
          //   silent: true,
          //   label: { show: true, position: 'insideEndTop', formatter: `0.00%`, fontSize: 11, color: CHART_COLORS.flat },
          //   data: [{ yAxis: previousClose, lineStyle: { color: CHART_COLORS.flat, type: 'solid', width: 1.5, opacity: 0.8 } }]
          // },
          markPoint: {
            symbol: 'circle',
            symbolSize: 6,
            label: { show: true, fontSize: 10, formatter: '{c}', offset: [0, -10] },
            data: [
              { name: '最高', value: highPriceVal.toFixed(2), coord: [priceData.find((p: any) => p[1] === highPriceVal)?.[0], highPriceVal], itemStyle: { color: CHART_COLORS.rise }, label: { color: CHART_COLORS.rise } },
              { name: '最低', value: lowPriceVal.toFixed(2), coord: [priceData.find((p: any) => p[1] === lowPriceVal)?.[0], lowPriceVal], itemStyle: { color: CHART_COLORS.fall }, label: { color: CHART_COLORS.fall } }
            ]
          }
        },
        {
          name: '均价',
          type: 'line',
          data: avgPriceData,
          symbolSize: 0,
          smooth: false,
          sampling: 'lttb',
          lineStyle: { width: 1.3, color: CHART_COLORS.average, type: 'solid' },
          z: 10
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
          barMaxWidth: 8,
          barCategoryGap: '10%'
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

  return (
    <div style={{ position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          zIndex: 10
        }}>
          加载中...
        </div>
      )}
      <div ref={chartRef} className="ai-report-card-chart-container" />
    </div>
  );
};

export default IntradayChart;
