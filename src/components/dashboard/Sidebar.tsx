'use client'

import { LayoutDashboard, BarChart3, Users, CreditCard, User } from 'lucide-react'
import Link from 'next/link'

export default function Sidebar(){

return(

<div className='w-64 h-screen bg-[#0b0f16] border-r border-[#1f2632] p-6 flex flex-col'>

<h1 className='text-xl text-white font-semibold mb-10'>
Dashboard
</h1>

<nav className='space-y-2'>

<Link href="/dashboard" className='flex items-center gap-3 p-3 sidebar-active'>
<LayoutDashboard size={18}/>
Dashboard
</Link>

<Link href="/markets" className='flex items-center gap-3 p-3 text-gray-400 hover:text-white'>
<BarChart3 size={18}/>
Analysis
</Link>

<Link href="/admin/users" className='flex items-center gap-3 p-3 text-gray-400 hover:text-white'>
<Users size={18}/>
Users
</Link>

<Link href="/billing" className='flex items-center gap-3 p-3 text-gray-400 hover:text-white'>
<CreditCard size={18}/>
Billing
</Link>

<Link href="/profile" className='flex items-center gap-3 p-3 text-gray-400 hover:text-white'>
<User size={18}/>
Profile
</Link>

</nav>

</div>

)

}
