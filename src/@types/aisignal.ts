
/**
 * AI信号信息
 */
export type AiSignal = {
  id?: number;
  symbol?: string;
  signalTime?: string;
  signalType?: "buy" | "sell" | "hold";
  confidence?: number;
  modelVersion?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};