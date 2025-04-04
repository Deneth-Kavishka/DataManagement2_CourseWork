// Currency utility functions for UrbanFood application

/**
 * Format a price in LKR currency
 * @param {number} price - The price to format
 * @param {boolean} showSymbol - Whether to show the LKR symbol
 * @returns {string} Formatted price string
 */
export const formatLKR = (price, showSymbol = true) => {
  const formattedPrice = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
  
  return showSymbol ? formattedPrice : formattedPrice.replace('LKR', '').trim();
};

/**
 * Convert USD to LKR (approximate conversion rate)
 * @param {number} usdPrice - Price in USD
 * @returns {number} Price in LKR
 */
export const convertUSDtoLKR = (usdPrice) => {
  // Using an approximate exchange rate (can be updated)
  const exchangeRate = 320; // 1 USD ≈ 320 LKR
  return usdPrice * exchangeRate;
};

/**
 * Format price in USD to LKR
 * @param {number} usdPrice - Price in USD
 * @returns {string} Formatted price in LKR
 */
export const formatUSDtoLKR = (usdPrice) => {
  return formatLKR(convertUSDtoLKR(usdPrice));
};