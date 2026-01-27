import { post } from "./fetch";
import type { Quote } from "@/@types/quote";

// ==================== 类型定义 ====================

/**
 * 行情列表分页响应
 */
interface QuotePaginatedResponse {
  quotes: Quote[];
  total: number;
}

/**
 * 行情同步请求 (单个)
 */
interface SyncStockQuotesRequest {
  code: string;
  market: number;
}

/**
 * 全量同步响应
 */
interface SyncAllStockQuotesResponse {
  message: string;
}

/**
 * 行情查询参数
 */
interface QuoteQueryDto {
  code?: string;
  startTime?: number; // 时间戳（秒）
  endTime?: number;   // 时间戳（秒）
  page?: number;
  limit?: number;
}

/**
 * 最新行情查询参数
 */
interface LatestQuoteRequest {
  code: string;
}

/**
 * 删除行情参数
 */
interface DeleteQuoteRequest {
  id: number;
}

/**
 * 排行榜查询参数
 */
interface RankingsRequest {
  limit?: number;
}

// ==================== API 方法 ====================

export const quotesApi = {
  /**
    * 同步股票快照
    * 从第三方 API 获取指定股票的最新实时行情并保存
    */
  syncStockQuotesFromAPI: (data: SyncStockQuotesRequest): Promise<boolean> => {
    return post<boolean>("/api/quotes/syncStockQuotesFromAPI", data);
  },

  /**
    * 批量同步所有股票快照
    * 异步启动全量股票行情同步任务
    */
  syncAllStockQuotes: (): Promise<SyncAllStockQuotesResponse> => {
    return post<SyncAllStockQuotesResponse>("/api/quotes/syncAllStockQuotes", {});
  },

  /**
    * 获取所有行情快照
    * 分页查询行情快照列表
    */
  list: (data?: QuoteQueryDto): Promise<QuotePaginatedResponse> => {
    return post<QuotePaginatedResponse>("/api/quotes/list", data || {});
  },

  /**
    * 获取指定股票的最新行情
    * 查询指定代码的最新一条行情快照
    */
  latest: (data: LatestQuoteRequest): Promise<Quote> => {
    return post<Quote>("/api/quotes/latest", data);
  },

  /**
    * 删除行情快照
    * 根据 ID 删除行情记录
    */
  delete: (data: DeleteQuoteRequest): Promise<void> => {
    return post<void>("/api/quotes/delete", data);
  },

  /**
    * 获取涨幅排行榜
    * 按照涨幅从高到低排序
    */
  rankingsGainers: (data?: RankingsRequest): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/rankings-gainers", data || {});
  },

  /**
    * 获取跌幅排行榜
    * 按照涨幅从低到高排序
    */
  rankingsLosers: (data?: RankingsRequest): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/rankings-losers", data || {});
  },

  /**
    * 获取成交量排行榜
    * 按照成交量从高到低排序
    */
  rankingsVolume: (data?: RankingsRequest): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/rankings-volume", data || {});
  },
};
