export default function AdminUsersTable(){

return(

<div className='glass-card p-6 mt-6'>

<table className='w-full text-sm'>

<thead className='text-gray-400 border-b border-neutral-800'>

<tr>
<th className='text-left pb-3'>Name</th>
<th className='text-left pb-3'>Email</th>
<th className='text-left pb-3'>Plan</th>
<th className='text-left pb-3'>Markets</th>
<th className='text-left pb-3'>Actions</th>
</tr>

</thead>

<tbody className='text-white'>

<tr className='border-b border-neutral-800'>

<td className='py-4 flex items-center gap-3'>
<img src='https://i.pravatar.cc/40?img=1' className='rounded-full'/>
Mark Thompson
</td>

<td className='text-gray-400'>
mark@example.com
</td>

<td>
<span className='bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded'>
Premium
</span>
</td>

<td className='space-x-2'>

<span className='bg-blue-500/20 text-blue-400 px-2 py-1 rounded'>Forex</span>
<span className='bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded'>Gold</span>
<span className='bg-purple-500/20 text-purple-400 px-2 py-1 rounded'>Crypto</span>

</td>

<td className='space-x-2'>

<button className='bg-[#d4a852] text-black px-3 py-1 rounded'>
Upgrade
</button>

<button className='bg-neutral-700 px-3 py-1 rounded'>
Edit
</button>

</td>

</tr>


<tr className='border-b border-neutral-800'>

<td className='py-4 flex items-center gap-3'>
<img src='https://i.pravatar.cc/40?img=2' className='rounded-full'/>
Emily White
</td>

<td className='text-gray-400'>
emily@example.com
</td>

<td>
<span className='bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded'>
Premium
</span>
</td>

<td className='space-x-2'>

<span className='bg-blue-500/20 text-blue-400 px-2 py-1 rounded'>Forex</span>
<span className='bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded'>Gold</span>

</td>

<td className='space-x-2'>

<button className='bg-[#d4a852] text-black px-3 py-1 rounded'>
Upgrade
</button>

<button className='bg-neutral-700 px-3 py-1 rounded'>
Edit
</button>

</td>

</tr>


<tr>

<td className='py-4 flex items-center gap-3'>
<img src='https://i.pravatar.cc/40?img=3' className='rounded-full'/>
John Carter
</td>

<td className='text-gray-400'>
john@example.com
</td>

<td>
<span className='bg-neutral-700 px-2 py-1 rounded'>
Free
</span>
</td>

<td className='space-x-2'>

<span className='bg-blue-500/20 text-blue-400 px-2 py-1 rounded'>Forex</span>
<span className='bg-purple-500/20 text-purple-400 px-2 py-1 rounded'>Crypto</span>

</td>

<td className='space-x-2'>

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
