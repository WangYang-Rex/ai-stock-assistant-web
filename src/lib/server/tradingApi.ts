import { post } from "./fetch";
import type { Trading } from "@/@types/trading";

// ==================== 类型定义 ====================

/**
 * 创建交易记录请求
 */
interface CreateTradingRequest {
  symbol?: string;
  name?: string;
  type?: "buy" | "sell";
  tradingTime?: string;
  quantity?: number;
  price?: number;
  fee?: number;
  openPrice?: number;
  changePercent?: number;
  changeAmount?: number;
  remarks?: string;
}

/**
 * 批量创建交易记录请求
 */
interface BatchCreateTradingRequest {
  tradingDataList: CreateTradingRequest[];
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
  updateData: CreateTradingRequest;
}

/**
 * 删除交易记录请求
 */
interface DeleteTradingRequest {
  id: number;
}

/**
 * 根据涨跌幅范围获取记录请求
 */
interface GetTradingByChangePercentRangeRequest {
  minChange: number;
  maxChange: number;
}

/**
 * 清理过期数据请求
 */
interface CleanOldDataRequest {
  daysToKeep?: number;
}

// ==================== API 方法 ====================

export const tradingApi = {
  /**
   * 创建交易记录
   * 创建单个交易记录
   */
  create: (data: CreateTradingRequest): Promise<Trading> => {
    return post<Trading>("/api/trading/create", data);
  },

  /**
   * 批量创建交易记录
   * 批量创建多个交易记录
   */
  createBatch: (data: BatchCreateTradingRequest): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/create-batch", data);
  },

  /**
   * 获取所有交易记录
   * 获取所有交易记录列表
   */
  list: (): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/list", {});
  },

  /**
   * 根据股票代码获取交易记录
   * 根据股票代码获取相关交易记录
   */
  getBySymbol: (
    data: GetTradingBySymbolRequest
  ): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/get-by-symbol", data);
  },

  /**
   * 根据股票代码和时间范围获取交易记录
   * 根据股票代码和时间范围获取相关交易记录
   */
  getBySymbolAndTime: (
    data: GetTradingBySymbolAndTimeRequest
  ): Promise<Trading[]> => {
    return post<Trading[]>(
      "/api/trading/get-by-symbol-and-time",
      data
    );
  },

  /**
   * 根据交易类型获取记录
   * 根据买入或卖出类型获取交易记录
   */
  getByType: (data: GetTradingByTypeRequest): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/get-by-type", data);
  },

  /**
   * 根据价格范围获取记录
   * 根据价格范围获取交易记录
   */
  getByPriceRange: (
    data: GetTradingByPriceRangeRequest
  ): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/get-by-price-range", data);
  },

  /**
   * 获取最新交易记录
   * 获取最新的交易记录
   */
  getLatest: (data?: GetLatestTradingRequest): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/get-latest", data || {});
  },

  /**
   * 获取交易统计信息
   * 获取交易相关的统计信息
   */
  stats: (data?: GetTradingStatsRequest): Promise<any> => {
    return post<any>("/api/trading/stats", data || {});
  },

  /**
   * 更新交易记录
   * 更新指定的交易记录
   */
  update: (data: UpdateTradingRequest): Promise<Trading> => {
    return post<Trading>("/api/trading/update", data);
  },

  /**
   * 删除交易记录
   * 删除指定的交易记录
   */
  delete: (data: DeleteTradingRequest): Promise<void> => {
    return post<void>("/api/trading/delete", data);
  },

  /**
   * 根据涨跌幅范围获取记录
   * 根据涨跌幅范围获取交易记录
   */
  getByChangePercentRange: (
    data: GetTradingByChangePercentRangeRequest
  ): Promise<Trading[]> => {
    return post<Trading[]>(
      "/api/trading/get-by-change-percent-range",
      data
    );
  },

  /**
   * 清理过期数据
   * 清理指定天数之前的过期交易数据
   */
  cleanOldData: (data?: CleanOldDataRequest): Promise<void> => {
    return post<void>("/api/trading/clean-old-data", data || {});
  },
};

