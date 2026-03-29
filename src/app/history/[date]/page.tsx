import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { ArrowLeft, Zap, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { t } from '@/lib/i18n'

export default async function DayHistoryPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  // Parse date from params (e.g., 2026-03-29)
  const dateObj = new Date(date)
  dateObj.setUTCHours(0,0,0,0)

  const metrics = await prisma.dailyMetric.findUnique({
    where: { user_id_metric_date: { user_id: userId, metric_date: dateObj } }
  })

  const meals = await prisma.mealEntry.findMany({
    where: { user_id: userId, entry_date: { gte: dateObj, lt: new Date(dateObj.getTime() + 86400000) } },
    include: { items: true },
    orderBy: { created_at: 'asc' }
  })

  // Format the date for the title
  const formattedDate = format(dateObj, "EEEE, d 'de' MMMM", { locale: es })

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="sticky top-0 glass px-6 pt-12 pb-6 shadow-sm z-40 flex items-center justify-between">
        <Link href="/history" className="text-slate-400 hover:text-slate-800 transition-all inline-flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft className="w-5 h-5" /> Atrás
        </Link>
        <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-tighter">
           {format(dateObj, 'MMM d, yyyy', { locale: es })}
        </div>
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto w-full">
        <div className="mb-8 px-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic leading-none capitalize">{formattedDate}</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Resumen de actividad diaria</p>
        </div>

        {metrics && (
          <div className="premium-card p-8 bg-slate-900 text-white shadow-2xl shadow-slate-900/20 border-none relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all duration-500">
              <Zap className="w-32 h-32 text-emerald-400 fill-emerald-400" />
            </div>
            
            <div className="relative z-10">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-2">Energía Consumida</p>
              <h2 className="text-5xl font-black flex items-baseline gap-2 tabular-nums">
                {metrics.total_calories_consumed} <span className="text-sm text-white/40 font-black uppercase tracking-widest">kcal</span>
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                   <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Agua</p>
                   <p className="font-black text-blue-400">{metrics.water_ml}<span className="text-[8px] ml-0.5">ml</span></p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                   <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Pasos</p>
                   <p className="font-black text-emerald-400">{metrics.steps}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 mt-10">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-black text-xl text-slate-900 italic tracking-tight underline decoration-emerald-500/30 decoration-4 underline-offset-4">Registros</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{meals.length} Comidas</span>
          </div>

          {meals.length === 0 ? (
            <div className="premium-card p-12 text-center border-dashed border-2 border-slate-200 bg-transparent shadow-none">
              <p className="text-slate-400 font-bold italic">No se registraron comidas... 🥗</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {meals.map((meal: any) => (
                <Link key={meal.id} href={`/meal/${meal.id}`} className="premium-card p-5 group flex justify-between items-center active:scale-[0.98] transition-all">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-2xl group-hover:bg-emerald-50 transition-colors">
                       <span className="text-xl">
                          {meal.category === 'BREAKFAST' ? '☕' : meal.category === 'LUNCH' ? '🍲' : meal.category === 'DINNER' ? '🥗' : '🍎'}
                       </span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-widest mb-0.5">{t(meal.category)}</h4>
                      <h5 className="font-black text-slate-900 text-lg tracking-tight leading-none group-hover:text-emerald-600 transition-colors">{meal.title_summary}</h5>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 block tabular-nums">{meal.total_calories} <span className="text-[10px] text-slate-400">kcal</span></span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Detalles →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
