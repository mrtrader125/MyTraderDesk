'use client'

import Link from 'next/link'

export default function Home(){

return(

<div className='bg-black text-neutral-900 dark:text-white min-h-screen'>

{/* HERO */}

<section className='text-center py-24 px-6'>

<h1 className='text-5xl font-bold'>
Professional Market Analysis
</h1>

<p className='mt-6 text-gray-400 max-w-2xl mx-auto'>
Daily Forex, Gold and Crypto technical analysis designed for serious traders.
Stay ahead of the market with professional insights.
</p>

<div className='mt-8 flex justify-center gap-4'>

<Link href="/signup" className='px-6 py-3 bg-white text-black rounded-lg font-semibold'>
Get Started
</Link>

<Link href="/markets" className='px-6 py-3 border border-gray-600 rounded-lg'>
View Analysis
</Link>

</div>

</section>

{/* FEATURES */}

<section className='max-w-6xl mx-auto py-20 px-6'>

<h2 className='text-3xl font-bold text-center'>
Why Use Our Analysis
</h2>

<div className='grid md:grid-cols-3 gap-10 mt-12'>

<div className='bg-neutral-900 p-6 rounded-xl'>
<h3 className='text-xl font-semibold'>Professional Charts</h3>
<p className='text-gray-400 mt-3'>
Clear chart analysis with key levels and trade setups.
</p>
</div>

<div className='bg-neutral-900 p-6 rounded-xl'>
<h3 className='text-xl font-semibold'>Daily Market Updates</h3>
<p className='text-gray-400 mt-3'>
Stay updated with new analysis posted regularly.
</p>
</div>

<div className='bg-neutral-900 p-6 rounded-xl'>
<h3 className='text-xl font-semibold'>Multiple Markets</h3>
<p className='text-gray-400 mt-3'>
Forex, Gold and Crypto coverage in one place.
</p>
</div>

</div>

</section>

{/* MARKETS */}

<section className='max-w-6xl mx-auto py-20 px-6'>

<h2 className='text-3xl font-bold text-center'>
Markets Covered
</h2>

<div className='grid md:grid-cols-3 gap-8 mt-12 text-center'>

<div className='bg-neutral-900 p-8 rounded-xl'>
<h3 className='text-xl font-semibold'>Forex</h3>
<p className='text-gray-400 mt-3'>
EURUSD, GBPUSD and major currency pairs.
</p>
</div>

<div className='bg-neutral-900 p-8 rounded-xl'>
<h3 className='text-xl font-semibold'>Gold</h3>
<p className='text-gray-400 mt-3'>
Technical analysis for XAUUSD and gold markets.
</p>
</div>

<div className='bg-neutral-900 p-8 rounded-xl'>
<h3 className='text-xl font-semibold'>Crypto</h3>
<p className='text-gray-400 mt-3'>
BTC, ETH and key crypto market structures.
</p>
</div>

</div>

</section>

{/* PRICING */}

<section className='max-w-5xl mx-auto py-20 px-6 text-center'>

<h2 className='text-3xl font-bold'>
Pricing
</h2>

<div className='grid md:grid-cols-2 gap-10 mt-12'>

<div className='bg-neutral-900 p-8 rounded-xl'>
<h3 className='text-2xl font-semibold'>Free</h3>
<p className='text-gray-400 mt-4'>
Limited market insights
</p>
<ul className='mt-6 space-y-2 text-gray-400'>
<li>Community updates</li>
<li>Limited analysis</li>
</ul>
</div>

<div className='bg-white text-black p-8 rounded-xl'>
<h3 className='text-2xl font-semibold'>Premium</h3>
<p className='mt-4'>
Full analysis access
</p>
<ul className='mt-6 space-y-2'>
<li>Forex analysis</li>
<li>Gold analysis</li>
<li>Crypto analysis</li>
<li>Priority updates</li>
</ul>

<Link href="/signup" className='block mt-6 px-6 py-3 bg-black text-neutral-900 dark:text-white rounded-lg'>
Join Premium
</Link>

</div>

</div>

</section>

{/* CTA */}

<section className='text-center py-24 px-6 bg-neutral-900'>

<h2 className='text-3xl font-bold'>
Start Trading Smarter Today
</h2>

<p className='text-gray-400 mt-4'>
Join traders using our professional analysis.
</p>

<Link href="/signup" className='inline-block mt-6 px-8 py-3 bg-white text-black rounded-lg font-semibold'>
Create Account
</Link>

</section>

{/* FOOTER */}

<footer className='text-center py-10 text-gray-500 text-sm'>

<p>© 2026 MyTraderDesk</p>

</footer>

</div>

)

}
