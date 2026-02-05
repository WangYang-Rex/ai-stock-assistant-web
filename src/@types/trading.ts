/**
 * 交易记录类型定义
 * 严格对齐 trading.swagger.json 定义
 */

/**
 * 交易记录实体
 */
export interface Trading {
  /** 交易记录 ID */
  id?: number;
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name: string;
  /** 买入日期 */
  buy_date?: string;
  /** 买入价格 */
  buy_price?: number;
  /** 买入数量 */
  buy_volume?: number;
  /** 卖出日期 */
  sell_date?: string;
  /** 卖出价格 */
  sell_price?: number;
  /** 卖出数量 */
  sell_volume?: number;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 交易统计信息
 */
export interface TradingStats {
  /** 总交易次数 */
  totalTrades: number;
  /** 总买入金额 */
  totalBuyAmount: number;
  /** 总卖出金额 */
  totalSellAmount: number;
  /** 总盈亏 */
  totalProfit: number;
}

/**
 * 删除交易记录响应
 */
export interface DeleteTradingResponse {
  /** 是否成功 */
  success: boolean;
}

/**
 * 清理过期数据响应
 */
export interface CleanOldDataResponse {
  /** 已删除的记录数量 */
  deletedCount: number;
  /** 提示消息 */
  message: string;
}
