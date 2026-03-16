'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Signup(){

const router = useRouter()

const [email,setEmail] = useState('')
const [password,setPassword] = useState('')
const [loading,setLoading] = useState(false)
const [error,setError] = useState('')

async function signup(){

setLoading(true)
setError('')

const { error } = await supabase.auth.signUp({
email,
password
})

setLoading(false)

if(error){
setError(error.message)
return
}

router.push('/dashboard')

}

return(

<div className='min-h-screen flex items-center justify-center bg-black text-white'>

<div className='bg-neutral-900 p-8 rounded-xl w-full max-w-md'>

<h1 className='text-3xl font-bold text-center'>
Create Account
</h1>

<input
type='email'
placeholder='Email'
className='w-full mt-6 p-3 bg-neutral-800 rounded'
onChange={(e)=>setEmail(e.target.value)}
/>

<input
type='password'
placeholder='Password'
className='w-full mt-4 p-3 bg-neutral-800 rounded'
onChange={(e)=>setPassword(e.target.value)}
/>

{error && (
<p className='text-red-500 mt-3 text-sm'>
{error}
</p>
)}

<button
onClick={signup}
disabled={loading}
className='w-full mt-6 py-3 bg-white text-black rounded font-semibold'
>

{loading ? 'Creating account...' : 'Sign Up'}

</button>

<p className='text-center mt-4 text-gray-400'>

Already have an account?

<Link href='/login' className='ml-2 text-white underline'>
Login
</Link>

</p>

</div>

</div>

)

}
