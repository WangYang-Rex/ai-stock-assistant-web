/**
 * 行情快照信息
 */
export type Quote = {
  /** 行情快照ID */
  id: number;
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name: string;
  /** 市场代码 */
  marketCode: string;
  /** 最新价 */
  latestPrice: number;
  /** 涨跌幅(%) */
  changePercent?: number;
  /** 开盘价 */
  openPrice?: number;
  /** 成交量(股) */
  volume?: number;
  /** 成交额(元) */
  volumeAmount: number;
  /** 昨收价 */
  previousClosePrice: number;
  /** 快照时间（精确到时间） */
  snapshotTime: string;
  /** 快照日期（精确到日期） */
  snapshotDate: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
};
