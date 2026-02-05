
/**
 * 分钟 K 线数据实体
 * 严格对齐 minute-bar.swagger.json 定义
 */
export interface MinuteBar {
  /** 主键 ID */
  id?: number;
  /** 股票代码 */
  code: string;
  /** 日期时间 (YYYY-MM-DD HH:mm:ss) */
  datetime: string;
  /** 开盘价 */
  open: number;
  /** 收盘价 */
  close: number;
  /** 最高价 */
  high: number;
  /** 最低价 */
  low: number;
  /** 成交量 (手/股) */
  volume: number;
  /** 成交额 (元) */
  amount: number;
}
