/**
 * 交易记录类型定义
 * 根据 Swagger API 规范定义
 */

/**
 * 交易类型枚举
 */
export type TradingType = "buy" | "sell";

/**
 * 交易记录完整实体
 * 包含所有字段，用于 API 响应
 */
export interface Trading {
  /** 交易记录 ID */
  id?: number;

  /** 股票代码 */
  symbol: string;

  /** 股票名称 */
  name: string;

  /** 交易类型：买入 (buy) 或卖出 (sell) */
  type: TradingType;

  /** 成交时间 */
  tradingTime: string;

  /** 交易数量（股） */
  quantity: number;

  /** 成交价格 */
  price: number;

  /** 交易金额（成交价格 × 数量） */
  amount: number;

  /** 关联交易 ID（用于关联买入和卖出交易） */
  relatedTradingId?: number;

  /** 备注 */
  remarks?: string;

  /** 创建时间 */
  createdAt?: string;

  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 交易记录输入类型
 * 用于创建和更新交易记录的请求
 */
export interface TradingInput {
  /** 股票代码 */
  symbol: string;

  /** 股票名称 */
  name: string;

  /** 交易类型：买入 (buy) 或卖出 (sell) */
  type: TradingType;

  /** 成交时间 */
  tradingTime: string;

  /** 交易数量（股） */
  quantity: number;

  /** 成交价格 */
  price: number;

  /** 交易金额（成交价格 × 数量） */
  amount: number;

  /** 关联交易 ID（用于关联买入和卖出交易） */
  relatedTradingId?: number;

  /** 备注 */
  remarks?: string;
}

/**
 * 交易统计信息
 */
export interface TradingStats {
  /** 总交易次数 */
  totalTrades: number;

  /** 总成交量（股） */
  totalVolume: number;

  /** 总成交金额 */
  totalAmount: number;

  /** 买入交易次数 */
  buyTrades: number;

  /** 卖出交易次数 */
  sellTrades: number;

  /** 平均成交价格 */
  avgPrice: number;
}

/**
 * 通用 API 响应类型
 */
export interface ApiResponse<T = Trading> {
  /** 请求是否成功 */
  success: boolean;

  /** 响应消息 */
  message: string;

  /** 响应数据 */
  data?: T;
}

/**
 * 删除交易记录响应
 */
export interface DeleteTradingResponse {
  /** 是否删除成功 */
  success: boolean;
}

/**
 * 清理过期数据响应
 */
export interface CleanOldDataResponse {
  /** 已删除的记录数量 */
  deletedCount: number;

  /** 操作结果消息 */
  message: string;
}
