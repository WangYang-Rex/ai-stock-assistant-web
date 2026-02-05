import { get } from "./fetch";

/**
 * 健康检查响应
 */
export interface HealthCheckResponse {
  /** 整体状态 (如 "ok") */
  status: string;
  /** 数据库连接状态 (如 "connected") */
  database: string;
  /** 检查时间戳 */
  timestamp: string;
}

// ==================== API Implementation ====================

export const healthApi = {
  /**
   * 健康检查 (GET /api/health)
   * 检查服务器及数据库连接状态
   */
  check: (): Promise<HealthCheckResponse> => {
    return get<HealthCheckResponse>("/api/health");
  },
};
