import { post } from "./fetch";
import type { Quote } from "@/@types/quote";

// ==================== 类型定义 ====================

/**
 * 行情列表响应
 */
interface QuoteListResponse {
  quotes: Quote[];
  total: number;
}

/**
 * 创建行情快照请求
 */
interface CreateQuoteRequest {
  code: string;
  name: string;
  marketCode: string;
  latestPrice?: number;
  changePercent?: number;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  volume?: number;
  volumeAmount?: number;
  previousClosePrice?: number;
  snapshotTime?: string;
  snapshotDate?: string;
}

/**
 * 行情查询请求
 */
interface QuoteQueryRequest {
  code?: string;
  marketCode?: string;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * 根据ID获取行情请求
 */
interface GetQuoteByIdRequest {
  id: number;
}

/**
 * 获取最新行情请求
 */
interface GetLatestQuoteRequest {
  code: string;
}

/**
 * 获取历史行情请求
 */
interface GetHistoryQuoteRequest {
  code: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
}

/**
 * 根据日期获取股票行情请求
 */
interface GetQuoteByDateCodeRequest {
  code: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * 根据日期获取所有行情请求
 */
interface GetQuoteByDateRequest {
  date: string;
}

/**
 * 更新行情快照请求
 */
interface UpdateQuoteRequest {
  id: number;
  latestPrice?: number;
  changePercent?: number;
  openPrice?: number;
  volume?: number;
  volumeAmount?: number;
  previousClosePrice?: number;
  snapshotTime?: string;
  snapshotDate?: string;
}

/**
 * 删除行情快照请求
 */
interface DeleteQuoteRequest {
  id: number;
}

/**
 * 批量删除行情快照请求
 */
interface DeleteQuoteRangeRequest {
  startTime: string;
  endTime: string;
}

/**
 * 排行榜请求
 */
interface RankingsRequest {
  limit?: number;
}

/**
 * 市场统计信息
 */
export type MarketStats = {
  market?: string;
  count?: string;
  avgPrice?: string;
  maxPrice?: string;
  minPrice?: string;
};

// ==================== API 方法 ====================

export const quotesApi = {
  /**
   * 创建行情快照
   * 创建单个行情快照记录
   */
  add: (data: CreateQuoteRequest): Promise<Quote> => {
    return post<Quote>("/api/quotes/add", data);
  },

  /**
   * 批量创建行情快照
   * 批量创建多个行情快照记录
   */
  batchAdd: (data: CreateQuoteRequest[]): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/batchAdd", data);
  },

  /**
   * 获取所有行情快照
   * 根据查询条件获取行情快照列表
   */
  list: (data?: QuoteQueryRequest): Promise<QuoteListResponse> => {
    return post<QuoteListResponse>("/api/quotes/list", data || {});
  },

  /**
   * 根据ID获取行情快照
   * 根据ID获取单个行情快照
   */
  one: (data: GetQuoteByIdRequest): Promise<Quote> => {
    return post<Quote>("/api/quotes/one", data);
  },

  /**
   * 获取指定股票的最新行情
   * 获取指定股票代码的最新行情快照
   */
  latest: (data: GetLatestQuoteRequest): Promise<Quote> => {
    return post<Quote>("/api/quotes/latest", data);
  },

  /**
   * 获取指定股票的历史行情
   * 获取指定股票的历史行情快照
   */
  history: (data: GetHistoryQuoteRequest): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/history", data);
  },

  /**
   * 根据日期获取指定股票的行情
   * 根据日期范围获取指定股票的行情快照
   */
  getByDateCode: (
    data: GetQuoteByDateCodeRequest
  ): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/date-code", data);
  },

  /**
   * 获取指定日期的所有行情
   * 获取指定日期的所有股票行情快照
   */
  getByDate: (data: GetQuoteByDateRequest): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/date", data);
  },

  /**
   * 更新行情快照
   * 更新指定的行情快照
   */
  update: (data: UpdateQuoteRequest): Promise<Quote> => {
    return post<Quote>("/api/quotes/update", data);
  },

  /**
   * 删除行情快照
   * 删除指定的行情快照
   */
  delete: (data: DeleteQuoteRequest): Promise<void> => {
    return post<void>("/api/quotes/delete", data);
  },

  /**
   * 批量删除指定时间范围的行情快照
   * 删除指定时间范围内的所有行情快照
   */
  deleteRange: (data: DeleteQuoteRangeRequest): Promise<void> => {
    return post<void>("/api/quotes/delete-range", data);
  },

  /**
   * 获取市场统计信息
   * 获取各市场的统计信息
   */
  statsMarket: (): Promise<MarketStats[]> => {
    return post<MarketStats[]>("/api/quotes/stats-market", {});
  },

  /**
   * 获取涨跌幅排行榜
   * 获取涨幅最大的股票排行榜
   */
  rankingsGainers: (data?: RankingsRequest): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/rankings-gainers", data || {});
  },

  /**
   * 获取跌幅排行榜
   * 获取跌幅最大的股票排行榜
   */
  rankingsLosers: (data?: RankingsRequest): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/rankings-losers", data || {});
  },

  /**
   * 获取成交量排行榜
   * 获取成交量最大的股票排行榜
   */
  rankingsVolume: (data?: RankingsRequest): Promise<Quote[]> => {
    return post<Quote[]>("/api/quotes/rankings-volume", data || {});
  },

  /**
   * 同步股票快照
   * 从外部API同步股票快照数据
   */
  syncStockQuotesFromAPI: (data: {
    code: string;
    marketCode: string;
  }): Promise<boolean> => {
    return post<boolean>("/api/quotes/syncStockQuotesFromAPI", data);
  },
};

