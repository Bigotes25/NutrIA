import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { HistoryClient } from './HistoryClient'
import { hasCompletedProfile } from '@/lib/profile-completion'

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.userProfile.findUnique({
    where: { user_id: session.user.id },
    select: {
      age: true,
      height_cm: true,
      current_weight_kg: true,
      goal_weight_kg: true,
      activity_level: true,
      target_loss_per_week: true,
      daily_calorie_target: true,
      daily_water_target_ml: true,
      daily_steps_target: true,
    }
  })

  if (!hasCompletedProfile(profile)) redirect('/onboarding')

  const metrics = await prisma.dailyMetric.findMany({
    where: { user_id: session.user.id },
    orderBy: { metric_date: 'desc' },
    take: 100 // Fetch more for calendar view
  })

  // Ensure dates are plain objects for RSC
  const serializedMetrics = metrics.map(m => ({
    ...m,
    metric_date: m.metric_date.toISOString()
  }))

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="sticky top-0 glass px-6 pt-12 pb-6 shadow-sm z-40">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight italic leading-none">Mi Diario</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 px-1">Control histórico de nutrición</p>
      </header>

      <main className="p-6 max-w-lg mx-auto">
        <HistoryClient initialMetrics={serializedMetrics} />
      </main>
    </div>
  )
}
