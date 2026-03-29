import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import Image from 'next/image'
import { Plus, BarChart2, Scale, User, Shield } from 'lucide-react'
import { WaterWidget } from '@/components/WaterWidget'
import { WeightWidget } from '@/components/WeightWidget'
import { CoachWidget } from '@/components/CoachWidget'
import { t } from '@/lib/i18n'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  
  const [user, profile] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
    prisma.userProfile.findUnique({ where: { user_id: userId } })
  ])

  if (!profile) redirect('/onboarding')

  const today = new Date()
  today.setUTCHours(0,0,0,0)
  
  let metrics = await prisma.dailyMetric.findUnique({
    where: { user_id_metric_date: { user_id: userId, metric_date: today } }
  })

  if (!metrics) {
    metrics = await prisma.dailyMetric.create({
      data: { user_id: userId, metric_date: today }
    })
  }

  const meals = await prisma.mealEntry.findMany({
    where: { user_id: userId, entry_date: { gte: today } },
    include: { items: true },
    orderBy: { created_at: 'asc' }
  })

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="sticky top-0 glass px-6 pt-12 pb-6 shadow-sm z-40 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 premium-card p-0.5 bg-white shadow-xl shadow-emerald-500/5 rotate-[-3deg] hover:rotate-0 transition-transform flex items-center justify-center overflow-hidden">
              <Image 
                src="/branding/logo.png" 
                alt="NutrIA" 
                width={48} 
                height={48} 
                className="w-full h-full object-contain rounded-2xl" 
                priority
              />
           </div>
           <div>
             <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic leading-none">Nutr<span className="text-emerald-500">IA</span></h1>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Hola, {profile.name || 'Pro'}</p>
           </div>
        </div>
        <div className="flex gap-2">
            {user?.role === 'SUPERADMIN' && (
                <Link href="/superadmin" className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-[1.2rem] shadow-premium border border-emerald-100 flex items-center justify-center hover:bg-emerald-100 transition-all active:scale-95">
                    <Shield className="w-5 h-5" />
                </Link>
            )}
            <Link href="/profile/edit" className="w-12 h-12 bg-white rounded-[1.2rem] shadow-premium border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all active:scale-95">
                <Plus className="w-6 h-6 rotate-45" />
            </Link>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8 max-w-lg mx-auto">
        {/* Calorias Glancé */}
        <div className="premium-card p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Restantes</p>
              <h2 className="text-5xl font-black text-slate-900 tabular-nums">
                {Math.max(0, profile.daily_calorie_target! - metrics.total_calories_consumed)} 
                <span className="text-sm text-slate-400 font-extrabold ml-1">KCAL</span>
              </h2>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
               <Scale className="w-6 h-6" />
            </div>
          </div>
          
          <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden p-1 border border-slate-200/50">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${metrics.total_calories_consumed > profile.daily_calorie_target! ? 'bg-red-500' : 'bg-emerald-pro shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`} 
              style={{ width: `${Math.min(100, (metrics.total_calories_consumed / profile.daily_calorie_target!) * 100)}%`}}
            />
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>{metrics.total_calories_consumed} Consumidas</span>
            <span>Meta: {profile.daily_calorie_target}</span>
          </div>
        </div>

        <CoachWidget />
        
        <div className="grid grid-cols-1 gap-6">
          <WeightWidget currentWeight={profile.current_weight_kg} />
          <WaterWidget consumed={metrics.water_ml} target={profile.daily_water_target_ml || 2000} />
        </div>

        <section>
          <div className="flex justify-between items-center mb-5 px-1">
            <h3 className="font-black text-xl text-slate-900 italic tracking-tight underline decoration-emerald-500/30 decoration-4 underline-offset-4">Diario de Hoy</h3>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">{meals.length} Comidas</span>
          </div>
          
          {meals.length === 0 ? (
            <div className="premium-card p-12 text-center border-dashed border-2 border-slate-200 bg-transparent shadow-none">
              <p className="text-slate-400 font-bold italic">Tu diario está esperando tu primera comida... 🥗</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meals.map((meal: any) => (
                <Link key={meal.id} href={`/meal/${meal.id}`} className="premium-card p-5 group flex justify-between items-center active:scale-[0.98] transition-all">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-2xl group-hover:bg-emerald-50 transition-colors">
                       <span className="text-xl">
                          {meal.category === 'BREAKFAST' ? '☕' : meal.category === 'LUNCH' ? '🍲' : meal.category === 'DINNER' ? '🥗' : '🍎'}
                       </span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 uppercase text-xs tracking-wider">{t(meal.category)}</h4>
                      <p className="text-sm text-slate-500 font-medium truncate max-w-[160px]">{meal.title_summary || meal.items.map((i: any) => i.food_name).join(', ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 block tabular-nums">{meal.total_calories} <span className="text-[10px] text-slate-400">kcal</span></span>
                    <div className="flex gap-2 mt-1 justify-end">
                       <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                       <div className="w-1 h-1 bg-blue-500 rounded-full" />
                       <div className="w-1 h-1 bg-amber-500 rounded-full" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-28 right-6 z-50">
        <Link 
          href="/add" 
          className="bg-slate-900 group text-white w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl hover:scale-105 transition-all active:scale-90 border-4 border-white glow-pulse"
        >
          <div className="relative">
            <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
          </div>
        </Link>
      </div>
    </div>
  )
}
