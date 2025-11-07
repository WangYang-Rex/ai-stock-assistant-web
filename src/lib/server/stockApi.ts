import { post } from "./fetch";
import type { Stock } from "@/@types/stock";

/**
 * 同步股票请求
 */
interface SyncStockRequest {
  code: string;
  marketCode: number;
}

/**
 * 删除股票请求
 */
interface DeleteStockRequest {
  id: number;
}

/**
 * 股票列表请求
 */
interface StockListRequest {
  market?: string;
  marketCode?: number;
  page?: number;
  limit?: number;
}

/**
 * 根据代码获取股票请求
 */
interface GetStockByCodeRequest {
  code: string;
}

/**
 * 更新股票价格请求
 */
interface UpdateStockPriceRequest {
  code: string;
  latestPrice?: number;
  previousClosePrice?: number;
  changePercent?: number;
  changeAmount?: number;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  volume?: number;
  pe?: number;
}

/**
 * 更新持仓信息请求
 */
interface UpdateHoldingRequest {
  code: string;
  holdingQuantity?: number;
  holdingCost?: number;
}

/**
 * 计算市值请求
 */
interface CalculateMarketValueRequest {
  code: string;
}

/**
 * 批量更新股票请求
 */
interface BatchUpdateStocksRequest {
  updates: Array<{
    code: string;
    updateData: Partial<Stock>;
  }>;
}

/**
 * 更新市盈率请求
 */
interface UpdatePERequest {
  code: string;
  pe: number;
}

/**
 * 更新成交量请求
 */
interface UpdateVolumeRequest {
  code: string;
  volume: number;
}

// ==================== API 方法 ====================

export const stockApi = {
  /**
   * 同步股票信息
   * 通过API获取股票信息，不存在则新增，存在则更新
   */
  sync: (data: SyncStockRequest): Promise<Stock> => {
    return post<Stock>("/api/stocks/sync", data);
  },

  /**
   * 删除股票
   * 根据ID删除股票
   */
  delete: (data: DeleteStockRequest): Promise<void> => {
    return post<void>("/api/stocks/delete", data);
  },

  /**
   * 获取股票列表
   * 获取所有股票或根据条件筛选
   */
  list: (data?: StockListRequest): Promise<Stock[]> => {
    return post<Stock[]>("/api/stocks/list", data || {});
  },

  /**
   * 根据代码获取股票
   * 根据股票代码获取股票信息
   */
  getByCode: (data: GetStockByCodeRequest): Promise<Stock> => {
    return post<Stock>("/api/stocks/get-by-code", data);
  },

  /**
   * 更新股票价格信息
   * 更新股票的价格相关数据
   */
  updatePrice: (data: UpdateStockPriceRequest): Promise<Stock> => {
    return post<Stock>("/api/stocks/update-price", data);
  },

  /**
   * 更新持仓信息
   * 更新股票的持仓数量和成本信息
   */
  updateHolding: (data: UpdateHoldingRequest): Promise<Stock> => {
    return post<Stock>("/api/stocks/update-holding", data);
  },

  /**
   * 计算市值
   * 根据持仓数量和当前价格计算市值
   */
  calculateMarketValue: (
    data: CalculateMarketValueRequest
  ): Promise<Stock> => {
    return post<Stock>("/api/stocks/calculate-market-value", data);
  },

  /**
   * 获取持仓股票列表
   * 获取所有持仓的股票列表
   */
  holdings: (): Promise<Stock[]> => {
    return post<Stock[]>("/api/stocks/holdings", {});
  },

  /**
   * 批量更新股票信息
   * 批量更新多个股票的信息
   */
  batchUpdate: (data: BatchUpdateStocksRequest): Promise<Stock[]> => {
    return post<Stock[]>("/api/stocks/batch-update", data);
  },

  /**
   * 更新市盈率
   * 更新指定股票的市盈率
   */
  updatePE: (data: UpdatePERequest): Promise<Stock> => {
    return post<Stock>("/api/stocks/update-pe", data);
  },

  /**
   * 更新成交量
   * 更新指定股票的成交量
   */
  updateVolume: (data: UpdateVolumeRequest): Promise<Stock> => {
    return post<Stock>("/api/stocks/update-volume", data);
  },

  /**
   * 获取股票统计信息
   * 获取股票相关的统计信息概览
   */
  statsOverview: (): Promise<any> => {
    return post<any>("/api/stocks/stats/overview", {});
  },
};