// ═══════════════════════════════════════════════════════════════════════════════
// SEO LANDING PAGES — Drop these into src/app/(public)/
// Each page targets a high-intent search cluster.
// These are your primary Google entry points — they must exist as real pages.
// ═══════════════════════════════════════════════════════════════════════════════


// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/trading-consistency/page.tsx
// TARGET: "how to become consistent in trading" — highest volume entry query
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Become Consistent in Trading — It\'s a Systems Problem',
  description:
    'Most traders never become consistent because they treat it as a mindset problem. Consistency in trading is a process failure. Here is the structural system that fixes it.',
  alternates: { canonical: '/trading-consistency' },
  openGraph: {
    title: 'How to Become Consistent in Trading | MyTraderDesk',
    description:
      'Consistency is not about discipline or psychology. It is about having a system that enforces structure when your emotions cannot. This page explains the framework.',
    url: 'https://www.mytraderdesk.com/trading-consistency',
    images: [{
      url: '/api/og?title=How+to+Become+Consistent+in+Trading&sub=The+systems+approach+serious+traders+use&tag=Consistency+System',
      width: 1200, height: 630
    }],
  },
}

const tradingConsistencyFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Why do traders struggle with consistency?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Inconsistency in trading is almost always a process failure, not a psychology failure. Traders without a weekly structure — defined prep windows, hard execution limits, mandatory post-trade review — rely on willpower to enforce their rules. Willpower is finite. Process is not.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the fastest way to build trading consistency?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Install a repeatable weekly cycle: (1) Weekend prep — upload your setups for the week with thesis notes. (2) Daily execution — push a maximum of 5 pairs into focus, log a maximum of 2 trades per day. (3) Post-trade reconciliation — settle every trade before planning the next week. This structure removes the daily decision about when and whether to trade.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does MyTraderDesk enforce trading consistency?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The vault locks on Monday morning — you cannot add setups mid-week without using a limited audible. You cannot log more than 2 trades per day. You cannot unlock the vault for next week until all trades from this week are settled. The system enforces the cycle so you do not have to.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is trading consistency a mindset issue?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Partially — but fixing mindset without fixing process does not work. A trader with the right psychology but no system will still break rules when the market moves against them. A trader with a system that enforces their rules will build consistency even when their mindset is imperfect.',
      },
    },
  ],
}

export default function TradingConsistencyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tradingConsistencyFAQ) }}
      />
      {/* 
        PAGE CONTENT — implement your design here.
        Must be 1800+ words for Google to rank it as a pillar page.
        
        Suggested structure:
        H1: How to Become Consistent in Trading
        H2: Why consistency is a systems problem, not a mindset problem
        H2: The weekly cycle that forces consistency
          H3: Weekend prep (Saturday–Monday)
          H3: Daily execution discipline (max 2 trades)
          H3: Post-trade settlement before the next week
        H2: What breaks consistency (execution mistakes)
        H2: How MyTraderDesk enforces the cycle
        FAQ section (matches schema above)
        CTA → /apply or /login
      */}
    </>
  )
}


// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/prop-firm-consistency/page.tsx
// TARGET: "pass prop firm challenge consistently", "funded trader discipline",
//         "ftmo consistency system", "prop firm rule compliance"
// ─────────────────────────────────────────────────────────────────────────────

export const propFirmMetadata: Metadata = {
  title: 'Pass Your Prop Firm Challenge Consistently — The Execution System',
  description:
    'Most traders pass the evaluation and then blow the funded account. The problem is execution discipline, not strategy. This is the system funded traders use to stay compliant.',
  alternates: { canonical: '/prop-firm-consistency' },
  openGraph: {
    title: 'Pass Your Prop Firm Challenge Consistently | MyTraderDesk',
    description:
      'FTMO, The5ers, and every other prop firm test the same thing: rule compliance under pressure. Build the execution infrastructure that keeps you compliant automatically.',
    url: 'https://www.mytraderdesk.com/prop-firm-consistency',
    images: [{
      url: '/api/og?title=Pass+Your+Prop+Firm+Challenge+Consistently&sub=The+execution+system+funded+traders+use&tag=Prop+Firm',
      width: 1200, height: 630
    }],
  },
}

const propFirmFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Why do traders fail prop firm challenges?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The evaluation tests rule compliance, not strategy quality. Traders fail because they exceed daily drawdown limits, overtrade during slow sessions, or revenge-trade after losses — all execution failures, not analytical failures. A system that hard-limits daily trades and enforces post-trade review eliminates most of these failure modes.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does a daily trade limit help with prop firm challenges?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Prop firms fail traders who overtrade. A system-enforced maximum of 2 trades per day eliminates the temptation to keep entering when conditions are marginal. This single constraint accounts for the majority of rule violations in FTMO and similar evaluations.',
      },
    },
    {
      '@type': 'Question',
      name: 'What execution system do successful funded traders use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Successful funded traders operate with a weekly cycle: define setups during the weekend prep window, limit daily executions to their pre-planned pairs, reconcile trades immediately after they close, and conduct a behavioral review before the next week begins. MyTraderDesk automates this entire cycle.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can MyTraderDesk help with FTMO consistency?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The execution desk enforces your daily trade limit, the vault locks you into your pre-planned setups, and the settlement queue forces reconciliation before you can plan again — exactly mirroring the rule-compliance structure that FTMO and other prop firms require.',
      },
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/trading-routine/page.tsx
// TARGET: "daily trading routine", "professional trader routine",
//         "weekly trading routine", "how serious traders prepare on sundays"
// ─────────────────────────────────────────────────────────────────────────────

export const tradingRoutineMetadata: Metadata = {
  title: 'The Weekly Trading Routine That Builds Consistency',
  description:
    'Professional discretionary traders do not rely on motivation. They follow a fixed weekly structure — weekend prep, daily execution limits, nightly reconciliation. Here is the routine.',
  alternates: { canonical: '/trading-routine' },
  openGraph: {
    title: 'The Weekly Trading Routine That Builds Consistency | MyTraderDesk',
    description:
      'How serious traders prepare on Sundays, execute with discipline Monday to Friday, and debrief before doing it again. The complete structure.',
    url: 'https://www.mytraderdesk.com/trading-routine',
    images: [{
      url: '/api/og?title=The+Weekly+Trading+Routine+That+Builds+Consistency&sub=How+professional+traders+structure+their+week&tag=Routine+%26+Structure',
      width: 1200, height: 630
    }],
  },
}

const tradingRoutineFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does a professional trader do on weekends?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Professional discretionary traders use Saturday and Sunday to review the previous week — P&L attribution, behavioral leaks, execution quality — and prepare the coming week by identifying setups with clear thesis, direction, and playbook. This prep window is sacred. Nothing is traded without first being planned.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a daily trading routine for serious traders?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A structured daily routine: (1) Pre-session — review your active setups from the vault, check macro conditions, complete your pre-session checklist. (2) Session — execute only pre-planned setups, log each trade immediately with execution quality and catalyst. (3) Post-session — reconcile any closed trades in the settlement queue. Deviating from this routine is the source of most execution mistakes.',
      },
    },
    {
      '@type': 'Question',
      name: 'How many trades should a serious trader take per day?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Quality discretionary traders take 1–2 trades per day at most. More than that is almost always overtrading — taking marginal setups when the high-probability ones have already been executed or are not present. MyTraderDesk enforces a 2-trade daily limit by design.',
      },
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/execution-tracking/page.tsx
// TARGET: "execution tracking for traders", "trade execution analysis",
//         "trader accountability system", "strategy adherence tracking"
// ─────────────────────────────────────────────────────────────────────────────

export const executionTrackingMetadata: Metadata = {
  title: 'Execution Tracking — The Discipline Layer Missing From Most Trading',
  description:
    'Most traders track P&L. Elite traders track execution quality. The difference between Perfect and Imperfect execution tells you more about your performance than your win rate.',
  alternates: { canonical: '/execution-tracking' },
  openGraph: {
    title: 'Execution Tracking for Traders | MyTraderDesk',
    description:
      'Log every trade with execution quality, behavioral catalyst, and post-trade autopsy. The discipline data that actually improves performance.',
    url: 'https://www.mytraderdesk.com/execution-tracking',
    images: [{
      url: '/api/og?title=Execution+Tracking+for+Traders&sub=The+discipline+layer+missing+from+most+trading&tag=Execution+System',
      width: 1200, height: 630
    }],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/trader-psychology/page.tsx
// TARGET: "trading psychology system", "why my trading psychology breaks",
//         "fomo trading fix", "revenge trading solution", "impulsive trading"
// ─────────────────────────────────────────────────────────────────────────────

export const traderPsychologyMetadata: Metadata = {
  title: 'Your Trading Psychology Breaks Because Your Process Is Weak',
  description:
    'Traders do not have psychology problems. They have process gaps that create the conditions for psychological failure. Fix the process and the psychology fixes itself.',
  alternates: { canonical: '/trader-psychology' },
  openGraph: {
    title: 'Trading Psychology — Why Process Fixes What Mindset Cannot | MyTraderDesk',
    description:
      'FOMO, revenge trading, and overtrading are not emotional weaknesses. They are predictable outcomes of a trading environment without structural constraints.',
    url: 'https://www.mytraderdesk.com/trader-psychology',
    images: [{
      url: '/api/og?title=Your+Psychology+Breaks+Because+Your+Process+Is+Weak&sub=Fix+the+system%2C+not+the+emotion&tag=Trading+Psychology',
      width: 1200, height: 630
    }],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/trading-accountability/page.tsx
// TARGET: "trader accountability", "trading accountability system",
//         "trading mentor accountability", "self-accountability trading"
// ─────────────────────────────────────────────────────────────────────────────

export const tradingAccountabilityMetadata: Metadata = {
  title: 'Accountability Infrastructure for Independent Traders',
  description:
    'Accountability is not about someone watching you trade. It is about a system that requires you to account for every decision before you can make the next one.',
  alternates: { canonical: '/trading-accountability' },
  openGraph: {
    title: 'Trader Accountability Infrastructure | MyTraderDesk',
    description:
      'The post-trade settlement queue, behavioral catalyst logging, and weekly debrief create structural accountability without a coach or mentor.',
    url: 'https://www.mytraderdesk.com/trading-accountability',
    images: [{
      url: '/api/og?title=Accountability+Infrastructure+for+Traders&sub=Structural+accountability+without+a+mentor&tag=Accountability',
      width: 1200, height: 630
    }],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/vs/trading-journal/page.tsx
// TARGET: "trading journal alternative", "better than edgewonk",
//         "tradervue alternative", "trading journal vs system"
// Comparison pages rank fast — traders in research mode are close to converting.
// ─────────────────────────────────────────────────────────────────────────────

export const vsJournalMetadata: Metadata = {
  title: 'MyTraderDesk vs Trading Journals — Why Structure Beats Logging',
  description:
    'Edgewonk, Tradervue, and TraderSync record what happened. MyTraderDesk enforces what must happen. The difference between a passive journal and an active execution system.',
  alternates: { canonical: '/vs/trading-journal' },
  openGraph: {
    title: 'MyTraderDesk vs Trading Journals | MyTraderDesk',
    description:
      'A trading journal asks you to be honest after the fact. MyTraderDesk requires accountability before the next trade is permitted.',
    url: 'https://www.mytraderdesk.com/vs/trading-journal',
    images: [{
      url: '/api/og?title=MyTraderDesk+vs+Trading+Journals&sub=Why+structure+beats+logging&tag=Comparison',
      width: 1200, height: 630
    }],
  },
}

const vsJournalSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the difference between a trading journal and MyTraderDesk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A trading journal is passive — it records your trades and shows you statistics after the fact. MyTraderDesk is active — it enforces your weekly prep, limits your daily executions, and requires post-trade settlement before you can plan the next week. One logs your behavior, the other constrains it.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is MyTraderDesk an alternative to Edgewonk?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'MyTraderDesk is a different category from Edgewonk. Edgewonk is a journal with analytics — it shows you patterns in your historical data. MyTraderDesk is an execution operating system — it prevents the behavioral patterns that create bad data in the first place. Both can be used, but they solve different problems.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why do trading journals fail to build consistency?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Journals require you to voluntarily record honest information about your mistakes, then voluntarily change your behavior based on that information — while still in the same unstructured trading environment that caused the mistakes. Compliance with journaling habits is extremely low under stress. MyTraderDesk removes voluntary compliance from the equation.',
      },
    },
  ],
}
