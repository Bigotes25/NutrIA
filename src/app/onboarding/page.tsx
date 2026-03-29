'use client'

import { useState } from 'react'
import { completeOnboarding } from './actions'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => setTimeout(() => setLoading(true), 10)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="max-w-md mx-auto pt-12 px-6">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Configuremos tu plan</h1>
        <p className="text-slate-500 mb-8 font-medium">
          Danos unos detalles básicos para que nuestra IA te genere los objetivos diarios ideales.
        </p>
        
        <form action={completeOnboarding} onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basics */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            <h2 className="font-bold text-lg text-slate-800">Sobre ti</h2>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">¿Cómo te llamas?</label>
              <input type="text" name="name" required placeholder="Tu nombre" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Sexo biológico</label>
                <select name="sex" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium">
                  <option value="M">Hombre</option>
                  <option value="F">Mujer</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Edad</label>
                <input type="number" name="age" required min="14" max="100" placeholder="Ej. 28" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Altura (cm)</label>
                <input type="number" name="height_cm" required min="100" max="250" placeholder="Ej. 175" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400" />
              </div>
            </div>
          </div>
          
          {/* Section 2: Weight Goals */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            <h2 className="font-bold text-lg text-slate-800">Tus objetivos</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Peso actual (kg)</label>
                <input type="number" name="current_weight_kg" step="0.1" required min="30" max="300" placeholder="Ej. 80" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Peso ideal (kg)</label>
                <input type="number" name="goal_weight_kg" step="0.1" required min="30" max="300" placeholder="Ej. 70" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400" />
              </div>
            </div>
          </div>

          {/* Section 3: Lifestyle */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">
            <h2 className="font-bold text-lg text-slate-800">Estilo de vida</h2>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Nivel de actividad diario</label>
              <select name="activity_level" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 font-medium">
                <option value="SEDENTARY">Sedentario (Poco ejercicio)</option>
                <option value="LIGHT">Ligero (1-3 días/sem.)</option>
                <option value="MODERATE">Moderado (3-5 días/sem.)</option>
                <option value="ACTIVE">Activo (6-7 días/sem.)</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Ritmo de pérdida</label>
              <select name="target_loss_per_week" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-700 font-medium">
                <option value="0.25">Lento (-0.25 kg/sem.)</option>
                <option value="0.5">Normal (-0.5 kg/sem.)</option>
                <option value="0.75">Rápido (-0.75 kg/sem.)</option>
                <option value="1">Muy Rápido (-1 kg/sem.)</option>
              </select>
            </div>
          </div>
          
          <button disabled={loading} type="submit" className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-75 text-white font-semibold py-4 px-4 rounded-xl shadow-md transition-all active:scale-[0.98]">
            {loading ? 'Calculando tu plan...' : 'Terminar y calcular mis metas'}
          </button>
        </form>
      </div>
    </div>
  )
}
