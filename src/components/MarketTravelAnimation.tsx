'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation, ArrowDown, LogIn, LogOut, Activity } from 'lucide-react'

export default function MarketTravelAnimation() {
  const [phase, setPhase] = useState(0) // 0 = Waiting, 1 = Traveling, 2 = Finished

  // The Master Director: Controls the story timing
  useEffect(() => {
    let isMounted = true;
    
    const runCycle = async () => {
      while (isMounted) {
        setPhase(0); // Start at Entry
        await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds
        
        if (!isMounted) break;
        setPhase(1); // Travel
        await new Promise(r => setTimeout(r, 3000)); // Travel for 3 seconds
        
        if (!isMounted) break;
        setPhase(2); // Hit Target
        await new Promise(r => setTimeout(r, 2000)); // Celebrate profit for 2 seconds
      }
    };

    runCycle();
    
    // Cleanup function to prevent memory leaks if user leaves the page
    return () => { isMounted = false };
  }, [])

  const currentPhase = phase === 0 
    ? { title: "1. The Setup", desc: "The market is moving endlessly. We wait patiently at our defined entry for the right setup.", status: "Observing", color: "text-neutral-500", bg: "bg-neutral-500/10", border: "border-neutral-500/20" }
    : phase === 1 
    ? { title: "2. The Journey", desc: "Setup aligned. We step into the market stream, traveling a small distance with the momentum.", status: "In Trade", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" }
    : { title: "3. The Exit", desc: "Target reached. We step out and secure profit. The market continues its endless travel without us.", status: "Profit Secured", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" }

  return (
    <div className="bg-[#0a0a0a] border border-neutral-900 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] font-sans w-full h-full flex flex-col relative overflow-hidden min-h-[500px]">
      
      {/* CSS Endless Background Grid */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes endless-flow {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0%); }
        }
        .animate-endless-flow {
          animation: endless-flow 3s linear infinite;
        }
      `}} />
      <div className="absolute top-0 left-0 w-full h-[200%] bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] animate-endless-flow pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col h-full p-6 md:p-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 border-b border-neutral-900 pb-4 shrink-0">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center">
            <Activity className="w-4 h-4 text-blue-500 mr-2" />
            Market Telemetry
          </h3>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm border transition-all duration-300 ${currentPhase.color} ${currentPhase.bg} ${currentPhase.border}`}>
            {currentPhase.status}
          </span>
        </div>

        {/* MAIN SPLIT VIEW */}
        <div className="flex flex-1 gap-6 relative">
          
          {/* LEFT: Dynamic Text Panel */}
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="bg-[#0a0a0a] border border-neutral-800 rounded-lg p-5 transition-all duration-500 relative overflow-hidden min-h-[140px]">
               <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${phase === 0 ? 'bg-neutral-700' : phase === 1 ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
               
               {/* Framer Motion Text Crossfade */}
               <AnimatePresence mode="wait">
                 <motion.div
                   key={phase}
                   initial={{ opacity: 0, y: 5 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -5 }}
                   transition={{ duration: 0.3 }}
                 >
                   <h4 className="text-white text-[11px] font-black uppercase tracking-widest mb-2">
                     {currentPhase.title}
                   </h4>
                   <p className="text-neutral-500 text-[10px] md:text-xs leading-relaxed font-medium">
                     {currentPhase.desc}
                   </p>
                 </motion.div>
               </AnimatePresence>
            </div>

            <div className="hidden sm:block">
              <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest mb-2">Live Parameters</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-[#0a0a0a] px-3 py-2 rounded-md border border-neutral-900">
                  <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Market Flow</span>
                  <span className="text-[10px] font-mono text-neutral-400 flex items-center"><ArrowDown className="w-3 h-3 mr-1"/> Endless</span>
                </div>
                <div className="flex justify-between items-center bg-[#0a0a0a] px-3 py-2 rounded-md border border-neutral-900">
                  <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Our Journey</span>
                  <span className={`text-[10px] font-mono transition-colors duration-300 ${phase === 1 ? 'text-blue-400' : 'text-neutral-600'}`}>
                    {phase === 1 ? `Active Execution` : 'Idle / Flat'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: THE GPU-ACCELERATED ENDLESS TRACK */}
          <div className="w-24 md:w-32 shrink-0 relative border-l border-neutral-900 bg-gradient-to-b from-transparent via-[#0a0a0a] to-transparent flex justify-center">
            
            <div className="absolute top-0 w-[1px] h-full bg-neutral-800"></div>

            {/* Static Entry Station */}
            <div className="absolute w-12 h-px bg-neutral-700 top-[25%]"></div>
            <div className="absolute right-1/2 pr-8 flex flex-col items-end top-[calc(25%-8px)]">
               <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap flex items-center">
                 Entry <LogIn className="w-3 h-3 ml-1" />
               </span>
            </div>

            {/* Static Target Station */}
            <div className="absolute w-12 h-px bg-neutral-700 top-[75%]"></div>
            <div className="absolute right-1/2 pr-8 flex flex-col items-end top-[calc(75%-8px)]">
               <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap flex items-center">
                 Exit <LogOut className="w-3 h-3 ml-1" />
               </span>
            </div>

            {/* GPU ACCELERATED MARKET FLOW (Endless Loop) */}
            <motion.div 
              className="absolute w-[2px] h-32 bg-gradient-to-b from-transparent via-neutral-500/50 to-transparent z-10"
              animate={{ top: ["-20%", "120%"] }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            />

            {/* GPU ACCELERATED TRADER DOT */}
            <motion.div 
              className="absolute w-3 rounded-full z-20 flex items-center justify-center origin-center"
              initial={{ top: "25%" }}
              animate={{ 
                // Move from Entry (25%) to Target (75%) instantly if reset, smoothly if trading
                top: phase === 0 ? "25%" : phase === 1 ? "75%" : "75%",
                // Visual changes based on phase
                height: phase === 0 ? "12px" : phase === 1 ? "32px" : "16px",
                backgroundColor: phase === 0 ? "#404040" : phase === 1 ? "#3b82f6" : "#10b981",
                borderColor: phase === 0 ? "#525252" : phase === 1 ? "#60a5fa" : "#34d399",
                borderWidth: phase === 0 ? "2px" : "1px",
                boxShadow: phase === 1 ? "0 0 30px rgba(59,130,246,0.8)" : phase === 2 ? "0 0 20px rgba(16,185,129,0.5)" : "none",
                opacity: 1 // FIX: Hardcoded to 1 to prevent scoping crashes
              }}
              transition={{ 
                top: { duration: phase === 1 ? 3 : 0, ease: "linear" }, // Takes 3 seconds to ride down
                height: { duration: 0.3 },
                backgroundColor: { duration: 0.2 }
              }}
            >
              {phase === 1 && <div className="w-1 h-3 bg-white rounded-full"></div>}
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  )
}
