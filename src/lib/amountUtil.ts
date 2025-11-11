/** 格式化百分比 */
const formatPercent = (amount: number): string => {
  return (amount * 100).toFixed(3) + '%';
}

export { formatPercent };