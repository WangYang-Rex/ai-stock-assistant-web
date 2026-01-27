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
    const dateStr = dayjs(item.updateTime * 1000).format('YYYY-MM-DD');
    if (!dateArr.includes(dateStr)) {
      dateArr.push(dateStr);
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

const Quote5Daysk = (props: { stock: Stock }) => {
  const { stock } = props;
  const [quoteList, setQuoteList] = useState<Quote[]>([]);

  useEffect(() => {
    if (stock) {
      getQuoteList();
    }
  }, [stock]);

  const getQuoteList = async () => {
    const today = dayjs();
    const startTime = today.subtract(8, 'day').unix();
    const endTime = today.unix();
    
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
              if (extra.break) {
                return dayjs(value).format('HH:mm')+'\n'+dayjs(value).format('MM-DD');
              }
              return dayjs(value).format('HH:mm');
            },
            rich: {
              weak: {
                color: '#999'
              }
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

export default Quote5Daysk;