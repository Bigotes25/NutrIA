'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { getCoachTip } from '@/app/dashboard/actions'

export function CoachWidget() {
  const [tip, setTip] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchTip = async () => {
    setLoading(true)
    try {
      const newTip = await getCoachTip()
      setTip(newTip)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-slate-800">
      {/* Dynamic Glow Effect */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="bg-white/5 border border-white/10 text-emerald-400 px-4 py-1.5 rounded-2xl text-[10px] font-black flex items-center gap-2 backdrop-blur-xl uppercase tracking-widest leading-none group-hover:bg-white/10 transition-colors">
            <Sparkles className="w-3.5 h-3.5 fill-emerald-400" />
            NutrIA Coach 🦦
          </div>
          <button 
            onClick={fetchTip} 
            disabled={loading}
            className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all active:scale-90"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-5 bg-white/5 rounded-full w-full animate-pulse"></div>
            <div className="h-5 bg-white/10 rounded-full w-3/4 animate-pulse"></div>
            <div className="h-5 bg-white/5 rounded-full w-1/2 animate-pulse"></div>
          </div>
        ) : tip ? (
          <p className="text-white font-bold text-xl leading-relaxed italic tracking-tight">
            &quot;{tip}&quot;
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-white/60 font-bold text-lg leading-snug">
              ¿Necesitas un consejo personalizado hoy? 🦦
            </p>
            <button 
              onClick={fetchTip}
              className="bg-emerald-500 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Generar Consejo Premium
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
