import React, { useEffect, useState } from 'react';
import { Space, Table, Popconfirm } from 'antd';
import type { TableProps } from 'antd';
import type { Stock } from '@/@types/stock';
import { stockApi } from '@/lib/server/stockApi';
import { formatPercent } from '@/lib/amountUtil';

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

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

  useEffect(() => {
    getStockList();
  }, []);

  /** 获取股票列表 */
  const getStockList = async () => {
    const res = await stockApi.list();
    setStockList(res);
  };

  /** 更新股票数据 */
  const updateStockData = async (record: Stock) => {
    const res = await stockApi.sync({
      code: record.code,
      market: record.market || 1,
    });
    getStockList();
    // 如果父组件提供了刷新回调，同时调用
    onRefresh?.();
  }

  const columns: TableProps['columns'] =[
    {
      title: 'code',
      dataIndex: 'code',
      key: 'code',
      render: (value: any, record: any, index: number) => {
        return <a>{record.name} - {value}</a>
      },
    },
    {
      title: '最新价',
      dataIndex: 'latestPrice',
      key: 'latestPrice',
      render: (value: any, record: any, index: number) => {
        let textColor = '';
        if (record.latestPrice) {
          if (record.latestPrice > 0) {
            textColor = 'text-color-red'
          } else {
            textColor = 'text-color-green'
          }
        }
        return <a className={textColor}>{parseFloat(record.latestPrice || 0).toFixed(3)}</a>
      },
    },
    {
      title: '今日涨跌幅',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (value: any, record: any, index: number) => {
        let textColor = '';
        if (record.changePercent) {
          if (record.changePercent > 0) {
            textColor = 'text-color-red'
           } else {
            textColor = 'text-color-green'
          }
        }
        return <a className={textColor}>{parseFloat(record.changePercent || 0).toFixed(2)}%</a>
      },
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (value: any, record: any, index: number) => {
        return (
          <Space size="middle">
            <a onClick={() => { updateStockData(record) }}>更新</a>

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
            {/* <a onClick={ ()=> { updateHolding(record) }}>更新持仓</a> */}
          </Space>
        )
      },
    },
  ]; 

  return (
    <div className="stock-table-wrap">
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