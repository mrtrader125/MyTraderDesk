// 🚨 Notice: NO 'use client' and NO Supabase imports! 
// This renders instantly on the server.

export default function ThemeWrapper({ 
  children, 
  theme = 'free' 
}: { 
  children: React.ReactNode
  theme?: string 
}) {
  return (
    <div 
      data-theme={theme !== 'free' ? theme : undefined} 
      className="flex h-screen bg-app-bg text-neutral-200 overflow-hidden font-sans selection:bg-brand-primary/30 transition-colors duration-1000"
    >
      {children}
    </div>
  )
}
