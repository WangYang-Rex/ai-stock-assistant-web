
/**
 * 交易记录信息
 */
export type Trading = {
  id?: number;
  symbol: string;
  name?: string;
  type: "buy" | "sell";
  tradingTime?: string;
  quantity?: number;
  price?: number;
  fee?: number;
  openPrice?: number;
  changePercent?: number;
  changeAmount?: number;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
};
