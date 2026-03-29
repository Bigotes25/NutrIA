'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Sparkles, Settings } from 'lucide-react'
import { updateProfile } from './actions'

interface EditProfileFormProps {
  initialData: any
}

export default function EditProfileForm({ initialData }: EditProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'auto' | 'manual'>(initialData.daily_calorie_target ? 'auto' : 'manual') // simplistic heuristic for default

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="sticky top-0 glass px-6 pt-12 pb-6 shadow-sm z-40 flex items-center justify-between">
        <Link href="/profile" className="text-slate-400 hover:text-slate-800 transition-all inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft className="w-5 h-5" /> Cancelar
        </Link>
        <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-tighter">
           Ajustes Pro
        </div>
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto w-full">
        <div className="mb-8 px-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic leading-none">Mi Perfil</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Configura tus datos físicos y metas</p>
        </div>

        <form action={updateProfile} onSubmit={() => setLoading(true)} className="space-y-8">
          {/* Basicos */}
          <div className="premium-card p-8 space-y-6">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-emerald-600 mb-2">Datos Básicos</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre completo</label>
              <input name="name" defaultValue={initialData.name} required className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-slate-800 text-base transition-all" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Edad</label>
                <input type="number" name="age" defaultValue={initialData.age} required className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-800 text-base" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sexo</label>
                <select name="sex" defaultValue={initialData.sex} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-800 text-base appearance-none">
                  <option value="M">Hombre</option>
                  <option value="F">Mujer</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Altura (cm)</label>
              <input type="number" name="height_cm" defaultValue={initialData.height_cm} required className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-800 text-base" />
            </div>
          </div>

          {/* Peso y Actividad */}
          <div className="premium-card p-8 space-y-6">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-indigo-600 mb-2">Estado Activo</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Peso Actual (kg)</label>
                <input type="number" step="0.1" name="current_weight_kg" defaultValue={initialData.current_weight_kg} required className="w-full px-4 py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl outline-none font-black text-xl tabular-nums" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Final (kg)</label>
                <input type="number" step="0.1" name="goal_weight_kg" defaultValue={initialData.goal_weight_kg} required className="w-full px-4 py-4 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl outline-none font-black text-xl tabular-nums" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actividad Física</label>
              <select name="activity_level" defaultValue={initialData.activity_level} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-800 text-base appearance-none">
                  <option value="SEDENTARY">Sedentario (Oficina)</option>
                  <option value="LIGHT">Ligero (1-3 días)</option>
                  <option value="MODERATE">Moderado (3-5 días)</option>
                  <option value="ACTIVE">Activo (Diario)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ritmo Perder (kg/sem)</label>
              <select name="target_loss_per_week" defaultValue={initialData.target_loss_per_week} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-slate-800 text-base appearance-none">
                  <option value="0.25">Sostenible (0.25 kg)</option>
                  <option value="0.5">Estándar (0.5 kg)</option>
                  <option value="0.75">Rápido (0.75 kg)</option>
                  <option value="1">Intenso (1.0 kg)</option>
              </select>
            </div>
          </div>

          {/* Config de Objetivos */}
          <div className="premium-card p-8 space-y-6">
             <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] mb-2 shadow-inner">
                <button type="button" onClick={() => setMode('auto')} className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'auto' ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}>
                  <Sparkles className="w-4 h-4 shadow-emerald-500/20" /> Auto
                </button>
                <button type="button" onClick={() => setMode('manual')} className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'manual' ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}>
                  <Settings className="w-4 h-4" /> Manual
                </button>
             </div>

             <input type="hidden" name="calc_mode" value={mode} />

             {mode === 'auto' ? (
               <div className="text-center p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-inner">
                  <p className="text-xs font-bold text-emerald-700 leading-relaxed uppercase tracking-tighter">La app recalculará tus objetivos de energía y agua basándose en el algoritmo Mifflin-St Jeor.</p>
               </div>
             ) : (
               <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calorías Objetivo</label>
                    <input type="number" name="manual_calories" defaultValue={initialData.daily_calorie_target} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-2xl text-slate-900 tabular-nums focus:ring-2 ring-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agua Objetivo (ml)</label>
                    <input type="number" name="manual_water" defaultValue={initialData.daily_water_target_ml} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-2xl text-slate-900 tabular-nums focus:ring-2 ring-indigo-500" />
                  </div>
               </div>
             )}
          </div>

          <div className="pt-6">
            <button disabled={loading} type="submit" className="w-full bg-slate-900 hover:bg-emerald-600 disabled:opacity-50 text-white font-black py-6 px-4 rounded-[2rem] shadow-2xl transition-all active:scale-95 flex justify-center items-center gap-3 uppercase tracking-[0.2em]">
              <Save className="w-6 h-6" />
              {loading ? 'Guardando...' : 'Aplicar Cambios'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
