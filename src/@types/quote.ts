/**
 * 行情快照信息
 */
export type Quote = {
  /** 主键ID */
  id: number;
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name: string;
  /** 最新价 */
  price: number;
  /** 今日最高价 */
  high: number;
  /** 今日最低价 */
  low: number;
  /** 今日开盘价 */
  open: number;
  /** 昨日收盘价 */
  preClose: number;
  /** 成交量(股) */
  volume: number;
  /** 成交额(元) */
  amount: number;
  /** 涨跌幅(%) */
  pct: number;
  /** 涨跌额 */
  change: number;
  /** 换手率(%) */
  turnover: number;
  /** 总市值(元) */
  totalMarketCap: number;
  /** 流通市值(元) */
  floatMarketCap: number;
  /** 市盈率(动态) */
  pe: number;
  /** 市净率 */
  pb: number;
  /** 更新时间戳（秒） */
  updateTime: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
};

