'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RealtimeAnalysis({ initialData }: { initialData: any }) {
const [analysis,setAnalysis] = useState(initialData)

useEffect(()=>{

const channel = supabase
.channel('analysis-realtime')
.on(
'postgres_changes',
{
event:'INSERT',
schema:'public',
table:'analysis'
},
(payload)=>{

const newItem = payload.new

setAnalysis((prev)=>[newItem,...prev])

}
)
.subscribe()

return ()=>{
supabase.removeChannel(channel)
}

},[])

return(

<div className='grid grid-cols-3 gap-6 mt-6'>

{analysis.map((item)=>(

<div key={item.id} className='border p-4 rounded-lg'>

<img src={item.image_url} className='w-full'/>

<h2 className='font-bold mt-2'>
{item.title}
</h2>

<p className='text-sm mt-2'>
{item.content}
</p>

<p className='text-xs mt-3 text-gray-500'>
{item.market.toUpperCase()}
</p>

</div>

))}

</div>

)

}
