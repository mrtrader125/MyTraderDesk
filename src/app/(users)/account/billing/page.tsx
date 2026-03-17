'use client'

import { CreditCard, Download, ExternalLink } from 'lucide-react'

export default function BillingPage() {
  // Dummy data until Stripe is connected
  const invoices = [
    { date: 'Mar 2, 2026', amount: '$49.00', status: 'Paid', id: 'INV-3049' },
    { date: 'Feb 2, 2026', amount: '$49.00', status: 'Paid', id: 'INV-2841' },
    { date: 'Jan 2, 2026', amount: '$49.00', status: 'Paid', id: 'INV-1920' },
  ]

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Billing & Invoices</h2>
        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Manage your payment methods and financial history.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center">
          <CreditCard className="mr-2 text-neutral-500" size={16} /> Payment Method
        </h3>
        <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-2xl bg-[#050505]">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-8 bg-white rounded flex items-center justify-center text-blue-900 font-black italic text-xs">VISA</div>
            <div>
              <p className="text-xs font-bold text-white tracking-widest">•••• •••• •••• 4242</p>
              <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mt-0.5">Expires 12/28</p>
            </div>
          </div>
          <button className="text-[10px] font-black text-neutral-400 uppercase tracking-widest hover:text-white transition-colors">
            Update
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Billing History</h3>
        <div className="space-y-2">
          {invoices.map((inv, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border-b border-neutral-800/50 hover:bg-white/5 transition-colors rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white uppercase tracking-widest">{inv.date}</span>
                <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mt-1">{inv.id}</span>
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-xs font-black text-emerald-500">{inv.amount}</span>
                <button className="text-neutral-500 hover:text-white transition-colors"><Download size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}