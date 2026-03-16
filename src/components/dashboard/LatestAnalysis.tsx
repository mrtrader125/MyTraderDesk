export default function LatestAnalysis(){

return(

<div className='bg-[#0f131a] border border-[#1e242d] rounded-xl p-6'>

<h3 className='text-lg font-semibold text-white mb-4'>
Latest Analysis
</h3>

<div className='space-y-4'>

<div className='flex justify-between'>
<div>
<p className='text-white'>EUR/USD Breakout</p>
<p className='text-gray-400 text-sm'>Forex</p>
</div>
<p className='text-gray-500 text-sm'>30m</p>
</div>

<div className='flex justify-between'>
<div>
<p className='text-white'>XAU/USD Support</p>
<p className='text-gray-400 text-sm'>Gold</p>
</div>
<p className='text-gray-500 text-sm'>1h</p>
</div>

<div className='flex justify-between'>
<div>
<p className='text-white'>BTC Trend Reversal</p>
<p className='text-gray-400 text-sm'>Crypto</p>
</div>
<p className='text-gray-500 text-sm'>2h</p>
</div>

</div>

</div>

)

}
