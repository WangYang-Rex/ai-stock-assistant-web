import React, { useEffect, useState } from 'react';
import type { Stock } from '@/@types/stock';
import { Select } from 'antd';
import StockTable from './components/stockTable';
import QuoteChart from './components/quoteChart';
import AISign from './components/aiSign';
import { stockApi } from '@/lib/server/stockApi'; 
import './home.less';

const Home = () => {
  const [selectedStock, setSelectedStock] = useState<string>('588080');
  const [stockList, setStockList] = useState<Stock[]>([]);

  useEffect(() => {
    getStockList();
  }, []);

  const getStockList = async () => {
    const res = await stockApi.list();
    debugger
    setStockList(res);
  };

  return (
    <div className="homePage main p_12">
      <div className="stock-filter mb_12">
        <Select
          placeholder="请选择"
          style={{ width: 200 }}
          value={selectedStock}
          onChange={(value: string) => {
            setSelectedStock(value);
          }}
          options={[
            { value: '588080', label: <span>科创50ETF</span> },
          ]}
        />
      </div>
      <div className="stock-content">
        <div className="stock-section">
          <div className="stock-section-title">股票信息</div>
          <StockTable />
        </div>
        <div className="stock-section">
          <div className="stock-section-title">行情图</div>
          <QuoteChart />
        </div>
        <div className="stock-section">
          <div className="stock-section-title">AI分析</div>
          <AISign />
        </div>
      </div>
    </div>
  )
}

export default Home;