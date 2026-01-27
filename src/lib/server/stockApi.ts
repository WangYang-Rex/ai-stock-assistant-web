import { post } from "./fetch";
import type { Stock } from "@/@types/stock";

// ==================== Request Interfaces (Swagger Defined) ====================

/**
 * 同步股票请求
 * POST /stocks/sync
 */
interface SyncStockRequest {
  /** 股票代码（如 600519） */
  code: string;
  /** 市场代码（1-上交所、0-深交所） */
  market: number;
}

/**
 * 删除股票请求
 * POST /stocks/delete
 */
interface DeleteStockRequest {
  /** 股票 ID */
  id: number;
}

/**
 * 股票列表请求
 * POST /stocks/list
 */
interface StockListRequest {
  /** 市场代码（可选，1-上交所、0-深交所） */
  market?: number;
  /** 市场类型（可选，SH-上海、SZ-深圳） */
  marketType?: string;
  
  // 分页参数 (Swagger 未定义但系统可能支持)
  page?: number;
  limit?: number;
}

/**
 * 根据代码获取股票请求
 * POST /stocks/get-by-code
 */
interface GetStockByCodeRequest {
  /** 股票代码 */
  code: string;
}

// ==================== Response Interfaces (Swagger Defined) ====================

interface SyncStockResponseData {
  stock: Stock;
  /** 是否为新增股票（true-新增，false-已存在） */
  isNew: boolean;
}

interface DeleteStockResponseData {
  /** 是否删除成功 */
  success: boolean;
}

// ==================== API Implementation ====================

export const stockApi = {
  // -------------------- Swagger Defined Methods --------------------

  /**
   * 同步股票信息 (POST /stocks/sync)
   */
  sync: (data: SyncStockRequest): Promise<SyncStockResponseData> => {
    return post<SyncStockResponseData>("/api/stocks/sync", data);
  },

  /**
   * 获取股票列表 (POST /stocks/list)
   * 优化：对返回数据进行简单的预处理或类型校验
   */
  list: async (data?: StockListRequest): Promise<Stock[]> => {
    const stocks = await post<Stock[]>("/api/stocks/list", data || {});
    // 处理旧数据兼容逻辑（如果后端返回了新字段，我们也保留旧字段名的引用以防 UI 崩溃）
    return (stocks || []).map(item => ({
      ...item,
      latestPrice: item.price,
      changePercent: item.pct,
      changeAmount: item.change,
    }));
  },

  /**
   * 根据股票代码获取股票 (POST /stocks/get-by-code)
   */
  getByCode: async (data: GetStockByCodeRequest): Promise<Stock> => {
    const stock = await post<Stock>("/api/stocks/get-by-code", data);
    return {
      ...stock,
      latestPrice: stock.price,
      changePercent: stock.pct,
      changeAmount: stock.change,
    };
  },

  /**
   * 删除股票 (POST /stocks/delete)
   */
  delete: (data: DeleteStockRequest): Promise<DeleteStockResponseData> => {
    return post<DeleteStockResponseData>("/api/stocks/delete", data);
  },
};