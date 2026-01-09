import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Radio, DatePicker } from 'antd';
import type { Stock } from '@/@types/stock';
import { quotesApi } from '@/lib/server/quoteApi';
import dayjs from 'dayjs';
import type { Quote } from '@/@types/quote';
import echarts from '@/lib/echartUtil';

const BREAK_GAP = '1%';

// 专业股票软件配色方案
const COLORS = {
  rise: '#FF4D4F',       // 涨 - 红色（更鲜艳）
  fall: '#3FC956',       // 跌 - 绿色（更柔和）
  flat: '#888888',       // 平 - 灰色
  average: '#FFA940',    // 均线 - 橙黄色
  bg: '#FFFFFF',         // 背景
  grid: '#E8E8E8',       // 网格线
  text: '#333333',       // 主文字
  textSecondary: '#999', // 次要文字
  border: '#D9D9D9',      // 边框
  neutral: '#999999',         // 中性：灰色

};

const getBreakData = (quoteList: Quote[]) => {
  const dateArr: string[] = [];
  // 遍历出 quoteList 所有的日期，去重，并排序
  quoteList.forEach(item => {
    if (item.snapshotDate && !dateArr.includes(item.snapshotDate)) {
      dateArr.push(item.snapshotDate);
    }
  });
  dateArr.sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const breakDatas: any = [];
  dateArr.forEach((it, index) => {
    if (index > 0) {
      const beforeDate = dateArr[index - 1];
      // 插入隔天
      breakDatas.push({
        start: new Date(`${beforeDate} 15:00:00`).getTime(),
        end: new Date(`${it} 09:30:00`).getTime(),
        gap: BREAK_GAP
      })
    }
    // 插入当天11:30-13:00
    breakDatas.push({
      start: new Date(`${it} 11:30:00`).getTime(),
      end: new Date(`${it} 13:00:00`).getTime(),
      gap: 0
    })
  });
  return breakDatas;
}

// 计算分时均价
const calculateAveragePrice = (quoteList: Quote[]) => {
  if (quoteList.length === 0) return [];

  let totalAmount = 0;
  let totalVolume = 0;

  return quoteList.map((quote, index) => {
    totalAmount += Number(quote.volumeAmount) || 0;
    totalVolume += Number(quote.volume) || 0;

    const latestPrice = Number(quote.latestPrice) || 0;
    const avgPrice = totalVolume > 0 ? totalAmount / totalVolume : latestPrice;
    return [new Date(quote.snapshotTime).getTime(), avgPrice];
  });
}

/**
 * 计算todayK的起始时间
 * 如果当前时间早于当天9点，取昨天的0点0分0秒
 * 如果晚于9点，取今天的0点0分0秒
 */
const getTodayKStartTime = (): string => {
  const now = dayjs();
  const today9am = dayjs().hour(9).minute(0).second(0).millisecond(0);
  
  if (now.isBefore(today9am)) {
    // 早于9点，取昨天的0点0分0秒
    return dayjs().subtract(1, 'day').format('YYYY-MM-DD 00:00:00');
  } else {
    // 晚于9点，取今天的0点0分0秒
    return dayjs().format('YYYY-MM-DD 00:00:00');
  }
};

const QuoteChart = (props: { stock: Stock }) => {
  const { stock } = props;
  const [t, setT] = useState<string>(Date.now().toString());
  const [type, setType] = useState<string>('todayK');
  const [startTime, setStartTime] = useState<string>(getTodayKStartTime());
  const [endTime, setEndTime] = useState<string>(dayjs().format('YYYY-MM-DD 23:59:59'));
  const [quoteList, setQuoteList] = useState<Quote[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getQuoteList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stock]);

  /** 获取股票行情 */
  const getQuoteList = useCallback(async (p?: { startTime: string, endTime: string }) => {
    const today = new Date().toISOString().split('T')[0];
    const params = {
      code: stock.code,
      marketCode: stock.marketCode?.toString() || '',
      "startTime": p?.startTime || startTime,
      "endTime": p?.endTime || endTime,
      "page": 1,
      "limit": 10000
    }
    const res = await quotesApi.list(params);
    let newQuoteList = res.quotes;
    // 过滤出 09:30之后的 和 15:00之前的
    newQuoteList = newQuoteList.filter(it => {
      const todayStr = dayjs(it.snapshotTime).format('YYYY-MM-DD');
      return new Date(it.snapshotTime).getTime() >= new Date(`${todayStr} 09:30:00`).getTime() && new Date(it.snapshotTime).getTime() <= new Date(`${todayStr} 15:00:00`).getTime();
    });
    newQuoteList.sort((a, b) => {
      return new Date(a.snapshotTime || '').getTime() - new Date(b.snapshotTime || '').getTime();
    });
    setQuoteList(newQuoteList);
  }, [stock.code, stock.marketCode, startTime, endTime]);

  /** 同步当天股票行情 */
  const onRefresh = async () => {
    const res = await quotesApi.syncStockQuotesFromAPI({
      code: stock.code,
      marketCode: stock.marketCode?.toString() || '',
    });
    if (res) {
      setT(Date.now().toString());
    }
  }

  useLayoutEffect(() => {
    const cleanup = chartInit();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteList]);

  /** 初始化图表 */
  const chartInit = useCallback(() => {
    if (!chartRef.current || quoteList.length === 0) {
      return;
    }

    const previousClose = Number(quoteList[0]?.previousClosePrice) || Number(quoteList[0]?.openPrice) || 0;
    const breakData = getBreakData(quoteList);

    // 分时价格数据
    const priceData = quoteList.map(it => {
      return [new Date(it.snapshotTime).getTime(), Number(it.latestPrice) || 0];
    });

    // 分时均价数据
    const avgPriceData = calculateAveragePrice(quoteList);

    // 成交量数据 - 与前一数据点比较判断买卖方向
    const volumeData = quoteList.map((it, index) => {
      const latestPrice = Number(it.latestPrice) || 0;
      const currentVolume = Number(it.volume) || 0;
      
      // 获取前一个数据点的价格进行比较
      let priceDirection = 0; // 0:平, 1:涨, -1:跌
      if (index > 0) {
        const previousPrice = Number(quoteList[index - 1].latestPrice) || 0;
        if (latestPrice > previousPrice) {
          priceDirection = 1; // 价格上涨 - 主动买入
        } else if (latestPrice < previousPrice) {
          priceDirection = -1; // 价格下跌 - 主动卖出
        } else {
          priceDirection = 0; // 价格持平 - 中性成交
        }
      } else {
        // 第一个数据点，用昨收价作为参考
        if (previousClose) {
          priceDirection = latestPrice >= previousClose ? 1 : -1;
        }
      }
      
      return [
        new Date(it.snapshotTime).getTime(),
        currentVolume,
        priceDirection
      ];
    });

    // 计算Y轴对称范围（以昨收价为中心）
    const allPrices = quoteList.map(q => Number(q.latestPrice) || 0).filter(p => p > 0);
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : previousClose;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : previousClose;
    
    // 计算相对昨收价的最大涨跌幅
    const maxChangePercent = Math.max(
      Math.abs((maxPrice - previousClose) / previousClose),
      Math.abs((minPrice - previousClose) / previousClose)
    );
    
    // Y轴对称显示，以昨收价为中心
    const yAxisMin = previousClose * (1 - maxChangePercent * 1.1); // 增加10%余量
    const yAxisMax = previousClose * (1 + maxChangePercent * 1.1);

    // 获取最新价格用于判断整体涨跌
    const latestPrice = Number(quoteList[quoteList.length - 1]?.latestPrice) || previousClose;
    const isRising = latestPrice >= previousClose;

    // 计算关键价格点
    const highPrice = allPrices.length > 0 ? Math.max(...allPrices) : previousClose;
    const lowPrice = allPrices.length > 0 ? Math.min(...allPrices) : previousClose;
    const openPrice = Number(quoteList[0]?.latestPrice) || previousClose;

    const option = {
      backgroundColor: COLORS.bg,
      tooltip: {
        show: true,
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: COLORS.border,
        borderWidth: 1,
        padding: [10, 15],
        textStyle: {
          color: COLORS.text,
          fontSize: 12
        },
        axisPointer: {
          type: 'cross',
          lineStyle: {
            type: 'solid',
            color: COLORS.textSecondary,
            width: 1
          },
          crossStyle: {
            color: COLORS.textSecondary,
            width: 1,
            type: 'dashed'
          }
        },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';

          const time = dayjs(params[0].value[0]).format('MM-DD HH:mm');
          let result = `<div style="margin-bottom: 8px; font-weight: bold; border-bottom: 1px solid ${COLORS.grid}; padding-bottom: 6px;">${time}</div>`;

          params.forEach((param: any) => {
            if (param.seriesName === '价格') {
              const price = param.value[1];
              const change = price - previousClose;
              const changePercent = (change / previousClose) * 100;
              const color = changePercent > 0 ? COLORS.rise : changePercent < 0 ? COLORS.fall : COLORS.flat;
              const sign = changePercent > 0 ? '+' : '';
              result += `<div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${COLORS.textSecondary};">价格</span>
                <span style="margin-left: 20px;">
                  <span style="color:${color};font-weight:bold;font-size:14px;">${price.toFixed(2)}</span>
                  <span style="color:${color};margin-left:8px;font-size:12px;">${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)</span>
                </span>
              </div>`;
            } else if (param.seriesName === '均价') {
              const avgPrice = param.value[1];
              const change = avgPrice - previousClose;
              const changePercent = (change / previousClose) * 100;
              const sign = changePercent > 0 ? '+' : '';
              result += `<div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${COLORS.textSecondary};">均价</span>
                <span style="margin-left: 20px;">
                  <span style="color:${COLORS.average};font-weight:bold;">${avgPrice.toFixed(2)}</span>
                  <span style="color:${COLORS.textSecondary};margin-left:8px;font-size:12px;">${sign}${changePercent.toFixed(2)}%</span>
                </span>
              </div>`;
            } else if (param.seriesName === '成交量') {
              const volume = param.value[1];
              const direction = param.value[2];
              let color, directionText;
              if (direction > 0) {
                color = COLORS.rise;
                directionText = "买入";
              } else if (direction < 0) {
                color = COLORS.fall;
                directionText = "卖出";
              } else {
                color = COLORS.textSecondary;
                directionText = "中性";
              }
              result += `<div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${COLORS.textSecondary};">成交量(${directionText})</span>
                <span style="color:${color};margin-left:20px;font-weight:bold;">${(volume / 10000).toFixed(2)}万手</span>
              </div>`;
            }
          });

          return result;
        }
      },
      // 主图 - 分时图
      grid: [
        {
          left: '3%',
          right: '3%',
          top: '2%',
          height: '65%',
          containLabel: false,
          show: true,
          borderColor: COLORS.border,
          backgroundColor: 'transparent'
        },
        {
          left: '3%',
          right: '3%',
          top: '72%',
          height: '20%',
          containLabel: false,
          show: true,
          borderColor: COLORS.border,
          backgroundColor: 'transparent'
        }
      ],
      xAxis: [
        {
          type: 'time',
          gridIndex: 0,
          minInterval: 1000 * 60, // 最小间隔1分钟
          axisLine: {
            lineStyle: {
              color: COLORS.text
            }
          },
          axisLabel: {
            color: COLORS.text,
            fontSize: 11,
            formatter: (value: number, index: number, extra: any) => {
              const time = dayjs(value);
              const hour = time.hour();
              const minute = time.minute();
              const timeStr = time.format('HH:mm');
              
              // 跨天时显示日期
              if (extra.break) {
                return timeStr + '\n' + time.format('MM-DD');
              }
              
              // 只显示关键时间点：09:30, 11:30, 13:00, 15:00
              if ((hour === 9 && minute === 30) || 
                  (hour === 11 && minute === 30) || 
                  (hour === 13 && minute === 0) || 
                  (hour === 15 && minute === 0)) {
                return timeStr;
              }
              
              // 其他时间不显示标签
              return '';
            },
            showMinLabel: true,
            showMaxLabel: true
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: COLORS.grid,
              type: 'dashed'
            }
          },
          breaks: breakData,
          breakArea: {
            expandOnClick: false,
            zigzagAmplitude: 0,
            zigzagZ: 200,
            itemStyle: {
              borderColor: 'none',
              opacity: 0
            }
          }
        },
        {
          type: 'time',
          gridIndex: 1,
          minInterval: 1000 * 60,
          axisLine: {
            lineStyle: {
              color: COLORS.text
            }
          },
          axisLabel: {
            color: COLORS.text,
            fontSize: 11,
            formatter: (value: number) => {
              const time = dayjs(value);
              const hour = time.hour();
              const minute = time.minute();
              const timeStr = time.format('HH:mm');
              
              // 只显示关键时间点：09:30, 11:30, 13:00, 15:00
              if ((hour === 9 && minute === 30) || 
                  (hour === 11 && minute === 30) || 
                  (hour === 13 && minute === 0) || 
                  (hour === 15 && minute === 0)) {
                return timeStr;
              }
              
              return '';
            },
            showMinLabel: true,
            showMaxLabel: true
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          breaks: breakData,
          breakArea: {
            expandOnClick: false,
            zigzagAmplitude: 0,
            zigzagZ: 200,
            itemStyle: {
              borderColor: 'none',
              opacity: 0
            }
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          gridIndex: 0,
          position: 'left',
          scale: false,
          min: yAxisMin,
          max: yAxisMax,
          splitNumber: 4,
          axisLabel: {
            fontSize: 11,
            color: COLORS.text,
            formatter: (value: number) => {
              return value.toFixed(2);
            },
            margin: 8
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: (value: number) => {
                // 昨收价线用实线，其他用虚线
                return Math.abs(value - previousClose) < 0.01 ? COLORS.flat : COLORS.grid;
              },
              type: (value: number) => {
                return Math.abs(value - previousClose) < 0.01 ? 'solid' : 'dashed';
              },
              width: (value: number) => {
                return Math.abs(value - previousClose) < 0.01 ? 1.5 : 1;
              }
            }
          }
        },
        {
          type: 'value',
          gridIndex: 0,
          position: 'right',
          scale: false,
          min: yAxisMin,
          max: yAxisMax,
          splitNumber: 4,
          axisLabel: {
            fontSize: 11,
            color: (value: number) => {
              const changePercent = ((value - previousClose) / previousClose) * 100;
              if (Math.abs(changePercent) < 0.01) return COLORS.flat;
              return changePercent > 0 ? COLORS.rise : COLORS.fall;
            },
            formatter: (value: number) => {
              const changePercent = previousClose ? ((value - previousClose) / previousClose) * 100 : 0;
              const sign = changePercent > 0 ? '+' : '';
              return `${sign}${changePercent.toFixed(2)}%`;
            },
            margin: 8
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        {
          type: 'value',
          gridIndex: 1,
          scale: true,
          splitNumber: 2,
          axisLabel: {
            fontSize: 11,
            color: COLORS.textSecondary,
            formatter: (value: number) => {
              if (value >= 100000000) {
                return (value / 100000000).toFixed(1) + '亿';
              }
              if (value >= 10000) {
                return (value / 10000).toFixed(0) + '万';
              }
              return value.toFixed(0);
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: COLORS.grid,
              type: 'dashed'
            }
          }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 0,
          end: 100
        }
      ],
      series: [
        {
          name: '价格',
          type: 'line',
          data: priceData,
          symbolSize: 0,
          smooth: false, // 改为不平滑，更接近真实走势
          sampling: 'lttb', // 优化大数据量渲染
          lineStyle: {
            width: 1.5,
            color: isRising ? COLORS.rise : COLORS.fall
          },
          markLine: {
            symbol: 'none',
            silent: true,
            label: {
              show: true,
              position: 'insideEndTop',
              formatter: '昨收 {c}',
              fontSize: 11,
              color: COLORS.flat
            },
            data: [
              {
                yAxis: previousClose,
                lineStyle: {
                  color: COLORS.flat,
                  type: 'solid',
                  width: 1.5,
                  opacity: 0.8
                }
              }
            ]
          },
          markPoint: {
            symbol: 'circle',
            symbolSize: 6,
            label: {
              show: true,
              fontSize: 10,
              formatter: '{c}',
              offset: [0, -10]
            },
            data: [
              {
                name: '最高',
                value: highPrice.toFixed(2),
                coord: [priceData.find((p: any) => p[1] === highPrice)?.[0], highPrice],
                itemStyle: { color: COLORS.rise },
                label: { color: COLORS.rise }
              },
              {
                name: '最低',
                value: lowPrice.toFixed(2),
                coord: [priceData.find((p: any) => p[1] === lowPrice)?.[0], lowPrice],
                itemStyle: { color: COLORS.fall },
                label: { color: COLORS.fall }
              }
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
          lineStyle: {
            width: 1.3,
            color: COLORS.average,
            type: 'solid'
          },
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
              if (direction > 0) return COLORS.rise;      // 买入：红色
              if (direction < 0) return COLORS.fall;      // 卖出：绿色
              return COLORS.neutral || '#999999';         // 中性：灰色
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

    // 响应式调整
    const handleResize = () => {
      myChart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      myChart.dispose();
    };
  }, [quoteList]);

  // 计算实时数据
  const latestQuote = quoteList[quoteList.length - 1];
  const previousClose = Number(quoteList[0]?.previousClosePrice) || Number(quoteList[0]?.openPrice) || 0;
  const latestPrice = Number(latestQuote?.latestPrice) || previousClose || 0;
  const change = Number(latestPrice) - Number(previousClose);
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;
  const totalVolume = quoteList.reduce((sum, q) => sum + (Number(q.volume) || 0), 0);
  const totalAmount = quoteList.reduce((sum, q) => sum + (Number(q.volumeAmount) || 0), 0);

  const isPriceRising = change > 0;
  const isPriceFlat = Math.abs(change) < 0.01;
  const priceColor = isPriceFlat ? COLORS.flat : (isPriceRising ? COLORS.rise : COLORS.fall);

  return (
    <div className="stock-content-chart" key={t}>
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
            <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>最新价</span>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: priceColor,
              marginLeft: '8px'
            }}            >
              {Number(latestPrice).toFixed(2)}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>涨跌额</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: priceColor,
              marginLeft: '8px'
            }}>
              {change > 0 ? '+' : ''}{Number(change).toFixed(2)}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>涨跌幅</span>
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: priceColor,
              marginLeft: '8px'
            }}>
              {changePercent > 0 ? '+' : ''}{Number(changePercent).toFixed(2)}%
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>成交量</span>
            <span style={{ fontSize: '14px', marginLeft: '8px', fontWeight: '500' }}>
              {(totalVolume / 10000).toFixed(2)}万手
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>成交额</span>
            <span style={{ fontSize: '14px', marginLeft: '8px', fontWeight: '500' }}>
              {totalAmount >= 100000000 
                ? (totalAmount / 100000000).toFixed(2) + '亿' 
                : (totalAmount / 10000).toFixed(2) + '万'}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: COLORS.textSecondary }}>昨收</span>
            <span style={{ fontSize: '14px', marginLeft: '8px' }}>
              {Number(previousClose).toFixed(2)}
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
              setStartTime(value[0].format('YYYY-MM-DD 00:00:00'));
              setEndTime(value[1].format('YYYY-MM-DD 23:59:59'));
              getQuoteList({ startTime: value[0].format('YYYY-MM-DD 00:00:00'), endTime: value[1].format('YYYY-MM-DD 23:59:59') });
            }
          }}
        />
        <Radio.Group
          style={{ width: '300px' }}
          block
          optionType="button"
          value={type}
          onChange={(e) => {
            console.log(e.target.value);
            let _startTime = '2025-10-01 00:00:00'; // 2025-10-01 之后才有数据
            const _endTime = dayjs().format('YYYY-MM-DD 23:59:59'); // 今天
            if (e.target.value === 'todayK') {
              _startTime = getTodayKStartTime();
            } else if (e.target.value === 'fiveDaysK') {
              _startTime = dayjs().subtract(7, 'day').format('YYYY-MM-DD 00:00:00');
            }
            setStartTime(_startTime);
            setEndTime(_endTime);
            setType(e.target.value);
            getQuoteList({ startTime: _startTime, endTime: _endTime });
          }}
          options={[
            { label: '分时', value: 'todayK' },
            { label: '5日', value: 'fiveDaysK' },
            { label: '日K', value: 'dailyK' },
          ]}
        />
        <div className="t-FB1"></div>
        <Button type="primary" onClick={() => {
          onRefresh();
        }}>刷新</Button>
      </div>

      {/* 图表容器 */}
      <div ref={chartRef} className="ai-report-card-chart-container" ></div>
    </div>
  )
}

export default QuoteChart;