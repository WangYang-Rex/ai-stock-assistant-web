/**
 * ============================================
 * MinuteBarChart - 分钟K线图组件
 * ============================================
 * 显示分钟级K线蜡烛图，包含：
 * - OHLC蜡烛图
 * - 成交量柱状图
 * - 支持缩放和拖动
 */

import React, { useLayoutEffect, useRef, useCallback, useMemo, useState, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import echarts from '@/lib/echartUtil';

dayjs.extend(utc);
dayjs.extend(timezone);
import { minuteBarApi } from '@/lib/server/minuteBarApi';
import type { Stock } from '@/@types/stock';
import type { MinuteBar } from '@/@types/minuteBar';
import { 
  CHART_COLORS,
  formatVolume,
  getBaseTooltipConfig
} from './chartConfig';

interface MinuteBarChartProps {
  stock: Stock;
}

/**
 * 分钟K线图组件 - 专业蜡烛图展示
 */
const MinuteBarChart: React.FC<MinuteBarChartProps> = ({ stock }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [dataList, setDataList] = useState<MinuteBar[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await minuteBarApi.list({
        code: stock.code,
        page: 1,
        pageSize: 480, // 展示最近两天的分钟线 (240 * 2)
      });
      
      // 这里的 res 可能是 Array，也可能是包含 data 属性的对象 (取决于 API 实现)
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      
      // 按时间正序排列
      const sorted = [...list].sort((a, b) => 
        dayjs.utc(a.datetime).valueOf() - dayjs.utc(b.datetime).valueOf()
      );
      setDataList(sorted);
    } catch (error) {
      console.error('MinuteBarChart fetchData failed:', error);
    } finally {
      setLoading(false);
    }
  }, [stock.code]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const chartInit = useCallback(() => {
    if (!chartRef.current || dataList.length === 0) {
      return;
    }

    // 时间序列
    const times = dataList.map(d => dayjs.utc(d.datetime).local().format('MM-DD HH:mm'));
    
    // OHLC数据 [open, close, low, high]
    const ohlcData = dataList.map(d => [d.open, d.close, d.low, d.high]);
    
    // 成交量数据
    const volumeData = dataList.map((d) => {
      const isRising = d.close >= d.open;
      return {
        value: d.volume,
        itemStyle: { color: isRising ? CHART_COLORS.rise : CHART_COLORS.fall, opacity: 0.7 }
      };
    });

    const option = {
      backgroundColor: CHART_COLORS.bg,
      tooltip: {
        ...getBaseTooltipConfig(),
        trigger: 'axis',
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';
          
          const dataIndex = params[0].dataIndex;
          const item = dataList[dataIndex];
          if (!item) return '';
          
          const open = Number(item.open) || 0;
          const close = Number(item.close) || 0;
          const high = Number(item.high) || 0;
          const low = Number(item.low) || 0;
          const volume = Number(item.volume) || 0;
          
          const changeVal = close - open;
          const changePercent = open ? (changeVal / open) * 100 : 0;
          const color = changeVal >= 0 ? CHART_COLORS.rise : CHART_COLORS.fall;
          const sign = changeVal >= 0 ? '+' : '';
          
          let result = `<div style="margin-bottom: 8px; font-weight: bold; border-bottom: 1px solid ${CHART_COLORS.grid}; padding-bottom: 6px;">${dayjs.utc(item.datetime).local().format('YYYY-MM-DD HH:mm')}</div>`;
          
          result += `<div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; align-items: center;">`;
          result += `<span style="color:${CHART_COLORS.textSecondary}">开盘</span><span style="font-weight:500">${open.toFixed(2)}</span>`;
          result += `<span style="color:${CHART_COLORS.textSecondary}">收盘</span><span style="color:${color};font-weight:bold">${close.toFixed(2)}</span>`;
          result += `<span style="color:${CHART_COLORS.textSecondary}">最高</span><span style="color:${CHART_COLORS.rise}">${high.toFixed(2)}</span>`;
          result += `<span style="color:${CHART_COLORS.textSecondary}">最低</span><span style="color:${CHART_COLORS.fall}">${low.toFixed(2)}</span>`;
          result += `<span style="color:${CHART_COLORS.textSecondary}">涨跌</span><span style="color:${color}">${sign}${changeVal.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)</span>`;
          result += `<span style="color:${CHART_COLORS.textSecondary}">成交量</span><span>${formatVolume(volume)}</span>`;
          result += `</div>`;
          
          return result;
        }
      },
      grid: [
        {
          left: '3%',
          right: '3%',
          top: '10%',
          height: '60%',
          containLabel: false,
          show: true,
          borderColor: CHART_COLORS.border
        },
        {
          left: '3%',
          right: '3%',
          top: '75%',
          height: '15%',
          containLabel: false,
          show: true,
          borderColor: CHART_COLORS.border
        }
      ],
      xAxis: [
        {
          type: 'category',
          data: times,
          gridIndex: 0,
          axisLine: { lineStyle: { color: CHART_COLORS.border } },
          axisTick: { show: false },
          axisLabel: {
            color: CHART_COLORS.text,
            fontSize: 10,
            margin: 8,
            formatter: (value: string, index: number) => {
              // 关键时间点显示
              if (index % 30 === 0) return value;
              return '';
            }
          },
          splitLine: { show: true, lineStyle: { color: CHART_COLORS.grid, type: 'dashed', opacity: 0.5 } },
          boundaryGap: true
        },
        {
          type: 'category',
          data: times,
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
          splitLine: { show: true, lineStyle: { color: CHART_COLORS.grid, type: 'dashed' } }
        },
        {
          type: 'value',
          gridIndex: 1,
          scale: true,
          splitNumber: 2,
          axisLabel: { 
            inside: true, 
            fontSize: 10, 
            color: CHART_COLORS.textSecondary, 
            formatter: formatVolume,
            margin: 0,
            padding: [0, 0, 2, 4],
            verticalAlign: 'bottom'
          },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: true, lineStyle: { color: CHART_COLORS.grid, type: 'dashed' } }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: dataList.length > 240 ? 100 - (240 / dataList.length) * 100 : 0,
          end: 100
        },
        {
          type: 'slider',
          xAxisIndex: [0, 1],
          top: '92%',
          height: 15,
          start: dataList.length > 240 ? 100 - (240 / dataList.length) * 100 : 0,
          end: 100,
          borderColor: CHART_COLORS.border,
          fillerColor: 'rgba(59, 130, 246, 0.1)',
          handleStyle: { color: CHART_COLORS.text, borderColor: CHART_COLORS.border },
          textStyle: { color: CHART_COLORS.text, fontSize: 10 }
        }
      ],
      series: [
        {
          name: '分钟线',
          type: 'candlestick',
          data: ohlcData,
          itemStyle: {
            color: CHART_COLORS.rise,
            color0: CHART_COLORS.fall,
            borderColor: CHART_COLORS.rise,
            borderColor0: CHART_COLORS.fall
          }
        },
        {
          name: '成交量',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumeData,
          barMaxWidth: 10
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
  }, [dataList]);

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

export default MinuteBarChart;
