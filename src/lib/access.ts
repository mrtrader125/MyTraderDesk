// src/lib/access.ts
import { PLAN_CONFIG, normalizeTimeframe } from './platformConfig';

export function getSetupAccess(setup: any, userPlan: string = 'free') {
  if (!setup) return { hasAccess: false, requiredTier: 'pro', hoursLeft: 0, countdownText: '' };

  const currentPlanId = userPlan.toLowerCase();
  const planRules = PLAN_CONFIG[currentPlanId as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free;

  const category = (setup.category || 'FOREX').toUpperCase();
  const tf = normalizeTimeframe(setup.timeframe || '1H');

  let hasAccess = false;
  let requiredTier = 'pro'; 
  let requiredDelayHours = 0;

  const categoryAllowed = planRules.allowedCategories.includes(category);
  const timeframeAllowed = planRules.allowedTimeframes.includes(tf);

  if (!categoryAllowed || !timeframeAllowed) {
    if (PLAN_CONFIG.essential.allowedCategories.includes(category) && PLAN_CONFIG.essential.allowedTimeframes.includes(tf)) {
      requiredTier = 'essential';
    } else if (PLAN_CONFIG.pro.allowedCategories.includes(category) && PLAN_CONFIG.pro.allowedTimeframes.includes(tf)) {
      requiredTier = 'pro';
    } else {
      requiredTier = 'premium'; 
    }
  } else {
    if (planRules.delays && tf in planRules.delays) {
      requiredDelayHours = planRules.delays[tf as keyof typeof planRules.delays];
    }

    if (requiredDelayHours === 0) {
      hasAccess = true;
    } else {
      const createdTime = new Date(setup.created_at).getTime();
      const ageInHours = (new Date().getTime() - createdTime) / (1000 * 60 * 60);
      if (ageInHours >= requiredDelayHours) {
        hasAccess = true;
      } else {
        requiredTier = 'essential'; 
      }
    }
  }

  if (hasAccess) return { hasAccess: true, requiredTier, hoursLeft: 0, countdownText: '' };

  const createdTime = new Date(setup.created_at).getTime();
  const ageInHours = (new Date().getTime() - createdTime) / (1000 * 60 * 60);
  const hoursLeft = Math.max(0, requiredDelayHours - ageInHours);
  const daysLeft = Math.floor(hoursLeft / 24);
  const remainingHours = Math.floor(hoursLeft % 24);
  const remainingMins = Math.floor((hoursLeft * 60) % 60);

  let countdownText = '';
  if (categoryAllowed && timeframeAllowed && hoursLeft > 0) {
    countdownText = daysLeft > 0 
      ? `Time Delay: Unlocks in ${daysLeft}d ${remainingHours}h` 
      : `Time Delay: Unlocks in ${remainingHours}h ${remainingMins}m`;
  } else {
    countdownText = `Clearance strictly limited to ${requiredTier.toUpperCase()} Tier.`;
  }

  return {
    hasAccess: false,
    requiredTier,
    hoursLeft,
    countdownText
  };
}
