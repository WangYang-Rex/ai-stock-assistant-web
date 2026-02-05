/**
 * 股票信息
 * 严格对齐 stock.swagger.json 定义
 */
export type Stock = {
  /** 股票ID */
  id: number;
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name: string;
  /** 市场代码（1-上交所、0-深交所） */
  market: number;
  /** 市场类型（SH-上海、SZ-深圳） */
  marketType: string;
  
  /** 最新价 (原 latestPrice) */
  price: number;
  /** 涨跌幅% (原 changePercent) */
  pct: number;
  /** 涨跌额 (原 changeAmount) */
  change: number;
  
  /** 成交量(股) */
  volume: number;
  /** 成交额(元) */
  amount: number;
  /** 总市值(元) */
  totalMarketCap: number;
  /** 流通市值(元) */
  floatMarketCap: number;
  /** 换手率(%) */
  turnover: number;

  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;

  // --- 兼容旧代码的可选字段 (建议逐步迁移) ---
  /** @deprecated 请使用 price */
  latestPrice?: number;
  /** @deprecated 请使用 pct */
  changePercent?: number;
  /** @deprecated 请使用 change */
  changeAmount?: number;
  /** @deprecated 请使用 market */
  marketCode?: number;
};

/**
 * ETF 成分股信息
 * 严格对齐 stock.swagger.json 定义
 */
export type EtfConstituent = {
  /** 记录 ID */
  id: number;
  /** ETF 代码 */
  etfCode: string;
  /** 成分股代码 */
  stockCode: string;
  /** 成分股名称 */
  stockName: string;
  /** 权重 */
  weight: number;
  /** 排名 */
  rank: number;
  /** 生效日期 */
  effectiveDate: string;
  /** 失效日期 */
  expireDate: string | null;
};

