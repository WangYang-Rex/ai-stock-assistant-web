
/**
 * 行情快照信息
 */
export type Quote = {
  id?: number;
  code: string;
  name?: string;
  marketCode?: string;
  latestPrice?: number;
  changePercent?: number;
  openPrice?: number;
  volume?: number;
  volumeAmount?: number;
  previousClosePrice?: number;
  snapshotTime?: string;
  snapshotDate?: string;
  createdAt?: string;
  updatedAt?: string;
};