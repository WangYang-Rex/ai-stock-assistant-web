import { post } from "./fetch";
import type {
  Trading,
  TradingInput,
  TradingStats,
  ApiResponse,
  DeleteTradingResponse,
  CleanOldDataResponse,
} from "@/@types/trading";

// ==================== 请求类型定义 ====================

/**
 * 批量创建交易记录请求
 */
interface BatchCreateTradingRequest {
  tradingDataList: TradingInput[];
}

/**
 * 根据股票代码获取交易记录请求
 */
interface GetTradingBySymbolRequest {
  symbol: string;
}

/**
 * 根据股票代码和时间范围获取交易记录请求
 */
interface GetTradingBySymbolAndTimeRequest {
  symbol: string;
  startTime: string;
  endTime: string;
}

/**
 * 根据交易类型获取记录请求
 */
interface GetTradingByTypeRequest {
  type: "buy" | "sell";
}

/**
 * 根据价格范围获取记录请求
 */
interface GetTradingByPriceRangeRequest {
  minPrice: number;
  maxPrice: number;
}

/**
 * 获取最新交易记录请求
 */
interface GetLatestTradingRequest {
  symbol?: string;
  limit?: number;
}

/**
 * 获取交易统计信息请求
 */
interface GetTradingStatsRequest {
  symbol?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * 更新交易记录请求
 */
interface UpdateTradingRequest {
  id: number;
  updateData: TradingInput;
}

/**
 * 删除交易记录请求
 */
interface DeleteTradingRequest {
  id: number;
}

/**
 * 清理过期数据请求
 */
interface CleanOldDataRequest {
  daysToKeep?: number;
}

// ==================== API 方法 ====================

/**
 * 交易记录 API
 * 提供交易记录的增删改查等操作
 */
export const tradingApi = {
  /**
   * 创建交易记录
   * @param data 交易记录数据
   * @returns 创建结果，包含成功标志、消息和交易记录数据
   */
  create: (data: TradingInput): Promise<ApiResponse<Trading>> => {
    return post<ApiResponse<Trading>>("/api/trading/create", data);
  },

  /**
   * 批量创建交易记录
   * @param data 包含交易记录数据列表的对象
   * @returns 创建的交易记录列表
   */
  createBatch: (data: BatchCreateTradingRequest): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/create-batch", data);
  },

  /**
   * 获取所有交易记录
   * 按交易时间降序排列
   * @returns 交易记录列表
   */
  list: (): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/list", {});
  },

  /**
   * 根据股票代码获取交易记录
   * @param data 包含股票代码的查询条件
   * @returns 该股票的交易记录列表
   */
  getBySymbol: (data: GetTradingBySymbolRequest): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/get-by-symbol", data);
  },

  /**
   * 根据股票代码和时间范围获取交易记录
   * @param data 包含股票代码、开始时间和结束时间的查询条件
   * @returns 符合条件的交易记录列表
   */
  getBySymbolAndTime: (
    data: GetTradingBySymbolAndTimeRequest
  ): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/get-by-symbol-and-time", data);
  },

  /**
   * 根据交易类型获取记录
   * @param data 包含交易类型（买入/卖出）的查询条件
   * @returns 该类型的交易记录列表
   */
  getByType: (data: GetTradingByTypeRequest): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/get-by-type", data);
  },

  /**
   * 根据价格范围获取记录
   * @param data 包含最低价格和最高价格的查询条件
   * @returns 价格在指定范围内的交易记录列表
   */
  getByPriceRange: (
    data: GetTradingByPriceRangeRequest
  ): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/get-by-price-range", data);
  },

  /**
   * 获取最新交易记录
   * @param data 可选的查询条件，包含股票代码和数量限制
   * @returns 最新的交易记录列表
   */
  getLatest: (data?: GetLatestTradingRequest): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/get-latest", data || {});
  },

  /**
   * 获取交易统计信息
   * @param data 可选的统计条件，包含股票代码、开始时间和结束时间
   * @returns 交易统计数据，包括总交易次数、总成交量、总金额等
   */
  stats: (data?: GetTradingStatsRequest): Promise<TradingStats> => {
    return post<TradingStats>("/api/trading/stats", data || {});
  },

  /**
   * 更新交易记录
   * @param data 包含交易记录 ID 和更新数据的对象
   * @returns 更新后的交易记录
   */
  update: (data: UpdateTradingRequest): Promise<Trading> => {
    return post<Trading>("/api/trading/update", data);
  },

  /**
   * 删除交易记录
   * @param data 包含交易记录 ID 的对象
   * @returns 删除操作结果，包含成功标志
   */
  delete: (data: DeleteTradingRequest): Promise<DeleteTradingResponse> => {
    return post<DeleteTradingResponse>("/api/trading/delete", data);
  },

  /**
   * 清理过期数据
   * @param data 可选的参数，指定保留最近 N 天的数据（默认 30 天）
   * @returns 清理结果，包含已删除的记录数量和操作消息
   */
  cleanOldData: (data?: CleanOldDataRequest): Promise<CleanOldDataResponse> => {
    return post<CleanOldDataResponse>("/api/trading/clean-old-data", data || {});
  },
};
