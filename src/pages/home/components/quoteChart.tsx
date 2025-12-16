import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Radio } from 'antd';
import type { Stock } from '@/@types/stock';
import QuoteTodayk from './quoteTodayk';
import Quote5Daysk from './quote5Daysk';
import { quotesApi } from '@/lib/server/quoteApi';

const QuoteChart = (props: { stock: Stock }) => {
  const { stock } = props;
  const [type, setType] = useState<string>('todayK');
  const [t, setT] = useState<string>(Date.now().toString());

  const onRefresh = async () => {
    const res = await quotesApi.syncStockQuotesFromAPI({
      code: stock.code,
      marketCode: stock.marketCode?.toString() || '',
    });
    if (res) {
      setT(Date.now().toString());
    }
  }

  return (
    <div className="stock-content-chart" key={t}>
      <div className="mb_12 t-FBH">
        <Radio.Group
          style={{ width: '300px' }}
          block
          optionType="button"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { label: '今日', value: 'todayK' },
            { label: '5日', value: 'fiveDaysK' },
            { label: '日K', value: 'dailyK' },
          ]}
        />
        <div className="t-FB1"></div>
        <Button type="primary" onClick={() => {
          onRefresh();
        }}>刷新</Button>
      </div>
      {type === 'todayK' && (
        <QuoteTodayk stock={stock} />
      )}
      {type === 'fiveDaysK' && (
        <Quote5Daysk stock={stock} />
      )}
    </div>
  )
}

export default QuoteChart;