/**
 * 股票信息
 */
export type Stock = {
  /** 股票ID */
  id: number;
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name?: string;
  /** 市场类型 */
  market?: string;
  /** 市场代码 */
  marketCode?: number;
  /** 市盈率 */
  pe?: number;
  /** 最新价 */
  latestPrice?: number;
  /** 涨跌幅(%) */
  changePercent?: number;
  /** 涨跌额 */
  changeAmount?: number;
  /** 开盘价 */
  openPrice?: number;
  /** 最高价 */
  highPrice?: number;
  /** 最低价 */
  lowPrice?: number;
  /** 昨收价 */
  previousClosePrice?: number;
  /** 成交量(股) */
  volume?: number;
  /** 持仓数量 */
  holdingQuantity?: number;
  /** 持仓成本 */
  holdingCost?: number;
  /** 市值 */
  marketValue?: number;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
};
