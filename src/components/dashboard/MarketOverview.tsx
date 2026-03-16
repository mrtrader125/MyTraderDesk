'use client'

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
{time:'00',price:1.08},
{time:'02',price:1.09},
{time:'04',price:1.07},
{time:'06',price:1.10},
{time:'08',price:1.11},
{time:'10',price:1.12},
]

export default function MarketOverview(){

return(

<div className='bg-[#0f131a] border border-[#1e242d] rounded-xl p-6 mt-8'>

<h3 className='text-lg font-semibold text-white mb-4'>
Market Overview
</h3>

<div className='h-64'>

<ResponsiveContainer width="100%" height="100%">

<LineChart data={data}>

<XAxis dataKey="time" stroke="#555"/>

<Tooltip/>

<Line
type="monotone"
dataKey="price"
stroke="#facc15"
strokeWidth={2}
/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

)

}
