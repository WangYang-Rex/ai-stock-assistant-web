import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Area, BarChart, Bar } from "recharts";
import { motion } from "framer-motion";

// 示例数据（可直接替换为接口数据）
const priceData = [
  { date: "01-01", price: 1.32, cost: 1.35, signal: 1 },
  { date: "01-02", price: 1.34, cost: 1.35, signal: 0 },
  { date: "01-03", price: 1.36, cost: 1.35, signal: -1 },
  { date: "01-04", price: 1.33, cost: 1.35, signal: 1 },
  { date: "01-05", price: 1.38, cost: 1.35, signal: 0 }
];

const pnlData = [
  { date: "01-01", pnl: 0 },
  { date: "01-02", pnl: 120 },
  { date: "01-03", pnl: 260 },
  { date: "01-04", pnl: 180 },
  { date: "01-05", pnl: 420 }
];

const positionData = [
  { date: "01-01", position: 0.3 },
  { date: "01-02", position: 0.5 },
  { date: "01-03", position: 0.7 },
  { date: "01-04", position: 0.6 },
  { date: "01-05", position: 0.8 }
];

export default function StrategyPage() {
  return (
    <div className="p-6 grid grid-cols-12 gap-6">
      {/* 顶部策略信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-12"
      >
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">科创50 ETF 网格策略</h1>
              <p className="text-sm text-muted-foreground mt-1">
                区间 1.30 ~ 1.63 ｜ 网格 10 ｜ 单格 1000
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">回测</Button>
              <Button>实盘运行</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 汇总指标 */}
      <div className="col-span-12 grid grid-cols-4 gap-4">
        {["累计收益", "年化收益", "最大回撤", "胜率"].map((title, i) => (
          <Card key={i} className="rounded-2xl">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">{title}</div>
              <div className="text-2xl font-semibold mt-2">--</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 价格 + 成本 + 信号 叠加图 */}
      <div className="col-span-12">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <h2 className="text-base font-medium mb-2">价格 / 成本 / 交易信号</h2>
            <LineChart width={1100} height={320} data={priceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="price" name="价格" />
              <Line dataKey="cost" name="成本" strokeDasharray="5 5" />
              <Area dataKey="signal" name="交易信号" />
            </LineChart>
          </CardContent>
        </Card>
      </div>

      {/* 收益曲线 */}
      <div className="col-span-8">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <h2 className="text-base font-medium mb-2">累计收益</h2>
            <LineChart width={700} height={260} data={pnlData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="pnl" name="收益" />
            </LineChart>
          </CardContent>
        </Card>
      </div>

      {/* 仓位变化 */}
      <div className="col-span-4">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <h2 className="text-base font-medium mb-2">仓位变化</h2>
            <BarChart width={360} height={260} data={positionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="position" name="仓位" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
