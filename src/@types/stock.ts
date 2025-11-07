/**
 * 股票信息
 */
export type Stock = {
  id: number;
  code: string;
  name?: string;
  market?: string;
  marketCode?: number;
  pe?: number;
  latestPrice?: number;
  changePercent?: number;
  changeAmount?: number;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  previousClosePrice?: number;
  volume?: number;
  holdingQuantity?: number;
  holdingCost?: number;
  marketValue?: number;
  createdAt?: string;
  updatedAt?: string;
}
