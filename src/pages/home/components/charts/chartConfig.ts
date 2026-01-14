/**
 * ============================================
 * 图表配置 - 共享常量和工具函数
 * ============================================
 * 专业股票图表配色方案和通用配置
 */

import type { Quote } from '@/@types/quote';

// 专业股票软件配色方案
export const CHART_COLORS = {
  rise: '#FF4D4F',       // 涨 - 红色（中国股市风格）
  fall: '#3FC956',       // 跌 - 绿色
  flat: '#888888',       // 平 - 灰色
  average: '#FFA940',    // 均线 - 橙黄色
  ma5: '#FF6B6B',        // MA5 - 红色系
  ma10: '#4ECDC4',       // MA10 - 青色系
  ma20: '#45B7D1',       // MA20 - 蓝色系
  ma60: '#9B59B6',       // MA60 - 紫色系
  bg: '#FFFFFF',         // 背景
  grid: '#E8E8E8',       // 网格线
  text: '#333333',       // 主文字
  textSecondary: '#999', // 次要文字
  border: '#D9D9D9',     // 边框
  neutral: '#999999',    // 中性：灰色
  volumeUp: 'rgba(255, 77, 79, 0.7)',   // 成交量涨
  volumeDown: 'rgba(63, 201, 86, 0.7)', // 成交量跌
};

// 分时图午休间隔 gap
export const BREAK_GAP = '1%';

/**
 * 获取分时图的时间间断数据（午休、隔天）
 * @param quoteList 行情数据列表
 * @param includeDayBreak 是否包含隔天间断（5日图需要）
 */
export const getBreakData = (quoteList: Quote[], includeDayBreak = true) => {
  const dateArr: string[] = [];
  // 遍历出所有日期，去重并排序
  quoteList.forEach(item => {
    if (item.snapshotDate && !dateArr.includes(item.snapshotDate)) {
      dateArr.push(item.snapshotDate);
    }
  });
  dateArr.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const breakDatas: any = [];
  dateArr.forEach((it, index) => {
    if (includeDayBreak && index > 0) {
      const beforeDate = dateArr[index - 1];
      // 插入隔天间断
      breakDatas.push({
        start: new Date(`${beforeDate} 15:00:00`).getTime(),
        end: new Date(`${it} 09:30:00`).getTime(),
        gap: BREAK_GAP
      });
    }
    // 插入当天11:30-13:00午休间断
    breakDatas.push({
      start: new Date(`${it} 11:30:00`).getTime(),
      end: new Date(`${it} 13:00:00`).getTime(),
      gap: 0
    });
  });
  return breakDatas;
};

/**
 * 计算分时均价（成交额 / 成交量）
 */
export const calculateAveragePrice = (quoteList: Quote[]) => {
  if (quoteList.length === 0) return [];

  let totalAmount = 0;
  let totalVolume = 0;

  return quoteList.map((quote) => {
    totalAmount += Number(quote.volumeAmount) || 0;
    totalVolume += Number(quote.volume) || 0;

    const latestPrice = Number(quote.latestPrice) || 0;
    const avgPrice = totalVolume > 0 ? totalAmount / totalVolume : latestPrice;
    return [new Date(quote.snapshotTime).getTime(), avgPrice];
  });
};

/**
 * 格式化成交量显示
 */
export const formatVolume = (value: number): string => {
  if (value >= 100000000) {
    return (value / 100000000).toFixed(1) + '亿';
  }
  if (value >= 10000) {
    return (value / 10000).toFixed(0) + '万';
  }
  return value.toFixed(0);
};

/**
 * 格式化金额显示
 */
export const formatAmount = (value: number): string => {
  if (value >= 100000000) {
    return (value / 100000000).toFixed(2) + '亿';
  }
  if (value >= 10000) {
    return (value / 10000).toFixed(2) + '万';
  }
  return value.toFixed(2);
};

/**
 * 通用 Tooltip 样式配置
 */
export const getBaseTooltipConfig = () => ({
  show: true,
  trigger: 'axis' as const,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderColor: CHART_COLORS.border,
  borderWidth: 1,
  padding: [10, 15],
  textStyle: {
    color: CHART_COLORS.text,
    fontSize: 12
  },
  axisPointer: {
    type: 'cross' as const,
    lineStyle: {
      type: 'solid' as const,
      color: CHART_COLORS.textSecondary,
      width: 1
    },
    crossStyle: {
      color: CHART_COLORS.textSecondary,
      width: 1,
      type: 'dashed' as const
    }
  }
});

/**
 * 通用网格配置 - 双图布局（主图 + 成交量）
 */
export const getDualGridConfig = () => ([
  {
    left: '3%',
    right: '3%',
    top: '2%',
    height: '65%',
    containLabel: false,
    show: true,
    borderColor: CHART_COLORS.border,
    backgroundColor: 'transparent'
  },
  {
    left: '3%',
    right: '3%',
    top: '72%',
    height: '20%',
    containLabel: false,
    show: true,
    borderColor: CHART_COLORS.border,
    backgroundColor: 'transparent'
  }
]);
