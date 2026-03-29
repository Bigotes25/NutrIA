'use client'

import { useState } from 'react'
import { t } from '@/lib/i18n'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, Zap, AlertTriangle } from 'lucide-react'
import { updateMealEntry, deleteMealEntry } from '../actions'

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

interface EditMealClientProps {
  initialData: {
    category: string
    source_type: string
    parsed: {
      title_summary: string
      total_calories: number
      total_protein: number
      total_carbs: number
      total_fats: number
      items: ParsedItem[]
    }
  }
  mealId: string
}

export function EditMealClient({ initialData, mealId }: EditMealClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [mealData, setMealData] = useState(initialData)

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

  const recalculateTotals = (data: typeof mealData) => {
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
    setMealData({ ...data })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
       await updateMealEntry(mealId, mealData)
       router.push(`/meal/${mealId}`)
    } catch(e) {
       alert('Error actualizando. Intenta de nuevo.')
       setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteMealEntry(mealId)
    } catch (e) {
      alert('Error eliminando.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col pt-12 pb-24">
      <div className="mb-6 flex justify-between items-center">
        <Link href={`/meal/${mealId}`} className="text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-2 font-medium">
          <ArrowLeft className="w-5 h-5" /> Cancelar
        </Link>
        <button 
          onClick={() => setShowDeleteConfirm(true)} 
          className="text-red-500 bg-red-50 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Eliminar
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="bg-red-50 text-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">¿Estás seguro?</h3>
              <p className="text-slate-500 mt-2 font-medium">Esta acción no se puede deshacer y ajustará tus calorías del día.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold hover:bg-slate-200">No, volver</button>
              <button onClick={handleDelete} disabled={loading} className="bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-600 disabled:opacity-50">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 mb-6 relative overflow-hidden">
         <div className="relative z-10 space-y-4">
           <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Comida</label>
              <select value={mealData.category} onChange={e => setMealData({...mealData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-emerald-500 mb-2">
                <option value="BREAKFAST">{t('BREAKFAST')}</option>
                <option value="LUNCH">{t('LUNCH')}</option>
                <option value="DINNER">{t('DINNER')}</option>
                <option value="SNACK">{t('SNACK')}</option>
                <option value="OTHER">{t('OTHER')}</option>
              </select>
           </div>
           
           <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Título / Resumen</label>
              <input 
                value={mealData.parsed.title_summary}
                onChange={(e) => setMealData({...mealData, parsed: {...mealData.parsed, title_summary: e.target.value}})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-800 focus:outline-emerald-500" 
              />
            </div>

            <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Calculado</p>
                <p className="text-3xl font-black text-emerald-600 flex items-center gap-1"><Zap className="w-6 h-6"/> {mealData.parsed.total_calories}</p>
              </div>
              <div className="text-right text-sm font-bold text-slate-600 space-y-0.5 mt-4">
                <p className="flex justify-between w-16 gap-2"><span className="text-slate-400">P</span> {mealData.parsed.total_protein}g</p>
                <p className="flex justify-between w-16 gap-2"><span className="text-slate-400">G</span> {mealData.parsed.total_fats}g</p>
                <p className="flex justify-between w-16 gap-2"><span className="text-slate-400">C</span> {mealData.parsed.total_carbs}g</p>
              </div>
            </div>
         </div>
      </div>

      <div className="mb-4 flex justify-between items-center px-1">
        <h3 className="font-bold text-lg text-slate-800">Editar Alimentos</h3>
        <button onClick={handleAddItem} className="text-emerald-600 font-bold text-sm flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100 transition-colors"><Plus className="w-4 h-4"/> Añadir</button>
      </div>

      <div className="space-y-3 mb-8">
        {mealData.parsed.items.map((item, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative group">
             <button onClick={() => handleDeleteItem(i)} className="absolute top-3 right-3 text-slate-200 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
             <input 
                className="font-bold text-slate-700 bg-transparent outline-none border-b border-dashed border-slate-200 focus:border-emerald-500 w-[85%] pb-1 mb-3"
                value={item.food_name}
                onChange={e => handleUpdateItem(i, 'food_name', e.target.value)}
                placeholder="Nombre"
             />
             <div className="flex items-center gap-2 mb-3">
               <input type="number" className="w-16 bg-slate-50 border border-slate-100 p-1.5 rounded-lg outline-none font-bold text-sm text-center focus:ring-1 ring-emerald-500" value={item.quantity_value} onChange={e => handleUpdateItem(i, 'quantity_value', Number(e.target.value))} />
               <input type="text" className="w-24 bg-slate-50 border border-slate-100 p-1.5 rounded-lg outline-none font-bold text-sm focus:ring-1 ring-emerald-500" value={item.quantity_unit} onChange={e => handleUpdateItem(i, 'quantity_unit', e.target.value)} />
               {item.estimated_grams ? <span className="text-xs border border-slate-100 px-2 py-1 rounded bg-slate-50 font-bold text-slate-400">~{item.estimated_grams}g</span> : null}
             </div>
             
             <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
               <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                 <p className="text-slate-400 mb-1">Kcal</p>
                 <input type="number" value={item.calories} onChange={e => handleUpdateItem(i, 'calories', Number(e.target.value))} className="w-full bg-transparent text-center outline-none text-slate-800 focus:bg-white rounded" />
               </div>
               <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                 <p className="text-slate-400 mb-1">Prot</p>
                 <input type="number" value={item.protein} onChange={e => handleUpdateItem(i, 'protein', Number(e.target.value))} className="w-full bg-transparent text-center outline-none text-slate-800 focus:bg-white rounded" />
               </div>
               <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                 <p className="text-slate-400 mb-1">Gras</p>
                 <input type="number" value={item.fats} onChange={e => handleUpdateItem(i, 'fats', Number(e.target.value))} className="w-full bg-transparent text-center outline-none text-slate-800 focus:bg-white rounded" />
               </div>
               <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                 <p className="text-slate-400 mb-1">Carbs</p>
                 <input type="number" value={item.carbs} onChange={e => handleUpdateItem(i, 'carbs', Number(e.target.value))} className="w-full bg-transparent text-center outline-none text-slate-800 focus:bg-white rounded" />
               </div>
             </div>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-75 text-white font-bold py-4 px-4 rounded-xl shadow-xl transition-all active:scale-[0.98] flex justify-center items-center gap-2">
        <Save className="w-5 h-5" />
        {loading ? 'Guardando cambios...' : 'Guardar Cambios'}
      </button>

    </div>
  )
}
