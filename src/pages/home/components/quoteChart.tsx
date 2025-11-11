import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Radio } from 'antd';
import type { Stock } from '@/@types/stock';
import QuoteTodayk from './quoteTodayk';
import Quote5Daysk from './quote5Daysk';

const QuoteChart = (props: { stock: Stock }) => {
  const { stock } = props;
  const [type, setType] = useState<string>('todayK');

  return (
    <div className="stock-content-chart">
      <div className="mb_12">
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