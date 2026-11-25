export const CURRENCY = '₹';

export function formatMoney(amount: number) {
  return `${CURRENCY}${amount.toLocaleString('en-IN')}`;
}
