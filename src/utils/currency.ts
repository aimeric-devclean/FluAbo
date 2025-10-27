export const currencies = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dollar américain' },
  { code: 'GBP', symbol: '£', name: 'Livre sterling' },
  { code: 'CHF', symbol: 'Fr', name: 'Franc suisse' },
  { code: 'CAD', symbol: 'C$', name: 'Dollar canadien' },
  { code: 'JPY', symbol: '¥', name: 'Yen japonais' },
  { code: 'CNY', symbol: '¥', name: 'Yuan chinois' },
  { code: 'AUD', symbol: 'A$', name: 'Dollar australien' },
  { code: 'INR', symbol: '₹', name: 'Roupie indienne' },
  { code: 'BRL', symbol: 'R$', name: 'Réal brésilien' },
];

export const getCurrencySymbol = (code: string): string => {
  const currency = currencies.find(c => c.code === code);
  return currency?.symbol || code;
};

export const formatPrice = (price: number, currencyCode: string): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${price.toFixed(2)} ${symbol}`;
};
