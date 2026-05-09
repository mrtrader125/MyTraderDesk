import { Loader2 } from 'lucide-react'

export default function UsersLoadingUI() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center min-h-[70vh] bg-transparent">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
        Loading...
      </p>
    </div>
  )
}
