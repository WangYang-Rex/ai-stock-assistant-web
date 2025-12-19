import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Radio, DatePicker } from 'antd';
import type { Stock } from '@/@types/stock';
import { quotesApi } from '@/lib/server/quoteApi';
import dayjs from 'dayjs';
import type { Quote } from '@/@types/quote';
import echarts from '@/lib/echartUtil';

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


const QuoteChart = (props: { stock: Stock }) => {
  const { stock } = props;
  const [t, setT] = useState<string>(Date.now().toString());
  const [type, setType] = useState<string>('todayK');
  const [startTime, setStartTime] = useState<string>(dayjs().format('YYYY-MM-DD 00:00:00'));
  const [endTime, setEndTime] = useState<string>(dayjs().format('YYYY-MM-DD 23:59:59'));
  const [quoteList, setQuoteList] = useState<Quote[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getQuoteList();
  }, [stock]);

  /** 获取股票行情 */
  const getQuoteList = async (p?: { startTime: string, endTime: string }) => {
    const today = new Date().toISOString().split('T')[0];
    const params = {
      code: stock.code,
      marketCode: stock.marketCode?.toString() || '',
      "startTime": p?.startTime || startTime, // '2025-11-10 00:00:00', // 
      "endTime": p?.endTime || endTime, // '2025-11-10 23:59:59', //
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
  }

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
    chartInit()
  }, [quoteList]);

  /** 初始化图表 */
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
                return dayjs(value).format('HH:mm') + '\n' + dayjs(value).format('MM-DD');
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
    <div className="stock-content-chart" key={t}>
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
              _startTime = dayjs().format('YYYY-MM-DD 00:00:00');
            } else if (e.target.value === 'fiveDaysK') {
              _startTime = dayjs().subtract(7, 'day').format('YYYY-MM-DD 00:00:00');
            }
            setStartTime(_startTime);
            setEndTime(_endTime);
            setType(e.target.value);
            getQuoteList({ startTime: _startTime, endTime: _endTime });
          }}
          options={[
            { label: '今日', value: 'todayK' },
            { label: '5日', value: 'fiveDaysK' },
            { label: '日K', value: 'dailyK' },
          ]}
        />
        <div className="t-FB1"></div>
        <Button type="primary" onClick={() => {
          onRefresh();
        }}>刷新</Button>
      </div>
      <div ref={chartRef} className="ai-report-card-chart-container" ></div>
    </div>
  )
}

export default QuoteChart;