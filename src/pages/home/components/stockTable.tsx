import React, { useEffect, useState } from 'react';
import { Space, Table, Popconfirm } from 'antd';
import type { TableProps } from 'antd';
import type { Stock } from '@/@types/stock';
import { stockApi } from '@/lib/server/stockApi';

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
    await stockApi.sync({
      code: record.code,
      market: record.market || 1,
    });
    getStockList();
    // 如果父组件提供了刷新回调，同时调用
    onRefresh?.();
  }

  const columns: TableProps['columns'] =[
    {
      title: '股票名称',
      dataIndex: 'name',
      key: 'name',
      render: (value: any, record: any) => {
        return <a>{value} - {record.code}</a>
      },
    },
    {
      title: '最新价',
      dataIndex: 'price',
      key: 'price',
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