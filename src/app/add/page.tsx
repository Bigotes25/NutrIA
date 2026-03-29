import Link from 'next/link'
import { Camera, Mic, Type, ArrowLeft, Star, Plus } from 'lucide-react'
import { getFavoriteMeals, useFavoriteMeal } from './actions'
import { redirect } from 'next/navigation'

export default async function AddSelectorPage() {
  const favorites = await getFavoriteMeals()

  async function handleQuickAdd(formData: FormData) {
    'use server'
    const favoriteId = formData.get('favoriteId') as string
    if (favoriteId) {
      await useFavoriteMeal(favoriteId)
      redirect('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col pt-12 pb-24">
      <div className="mb-8">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-2 font-medium">
          <ArrowLeft className="w-5 h-5" /> Volver
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-6 tracking-tight">Añadir Comida</h1>
        <p className="text-slate-500 mt-1 font-medium">Selecciona cómo quieres registrarla.</p>
      </div>

      <div className="grid gap-4">
        <Link href="/add/photo" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:border-blue-500 transition-colors group">
          <div className="bg-blue-50 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Con una Foto</h3>
            <p className="text-slate-500 text-sm">La IA extraerá alimentos y macros.</p>
          </div>
        </Link>

        <Link href="/add/audio" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:border-purple-500 transition-colors group">
          <div className="bg-purple-50 text-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Con Audio</h3>
            <p className="text-slate-500 text-sm">Díle a la IA lo que has comido.</p>
          </div>
        </Link>

        <Link href="/add/manual" className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5 hover:border-emerald-500 transition-colors group">
          <div className="bg-emerald-50 text-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <Type className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Entrada Manual</h3>
            <p className="text-slate-500 text-sm">Escribe los detalles tú mismo.</p>
          </div>
        </Link>
      </div>

      {favorites.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-xl font-bold text-slate-900">Tus Favoritos</h2>
          </div>
          
          <div className="grid gap-3">
            {favorites.map((fav) => (
              <form key={fav.id} action={handleQuickAdd}>
                <input type="hidden" name="favoriteId" value={fav.id} />
                <button type="submit" className="w-full bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-amber-200 transition-colors group">
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-slate-800 group-hover:text-amber-700 transition-colors">{fav.title}</span>
                    <span className="text-xs text-slate-400 font-bold tracking-wide uppercase mt-1">
                      {fav.total_calories} kcal • {fav.total_protein}P {fav.total_carbs}C {fav.total_fats}G
                    </span>
                  </div>
                  <div className="bg-slate-50 group-hover:bg-amber-50 p-2 rounded-xl transition-colors">
                    <Plus className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
                  </div>
                </button>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
