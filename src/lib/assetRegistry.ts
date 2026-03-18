// src/lib/assetRegistry.ts

// 1. Define all known assets by their exact symbols
export const ASSET_CATEGORIES = {
  FOREX: [
    // Majors
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDCHF',
    // EUR Minors/Crosses
    'EURGBP', 'EURJPY', 'EURCHF', 'EURAUD', 'EURCAD', 'EURNZD',
    // GBP Minors/Crosses
    'GBPJPY', 'GBPCHF', 'GBPAUD', 'GBPCAD', 'GBPNZD',
    // AUD Minors/Crosses
    'AUDJPY', 'AUDCHF', 'AUDCAD', 'AUDNZD',
    // CAD Minors/Crosses
    'CADJPY', 'CADCHF',
    // NZD Minors/Crosses
    'NZDJPY', 'NZDCHF', 'NZDCAD',
    // CHF Minors
    'CHFJPY'
  ],
  COMMODITY: [
    // Metals
    'XAUUSD', 'XAUEUR', 'XAGUSD', 'XPTUSD', 'XPDUSD', 'COPPER',
    // Energy
    'USOIL', 'UKOIL', 'XTIUSD', 'XBRUSD', 'NGAS'
  ],
  CRYPTO: [
    'BTCUSD', 'ETHUSD', 'SOLUSD', 'XRPUSD', 'ADAUSD', 'DOGEUSD', 
    'DOTUSD', 'LINKUSD', 'MATICUSD', 'AVAXUSD', 'BNBUSD', 'LTCUSD'
  ],
  INDICES: [
    'US30', 'NAS100', 'SPX500', 'GER40', 'UK100', 'JPN225', 
    'FRA40', 'AUS200', 'EU50', 'HK50', 'IN50'
  ],
  STOCKS: [
    // Big Tech & Semis
    'AAPL', 'TSLA', 'MSFT', 'AMZN', 'NVDA', 'META', 'GOOGL', 'AMD', 'INTC', 'TSM', 'ASML',
    // Finance & Payment
    'V', 'MA', 'JPM', 'BAC', 'PYPL', 'SQ', 'GS', 'MS',
    // Consumer & Retail
    'WMT', 'TGT', 'COST', 'MCD', 'SBUX', 'NKE', 'DIS', 'HD',
    // Health & Pharma
    'JNJ', 'PFE', 'UNH', 'LLY', 'MRK',
    // Industrial & Energy
    'BA', 'CAT', 'XOM', 'CVX', 'GE',
    // Software & Cloud
    'CRM', 'ADBE', 'NOW', 'SNOW', 'PLTR', 'CRWD'
  ]
};

// 2. Define the exact clearance tier required for each category
export const CATEGORY_REQUIREMENTS: Record<string, string> = {
  FOREX: 'free',
  COMMODITY: 'essential', // Renamed from GOLD
  CRYPTO: 'pro',
  INDICES: 'pro',
  STOCKS: 'pro'
};

// HELPER 1: Auto-detect the category based on the symbol
export function getAssetCategory(symbol: string): string {
  const upperSymbol = symbol.trim().toUpperCase();
  for (const [category, assets] of Object.entries(ASSET_CATEGORIES)) {
    if (assets.includes(upperSymbol)) {
      return category;
    }
  }
  return 'FOREX'; // Default fallback if unknown
}

// HELPER 2: Check what tier is required for a specific category
export function getRequiredTier(category: string): string {
  const upperCategory = category.trim().toUpperCase();
  return CATEGORY_REQUIREMENTS[upperCategory] || 'pro'; // Default to pro for maximum security if unknown
}
