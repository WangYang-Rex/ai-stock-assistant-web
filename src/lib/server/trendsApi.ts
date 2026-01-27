import { post } from "./fetch";
import type { Trend } from "@/@types/trend";


// ==================== Request Interfaces (Swagger Defined) ====================

/**
 * 从东方财富 SDK 同步分时数据请求
 * POST /trends/sync-from-api
 */
export interface SyncTrendsRequest {
  /** 股票代码（如：600519） */
  code: string;
  /** 市场代码（1-上交所，0-深交所） */
  market: number;
  /** 获取天数（1-当日分时，5-5日分时，默认为1） */
  ndays?: number;
}

/**
 * 获取分时数据列表请求
 * POST /trends/list
 */
export interface TrendListRequest {
  /** 股票代码（可选） */
  code?: string;
  /** 获取最近 N 天的数据（可选，1 或 5） */
  ndays?: number;
  /** 开始时间（可选，格式：YYYY-MM-DD HH:mm） */
  startDatetime?: string;
  /** 结束时间（可选，格式：YYYY-MM-DD HH:mm） */
  endDatetime?: string;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  limit?: number;
}

/**
 * 根据代码和日期范围批量删除分时数据请求
 * POST /trends/delete-range
 */
export interface DeleteTrendRangeRequest {
  /** 股票代码 */
  code: string;
  /** 开始时间（格式：YYYY-MM-DD HH:mm） */
  startDatetime: string;
  /** 结束时间（格式：YYYY-MM-DD HH:mm） */
  endDatetime: string;
}

// ==================== Response Interfaces (Swagger Defined) ====================

/**
 * 同步结果响应
 */
export interface SyncTrendsResponseData {
  /** 已同步条数 */
  synced: number;
  /** 总条数 */
  total: number;
  /** 新增加条数 */
  newAdded: number;
}

/**
 * 分时数据列表响应
 */
export interface TrendListResponseData {
  /** 分时数据列表 */
  trends: Trend[];
  /** 总记录数 */
  total: number;
}

// ==================== API Implementation ====================

export const trendsApi = {
  /**
   * 从东方财富 SDK 同步分时数据到数据库 (POST /api/trends/sync-from-api)
   * 支持同步当日分时（ndays=1）或5日分时（ndays=5）数据到数据库（增量更新）
   */
  syncFromApi: (data: SyncTrendsRequest): Promise<SyncTrendsResponseData> => {
    return post<SyncTrendsResponseData>("/api/trends/sync-from-api", data);
  },

  /**
   * 获取分时数据列表 (POST /api/trends/list)
   * 支持分页、股票代码过滤及时间范围过滤
   */
  list: (data: TrendListRequest): Promise<TrendListResponseData> => {
    return post<TrendListResponseData>("/api/trends/list", data);
  },

  /**
   * 根据代码和日期范围批量删除分时数据 (POST /api/trends/delete-range)
   */
  deleteRange: (data: DeleteTrendRangeRequest): Promise<void> => {
    return post<void>("/api/trends/delete-range", data);
  },
};
