import { post } from "./fetch";
import type { MinuteBar } from "@/@types/minuteBar";

// ==================== Request Interfaces (Swagger Defined) ====================

/**
 * 同步单只股票分钟 K 线请求
 */
export interface SyncMinuteBarRequest {
  /** 股票代码 */
  code: string;
  /** 市场代码 (1-SH, 0-SZ) */
  market: number;
}

/**
 * 分页查询分钟 K 线列表请求
 */
export interface MinuteBarQueryDto {
  /** 股票代码 */
  code?: string;
  /** 开始日期 (YYYY-MM-DD) */
  startDate?: string;
  /** 结束日期 (YYYY-MM-DD) */
  endDate?: string;
  /** 页码 (默认 1) */
  page?: number;
  /** 每页大小 (默认 240) */
  pageSize?: number;
}

/**
 * 清理分钟 K 线请求
 */
export interface ClearMinuteBarRequest {
  /** 股票代码 */
  code: string;
  /** 目标日期 (YYYY-MM-DD) */
  date: string;
}

// ==================== API Implementation ====================

export const minuteBarApi = {
  /**
   * 同步单只股票的当日分钟 K 线 (POST /api/market/minute-bar/sync-from-api)
   */
  syncFromApi: (data: SyncMinuteBarRequest): Promise<void> => {
    return post<void>("/api/market/minute-bar/sync-from-api", data);
  },

  /**
   * 同步所有股票的当日分钟 K 线 (POST /api/market/minute-bar/sync-all-stocks)
   */
  syncAllStocks: (): Promise<void> => {
    return post<void>("/api/market/minute-bar/sync-all-stocks", {});
  },

  /**
   * 获取分钟 K 线列表 (POST /api/market/minute-bar/list)
   */
  list: (data?: MinuteBarQueryDto): Promise<MinuteBar[]> => {
    return post<MinuteBar[]>("/api/market/minute-bar/list", data || {});
  },

  /**
   * 按日期清理分钟 K 线 (POST /api/market/minute-bar/clear)
   */
  clear: (data: ClearMinuteBarRequest): Promise<void> => {
    return post<void>("/api/market/minute-bar/clear", data);
  },
};
