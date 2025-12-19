import React, { useEffect, useState } from 'react';
import { Space, Table, Tag } from 'antd';
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

/** 获取持仓总市值 */
// const getHoldingAmount = (record: Stock) => {
//   const { holdingQuantity = 0, holdingCost = 0, latestPrice = 0 } = record;
//   return latestPrice * holdingQuantity;
// }
/** 持仓总成本 */
// const getHoldingCost = (record: Stock) => {
//   const { holdingQuantity = 0, holdingCost = 0, latestPrice = 0 } = record;
//   return holdingCost * holdingQuantity;
// }
/** 持仓浮盈/亏损 */
// const getHoldingChangeAmount = (record: Stock) => {
//   const holdingAmount = getHoldingAmount(record);
//   const holdingCost = getHoldingCost(record);
//   return holdingAmount - holdingCost;
// }
/** 持仓浮盈/亏损百分比 */
// const getHoldingChangePercent = (record: Stock) => {
//   const holdingChangeAmount = getHoldingChangeAmount(record);
//   const holdingCost = getHoldingCost(record);
//   return holdingChangeAmount / holdingCost;
// }

/** 股票表格 */
const StockTable = () => {
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
      marketCode: record.marketCode || 1,
    });
    getStockList();
  }

  /** 更新持仓 */
  // const updateHolding = async (record: Stock) => {
  //   const res = await stockApi.updateHolding({
  //     code: record.code,
  //     holdingQuantity: 15500,
  //     holdingCost: 1.339,
  //   });
  //   getStockList();
  // }

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
        return <a className={textColor}>{parseFloat(record.changePercent || 0).toFixed(3)}%</a>
      },
    },
    // {
    //   title: '持仓盈亏',
    //   dataIndex: 'holdingChangeAmount',
    //   key: 'holdingChangeAmount',
    //   render: (value: any, record: any, index: number) => {
    //     const holdingChangeAmount = getHoldingChangeAmount(record);
    //     const holdingChangePercent = getHoldingChangePercent(record);
    //     return <a>{holdingChangeAmount}/{formatPercent(holdingChangePercent)}</a>
    //   },
    // },
    // {
    //   title: '持仓数量/市值',
    //   dataIndex: 'holdingQuantity',
    //   key: 'holdingQuantity',
    //   render: (value: any, record: any, index: number) => {
    //     const holdingAmount = getHoldingAmount(record);
    //     return <a>{record.holdingQuantity}/{holdingAmount}</a>
    //   },
    // },
    // {
    //   title: '成本/现价',
    //   dataIndex: 'holdingCost',
    //   key: 'holdingCost',
    //   render: (value: any, record: any, index: number) => {
    //     return (
    //       <a>{record.holdingCost}/{record.latestPrice}</a>
    //     )
    //   },
    // },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      render: (value: any, record: any, index: number) => {
        return (
          <Space size="middle">
            <a onClick={ ()=>{ updateStockData(record) }}>更新数据</a>
            {/* <a onClick={ ()=>{ updateHolding(record) }}>更新持仓</a> */}
          </Space>
        )
      },
    },
  ]; 

  return (
    <div className="stock-table-wrap">
      <Table columns={columns} dataSource={stockList} />
    </div>
  )
}

export default StockTable;