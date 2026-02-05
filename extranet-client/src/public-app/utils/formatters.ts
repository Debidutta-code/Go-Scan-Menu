export const formatPrice = (price: number, currency: string = 'USD'): string => {
  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
  };

  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${price.toFixed(2)}`;
};

export const getSpiceLevelEmoji = (spiceLevel?: string): string => {
  const levels: { [key: string]: string } = {
    mild: '🌶️',
    medium: '🌶️🌶️',
    hot: '🌶️🌶️🌶️',
    'extra-hot': '🌶️🌶️🌶️🌶️',
  };
  return spiceLevel ? levels[spiceLevel] || '' : '';
};
