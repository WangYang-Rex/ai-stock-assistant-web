
/**
 * 尾盘策略评估结果
 */
export interface StrategySignalDto {
  /** 策略名称 */
  strategy?: string;
  /** 股票代码 */
  symbol?: string;
  /** 是否允许交易 */
  allow?: boolean;
  /** 置信度 (0-100) */
  confidence?: number;
  /** 评估原因 */
  reasons?: string[];
  /** 评估时间 */
  evaluatedAt?: string;
}

/**
 * 策略信号实体
 */
export interface StrategySignal {
  /** 信号ID */
  id?: number;
  /** 策略代码 */
  strategyCode?: string;
  /** 股票代码 */
  symbol?: string;
  /** 交易日期 */
  tradeDate?: string;
  /** 是否允许 (0/1) */
  allow?: number;
  /** 置信度 */
  confidence?: number;
  /** 评估原因 */
  reasons?: string[];
  /** 评估时间 */
  evalTime?: string;
  /** 价格 */
  price?: number;
  /** VWAP */
  vwap?: number;
  /** 成交量 */
  volume?: number;
  /** 额外信息 */
  extra?: Record<string, any>;
}
