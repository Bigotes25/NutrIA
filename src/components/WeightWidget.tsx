'use client'

import { useState } from 'react'
import { Scale, ChevronRight } from 'lucide-react'
import { logWeight } from '@/app/dashboard/actions'

interface WeightWidgetProps {
  currentWeight?: number | null
}

export function WeightWidget({ currentWeight }: WeightWidgetProps) {
  const [weight, setWeight] = useState(currentWeight?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!weight || loading) return
    setLoading(true)
    try {
      await logWeight(parseFloat(weight))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="premium-card p-6 flex items-center justify-between group">
      <div className="flex items-center gap-5">
        <div className="bg-slate-900 group-hover:bg-emerald-600 text-white p-4 rounded-3xl shadow-lg transition-all duration-500">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peso Corporal</p>
          <div className="flex items-baseline gap-1">
            <input 
              type="number" 
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="text-3xl font-black text-slate-900 bg-transparent w-24 outline-none tabular-nums"
              placeholder="0.0"
            />
            <span className="text-xs font-black text-slate-400 uppercase">kg</span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleSave}
        disabled={loading || !weight}
        className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-90 shadow-xl ${
          saved 
            ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
            : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 shadow-slate-900/10'
        }`}
      >
        {loading ? '...' : saved ? '¡LOG!' : 'LOG'}
      </button>
    </div>
  )
}
