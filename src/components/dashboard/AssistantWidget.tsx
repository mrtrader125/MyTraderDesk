'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Loader2 } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string }

export default function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  const customSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const currentMessages: Message[] = [...messages, { role: 'user', content: input }]
    setMessages(currentMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Server error')

      setMessages((prev) => [...prev, { role: 'assistant', content: data.text }])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages((prev) => [...prev, { role: 'assistant', content: "Connection error. Please check your network." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    // 🚨 UPDATED: Now fixed to the bottom-right
    <div className="fixed bottom-[85px] right-4 md:bottom-6 md:right-6 z-[9999] flex flex-col items-end">
      
      {/* THE CHAT WINDOW */}
      <div 
        className={`bg-[#0a0a0a] border border-neutral-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 origin-bottom-right mb-4 flex flex-col ${
          isOpen ? 'w-[calc(100vw-32px)] md:w-[380px] h-[500px] opacity-100 scale-100' : 'w-0 h-0 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-900 bg-[#0d0d0d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <Bot size={16} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest leading-none">Operator AI</h3>
              <p className="text-[9px] text-emerald-500 font-bold mt-0.5 tracking-wider">ONLINE</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-neutral-500 hover:text-white transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#050505]">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3">
              <Bot size={32} className="text-neutral-600" />
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 max-w-[200px]">
                I am your dedicated trading assistant. How can I help optimize your session today?
              </p>
            </div>
          )}
          
          {messages.map((m, index) => (
            <div key={index} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600/10 text-blue-100 border border-blue-500/20 rounded-br-none' 
                    : 'bg-[#111] text-neutral-300 border border-neutral-800 rounded-bl-none'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#111] border border-neutral-800 rounded-xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="text-blue-500 animate-spin" />
                <span className="text-xs text-neutral-500 font-medium tracking-wide">Processing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={customSubmit} className="p-3 bg-[#0d0d0d] border-t border-neutral-900 shrink-0">
          <div className="relative flex items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the assistant..."
              className="w-full bg-[#111] border border-neutral-800 rounded-xl py-2.5 pl-4 pr-12 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded-lg transition-all"
            >
              <Send size={16} className={isLoading || !input.trim() ? "opacity-50" : ""} />
            </button>
          </div>
        </form>
      </div>

      {/* THE TOGGLE BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-neutral-800 text-white border border-neutral-700' : 'bg-blue-600 text-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>
      
    </div>
  )
}
