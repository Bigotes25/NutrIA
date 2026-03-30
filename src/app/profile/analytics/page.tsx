import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import { subDays } from 'date-fns'
import { hasCompletedProfile } from '@/lib/profile-completion'

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const thirtyDaysAgo = subDays(new Date(), 30)

  const profile = await prisma.userProfile.findUnique({
    where: { user_id: userId },
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

  // Fetch metrics and weight logs
  const metrics = await prisma.dailyMetric.findMany({
    where: {
      user_id: userId,
      metric_date: { gte: thirtyDaysAgo }
    },
    orderBy: { metric_date: 'desc' },
    take: 30
  })

  const weightLogs = await prisma.weightLog.findMany({
    where: {
      user_id: userId,
      log_date: { gte: thirtyDaysAgo }
    },
    orderBy: { log_date: 'desc' },
    take: 30
  })

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="px-6 pt-12 pb-4">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-2 font-medium">
          <ArrowLeft className="w-5 h-5" /> Volver al Dashboard
        </Link>
        <h1 className="text-3xl font-black text-slate-900 mt-6 tracking-tight">Tu Progreso</h1>
        <p className="text-slate-500 mt-1 font-medium">Visualiza tus tendencias y logros.</p>
      </header>
      
      <main className="px-6 mt-8">
        <AnalyticsCharts data={metrics} weightData={weightLogs} />
      </main>
    </div>
  )
}
