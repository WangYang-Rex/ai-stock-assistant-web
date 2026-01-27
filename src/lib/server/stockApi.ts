import { post } from "./fetch";
import type { Stock } from "@/@types/stock";

// ==================== Request Interfaces (Swagger Defined) ====================

/**
 * 同步股票请求
 * POST /stocks/sync
 */
export interface SyncStockRequest {
  /** 股票代码（如 600519） */
  code: string;
  /** 市场代码（1-上交所、0-深交所） */
  market: number;
}

/**
 * 删除股票请求
 * POST /stocks/delete
 */
export interface DeleteStockRequest {
  /** 股票 ID */
  id: number;
}

/**
 * 股票列表请求
 * POST /stocks/list
 */
export interface StockListRequest {
  /** 市场代码（可选，1-上交所、0-深交所） */
  market?: number;
  /** 市场类型（可选，SH-上海、SZ-深圳） */
  marketType?: string;
}

/**
 * 根据代码获取股票请求
 * POST /stocks/get-by-code
 */
export interface GetStockByCodeRequest {
  /** 股票代码 */
  code: string;
}

// ==================== Response Interfaces (Swagger Defined) ====================

/**
 * 同步股票响应数据
 */
export interface SyncStockResponseData {
  /** 股票信息 */
  stock: Stock;
  /** 是否为新增股票（true-新增，false-已存在） */
  isNew: boolean;
}

/**
 * 删除股票响应数据
 */
export interface DeleteStockResponseData {
  /** 是否删除成功 */
  success: boolean;
}

// ==================== API Implementation ====================

export const stockApi = {
  /**
   * 同步股票信息 (POST /api/stocks/sync)
   * 通过 API 获取股票最新信息，若数据库中不存在则新增，存在则更新
   */
  sync: (data: SyncStockRequest): Promise<SyncStockResponseData> => {
    return post<SyncStockResponseData>("/api/stocks/sync", data);
  },

  /**
   * 获取股票列表 (POST /api/stocks/list)
   * 支持按市场或市场类型筛选股票列表
   */
  list: (data?: StockListRequest): Promise<Stock[]> => {
    return post<Stock[]>("/api/stocks/list", data || {});
  },

  /**
   * 根据股票代码获取股票 (POST /api/stocks/get-by-code)
   * 根据唯一股票代码查询股票详细信息
   */
  getByCode: (data: GetStockByCodeRequest): Promise<Stock> => {
    return post<Stock>("/api/stocks/get-by-code", data);
  },

  /**
   * 删除股票 (POST /api/stocks/delete)
   * 根据 ID 删除指定的股票记录
   */
  delete: (data: DeleteStockRequest): Promise<DeleteStockResponseData> => {
    return post<DeleteStockResponseData>("/api/stocks/delete", data);
  },
};