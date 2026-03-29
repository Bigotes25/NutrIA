import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { ArrowLeft, Clock, Zap, Edit2 } from 'lucide-react'
import FavoriteButton from '@/components/FavoriteButton'
import { t } from '@/lib/i18n'

export default async function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const meal = await prisma.mealEntry.findUnique({
    where: { id },
    include: { items: true, media: true }
  })

  // Prevent accessing someone else's UI via URL
  if (!meal || meal.user_id !== session.user.id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="px-6 pt-12 pb-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-2 font-medium">
          <ArrowLeft className="w-5 h-5" /> Atrás
        </Link>
        <div className="flex gap-2">
          <Link href={`/meal/${meal.id}/edit`} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:text-slate-800 transition-colors">
            <Edit2 className="w-5 h-5" />
          </Link>
          <FavoriteButton mealEntryId={meal.id} mealTitle={meal.title_summary || undefined} />
        </div>
      </header>
      
      <main className="px-6 space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">{t(meal.category)}</span>
              <h1 className="text-2xl font-black text-slate-800 mt-1">{meal.title_summary}</h1>
            </div>
            <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
              <Zap className="w-4 h-4" /> {meal.total_calories}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold text-slate-400 mb-6">
             {/* Note: In Next.js App Router server components we stringify dates consistently without locale time strings to avoid hydration mismatches if possible, but serverside render is fine for static text if consistent container tz. */}
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Registrado hoy</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{t(meal.source_type)}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-2xl text-center">
              <span className="block text-xs font-bold text-slate-400 mb-1">Proteína</span>
              <span className="block text-lg font-black text-slate-700">{meal.total_protein}g</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl text-center">
              <span className="block text-xs font-bold text-slate-400 mb-1">Grasas</span>
              <span className="block text-lg font-black text-slate-700">{meal.total_fats}g</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl text-center">
              <span className="block text-xs font-bold text-slate-400 mb-1">Carbs</span>
              <span className="block text-lg font-black text-slate-700">{meal.total_carbs}g</span>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-lg text-slate-800 ml-1">Desglose de items</h3>
        <div className="space-y-3">
          {meal.items.map((item: any) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-700">{item.food_name}</p>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">{item.quantity_value} {item.quantity_unit}</p>
              </div>
              <div className="text-right">
                <span className="font-black text-slate-600">{item.calories} kcal</span>
                {item.estimated_grams ? <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wide mt-0.5">~{item.estimated_grams}g</span> : null}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
