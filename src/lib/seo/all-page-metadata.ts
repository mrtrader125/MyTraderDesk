// ═══════════════════════════════════════════════════════════════════════════════
// SEO METADATA — ALL PUBLIC PAGES
// Drop each export into its corresponding page.tsx file.
// Every page also needs: alternates.canonical set, and OG image.
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/about/page.tsx
// TARGET QUERIES: "mytraderdesk story", "trading desk philosophy", "trader system origin"
// ─────────────────────────────────────────────────────────────────────────────
export const aboutMetadata = {
  title: 'Our Story — Why We Built a Trader Operating System',
  description:
    'MyTraderDesk was built by traders who discovered consistency is a process failure, not a mindset failure. The origin of the system that enforces structure so traders can stop sabotaging themselves.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Our Story — Why We Built a Trader Operating System | MyTraderDesk',
    description:
      'Built by traders who kept breaking their own rules. The origin of MyTraderDesk and the move from discretionary chaos to systematic execution.',
    url: 'https://www.mytraderdesk.com/about',
    images: [{ url: '/og/about.png', width: 1200, height: 630 }],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/faq/page.tsx
// TARGET QUERIES: "mytraderdesk faq", "how does trading discipline system work",
//                 "trader operating system questions", "trading consistency questions"
// ─────────────────────────────────────────────────────────────────────────────
export const faqMetadata = {
  title: 'FAQ — How the Trader Operating System Works',
  description:
    'Everything serious traders ask before switching from journals to a structured execution system. How the weekly cycle, vault, trade limits, and MT5 sync work.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — How the Trader Operating System Works | MyTraderDesk',
    description:
      'Common questions about the weekly prep cycle, execution desk, trade limits, and how MyTraderDesk enforces consistency without willpower.',
    url: 'https://www.mytraderdesk.com/faq',
    images: [{ url: '/og/faq.png', width: 1200, height: 630 }],
  },
}

// FAQPage schema — inject this as <script type="application/ld+json"> in the FAQ page
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this a trading journal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. A journal records what happened. MyTraderDesk enforces what must happen — you cannot plan next week until this week is settled, you cannot exceed your daily trade limit, and every execution must be reconciled.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the weekly vault?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "The vault is your weekend prep workspace. During the Saturday-to-Monday prep window, you upload your chart setups with thesis notes, direction, and playbook. These are locked in — you can only push up to 5 setups per day into Today's Focus during the live week.",
      },
    },
    {
      '@type': 'Question',
      name: 'How does the trade limit work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can log a maximum of 2 trades per day. This is enforced by the system — not a suggestion. The limit resets at midnight IST. Overrides require a mandatory reason and are flagged in your execution log.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I connect my MT5 account?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can upload your MT5 history report (CSV or HTML) and the system matches your logged trades to broker data automatically, filling in outcome, P&L, and R:R for reconciliation.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is post-trade reconciliation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "After each trade closes, you settle it in the queue — recording the outcome (TP/SL/BE/Hold), R:R, and an after-chart. Until all trades are settled, the vault stays locked. This forces honest accounting before you can plan again.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is it suitable for prop firm traders?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Specifically designed for it. The weekly structure, daily execution limits, and behavioral tracking mirror exactly what prop firm evaluations test for: rule compliance, disciplined sizing, and consistent process.',
      },
    },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/playbook/page.tsx
// TARGET QUERIES: "trading playbook system", "professional trading playbooks",
//                 "liquidity sweep playbook", "ICT trading playbook"
// ─────────────────────────────────────────────────────────────────────────────
export const playbookMetadata = {
  title: 'The Playbook — Execution Frameworks for Serious Traders',
  description:
    'Structured trading playbooks used inside MyTraderDesk — Liquidity Sweep, Trend Continuation, Breakout/Retest, Range Play, and News Catalyst. Each framework enforces pre-defined entry conditions.',
  alternates: { canonical: '/playbook' },
  openGraph: {
    title: 'The Playbook — Execution Frameworks for Serious Traders | MyTraderDesk',
    description:
      'Five institutional-grade playbook frameworks that remove ambiguity from trade execution. Pre-defined entry conditions that feed directly into the execution desk.',
    url: 'https://www.mytraderdesk.com/playbook',
    images: [{ url: '/og/playbook.png', width: 1200, height: 630 }],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/apply/page.tsx
// TARGET QUERIES: "join professional trading desk", "apply mytraderdesk pro",
//                 "funded trader community", "serious trading community"
// ─────────────────────────────────────────────────────────────────────────────
export const applyMetadata = {
  title: 'Apply for Pro Access — Serious Traders Only',
  description:
    'MyTraderDesk Pro is for traders who understand consistency is a process problem. Apply for full access to the execution desk, live floor, and real-time market analysis.',
  alternates: { canonical: '/apply' },
  openGraph: {
    title: 'Apply for Pro Access | MyTraderDesk',
    description:
      'Full access to the trader operating system. Execution desk, MT5 sync, behavioral tracking, live floor, and real-time setups — for serious traders only.',
    url: 'https://www.mytraderdesk.com/apply',
    images: [{ url: '/og/apply.png', width: 1200, height: 630 }],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/community/page.tsx
// TARGET QUERIES: "trader community platform", "serious traders community",
//                 "trading discipline community", "funded trader network"
// ─────────────────────────────────────────────────────────────────────────────
export const communityMetadata = {
  title: 'The Community — Traders Who Operate With Structure',
  description:
    'A private community of discretionary traders building consistency through process. No signals. No noise. Shared structure, shared accountability.',
  alternates: { canonical: '/community' },
  openGraph: {
    title: 'The Community — Traders Who Operate With Structure | MyTraderDesk',
    description:
      'Join discretionary traders who have replaced willpower with process. Accountability, structure, shared discipline — not another signal group.',
    url: 'https://www.mytraderdesk.com/community',
    images: [{ url: '/og/community.png', width: 1200, height: 630 }],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/disclaimer/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
export const disclaimerMetadata = {
  title: 'Risk Disclaimer',
  description:
    'Important legal information regarding financial market risk and the use of MyTraderDesk tools and analysis.',
  alternates: { canonical: '/disclaimer' },
  robots: { index: false, follow: false }, // legal pages should not be indexed
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/privacy/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
export const privacyMetadata = {
  title: 'Privacy Policy',
  description: 'How MyTraderDesk handles and protects your personal data and trading information.',
  alternates: { canonical: '/privacy' },
  robots: { index: false, follow: false },
}

// ─────────────────────────────────────────────────────────────────────────────
// FILE: src/app/(public)/terms/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
export const termsMetadata = {
  title: 'Terms of Service',
  description: 'Operating rules and legal agreement for use of the MyTraderDesk platform.',
  alternates: { canonical: '/terms' },
  robots: { index: false, follow: false },
}
