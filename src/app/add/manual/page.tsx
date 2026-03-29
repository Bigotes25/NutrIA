'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { saveManualMeal } from './actions'

export default function AddManualPage() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col pt-12 pb-24">
      <div className="mb-8">
        <Link href="/add" className="text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-2 font-medium">
          <ArrowLeft className="w-5 h-5" /> Atrás
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-6 tracking-tight">Registro Manual</h1>
      </div>

      <form action={saveManualMeal} onSubmit={() => setTimeout(() => setLoading(true), 10)} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Categoría</label>
            <select name="category" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-medium">
              <option value="BREAKFAST">Desayuno</option>
              <option value="LUNCH">Comida</option>
              <option value="DINNER">Cena</option>
              <option value="SNACK">Snack</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">¿Qué comiste? (Resumen)</label>
            <input type="text" name="food_name" required placeholder="Ej: Dos huevos revueltos con pan..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-bold text-lg text-slate-800">Calorías y Macros Totales</h2>
          <p className="text-xs text-slate-500 font-medium">En la entrada manual directa añades los totales manualmente.</p>
          
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Calorías (kcal)</label>
            <input type="number" name="calories" required min="0" placeholder="Ej. 450" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg text-slate-800" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Proteína (g)</label>
              <input type="number" name="protein" required min="0" placeholder="0" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-center" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Grasas (g)</label>
              <input type="number" name="fats" required min="0" placeholder="0" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-center" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Carbs (g)</label>
              <input type="number" name="carbs" required min="0" placeholder="0" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-semibold text-center" />
            </div>
          </div>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-75 text-white font-bold py-4 px-4 rounded-xl shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2">
          <Save className="w-5 h-5" />
          {loading ? 'Guardando...' : 'Guardar Comida'}
        </button>
      </form>
    </div>
  )
}
