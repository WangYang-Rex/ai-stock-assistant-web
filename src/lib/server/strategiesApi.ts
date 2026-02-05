import { post } from "./fetch";
import type {
  StrategySignalDto,
  StrategySignal,
  EvaluationResult,
  BacktestResultDto,
} from "@/@types/strategy";

// ==================== Definitions (Swagger Defined) ====================

/**
 * 策略基本信息
 */
export interface StrategyInfoDto {
  /** 策略ID */
  id?: number;
  /** 策略名称 */
  name?: string;
  /** 策略代码 */
  code?: string;
  /** 股票代码 */
  symbol?: string;
  /** 状态 */
  status?: string;
  /** 配置参数 */
  params?: Record<string, any>;
}

/**
 * 策略性能指标
 */
export interface StrategyMetricsDto {
  /** 总收益率 */
  totalReturn?: number;
  /** 年化收益率 */
  annualReturn?: number;
  /** 最大回撤 */
  maxDrawdown?: number;
  /** 胜率 */
  winRate?: number;
  /** 交易次数 */
  tradeCount?: number;
}

/**
 * 价格点
 */
export interface PricePointDto {
  /** 日期 */
  date?: string;
  /** 收盘价 */
  close?: number;
}

/**
 * 交易点
 */
export interface TradePointDto {
  /** 日期 */
  date?: string;
  /** 价格 */
  price?: number;
  /** 方向 (BUY/SELL) */
  side?: "BUY" | "SELL";
  /** 是否允许 */
  allow?: boolean;
}

/**
 * 净值点
 */
export interface EquityCurvePointDto {
  /** 日期 */
  date?: string;
  /** 净值 */
  equity?: number;
}

/**
 * 策略聚合详情
 */
export interface StrategyDetailDto {
  /** 策略基本信息 */
  strategy?: StrategyInfoDto;
  /** 性能指标 */
  metrics?: StrategyMetricsDto;
  /** 价格序列 */
  priceSeries?: PricePointDto[];
  /** 交易记录 */
  trades?: TradePointDto[];
  /** 净值曲线 */
  equityCurve?: EquityCurvePointDto[];
}

/**
 * 分页查询信号请求
 */
export interface QuerySignalDto {
  /** 策略代码 */
  strategyCode?: string;
  /** 股票代码 */
  symbol?: string;
  /** 开始日期 */
  startDate?: string;
  /** 结束日期 */
  endDate?: string;
  /** 仅看允许的信号 */
  allowOnly?: boolean;
  /** 最低置信度 */
  minConfidence?: number;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  pageSize?: number;
}

/**
 * 信号列表响应
 */
export interface SignalListResponseDto {
  /** 信号列表 */
  list?: StrategySignal[];
  /** 总数 */
  total?: number;
  /** 页码 */
  page?: number;
  /** 每页大小 */
  pageSize?: number;
}

/**
 * 获取最新信号请求
 */
export interface LatestSignalDto {
  /** 数量限制 */
  limit?: number;
  /** 策略代码 */
  strategyCode?: string;
  /** 股票代码 */
  symbol?: string;
  /** 仅看允许的信号 */
  allowOnly?: boolean;
}

// ==================== Request Interfaces (Inline Defined) ====================

/**
 * 获取策略详情请求
 */
export interface GetStrategyDetailRequest {
  /** 策略ID */
  id: number;
}

/**
 * 获取信号详情请求
 */
export interface GetSignalDetailRequest {
  /** 信号ID */
  id: number;
}

/**
 * 自动评估尾盘策略请求
 */
export interface EvaluateBySymbolRequest {
  /** 股票代码 (如 588080) */
  symbol: string;
  /** 市场代码 (1-SH, 0-SZ) */
  market?: number;
}

/**
 * 历史回测请求
 */
export interface BacktestRequest {
  /** ETF 代码 */
  etfCode: string;
  /** 回测日期列表 (YYYY-MM-DD) */
  dates: string[];
}

/**
 * 规则趋势评估请求
 */
export interface EvaluateRuleTrendRequest {
  /** 股票代码 */
  code: string;
}

/**
 * 批量规则趋势评估请求
 */
export interface EvaluateRuleTrendBatchRequest {
  /** 股票代码列表 */
  codes: string[];
}

// ==================== API Implementation ====================

export const strategiesApi = {
  /**
   * 获取策略聚合详情 (POST /api/strategies/detail)
   * 一次性获取策略基本信息、配置参数、性能指标、K线行情、交易信号及净值曲线
   */
  getDetail: (data: GetStrategyDetailRequest): Promise<StrategyDetailDto> => {
    return post<StrategyDetailDto>("/api/strategies/detail", data);
  },

  /**
   * 分页查询策略信号 (POST /api/strategies/signals/query)
   */
  querySignals: (data: QuerySignalDto): Promise<SignalListResponseDto> => {
    return post<SignalListResponseDto>("/api/strategies/signals/query", data);
  },

  /**
   * 获取最新策略信号 (POST /api/strategies/signals/latest)
   */
  getLatestSignals: (data: LatestSignalDto): Promise<StrategySignal[]> => {
    return post<StrategySignal[]>("/api/strategies/signals/latest", data);
  },

  /**
   * 获取信号详情 (POST /api/strategies/signals/detail)
   */
  getSignalDetail: (data: GetSignalDetailRequest): Promise<StrategySignal> => {
    return post<StrategySignal>("/api/strategies/signals/detail", data);
  },

  /**
   * 触发尾盘战法评估 (POST /api/strategies/close-auction/evaluate)
   * 传入标的代码，系统自动同步分时数据并计算尾盘买入信号
   */
  evaluateBySymbol: (data: EvaluateBySymbolRequest): Promise<StrategySignalDto> => {
    return post<StrategySignalDto>("/api/strategies/close-auction/evaluate", data);
  },

  /**
   * 尾盘共振历史回测 (POST /api/strategies/close-auction/backtest)
   * 对指定 ETF 进行历史共振得分计算及次日收益联动分析
   */
  evaluateBacktest: (data: BacktestRequest): Promise<BacktestResultDto> => {
    return post<BacktestResultDto>("/api/strategies/close-auction/backtest", data);
  },

  /**
   * 触发规则趋势评估 (POST /api/strategies/rule-trend/evaluate)
   * 传入股票代码，计算其趋势方向、风险状态及建议仓位动作
   */
  evaluateRuleTrend: (data: EvaluateRuleTrendRequest): Promise<EvaluationResult> => {
    return post<EvaluationResult>("/api/strategies/rule-trend/evaluate", data);
  },

  /**
   * 批量触发规则趋势评估 (POST /api/strategies/rule-trend/batch-evaluate)
   */
  evaluateRuleTrendBatch: (data: EvaluateRuleTrendBatchRequest): Promise<EvaluationResult[]> => {
    return post<EvaluationResult[]>("/api/strategies/rule-trend/batch-evaluate", data);
  },
};

