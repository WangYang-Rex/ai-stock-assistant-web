import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import echarts from '@/lib/echartUtil';
import type { Quote } from '@/@types/quote';
import { quotesApi } from '@/lib/server/quoteApi';
import type { Stock } from '@/@types/stock';
import dayjs from 'dayjs';

const BREAK_GAP = '1%';

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

/**
 * Generate random data, not relevant to echarts API.
 */
function generateData() {
  const seriesData: any = [];
  const breaks: any = [];

  const time = new Date('2024-04-09T00:00:00Z');
  const endTime = new Date('2024-04-12T23:59:59Z').getTime();
  const todayCloseTime = new Date();

  const roundTime = echarts.time.roundTime;

  updateDayTime(time, todayCloseTime);

  function updateDayTime(time: Date, todayCloseTime: Date): void {
    roundTime(time, 'day', true);
    todayCloseTime.setTime(time.getTime());
    time.setUTCHours(9, 30); // Open time
    todayCloseTime.setUTCHours(16, 0); // Close time
  }

  let valBreak = false;
  for (let val = 1669; time.getTime() <= endTime;) {
    let delta;
    if (valBreak) {
      delta =
        Math.floor((Math.random() - 0.5 * Math.sin(val / 1000)) * 20 * 100) /
        10;
      valBreak = false;
    } else {
      delta =
        Math.floor((Math.random() - 0.5 * Math.sin(val / 1000)) * 20 * 100) /
        100;
    }
    val = val + delta;
    val = +val.toFixed(2);
    seriesData.push([time.getTime(), val]);

    time.setMinutes(time.getMinutes() + 1);

    if (time.getTime() > todayCloseTime.getTime()) {
      // Use `NaN` to break the line.
      seriesData.push([time.getTime(), NaN]);

      const breakStart = todayCloseTime.getTime();
      time.setUTCDate(time.getUTCDate() + 1);
      updateDayTime(time, todayCloseTime);
      const breakEnd = time.getTime();

      valBreak = true;

      breaks.push({
        start: breakStart,
        end: breakEnd,
        gap: BREAK_GAP
      });
    }
  }
  return {
    seriesData: seriesData,
    breaks: breaks
  };
}

const Quote5Daysk = (props: { stock: Stock }) => {
  const { stock } = props;
  const [quoteList, setQuoteList] = useState<Quote[]>([]);

  useEffect(() => {
    if (stock) {
      getQuoteList();
    }
  }, [stock]);

  const getQuoteList = async () => {
    const today = new Date().toISOString().split('T')[0];
    const fiveDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];
    const params = {
      code: stock.code,
      marketCode: stock.marketCode?.toString() || '',
      "startTime": `${fiveDaysAgo} 00:00:00`, // `${today} 00:00:00`;
      "endTime": `${today} 23:59:59`, // `${today} 23:59:59`,
      "page": 1,
      "limit": 1000
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
  }
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    chartInit()
  }, [quoteList]);

  const chartInit = async () => {

    if (!chartRef.current) {
      return;
    }
    // const _data = generateData();

    const breakData = getBreakData(quoteList);
    const seriesData = quoteList.map(it => {
      return [new Date(it.snapshotTime).getTime(), it.latestPrice]
    });
    // const formatTime = echarts.time.format;
    // const breakData = getBreakData(quoteList);
    // const seriesData = quoteList.filter(it => !!it.snapshotTime).map(it => {
    //   return [new Date(it.snapshotTime || '').getTime(), it.latestPrice]
    // });
    const option = {
      // Choose axis ticks based on UTC time.
      // useUTC: true,
      // title: {
      //   text: 'Intraday Chart with Breaks (Single Day)',
      //   left: 'center'
      // },
      tooltip: {
        show: true,
        trigger: 'axis'
      },
      // 网格配置 - 调整图表边距
      grid: {
        left: '3%',
        right: '4%',
        // bottom: '15%',
        top: '10%',
        containLabel: true,
        show: true,
        borderColor: 'rgba(24, 144, 255, 0.1)'
      },
      xAxis: [
        {
          type: 'time',
          interval: 1000 * 60 * 30,
          axisLabel: {
            showMinLabel: true,
            showMaxLabel: true,
            formatter: (value, index, extra) => {
              // if (extra.break.type === 'start') {

              //   return dayjs(extra.break.start,).format('HH:mm') + '/' + dayjs(extra.break.end).format('HH:mm');
              // }
              if (extra.break) {
                // The third parameter is `useUTC: true`.
                return dayjs(value).format('HH:mm')+'\n'+dayjs(value).format('MM-DD');
                // return formatTime(value, '{HH}:{mm}\n{weak|{dd}d}', true);
              }
              return dayjs(value).format('HH:mm');
              // return formatTime(value, '{HH}:{mm}', true);
            },
            rich: {
              weak: {
                color: '#999'
              }
            }
          },
          breaks: breakData, // _data.breaks,
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
      yAxis: {
        type: 'value',
        min: 'dataMin'
      },
      // dataZoom: [
      //   {
      //     type: 'inside',
      //     xAxisIndex: 0
      //   },
      //   {
      //     type: 'slider',
      //     xAxisIndex: 0
      //   }
      // ],
      series: [
        {
          type: 'line',
          symbolSize: 0,
          data: seriesData, // _data.seriesData,
        }
      ]
    };

    const myChart = echarts.init(chartRef.current);
    myChart.setOption(option);
  }

  return (
    <div ref={chartRef} className="ai-report-card-chart-container" ></div>
  )
}

export default Quote5Daysk;