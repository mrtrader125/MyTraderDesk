// src/lib/access.ts
import { PLAN_CONFIG, normalizeTimeframe } from './platformConfig';

export function getSetupAccess(setup: any, userPlan: string = 'free') {
  // 1. Safety check
  if (!setup) return { hasAccess: false, requiredTier: 'pro', hoursLeft: 0, countdownText: '' };

  // 2. Map the user's plan (fallback to 'free' if they have a legacy plan in the DB)
  const currentPlanId = userPlan.toLowerCase();
  const planRules = PLAN_CONFIG[currentPlanId as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free;

  // 3. Extract setup details
  const category = (setup.category || 'FOREX').toUpperCase();
  const tf = normalizeTimeframe(setup.timeframe || '1H'); // Parsed but no longer used for strict gating

  let hasAccess = false;
  let requiredTier = 'pro'; 
  let requiredDelayHours = planRules.delayHours || 0; // Using the flat delayHours property from your new config

  // 4. Check if the user's current plan allows this asset category
  const categoryAllowed = planRules.allowedCategories.includes(category);

  if (!categoryAllowed) {
    // If category isn't allowed, they must upgrade to Pro
    hasAccess = false;
    requiredTier = 'pro';
  } else {
    // If category IS allowed, check if there is a time delay (e.g., Free tier delay)
    if (requiredDelayHours === 0) {
      hasAccess = true;
    } else {
      const createdTime = new Date(setup.created_at).getTime();
      const ageInHours = (new Date().getTime() - createdTime) / (1000 * 60 * 60);
      
      if (ageInHours >= requiredDelayHours) {
        hasAccess = true;
      } else {
        hasAccess = false;
        requiredTier = 'pro'; // Upgrading to Pro bypasses the delay
      }
    }
  }

  // 5. Return immediately if they have access
  if (hasAccess) return { hasAccess: true, requiredTier, hoursLeft: 0, countdownText: '' };

  // 6. Calculate countdowns for users who are blocked by a time delay
  const createdTime = new Date(setup.created_at).getTime();
  const ageInHours = (new Date().getTime() - createdTime) / (1000 * 60 * 60);
  const hoursLeft = Math.max(0, requiredDelayHours - ageInHours);
  const daysLeft = Math.floor(hoursLeft / 24);
  const remainingHours = Math.floor(hoursLeft % 24);
  const remainingMins = Math.floor((hoursLeft * 60) % 60);

  let countdownText = '';
  
  if (categoryAllowed && hoursLeft > 0) {
    // User has category access, but is waiting for the delay to expire
    countdownText = daysLeft > 0 
      ? `Time Delay: Unlocks in ${daysLeft}d ${remainingHours}h` 
      : `Time Delay: Unlocks in ${remainingHours}h ${remainingMins}m`;
  } else {
    // User does not have category access at all
    countdownText = `Clearance strictly limited to PRO Tier.`;
  }

  return {
    hasAccess: false,
    requiredTier,
    hoursLeft,
    countdownText
  };
}
