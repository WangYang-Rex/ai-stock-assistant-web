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
    const dateStr = dayjs(item.updateTime * 1000).format('YYYY-MM-DD');
    if (!dateArr.includes(dateStr)) {
      dateArr.push(dateStr);
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
    const today = dayjs();
    const startTime = today.startOf('day').unix();
    const endTime = today.endOf('day').unix();
    
    const params = {
      code: stock.code,
      startTime,
      endTime,
      page: 1,
      limit: 1000
    }
    const res = await quotesApi.list(params);
    let newQuoteList = res.quotes;
    
    // 过滤出 09:30之后的 和 15:00之前的
    newQuoteList = newQuoteList.filter(it => {
      const timeStr = dayjs(it.updateTime * 1000).format('HH:mm:ss');
      return timeStr >= '09:30:00' && timeStr <= '15:00:00';
    });
    
    newQuoteList.sort((a, b) => a.updateTime - b.updateTime);
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
      return [it.updateTime * 1000, it.price]
    });
    const option = {
      tooltip: {
        show: true,
        trigger: 'axis'
      },
      grid: {
        left: '3%',
        right: '4%',
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
            formatter: (value: number, _index: number, extra: any) => {
              if (!extra || !extra.break) {
                return dayjs(value).format('HH:mm');
              }
              if (extra.break.type === 'start') {
                return dayjs(extra.break.start).format('HH:mm') + '/' + dayjs(extra.break.end).format('HH:mm');
              }
              return '';
            }
          },
          breakLabelLayout: {
            moveOverlap: false
          },
          breaks: breakData,
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
      series: [
        {
          type: 'line',
          symbolSize: 0,
          data: seriesData,
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