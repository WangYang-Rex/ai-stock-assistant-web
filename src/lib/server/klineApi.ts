import { post } from "./fetch";
import type { Kline } from "@/@types/kline";

// ==================== Request Interfaces (Swagger Defined) ====================

/**
 * 同步K线数据请求
 * POST /api/klines/sync
 */
export interface SyncKlinesRequest {
  /** 股票代码 (如 600519) */
  code: string;
  /** 
   * K线周期 
   * 可选值: 'daily', 'weekly', 'monthly', '1min', '5min', '15min', '30min', '60min'
   * 默认: 'daily'
   */
  period?: 'daily' | 'weekly' | 'monthly' | '1min' | '5min' | '15min' | '30min' | '60min';
  /** 
   * 复权类型 (0=不复权, 1=前复权, 2=后复权)
   * 默认: 1
   */
  fqType?: 0 | 1 | 2;
  /** 
   * 获取数据条数限制
   * 默认: 1000
   */
  limit?: number;
  /** 开始日期 (YYYYMMDD格式) */
  startDate?: string;
  /** 结束日期 (YYYYMMDD格式) */
  endDate?: string;
}

/**
 * 查询K线数据列表请求
 * POST /api/klines/list
 */
export interface ListKlinesRequest {
  /** 股票代码 */
  code: string;
  /** 
   * K线周期 (101=日线, 102=周线, 103=月线, 1/5/15/30/60=分钟线)
   * 默认: 101
   */
  period?: number;
  /** 开始日期 (YYYY-MM-DD) */
  startDate?: string;
  /** 结束日期 (YYYY-MM-DD) */
  endDate?: string;
  /** 
   * 页码
   * 默认: 1
   */
  page?: number;
  /** 
   * 每页数量
   * 默认: 100
   */
  limit?: number;
  /** 
   * 排序方式
   * 默认: 'DESC'
   */
  orderBy?: 'ASC' | 'DESC';
}

/**
 * 获取K线统计信息请求
 * POST /api/klines/stats
 */
export interface KlineStatsRequest {
  /** 股票代码 */
  code: string;
  /** 
   * K线周期 (101=日线, 102=周线, 103=月线, 1/5/15/30/60=分钟线)
   * 默认: 101
   */
  period?: number;
}

// ==================== Response Interfaces (Swagger Defined) ====================

/**
 * 同步K线数据响应数据
 */
export interface SyncKlinesResponseData {
  /** 已同步条数 */
  synced: number;
  /** 总条数 */
  total: number;
}

/**
 * K线数据列表响应数据
 */
export interface ListKlinesResponseData {
  /** K线数据列表 */
  data: Kline[];
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  limit: number;
}

/**
 * K线统计信息响应数据
 */
export interface KlineStatsResponseData {
  /** 统计数据内容（根据实际 API 返回结构定义，目前 Swagger 定义为 object） */
  [key: string]: any;
}

// ==================== API Implementation ====================

export const klinesApi = {
  /**
   * 同步K线数据 (POST /api/klines/sync)
   * 从外部API获取K线数据并同步到本地数据库（存在则更新，不存在则新增）
   */
  sync: (data: SyncKlinesRequest): Promise<SyncKlinesResponseData> => {
    return post<SyncKlinesResponseData>("/api/klines/sync", data);
  },

  /**
   * 查询K线数据列表 (POST /api/klines/list)
   * 分页查询本地数据库中的K线数据
   */
  list: (data: ListKlinesRequest): Promise<ListKlinesResponseData> => {
    return post<ListKlinesResponseData>("/api/klines/list", data);
  },

  /**
   * 获取K线统计信息 (POST /api/klines/stats)
   * 获取指定股票在特定周期下的K线统计数据
   */
  stats: (data: KlineStatsRequest): Promise<KlineStatsResponseData> => {
    return post<KlineStatsResponseData>("/api/klines/stats", data);
  },
};
