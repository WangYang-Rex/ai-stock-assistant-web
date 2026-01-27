
/**
 * K线数据模型
 */
export interface Kline {
  /** 自增ID */
  id?: number;
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name?: string;
  /** K线周期 (101=日线, 102=周线, 103=月线, 1/5/15/30/60=分钟线) */
  period: number;
  /** 日期时间 (YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss) */
  date: string;
  /** 开盘价 */
  open: number;
  /** 收盘价 */
  close: number;
  /** 最高价 */
  high: number;
  /** 最低价 */
  low: number;
  /** 成交量(股) */
  volume: string;
  /** 成交额(元) */
  amount: number;
  /** 振幅(%) */
  amplitude: number;
  /** 涨跌幅(%) */
  pct: number;
  /** 涨跌额 */
  change: number;
  /** 换手率(%) */
  turnover: number;
  /** 复权类型 (0=不复权, 1=前复权, 2=后复权) */
  fqType: number;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}
