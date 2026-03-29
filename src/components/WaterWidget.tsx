'use client'

import { useState } from 'react'
import { Droplet, Plus } from 'lucide-react'
import { addWater } from '@/app/dashboard/actions'

export function WaterWidget({ consumed, target }: { consumed: number, target: number }) {
  const [loading, setLoading] = useState(false)
  const percent = Math.min(100, (consumed / target) * 100)

  return (
    <div className="premium-card p-6 relative overflow-hidden group">
      <div className="absolute -top-12 -right-12 opacity-5 group-hover:opacity-10 transition-all duration-500">
        <Droplet className="w-32 h-32 text-blue-500" />
      </div>
      <div className="flex justify-between items-center relative z-10">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
            <Droplet className="w-4 h-4 text-blue-500" /> Hidratación
          </h3>
          <p className="text-3xl font-black text-slate-900 tabular-nums">
            {consumed} <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">ml registrados</span>
          </p>
        </div>
        <button 
          onClick={async () => {
            setLoading(true)
            await addWater(250)
            setLoading(false)
          }}
          disabled={loading}
          className="bg-blue-600 text-white font-black py-3 px-5 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-90 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> 250
        </button>
      </div>
      
      <div className="w-full bg-slate-100 h-4 rounded-full mt-6 overflow-hidden relative z-10 p-0.5 border border-slate-200/50">
        <div className="bg-blue-500 h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${percent}%`}} />
      </div>
      <p className="mt-2 text-[10px] font-black text-slate-400 text-right uppercase tracking-widest">Meta Diaria: {target}ml</p>
    </div>
  )
}
