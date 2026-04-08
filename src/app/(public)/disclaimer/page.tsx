import { Metadata } from 'next'
import { AlertTriangle, TrendingDown, Info } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Risk Disclaimer | MyTraderDesk',
  description: 'Important legal warning regarding financial market risk.',
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-6" size={48} />
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Risk <span className="text-red-500">Disclaimer</span></h1>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Required Regulatory Notice</p>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 md:p-12 space-y-6">
          <p className="text-red-200 text-sm font-black uppercase tracking-widest flex items-center">
            <Info size={18} className="mr-3" /> High Risk Investment Warning
          </p>
          <div className="space-y-4 text-sm leading-relaxed text-neutral-400 font-medium">
            <p>Trading Forex, Cryptocurrencies, and Commodities involves a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you.</p>
            <p>Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment.</p>
            <p><strong>Past performance is not indicative of future results.</strong> Sentinel Vortex and MyTraderDesk are not liable for any financial losses incurred through the use of our analysis.</p>
          </div>
        </div>
      </div>
    </div>
  )
}