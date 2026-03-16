export default function AccountInfo(){

return(

<div className='glass-card p-6'>

<h3 className='text-lg font-semibold text-white mb-6'>
Account Information
</h3>

<div className='space-y-4 text-sm'>

<div className='flex justify-between border-b border-neutral-800 pb-3'>
<span className='text-gray-400'>Full Name</span>
<span className='text-white'>Mark Thompson</span>
</div>

<div className='flex justify-between border-b border-neutral-800 pb-3'>
<span className='text-gray-400'>Email</span>
<span className='text-white'>mark@example.com</span>
</div>

<div className='flex justify-between border-b border-neutral-800 pb-3'>
<span className='text-gray-400'>Password</span>
<span className='text-white'>•••••••</span>
</div>

<div className='flex justify-between border-b border-neutral-800 pb-3'>
<span className='text-gray-400'>Joined</span>
<span className='text-white'>February 12, 2024</span>
</div>

<div className='flex justify-between'>
<span className='text-gray-400'>Last Login</span>
<span className='text-white'>20 minutes ago</span>
</div>

</div>

<button className='mt-6 bg-[#d4a852] text-black px-4 py-2 rounded'>
Edit Profile
</button>

</div>

)

}
