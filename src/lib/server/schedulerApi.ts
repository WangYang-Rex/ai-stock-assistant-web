import { get, post } from "./fetch";

// ==================== Response Interfaces (Swagger Defined) ====================

/**
 * 定时任务状态信息
 */
export interface SchedulerStatusResponse {
  /** 任务列表及其状态 */
  jobs?: Array<{
    name: string;
    nextRun: string;
    lastRun: string;
    status: string;
  }>;
  /** 调度器运行状态 */
  running: boolean;
}

/**
 * 通用触发任务响应
 */
export interface TriggerJobResponse {
  /** 提示消息 */
  message: string;
}

// ==================== API Implementation ====================

export const schedulerApi = {
  /**
   * 获取定时任务状态 (GET /api/scheduler/status)
   */
  getStatus: (): Promise<SchedulerStatusResponse> => {
    return get<SchedulerStatusResponse>("/api/scheduler/status");
  },

  /**
   * 手动触发股票数据同步 (POST /api/scheduler/trigger-sync)
   * 触发基础信息及行情快照的同步任务
   */
  triggerSync: (): Promise<TriggerJobResponse> => {
    return post<TriggerJobResponse>("/api/scheduler/trigger-sync", {});
  },

  /**
   * 手动触发分时数据同步 (POST /api/scheduler/trigger-trend-sync)
   */
  triggerTrendSync: (): Promise<TriggerJobResponse> => {
    return post<TriggerJobResponse>("/api/scheduler/trigger-trend-sync", {});
  },
};
