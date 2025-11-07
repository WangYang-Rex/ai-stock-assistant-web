import { post } from "./fetch";
import type { AiSignal } from "@/@types/aisignal";

// ==================== 类型定义 ====================

/**
 * 创建AI信号记录请求
 */
interface CreateAiSignalRequest {
  symbol?: string;
  signalTime?: string;
  signalType?: "buy" | "sell" | "hold";
  confidence?: number;
  modelVersion?: string;
  description?: string;
}

/**
 * 批量创建AI信号记录请求
 */
interface BatchCreateAiSignalRequest {
  aiSignalDataList: CreateAiSignalRequest[];
}

/**
 * 根据股票代码获取AI信号记录请求
 */
interface GetAiSignalBySymbolRequest {
  symbol: string;
}

/**
 * 根据信号类型获取AI信号记录请求
 */
interface GetAiSignalByTypeRequest {
  signalType: "buy" | "sell" | "hold";
}

/**
 * 根据模型版本获取AI信号记录请求
 */
interface GetAiSignalByModelVersionRequest {
  modelVersion: string;
}

/**
 * 根据股票代码和时间范围获取AI信号记录请求
 */
interface GetAiSignalBySymbolAndTimeRequest {
  symbol: string;
  startTime: string;
  endTime: string;
}

/**
 * 根据置信度范围获取AI信号记录请求
 */
interface GetAiSignalByConfidenceRangeRequest {
  minConfidence: number;
  maxConfidence: number;
}

/**
 * 获取最新AI信号记录请求
 */
interface GetLatestAiSignalRequest {
  symbol?: string;
  limit?: number;
}

/**
 * 根据股票代码和信号类型获取记录请求
 */
interface GetAiSignalBySymbolAndTypeRequest {
  symbol: string;
  signalType: "buy" | "sell" | "hold";
}

/**
 * 获取高置信度信号请求
 */
interface GetHighConfidenceSignalsRequest {
  minConfidence?: number;
  limit?: number;
}

/**
 * 获取AI信号统计信息请求
 */
interface GetAiSignalStatsRequest {
  symbol?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * 更新AI信号记录请求
 */
interface UpdateAiSignalRequest {
  id: number;
  updateData: CreateAiSignalRequest;
}

/**
 * 删除AI信号记录请求
 */
interface DeleteAiSignalRequest {
  id: number;
}

/**
 * 清理过期数据请求
 */
interface CleanOldDataRequest {
  daysToKeep?: number;
}

// ==================== API 方法 ====================

export const aisignalApi = {
  /**
   * 创建AI信号记录
   * 创建单个AI信号记录
   */
  create: (data: CreateAiSignalRequest): Promise<AiSignal> => {
    return post<AiSignal>("/api/aisignals/create", data);
  },

  /**
   * 批量创建AI信号记录
   * 批量创建多个AI信号记录
   */
  createBatch: (
    data: BatchCreateAiSignalRequest
  ): Promise<AiSignal[]> => {
    return post<AiSignal[]>("/api/aisignals/create-batch", data);
  },

  /**
   * 获取所有AI信号记录
   * 获取所有AI信号记录列表
   */
  list: (): Promise<AiSignal[]> => {
    return post<AiSignal[]>("/api/aisignals/list", {});
  },

  /**
   * 根据股票代码获取AI信号记录
   * 根据股票代码获取相关AI信号记录
   */
  getBySymbol: (
    data: GetAiSignalBySymbolRequest
  ): Promise<AiSignal[]> => {
    return post<AiSignal[]>("/api/aisignals/get-by-symbol", data);
  },

  /**
   * 根据信号类型获取AI信号记录
   * 根据买入、卖出或持有信号类型获取AI信号记录
   */
  getBySignalType: (
    data: GetAiSignalByTypeRequest
  ): Promise<AiSignal[]> => {
    return post<AiSignal[]>("/api/aisignals/get-by-signal-type", data);
  },

  /**
   * 根据模型版本获取AI信号记录
   * 根据AI模型版本获取相关信号记录
   */
  getByModelVersion: (
    data: GetAiSignalByModelVersionRequest
  ): Promise<AiSignal[]> => {
    return post<AiSignal[]>("/api/aisignals/get-by-model-version", data);
  },

  /**
   * 根据股票代码和时间范围获取AI信号记录
   * 根据股票代码和时间范围获取相关AI信号记录
   */
  getBySymbolAndTimeRange: (
    data: GetAiSignalBySymbolAndTimeRequest
  ): Promise<AiSignal[]> => {
    return post<AiSignal[]>(
      "/api/aisignals/get-by-symbol-and-time-range",
      data
    );
  },

  /**
   * 根据置信度范围获取AI信号记录
   * 根据置信度范围获取AI信号记录
   */
  getByConfidenceRange: (
    data: GetAiSignalByConfidenceRangeRequest
  ): Promise<AiSignal[]> => {
    return post<AiSignal[]>("/api/aisignals/get-by-confidence-range", data);
  },

  /**
   * 获取最新AI信号记录
   * 获取最新的AI信号记录
   */
  getLatest: (data: GetLatestAiSignalRequest): Promise<AiSignal[]> => {
    return post<AiSignal[]>("/api/aisignals/get-latest", data);
  },

  /**
   * 根据股票代码和信号类型获取记录
   * 根据股票代码和信号类型获取AI信号记录
   */
  getBySymbolAndType: (
    data: GetAiSignalBySymbolAndTypeRequest
  ): Promise<AiSignal[]> => {
    return post<AiSignal[]>("/api/aisignals/get-by-symbol-and-type", data);
  },

  /**
   * 获取高置信度信号
   * 获取高置信度的AI信号记录
   */
  getHighConfidence: (
    data: GetHighConfidenceSignalsRequest
  ): Promise<AiSignal[]> => {
    return post<AiSignal[]>("/api/aisignals/get-high-confidence", data);
  },

  /**
   * 获取AI信号统计信息
   * 获取AI信号相关的统计信息
   */
  stats: (data: GetAiSignalStatsRequest): Promise<any> => {
    return post<any>("/api/aisignals/stats", data);
  },

  /**
   * 更新AI信号记录
   * 更新指定的AI信号记录
   */
  update: (data: UpdateAiSignalRequest): Promise<AiSignal> => {
    return post<AiSignal>("/api/aisignals/update", data);
  },

  /**
   * 删除AI信号记录
   * 删除指定的AI信号记录
   */
  delete: (data: DeleteAiSignalRequest): Promise<void> => {
    return post<void>("/api/aisignals/delete", data);
  },

  /**
   * 清理过期数据
   * 清理指定天数之前的过期AI信号数据
   */
  cleanOldData: (data?: CleanOldDataRequest): Promise<void> => {
    return post<void>("/api/aisignals/clean-old-data", data || {});
  },
};

