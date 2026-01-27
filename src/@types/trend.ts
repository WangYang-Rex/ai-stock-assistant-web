
/**
 * 分时数据实体
 */
export interface Trend {
  /** 主键ID */
  id: number;
  /** 股票代码 */
  code: string;
  /** 股票名称 */
  name: string;
  /** 日期时间（YYYY-MM-DD HH:mm 格式） */
  datetime: string;
  /** 当前价格 */
  price: number;
  /** 均价 */
  avgPrice: number;
  /** 成交量（股） */
  volume: number;
  /** 成交额（元） */
  amount: number;
  /** 涨跌幅（%） */
  pct: number;
  /** 系统创建时间 */
  createdAt: string;
  /** 系统更新时间 */
  updatedAt: string;
}