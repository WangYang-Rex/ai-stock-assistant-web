
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

// ==================== Rule Trend Evaluation ====================

/**
 * 规则趋势评估结果
 */
export interface EvaluationResult {
  /** 股票代码 */
  code?: string;
  /** 是否评估成功 */
  success?: boolean;
  /** 趋势结果 */
  result?: TrendResult;
  /** 风险结果 */
  risk?: RiskResult;
  /** 仓位结果 */
  position?: PositionResult;
  /** 仓位决策 */
  decision?: PositionDecision;
  /** 提示消息 */
  message?: string;
  /** 错误信息 */
  error?: string;
}

/**
 * 趋势计算结果
 */
export interface TrendResult {
  /** 趋势方向 (UP/DOWN/SIDEWAYS) */
  trend?: "UP" | "DOWN" | "SIDEWAYS";
  /** 趋势得分 */
  score?: number;
  /** 趋势强度 (WEAK/MEDIUM/STRONG) */
  strength?: "WEAK" | "MEDIUM" | "STRONG";
  /** 判读逻辑描述 */
  reasons?: string[];
  /** 数据指标快照 */
  snapshot?: TrendSnapshot;
}

/**
 * 趋势计算用快照数据
 */
export interface TrendSnapshot {
  ma5?: number;
  ma10?: number;
  ma20?: number;
  ma60?: number;
  ema20?: number;
  ema20Slope?: number;
  macd?: MacdSnapshot;
  rsi?: number;
  volumeRatio?: number;
  price?: number;
}

export interface MacdSnapshot {
  dif?: number;
  dea?: number;
  hist?: number;
}

/**
 * 风险控制结果
 */
export interface RiskResult {
  /** 是否建议止损/停步 */
  shouldStop?: boolean;
  /** 止损价格 */
  stopPrice?: number;
  /** 止损原因 */
  reason?: string;
  /** 风险评估快照 */
  snapshot?: RiskSnapshot;
}

export interface RiskSnapshot {
  atr14?: number;
  ma10?: number;
  ma20?: number;
}

/**
 * 仓位评估结果
 */
export interface PositionResult {
  /** 建议持仓比例 (0-1) */
  suggestedRatio?: number;
  /** 仓位操作指令 */
  action?: "BUY" | "SELL" | "HOLD" | "REDUCE" | "NONE";
  /** 动作解释 */
  message?: string;
}

/**
 * 具体的仓位动作决策
 */
export interface PositionDecision {
  /** 动作 (ADD/REDUCE/HOLD/STOP) */
  action?: "ADD" | "REDUCE" | "HOLD" | "STOP";
  /** 动作比例 */
  percent?: number;
  /** 决策原因 */
  reason?: string;
}

// ==================== Backtest ====================

/**
 * 共振分值详情
 */
export interface ResonanceDetailDto {
  /** 方向一致性 (0-1) */
  directionConsistency?: number;
  /** 加权强度 (0-1) */
  weightedStrength?: number;
  /** 同步比例 (0-1) */
  syncRatio?: number;
}

/**
 * 共振得分详情
 */
export interface ResonanceScoreDto {
  /** 时间戳 */
  ts?: string;
  /** 得分 (0-100) */
  score?: number;
  /** 共振方向 (UP/DOWN/NEUTRAL) */
  direction?: "UP" | "DOWN" | "NEUTRAL";
  /** 详情指标 */
  detail?: ResonanceDetailDto;
}

/**
 * 回测表现结果
 */
export interface PerformanceDto {
  /** 次日开盘收益率 */
  nextOpenReturn?: number;
  /** 次日最高收益率 */
  nextHighReturn?: number;
  /** 次日收盘收益率 */
  nextCloseReturn?: number;
  /** 是否达到盈亏平衡/获利 */
  isSuccess?: boolean;
}

/**
 * 历史回测单日详情
 */
export interface BacktestDayDetailDto {
  /** 日期 */
  date?: string;
  /** 共振得分 */
  resonance?: ResonanceScoreDto;
  /** 后续表现 */
  performance?: PerformanceDto;
}

/**
 * 历史回测聚合结果
 */
export interface BacktestResultDto {
  /** ETF 代码 */
  etfCode?: string;
  /** 开始日期 */
  startDate?: string;
  /** 结束日期 */
  endDate?: string;
  /** 总回测天数 */
  totalDays?: number;
  /** 看多天数 */
  bullishDays?: number;
  /** 看空天数 */
  bearishDays?: number;
  /** 成功命中率 (0-1) */
  hitRate?: number;
  /** 平均次日开盘收益率 */
  avgOpenReturn?: number;
  /** 平均次日盘中最高收益率 */
  avgMaxReturn?: number;
  /** 详细每日列表 */
  details?: BacktestDayDetailDto[];
}
