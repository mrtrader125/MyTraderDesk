export default function ProfileHeader(){

return(

<div className='flex items-center gap-6 mb-10'>

<img
src='https://i.pravatar.cc/200'
className='w-32 h-32 rounded-full border border-neutral-700'
/>

<div>

<h2 className='text-3xl font-semibold text-white'>
Mark Thompson
</h2>

<p className='text-gray-400'>
mark@example.com
</p>

<div className='mt-2 inline-flex items-center gap-2 bg-[#d4a852]/20 text-[#d4a852] px-3 py-1 rounded-lg text-sm'>
⭐ Premium Member
</div>

</div>

</div>

)

}
