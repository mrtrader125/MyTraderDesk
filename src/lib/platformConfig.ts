// src/lib/platformConfig.ts

// ==========================================
// 1. GLOBAL ASSET REGISTRY
// ==========================================
export const ASSET_CATEGORIES = {
  FOREX: [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDCHF', // Majors
    'EURGBP', 'EURJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'EURNZD', // EUR Crosses
    'GBPJPY', 'GBPCHF', 'GBPAUD', 'GBPCAD', 'GBPNZD', // GBP Crosses
    'AUDJPY', 'AUDCHF', 'AUDCAD', 'AUDNZD', // AUD Crosses
    'CADJPY', 'CADCHF', 'NZDJPY', 'NZDCHF', 'NZDCAD', 'CHFJPY' // Others
  ],
  COMMODITY: ['XAUUSD', 'XAUEUR', 'XAGUSD', 'XPTUSD', 'XPDUSD', 'COPPER', 'USOIL', 'UKOIL', 'NGAS'],
  CRYPTO: ['BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD', 'DOGEUSD', 'DOTUSD', 'LINKUSD', 'MATICUSD', 'BNBUSD'],
  INDICES: ['US30', 'NAS100', 'SPX500', 'GER40', 'UK100', 'JPN225', 'FRA40', 'AUS200'],
  STOCKS: ['AAPL', 'TSLA', 'MSFT', 'AMZN', 'NVDA', 'META', 'GOOGL', 'AMD']
};

export const TIMEFRAMES = {
  SCALPING: ['1M', '5M', '15M', '30M'],
  STANDARD: ['1H', '4H', '1D', '1W', '1MO']
};

// ==========================================
// 2. MASTER PLAN & SUBSCRIPTION RULES
// ==========================================
export const PLAN_CONFIG = {
  free: {
    id: 'free',
    name: 'Free Tier',
    priceMonthly: 0,
    priceYearly: 0,
    allowedCategories: ['FOREX'],
    allowedTimeframes: TIMEFRAMES.STANDARD,
    delays: {
      '1H': 24,
      '4H': 48,
      '1D': 168, // 1 week
      '1W': 168,
      '1MO': 168
    }
  },
  essential: {
    id: 'essential',
    name: 'Essential Tier',
    priceMonthly: 4.99,
    priceYearly: 49.99,
    allowedCategories: ['FOREX', 'COMMODITY'],
    allowedTimeframes: TIMEFRAMES.STANDARD,
    delays: {} // 0 delay
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    priceMonthly: 9.99,
    priceYearly: 99.99,
    allowedCategories: ['FOREX', 'COMMODITY', 'CRYPTO', 'INDICES', 'STOCKS'],
    allowedTimeframes: TIMEFRAMES.STANDARD,
    delays: {} // 0 delay
  },
  premium: {
    id: 'premium',
    name: 'Gold Premium',
    priceMonthly: 199.00,
    priceYearly: 1990.00,
    allowedCategories: ['FOREX', 'COMMODITY', 'CRYPTO', 'INDICES', 'STOCKS', 'FUNDAMENTAL', 'SENTIMENTAL'],
    allowedTimeframes: [...TIMEFRAMES.STANDARD, ...TIMEFRAMES.SCALPING],
    delays: {} // 0 delay
  }
};

// ==========================================
// 3. HELPER FUNCTIONS
// ==========================================
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
  return '1D'; // Fallback
}
