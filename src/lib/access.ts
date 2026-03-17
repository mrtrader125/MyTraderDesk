// src/lib/access.ts

export const TIERS = {
  FREE: 'free',
  ESSENTIAL: 'essential',
  PRO: 'pro'
};

export const CORE_ASSETS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCAD', 'AUDUSD', 'NZDUSD', 'USDCHF', 'XAUUSD', 'GBPCAD', 'CADJPY', 'EURJPY', 'EURAUD', 'GBPAUD'];

export function getSetupAccess(setup: any, userPlan: string = 'free') {
  if (!setup) return { hasAccess: false, requiredTier: TIERS.PRO, hoursLeft: 0, countdownText: '' };
  
  const plan = userPlan.toLowerCase();
  const isCore = CORE_ASSETS.includes(setup.asset_symbol || '');
  const tf = (setup.timeframe || '').toLowerCase().replace(/\s+/g, '');
  
  const isScalp = tf.includes('1m') || tf.includes('5m') || tf.includes('15m');
  const isFastDelay = isScalp || tf.includes('1h') || tf.includes('h1');

  const createdTime = new Date(setup.created_at).getTime();
  const ageInHours = (new Date().getTime() - createdTime) / (1000 * 60 * 60);
  
  // Logic: Scalps/Non-Core require PRO. Core Swing requires ESSENTIAL.
  const requiredTier = (!isCore || isScalp) ? TIERS.PRO : TIERS.ESSENTIAL;
  const requiredDelayHours = isFastDelay ? 24 : 168; // 1 day vs 7 days

  if (plan === TIERS.PRO) return { hasAccess: true, requiredTier, hoursLeft: 0, countdownText: '' };
  if (plan === TIERS.ESSENTIAL && requiredTier === TIERS.ESSENTIAL) return { hasAccess: true, requiredTier, hoursLeft: 0, countdownText: '' };
  if (ageInHours >= requiredDelayHours) return { hasAccess: true, requiredTier, hoursLeft: 0, countdownText: '' };

  // Calculate visual countdown for locked assets
  const hoursLeft = Math.max(0, requiredDelayHours - ageInHours);
  const daysLeft = Math.floor(hoursLeft / 24);
  const remainingHours = Math.floor(hoursLeft % 24);
  const remainingMins = Math.floor((hoursLeft * 60) % 60);
  const countdownText = daysLeft > 0 ? `${daysLeft}d ${remainingHours}h` : `${remainingHours}h ${remainingMins}m`;

  return { 
    hasAccess: false, 
    requiredTier,
    hoursLeft,
    countdownText 
  };
}
