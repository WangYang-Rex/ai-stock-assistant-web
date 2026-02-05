import { post } from "./fetch";
import type { Quote } from "@/@types/quote";

// ==================== Request Interfaces (Swagger Defined) ====================

/**
 * 同步股票快照请求
 * POST /api/quotes/syncStockQuotesFromAPI
 */
export interface SyncStockQuotesRequest {
  /** 股票代码 */
  code: string;
  /** 市场代码 */
  market: number;
}

/**
 * 行情查询参数
 * POST /api/quotes/list
 */
export interface QuoteQueryDto {
  /** 股票代码 */
  code?: string;
  /** 开始时间戳（秒） */
  startTime?: number;
  /** 结束时间戳（秒） */
  endTime?: number;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  limit?: number;
}

/**
 * 获取最新行情请求
 * POST /api/quotes/latest
 */
export interface LatestQuoteRequest {
  /** 股票代码 */
  code: string;
}

/**
 * 删除行情请求
 * POST /api/quotes/delete
 */
export interface DeleteQuoteRequest {
  /** 行情 ID */
  id: number;
}

/**
 * 排行榜查询参数
 * POST /api/quotes/rankings-*
 */
export interface RankingsRequest {
  /** 返回数量 */
  limit?: number;
}

// ==================== Response Interfaces (Swagger Defined) ====================

/**
 * 行情列表分页响应数据
 */
export interface QuotePaginatedResponse {
  /** 行情列表 */
  quotes: Quote[];
  /** 总数 */
  total: number;
}

/**
 * 批量同步响应数据
 */
export interface SyncAllStockQuotesResponse {
  /** 提示消息 */
  message: string;
}

// ==================== API Implementation ====================

export const quotesApi = {
  /**
   * 同步股票快照 (POST /api/quotes/syncStockQuotesFromAPI)
   * 从第三方 API 获取指定股票的最新实时行情并保存
   */
  syncStockQuotesFromAPI: (data: SyncStockQuotesRequest): Promise<boolean> => {
    return post<boolean>("/api/quotes/syncStockQuotesFromAPI", data);
  },

  /**
   * 批量同步所有股票快照 (POST /api/quotes/syncAllStockQuotes)
   * 异步启动全量股票行情同步任务
   */
  syncAllStockQuotes: (): Promise<SyncAllStockQuotesResponse> => {
    return post<SyncAllStockQuotesResponse>("/api/quotes/syncAllStockQuotes", {});
  },

  /**
   * 获取所有行情快照 (POST /api/quotes/list)
   * 分页查询行情快照列表
   */
  list: (data?: QuoteQueryDto): Promise<QuotePaginatedResponse> => {
    return post<QuotePaginatedResponse>("/api/quotes/list", data || {});
  },

  /**
   * 获取指定股票的最新行情 (POST /api/quotes/latest)
   * 查询指定代码的最新一条行情快照
   */
  latest: (data: LatestQuoteRequest): Promise<Quote> => {
    return post<Quote>("/api/quotes/latest", data);
  },

  /**
   * 删除行情快照 (POST /api/quotes/delete)
   * 根据 ID 删除行情记录
   */
  delete: (data: DeleteQuoteRequest): Promise<void> => {
    return post<void>("/api/quotes/delete", data);
  },

  /**
   * 获取涨幅排行榜 (POST /api/quotes/rankings-gainers)
   * 按照涨幅从高到低排序
   */
  rankingsGainers: (data?: RankingsRequest): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/rankings-gainers", data || {});
  },

  /**
   * 获取跌幅排行榜 (POST /api/quotes/rankings-losers)
   * 按照涨幅从低到高排序
   */
  rankingsLosers: (data?: RankingsRequest): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/rankings-losers", data || {});
  },

  /**
   * 获取成交量排行榜 (POST /api/quotes/rankings-volume)
   * 按照成交量从高到低排序
   */
  rankingsVolume: (data?: RankingsRequest): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/rankings-volume", data || {});
  },
};
