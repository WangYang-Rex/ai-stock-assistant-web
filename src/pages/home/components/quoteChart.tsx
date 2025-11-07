import React, { useEffect, useLayoutEffect, useRef } from 'react';
import echarts from '@/lib/echartUtil';

/**
 * Generate random data, not relevant to echarts API.
 */
function generateData1() {
  const seriesData: any = [];
  const time = new Date('2024-04-09T09:30:00Z');
  const endTime = new Date('2024-04-09T15:00:00Z').getTime();
  const breakStart = new Date('2024-04-09T11:30:00Z').getTime();
  const breakEnd = new Date('2024-04-09T13:00:00Z').getTime();
  for (let val = 1669; time.getTime() <= endTime;) {
    if (time.getTime() <= breakStart || time.getTime() >= breakEnd) {
      val =
        val +
        Math.floor((Math.random() - 0.5 * Math.sin(val / 1000)) * 20 * 100) /
        100;
      val = +val.toFixed(2);
      seriesData.push([time.getTime(), val]);
    }
    time.setMinutes(time.getMinutes() + 1);
  }
  return {
    seriesData: seriesData,
    breakStart: breakStart,
    breakEnd: breakEnd
  };
}

const QuoteChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    chartInit()
  }, []);

  const chartInit = async () => {
    if (!chartRef.current) {
      return;
    }

    const formatTime = echarts.time.format;
    const _data = generateData1();
    const option = {
      // Choose axis ticks based on UTC time.
      useUTC: true,
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
                // The third parameter is `useUTC: true`.
                return formatTime(value, '{HH}:{mm}', true);
              }
              // Only render the label on break start, but not on break end.
              if (extra.break.type === 'start') {
                return (
                  formatTime(extra.break.start, '{HH}:{mm}', true) +
                  '/' +
                  formatTime(extra.break.end, '{HH}:{mm}', true)
                );
              }
              return '';
            }
          },
          breakLabelLayout: {
            // Disable auto move of break labels if overlapping,
            // and use `axisLabel.formatter` to control the label display.
            moveOverlap: false
          },
          breaks: [
            {
              start: _data.breakStart,
              end: _data.breakEnd,
              gap: 0
            }
          ],
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
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: 0
        },
        {
          type: 'slider',
          xAxisIndex: 0
        }
      ],
      series: [
        {
          type: 'line',
          symbolSize: 0,
          data: _data.seriesData
        }
      ]
    };

    const myChart = echarts.init(chartRef.current);
    myChart.setOption(option);
  }

  return (
    <div className="stock-content-chart">
      <div ref={chartRef} className="ai-report-card-chart-container" ></div>
    </div>
  )
}

export default QuoteChart;