// src/lib/platformConfig.ts

export const ASSET_CATEGORIES = {
  FOREX: [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDCHF',
    'EURGBP', 'EURJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'EURNZD',
    'GBPJPY', 'GBPCHF', 'GBPAUD', 'GBPCAD', 'GBPNZD',
    'AUDJPY', 'AUDCHF', 'AUDCAD', 'AUDNZD',
    'CADJPY', 'CADCHF', 'NZDJPY', 'NZDCHF', 'NZDCAD', 'CHFJPY'
  ],
  COMMODITY: ['XAUUSD', 'XAUEUR', 'XAGUSD', 'XPTUSD', 'XPDUSD', 'COPPER', 'USOIL', 'UKOIL', 'NGAS'],
  CRYPTO: ['BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD', 'DOGEUSD', 'DOTUSD', 'LINKUSD', 'MATICUSD', 'BNBUSD'],
  INDICES: ['US30', 'NAS100', 'SPX500', 'GER40', 'UK100', 'JPN225', 'FRA40', 'AUS200'],
  STOCKS: ['AAPL', 'TSLA', 'MSFT', 'AMZN', 'NVDA', 'META', 'GOOGL', 'AMD'],
};

export const TIMEFRAMES = {
  SCALPING: ['1M', '5M', '15M', '30M'],
  STANDARD: ['1H', '4H', '1D', '1W', '1MO']
};

// Added strict typing here so Next.js Admin dashboard calculations are 100% safe
type PlanType = {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  delayHours: number;
  allowedCategories: string[];
  features: string[];
};

export const PLAN_CONFIG: Record<string, PlanType> = {
  free: {
    name: 'Free Tier',
    priceMonthly: 0,
    priceYearly: 0,
    delayHours: 168, // 7 Days delay for Pro setups
    allowedCategories: ['FOREX'], // Free users only get Forex
    features: ['Delayed Analysis (7 Days)', 'Basic Education Vault']
  },
  pro: {
    name: 'Professional',
    priceMonthly: 29, 
    priceYearly: 299,
    delayHours: 0, // Real-time access
    allowedCategories: ['FOREX', 'COMMODITY', 'CRYPTO', 'INDICES', 'STOCKS'], // Pro gets everything
    features: ['Live Trading Floor Access', 'Real-Time Setup Alerts', 'Global Sentiment Engine', 'Direct Operator Comms']
  }
};

export function getAssetCategory(symbol: string): string {
  const upperSymbol = symbol.trim().toUpperCase();
  for (const [category, assets] of Object.entries(ASSET_CATEGORIES)) {
    if (assets.includes(upperSymbol)) return category;
  }
  return 'FOREX'; // Fallback
}

export function normalizeTimeframe(tf: string): string {
  const clean = tf.trim().toUpperCase().replace(/\s+/g, '');
  if (clean.includes('1M') && !clean.includes('MO')) return '1M';
  if (clean.includes('5M')) return '5M';
  if (clean.includes('15M')) return '15M';
  if (clean.includes('30M')) return '30M';
  if (clean.includes('1H')) return '1H';
  if (clean.includes('4H')) return '4H';
  if (clean.includes('D')) return '1D';
  if (clean.includes('W')) return '1W';
  if (clean.includes('MO')) return '1MO';
  return '1D'; 
}
