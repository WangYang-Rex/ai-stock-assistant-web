import React, { useEffect, useState, useCallback } from 'react';
import type { Stock } from '@/@types/stock';
import { Select, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import StockTable from './components/stockTable';
import QuoteChart from './components/quoteChart';
import AISign from './components/aiSign';
import StockFormModal from './components/StockFormModal';
import { stockApi } from '@/lib/server/stockApi'; 
import './home.less';

const Home = () => {
  // 选中的股票代码
  const [selectedStock, setSelectedStock] = useState<string>('588080');
  // 股票列表
  const [stockList, setStockList] = useState<Stock[]>([]);
  // 模态框状态
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getStockList();
  }, []);

  /**
   * 获取股票列表
   */
  const getStockList = useCallback(async () => {
    const res = await stockApi.list();
    setStockList(res);
  }, []);

  /**
   * 打开新增模态框
   */
  const handleAdd = useCallback(() => {
    setModalVisible(true);
  }, []);



  /**
   * 删除股票
   */
  const handleDelete = useCallback(async (stock: Stock) => {
    try {
      await stockApi.delete({ id: stock.id });
      message.success('删除成功');
      getStockList();
    } catch (error: any) {
      message.error(error?.message || '删除失败');
    }
  }, [getStockList]);

  /**
   * 关闭模态框
   */
  const handleModalClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  /**
   * 模态框操作成功回调
   */
  const handleModalSuccess = useCallback(() => {
    getStockList();
  }, [getStockList]);

  // 当前选中的股票记录
  const selectedStockRecord = stockList.find((_stock) => _stock.code === selectedStock) as Stock;

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
          options={stockList.map((_stock) => {
            return { value: _stock.code, label: <span>{_stock.name}</span> }
          })}
        />
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加股票
        </Button>
      </div>
      <div className="stock-content">
        <div className="stock-section">
          <div className="stock-section-title">股票信息</div>
          <StockTable 
            onDelete={handleDelete}
            onRefresh={getStockList}
          />
        </div>
        <div className="stock-section">
          <div className="stock-section-title">行情图</div>
          {selectedStockRecord && (
          <QuoteChart stock={selectedStockRecord} />
          )}
        </div>
        <div className="stock-section">
          <div className="stock-section-title">AI分析</div>
          <AISign />
        </div>
      </div>

      {/* 股票新增/编辑模态框 - 通过 stock 是否存在自动判断模式 */}
      <StockFormModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}

export default Home;