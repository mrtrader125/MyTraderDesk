'use client'
import { User, Mail, MessageSquare, Send, ShieldCheck } from 'lucide-react'

export default function ProfileClient({ email, fullName, username, telegram, isTelegramLinked }: any) {
  return (
    <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight mb-1">Public Profile</h2>
        <p className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">
          This is how others see you. To make changes, visit your Settings.
        </p>
      </div>

      {/* PERSONAL IDENTITY (READ ONLY) */}
      <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest flex items-center mb-6">
          <User className="mr-2 text-neutral-500" size={16} /> Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Full Name</label>
            <div className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold text-white shadow-inner">
              {fullName || 'Not provided'}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
              <div className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 pl-4 pr-10 text-xs font-bold text-neutral-500 shadow-inner overflow-hidden text-ellipsis">
                {email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TRADING FLOOR IDENTITY (READ ONLY) */}
      <div className="bg-blue-500/[0.02] border border-blue-500/20 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
        <h3 className="text-xs md:text-sm font-black text-blue-500 uppercase tracking-widest flex items-center mb-6">
          <MessageSquare className="mr-2" size={16} /> Community Identity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2">
            <label className="text-[9px] md:text-[10px] font-bold text-blue-500/70 uppercase tracking-widest ml-1">Permanent Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-black">@</span>
              <div className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 pl-8 pr-4 text-xs font-bold text-white shadow-inner">
                {username || 'Not set'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] md:text-[10px] font-bold text-blue-500/70 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <Send size={10} /> Telegram Sync Status
            </label>
            <div className="w-full bg-[#050505] border border-neutral-800 rounded-xl py-3 px-4 text-xs font-bold flex items-center shadow-inner">
              {isTelegramLinked ? (
                <><ShieldCheck size={14} className="text-green-500 mr-2" /><span className="text-green-500">Linked to @{telegram}</span></>
              ) : (
                <span className="text-neutral-500">Not Linked</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
