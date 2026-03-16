export default function AdminAnalysisTable(){

return(

<div className='glass-card p-6 mt-6'>

<table className='w-full text-sm'>

<thead className='text-gray-400 border-b border-neutral-800'>

<tr>
<th className='text-left pb-3'>Market</th>
<th className='text-left pb-3'>Pair</th>
<th className='text-left pb-3'>Status</th>
<th className='text-left pb-3'>Posted</th>
<th className='text-left pb-3'>Actions</th>
</tr>

</thead>

<tbody className='text-white'>

<tr className='border-b border-neutral-800'>
<td className='py-4'>
<span className='bg-blue-500/20 text-blue-400 px-2 py-1 rounded'>
Forex
</span>
</td>

<td>EUR/USD Breakout</td>

<td>
<span className='bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded'>
Premium
</span>
</td>

<td className='text-gray-400'>2 hours ago</td>

<td className='space-x-2'>

<button className='bg-[#d4a852] text-black px-3 py-1 rounded'>
Edit
</button>

<button className='bg-red-500/20 text-red-400 px-3 py-1 rounded'>
Delete
</button>

</td>

</tr>


<tr className='border-b border-neutral-800'>

<td className='py-4'>
<span className='bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded'>
Gold
</span>
</td>

<td>XAU/USD Support</td>

<td>
<span className='bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded'>
Premium
</span>
</td>

<td className='text-gray-400'>18 hours ago</td>

<td className='space-x-2'>

<button className='bg-[#d4a852] text-black px-3 py-1 rounded'>
Edit
</button>

<button className='bg-red-500/20 text-red-400 px-3 py-1 rounded'>
Delete
</button>

</td>

</tr>


<tr className='border-b border-neutral-800'>

<td className='py-4'>
<span className='bg-purple-500/20 text-purple-400 px-2 py-1 rounded'>
Crypto
</span>
</td>

<td>BTC/USD Trend</td>

<td>
<span className='bg-neutral-700 px-2 py-1 rounded'>
Free
</span>
</td>

<td className='text-gray-400'>22 hours ago</td>

<td className='space-x-2'>

<button className='bg-[#d4a852] text-black px-3 py-1 rounded'>
Edit
</button>

<button className='bg-red-500/20 text-red-400 px-3 py-1 rounded'>
Delete
</button>

</td>

</tr>

</tbody>

</table>

</div>

)

}
