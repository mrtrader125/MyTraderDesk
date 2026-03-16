export default function MembershipCard(){

return(

<div className='glass-card p-6'>

<h3 className='text-lg font-semibold text-white mb-4'>
Membership Plan
</h3>

<div className='bg-neutral-900 rounded-lg p-5'>

<div className='flex items-center gap-3 mb-3'>

<div className='w-10 h-10 rounded-full bg-[#d4a852] flex items-center justify-center text-black font-bold'>
★
</div>

<div>
<p className='text-white font-semibold'>
Premium
</p>

<p className='text-gray-400 text-sm'>
Access all premium features
</p>
</div>

</div>

<p className='text-gray-400 text-sm'>
Renews on May 15, 2024
</p>

<div className='flex gap-3 mt-4'>

<button className='bg-[#d4a852] text-black px-4 py-2 rounded'>
Change Plan
</button>

<button className='bg-red-500/20 text-red-400 px-4 py-2 rounded'>
Cancel Plan
</button>

</div>

</div>

</div>

)

}
