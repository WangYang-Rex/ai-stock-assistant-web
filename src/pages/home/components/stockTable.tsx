import React, { useEffect, useState } from 'react';
import { Space, Table, Popconfirm, message } from 'antd';
import type { TableProps } from 'antd';
import type { Stock } from '@/@types/stock';
import { stockApi } from '@/lib/server/stockApi';
import { quotesApi } from '@/lib/server/quoteApi';
import { trendsApi } from '@/lib/server/trendsApi';
import { klinesApi } from '@/lib/server/klineApi';

/**
 * StockTable 组件属性
 */
interface StockTableProps {

  /** 删除股票回调 */
  onDelete?: (stock: Stock) => void;
  /** 刷新列表回调 */
  onRefresh?: () => void;
}

/** 股票表格 */
const StockTable: React.FC<StockTableProps> = ({ 
  onDelete, 
  onRefresh 
}) => {
  const [stockList, setStockList] = useState<Stock[]>([]);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    getStockList();

    // 倒计时定时器
    const timer = setInterval(async () => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // 倒计时结束，执行同步逻辑
          syncData();
          return 60; // 重置倒计时
        }
        return prev - 1;
      });
    }, 1000);

    // 同步数据的辅助函数
    const syncData = async () => {
      try {
        await quotesApi.syncAllStockQuotes();
        getStockList();
      } catch (error) {
        console.error('自动同步行情失败:', error);
      }
    };

    return () => clearInterval(timer);
  }, []);

  /** 获取股票列表 */
  const getStockList = async () => {
    const res = await stockApi.list();
    setStockList(res);
  };

  /** 更新股票实时行情数据 */
  const updateStockQuoteData = async (record: Stock) => {
    const res = await quotesApi.syncAllStockQuotes()
    message.success(`${record.name} (${record.code}) 实时行情同步成功`);
    getStockList();
  }

  /** 更新股票分时数据 */
  const updateStockTrendData = async (record: Stock) => {
    const res =await trendsApi.syncFromApi({
      code: record.code,
      market: record.market || 1,
      ndays: 1
    });
    message.success(`${record.name} (${record.code}) 分时数据同步成功`);
  }

  /** 更新股票5日分时数据 */
  const updateStock5DayTrendData = async (record: Stock) => {
    const res = await trendsApi.syncFromApi({
      code: record.code,
      market: record.market || 1,
      ndays: 5
    });
    message.success(`${record.name} (${record.code}) 5日分时数据同步成功`);
  }

  /** 更新股票日线数据 */
  const updateStockKlineData = async (record: Stock) => {
    const res = await klinesApi.sync({
      code: record.code,
      period: 'daily',
    });
    message.success(`${record.name} (${record.code}) 日线数据同步成功`);
  }

  const columns: TableProps['columns'] =[
    {
      title: '股票名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (value: any, record: any) => {
        return <a>{value} - {record.code}</a>
      },
    },
    {
      title: '最新价',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (value: any) => {
        const price = parseFloat(value || 0);
        return <a className={price > 0 ? 'text-color-red' : 'text-color-green'}>
          {price.toFixed(3)}
        </a>
      },
    },
    {
      title: '今日涨跌幅',
      dataIndex: 'pct',
      key: 'pct',
      width: 120,
      render: (value: any) => {
        const pct = parseFloat(value || 0);
        return <a className={pct > 0 ? 'text-color-red' : 'text-color-green'}>
          {pct.toFixed(2)}%
        </a>
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => {
        return (
          <Space size="middle">
            <a onClick={() => { updateStockQuoteData(record) }}>实时</a>
            <a onClick={() => { updateStockTrendData(record) }}>分时</a>
            <a onClick={() => { updateStock5DayTrendData(record) }}>5日</a>
            <a onClick={() => { updateStockKlineData(record) }}>日线</a>
            {onDelete && (
              <Popconfirm
                title="确认删除"
                description={`确定要删除股票「${record.name}」吗？`}
                onConfirm={() => { onDelete(record) }}
                okText="确定"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <a style={{ color: '#ff4d4f' }}>删除</a>
              </Popconfirm>
            )}
          </Space>
        )
      },
    },
  ]; 

  return (
    <div className="stock-table-wrap">
      <div className="refresh-countdown">
        下一次更新: <span className="countdown-value">{countdown}s</span>
      </div>
      <Table 
        columns={columns} 
        dataSource={stockList} 
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}

export default StockTable;