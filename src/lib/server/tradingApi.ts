import { post } from "./fetch";
import type {
  Trading,
  TradingStats,
  DeleteTradingResponse,
  CleanOldDataResponse,
} from "@/@types/trading";

// ==================== Request Interfaces (Swagger Defined) ====================

/**
 * 更新交易记录请求
 */
export interface UpdateTradingRequest {
  /** 记录 ID */
  id: number;
  /** 更新的数据 */
  updateData: Trading;
}

/**
 * 删除交易记录请求
 */
export interface DeleteTradingRequest {
  /** 记录 ID */
  id: number;
}

/**
 * 根据代码获取交易记录请求
 */
export interface GetTradingByCodeRequest {
  /** 股票代码 */
  code: string;
}

/**
 * 获取交易统计信息请求
 */
export interface GetTradingStatsRequest {
  /** 股票代码（可选） */
  code?: string;
  /** 开始时间（可选） */
  startTime?: string;
  /** 结束时间（可选） */
  endTime?: string;
}

/**
 * 清理过期数据请求
 */
export interface CleanOldDataRequest {
  /** 保留天数 */
  daysToKeep?: number;
}

// ==================== API Implementation ====================

export const tradingApi = {
  /**
   * 创建交易记录 (POST /api/trading/create)
   */
  create: (data: Trading): Promise<void> => {
    return post<void>("/api/trading/create", data);
  },

  /**
   * 更新交易记录 (POST /api/trading/update)
   */
  update: (data: UpdateTradingRequest): Promise<void> => {
    return post<void>("/api/trading/update", data);
  },

  /**
   * 删除交易记录 (POST /api/trading/delete)
   */
  delete: (data: DeleteTradingRequest): Promise<void> => {
    return post<void>("/api/trading/delete", data);
  },

  /**
   * 获取所有交易记录 (POST /api/trading/list)
   */
  list: (): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/list", {});
  },

  /**
   * 根据股票代码获取交易记录 (POST /api/trading/get-by-code)
   */
  getByCode: (data: GetTradingByCodeRequest): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/get-by-code", data);
  },

  /**
   * 获取已平仓交易 (POST /api/trading/get-closed)
   */
  getClosed: (): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/get-closed", {});
  },

  /**
   * 获取持仓中交易 (POST /api/trading/get-open)
   */
  getOpen: (): Promise<Trading[]> => {
    return post<Trading[]>("/api/trading/get-open", {});
  },

  /**
   * 获取交易统计信息 (POST /api/trading/stats)
   */
  stats: (data?: GetTradingStatsRequest): Promise<TradingStats> => {
    return post<TradingStats>("/api/trading/stats", data || {});
  },

  /**
   * 清理过期数据 (POST /api/trading/clean-old-data)
   */
  cleanOldData: (data?: CleanOldDataRequest): Promise<CleanOldDataResponse> => {
    return post<CleanOldDataResponse>("/api/trading/clean-old-data", data || {});
  },
};
