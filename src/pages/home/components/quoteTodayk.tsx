import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import echarts from '@/lib/echartUtil';
import type { Quote } from '@/@types/quote';
import { quotesApi } from '@/lib/server/quoteApi';
import type { Stock } from '@/@types/stock';
import dayjs from 'dayjs';

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

  return dateArr.map(it => {
    return {
      start: new Date(`${it} 11:30:00`).getTime(),
      end: new Date(`${it} 13:00:00`).getTime(),
      gap: 0
    }
  });
}

const QuoteTodayk = (props: { stock: Stock }) => {
  const { stock } = props;
  const [quoteList, setQuoteList] = useState<Quote[]>([]);

  useEffect(() => {
    if (stock) {
      getQuoteList();
    }
  }, [stock]);

  const getQuoteList = async () => {
    const today = new Date().toISOString().split('T')[0];
    const params = {
      code: stock.code,
      marketCode: stock.marketCode?.toString() || '',
      "startTime": `${today} 09:30:00`, // '2025-11-10 00:00:00', // 
      "endTime": `${today} 23:59:59`, // '2025-11-10 23:59:59', //
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
      return new Date(a.snapshotTime).getTime() - new Date(b.snapshotTime).getTime();
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

    const formatTime = echarts.time.format;
    const breakData = getBreakData(quoteList);
    const seriesData = quoteList.map(it => {
      return [new Date(it.snapshotTime).getTime(), it.latestPrice]
    });
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
              if (!extra || !extra.break) {
                return dayjs(value).format('HH:mm');
                // The third parameter is `useUTC: true`.
                return formatTime(value, '{HH}:{mm}', true);
              }
              // Only render the label on break start, but not on break end.
              if (extra.break.type === 'start') {

                return dayjs(extra.break.start,).format('HH:mm') + '/' + dayjs(extra.break.end).format('HH:mm');
              }
              return '';
            }
          },
          breakLabelLayout: {
            // Disable auto move of break labels if overlapping,
            // and use `axisLabel.formatter` to control the label display.
            moveOverlap: false
          },
          breaks: breakData,
          // breaks: [
          //   {
          //     start: _data.breakStart,
          //     end: _data.breakEnd,
          //     gap: 0
          //   }
          // ],
          breakArea: {
            expandOnClick: false,
            zigzagAmplitude: 0,
            zigzagZ: 200
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
          data: seriesData,
          // data: _data.seriesData
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

export default QuoteTodayk;