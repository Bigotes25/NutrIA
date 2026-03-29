'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, Zap, Star } from 'lucide-react'
import { saveAIMeal } from './actions'
import { t } from '@/lib/i18n'

type ParsedItem = {
  food_name: string
  quantity_value: number
  quantity_unit: string
  estimated_grams: number | null
  calories: number
  protein: number
  carbs: number
  fats: number
}

type ParsedMeal = {
  source_type: string
  media_url?: string | null
  // We add category local UI state
  category?: string
  parsed: {
    title_summary: string
    total_calories: number
    total_protein: number
    total_carbs: number
    total_fats: number
    items: ParsedItem[]
  }
}

export default function ReviewAIPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [mealData, setMealData] = useState<ParsedMeal | null>(null)

  useEffect(() => {
    const draft = sessionStorage.getItem('ai_draft_meal')
    if (draft) {
      const parsed = JSON.parse(draft)
      parsed.category = 'LUNCH' // default
      setMealData(parsed)
    } else {
      router.push('/add')
    }
  }, [router])

  if (!mealData) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400 animate-pulse">Cargando borrador...</div>

  const handleUpdateItem = (index: number, field: keyof ParsedItem, value: any) => {
    const newData = { ...mealData }
    newData.parsed.items[index] = { ...newData.parsed.items[index], [field]: value }
    recalculateTotals(newData)
  }

  const handleDeleteItem = (index: number) => {
    const newData = { ...mealData }
    newData.parsed.items.splice(index, 1)
    recalculateTotals(newData)
  }

  const handleAddItem = () => {
    const newData = { ...mealData }
    newData.parsed.items.push({
      food_name: 'Nuevo ingrediente', quantity_value: 1, quantity_unit: 'ud', estimated_grams: 0,
      calories: 0, protein: 0, carbs: 0, fats: 0
    })
    setMealData(newData)
  }

  const recalculateTotals = (data: ParsedMeal) => {
    let cals = 0, prot = 0, carbs = 0, fats = 0
    data.parsed.items.forEach(i => {
      cals += Number(i.calories) || 0
      prot += Number(i.protein) || 0
      carbs += Number(i.carbs) || 0
      fats += Number(i.fats) || 0
    })
    data.parsed.total_calories = cals
    data.parsed.total_protein = prot
    data.parsed.total_carbs = carbs
    data.parsed.total_fats = fats
    setMealData(data)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
       await saveAIMeal(mealData, isFavorite)
       sessionStorage.removeItem('ai_draft_meal')
       router.push('/dashboard')
    } catch(e) {
       alert('Error guardando en base de datos. Intenta de nuevo.')
       setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-12 pb-32">
      <div className="px-6 mb-8 flex justify-between items-center">
        <button onClick={() => { sessionStorage.removeItem('ai_draft_meal'); router.push('/add') }} className="text-slate-400 hover:text-slate-800 transition-colors inline-flex items-center gap-2 font-bold text-sm uppercase tracking-widest">
          <ArrowLeft className="w-5 h-5" /> Cancelar
        </button>
        <div className="bg-emerald-50 text-emerald-600 font-black text-[10px] px-3 py-1.5 rounded-full uppercase tracking-tighter border border-emerald-100 flex items-center gap-1.5">
          <Zap className="w-3 h-3 fill-emerald-600" /> IA Draft
        </div>
      </div>

      <main className="px-6 space-y-8 max-w-lg mx-auto w-full">
        {/* Main Card */}
        <div className="premium-card p-8 space-y-6">
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</label>
              <select 
                value={mealData.category} 
                onChange={e => setMealData({...mealData, category: e.target.value})} 
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-800 focus:ring-2 ring-emerald-500 outline-none appearance-none transition-all"
              >
                <option value="BREAKFAST">{t('BREAKFAST')}</option>
                <option value="LUNCH">{t('LUNCH')}</option>
                <option value="DINNER">{t('DINNER')}</option>
                <option value="SNACK">{t('SNACK')}</option>
                <option value="OTHER">{t('OTHER')}</option>
              </select>
           </div>
           
           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumen</label>
              <input 
                value={mealData.parsed.title_summary}
                onChange={(e) => setMealData({...mealData, parsed: {...mealData.parsed, title_summary: e.target.value}})}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-xl text-slate-900 focus:ring-2 ring-emerald-500 outline-none transition-all" 
              />
            </div>

            <div className="bg-slate-900 p-6 rounded-[2rem] flex justify-between items-center shadow-xl shadow-slate-900/10">
              <div>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Kcal</p>
                <p className="text-4xl font-black text-emerald-400 tabular-nums">{mealData.parsed.total_calories}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-white px-2 py-0.5 rounded-md bg-white/10 uppercase tracking-widest flex justify-between gap-4"><span>Prot</span> <span>{mealData.parsed.total_protein}g</span></p>
                <p className="text-[10px] font-black text-white px-2 py-0.5 rounded-md bg-white/10 uppercase tracking-widest flex justify-between gap-4"><span>Gras</span> <span>{mealData.parsed.total_fats}g</span></p>
                <p className="text-[10px] font-black text-white px-2 py-0.5 rounded-md bg-white/10 uppercase tracking-widest flex justify-between gap-4"><span>Carb</span> <span>{mealData.parsed.total_carbs}g</span></p>
              </div>
            </div>

            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 border-2 ${
                isFavorite 
                ? 'bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20' 
                : 'bg-white border-slate-100 text-slate-400'
              }`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
              {isFavorite ? '¡Favorito!' : 'Añadir a favoritos'}
            </button>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6 px-1">
            <h3 className="font-black text-xl text-slate-900 italic tracking-tight">Ingredientes</h3>
            <button onClick={handleAddItem} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 active:scale-90 transition-all shadow-lg shadow-emerald-500/20">
              <Plus className="w-4 h-4" /> Añadir
            </button>
          </div>

          <div className="space-y-4">
            {mealData.parsed.items.map((item, i) => (
              <div key={i} className="premium-card p-6 flex flex-col relative group">
                 <button onClick={() => handleDeleteItem(i)} className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-colors p-2">
                   <Trash2 className="w-5 h-5" />
                 </button>
                 
                 <input 
                    className="text-lg font-black text-slate-800 bg-transparent outline-none border-b-2 border-slate-50 focus:border-emerald-500 w-[80%] pb-2 mb-4 leading-none transition-all"
                    value={item.food_name}
                    onChange={e => handleUpdateItem(i, 'food_name', e.target.value)}
                 />
                 
                 <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 bg-slate-50 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-100">
                      <input type="number" className="w-full bg-transparent p-2 outline-none font-black text-sm text-center tabular-nums" value={item.quantity_value} onChange={e => handleUpdateItem(i, 'quantity_value', Number(e.target.value))} />
                      <input type="text" className="w-full bg-transparent p-2 outline-none font-black text-xs text-slate-400 uppercase tracking-tighter" value={item.quantity_unit} onChange={e => handleUpdateItem(i, 'quantity_unit', e.target.value)} />
                    </div>
                    {item.estimated_grams ? (
                      <div className="bg-emerald-50 px-4 py-3 rounded-2xl border border-emerald-100 font-black text-[10px] text-emerald-600 uppercase tracking-widest">
                        ~{item.estimated_grams}g
                      </div>
                    ) : null}
                 </div>
                 
                 <div className="grid grid-cols-4 gap-3">
                   {[
                     { label: 'Kcal', key: 'calories', color: 'slate' },
                     { label: 'Prot', key: 'protein', color: 'emerald' },
                     { label: 'Gras', key: 'fats', color: 'blue' },
                     { label: 'Carb', key: 'carbs', color: 'amber' }
                   ].map(macro => (
                     <div key={macro.key} className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100/50 text-center">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1.5">{macro.label}</p>
                       <input 
                         type="number" 
                         value={item[macro.key as keyof ParsedItem] as number} 
                         onChange={e => handleUpdateItem(i, macro.key as keyof ParsedItem, Number(e.target.value))} 
                         className="w-full bg-transparent text-center outline-none text-slate-900 font-black text-xs tabular-nums" 
                       />
                     </div>
                   ))}
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 hover:bg-emerald-600 disabled:opacity-50 text-white font-black py-6 px-4 rounded-[2rem] shadow-2xl transition-all active:scale-95 flex justify-center items-center gap-3 uppercase tracking-[0.2em]">
            <Save className="w-6 h-6" />
            {loading ? 'Guardando...' : 'Confirmar Registro'}
          </button>
        </div>
      </main>
    </div>
  )
}
