// src/lib/access.ts
import { PLAN_CONFIG, normalizeTimeframe } from './platformConfig';

export function getSetupAccess(setup: any, userPlan: string = 'free') {
  if (!setup) return { hasAccess: false, requiredTier: 'pro', hoursLeft: 0, countdownText: '' };

  const currentPlanId = userPlan.toLowerCase();
  const planRules = PLAN_CONFIG[currentPlanId as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free;

  const category = (setup.category || 'FOREX').toUpperCase();
  const tf = normalizeTimeframe(setup.timeframe || '1H');

  let hasAccess = false;
  let requiredTier = 'pro'; // Default upsell suggestion
  let requiredDelayHours = 0;

  // 1. Check if the user's plan ALLOWS this category
  const categoryAllowed = planRules.allowedCategories.includes(category);
  
  // 2. Check if the user's plan ALLOWS this timeframe (e.g., Scalping vs Standard)
  const timeframeAllowed = planRules.allowedTimeframes.includes(tf);

  // Determine what tier they ACTUALLY need if they are blocked
  if (!categoryAllowed || !timeframeAllowed) {
    if (PLAN_CONFIG.essential.allowedCategories.includes(category) && PLAN_CONFIG.essential.allowedTimeframes.includes(tf)) {
      requiredTier = 'essential';
    } else if (PLAN_CONFIG.pro.allowedCategories.includes(category) && PLAN_CONFIG.pro.allowedTimeframes.includes(tf)) {
      requiredTier = 'pro';
    } else {
      requiredTier = 'premium'; // If it's scalping or fundamental, it requires Premium
    }
  } else {
    // If category AND timeframe are allowed, check for TIME DELAYS (Mainly for the Free tier)
    if (planRules.delays && tf in planRules.delays) {
      requiredDelayHours = planRules.delays[tf as keyof typeof planRules.delays];
    }

    if (requiredDelayHours === 0) {
      hasAccess = true; // Instant access (Essential, Pro, Premium)
    } else {
      // Calculate if enough time has passed for the Free user
      const createdTime = new Date(setup.created_at).getTime();
      const ageInHours = (new Date().getTime() - createdTime) / (1000 * 60 * 60);
      
      if (ageInHours >= requiredDelayHours) {
        hasAccess = true;
      } else {
        requiredTier = 'essential'; // Suggest upgrading to Essential to bypass the delay
      }
    }
  }

  // If granted access, return early
  if (hasAccess) return { hasAccess: true, requiredTier, hoursLeft: 0, countdownText: '' };

  // --- COUNTDOWN / LOCK TEXT GENERATOR ---
  const createdTime = new Date(setup.created_at).getTime();
  const ageInHours = (new Date().getTime() - createdTime) / (1000 * 60 * 60);
  const hoursLeft = Math.max(0, requiredDelayHours - ageInHours);
  const daysLeft = Math.floor(hoursLeft / 24);
  const remainingHours = Math.floor(hoursLeft % 24);
  const remainingMins = Math.floor((hoursLeft * 60) % 60);

  let countdownText = '';
  if (categoryAllowed && timeframeAllowed && hoursLeft > 0) {
    // They are allowed to see it, they just have to wait (Free Tier Delay)
    countdownText = daysLeft > 0 
      ? `Time Delay: Unlocks in ${daysLeft}d ${remainingHours}h` 
      : `Time Delay: Unlocks in ${remainingHours}h ${remainingMins}m`;
  } else {
    // They are strictly locked out due to asset/timeframe restrictions
    countdownText = `Clearance strictly limited to ${requiredTier.toUpperCase()} Tier.`;
  }

  return {
    hasAccess: false,
    requiredTier,
    hoursLeft,
    countdownText
  };
}
