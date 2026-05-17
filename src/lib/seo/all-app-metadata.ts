// ═══════════════════════════════════════════════════════════════════════════════
// SEO METADATA — ALL AUTHENTICATED / APP PAGES
// These pages are behind auth so robots = noindex.
// Still set proper titles for browser tab UX and internal navigation.
// ═══════════════════════════════════════════════════════════════════════════════

import type { Metadata } from 'next'

// ─────────────────────────────────────────────────────────────────────────────
// SHARED ROBOT RULE — all app pages are auth-gated, never index them
// ─────────────────────────────────────────────────────────────────────────────
const appRobots: Metadata['robots'] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(users)/dashboard/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
export const dashboardMetadata: Metadata = {
  title: 'Dashboard',
  description: 'Your MyTraderDesk command centre — daily briefing, active setups, and system status.',
  robots: appRobots,
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(users)/desk/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
export const deskMetadata: Metadata = {
  title: 'Execution Desk',
  description: 'Stage live trades, enforce your daily execution limit, sync MT5 data, and settle your post-trade queue.',
  robots: appRobots,
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(users)/journal/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
export const journalMetadata: Metadata = {
  title: 'Performance Journal',
  description: 'Trade autopsy — compare your structural intent against execution reality and identify behavioral leaks.',
  robots: appRobots,
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(users)/analytics/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
export const analyticsMetadata: Metadata = {
  title: 'Macro Analytics',
  description: 'Cumulative yield, playbook strike rates, behavioral discipline heatmap, and long-term performance proof.',
  robots: appRobots,
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(users)/vault/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
export const vaultMetadata: Metadata = {
  title: 'The Vault',
  description: 'Your personal setup archive — bookmark, annotate, and organise high-probability chart setups for the coming week.',
  robots: appRobots,
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(users)/markets/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
export const marketsMetadata: Metadata = {
  title: 'Markets',
  description: 'Multi-timeframe institutional analysis across Forex, Crypto, Indices, and Commodities.',
  robots: appRobots,
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(users)/floor/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
export const floorMetadata: Metadata = {
  title: 'Live Floor',
  description: 'Real-time structural analysis, community sentiment voting, and live terminal squawks.',
  robots: appRobots,
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(users)/account/layout.tsx  (wraps all /account/* pages)
// ─────────────────────────────────────────────────────────────────────────────
export const accountMetadata: Metadata = {
  title: {
    default: 'Account',
    template: '%s — Account | MyTraderDesk',
  },
  description: 'Manage your MyTraderDesk account, subscription, and settings.',
  robots: appRobots,
}

export const profileMetadata: Metadata  = { title: 'Profile',      robots: appRobots }
export const billingMetadata: Metadata  = { title: 'Billing',       robots: appRobots }
export const securityMetadata: Metadata = { title: 'Security',      robots: appRobots }
export const settingsMetadata: Metadata = { title: 'Settings',      robots: appRobots }
export const subscriptionMetadata: Metadata = { title: 'Subscription', robots: appRobots }
