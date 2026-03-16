import { TrendingUp, Star, Coins, UserPlus } from 'lucide-react'

export default function StatsCards(){

const cards = [
{icon:TrendingUp,title:'Analyses',value:'2.8K',change:'+15.2%'},
{icon:Star,title:'Premium Users',value:'450',change:'+8.9%'},
{icon:Coins,title:'Monthly Revenue',value:',540',change:'+4.7%'},
{icon:UserPlus,title:'New Signups',value:'312',change:'+5.3%'}
]

return(

<div className='grid grid-cols-4 gap-6 mt-6'>

{cards.map((c,i)=>{

const Icon = c.icon

return(

<div key={i} className='glass-card p-6 flex items-center gap-4'>

<div className='bg-[#1f2632] p-3 rounded-lg gold'>
<Icon size={20}/>
</div>

<div>
<p className='text-sm text-gray-400'>{c.title}</p>
<h3 className='text-xl font-semibold text-white'>{c.value}</h3>
<p className='text-green-400 text-xs'>{c.change}</p>
</div>

</div>

)

})}

</div>

)

}
