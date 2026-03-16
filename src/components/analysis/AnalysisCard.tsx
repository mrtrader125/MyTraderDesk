import Link from "next/link"

export default function AnalysisCard({ analysis }: any) {

return (

<Link href={`/analysis/${analysis.id}`}>

<div className="glass-card p-6 cursor-pointer hover:scale-[1.02] transition">

<img
src={analysis.image_url}
className="rounded-xl mb-4 w-full"
/>

<h3 className="text-lg font-semibold">
{analysis.title}
</h3>

<p className="text-gray-400 text-sm mt-1">
{analysis.market}
</p>

</div>

</Link>

)

}