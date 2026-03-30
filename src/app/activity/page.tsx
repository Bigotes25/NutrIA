import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import prisma from '@/lib/prisma'
import { ArrowLeft, Flame } from 'lucide-react'
import { ActivityClient } from './ActivityClient'
import { hasCompletedProfile } from '@/lib/profile-completion'

export default async function ActivityPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const [profile, metrics] = await Promise.all([
    prisma.userProfile.findUnique({ where: { user_id: userId } }),
    prisma.dailyMetric.findMany({
      where: { user_id: userId },
      orderBy: { metric_date: 'desc' },
      take: 120,
    }),
  ])

  if (!hasCompletedProfile(profile)) redirect('/onboarding')
  const activeProfile = profile!

  let workouts: Awaited<ReturnType<typeof prisma.workout.findMany>> = []

  try {
    workouts = await prisma.workout.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 300,
    })
  } catch (error) {
    console.warn('Workout table not available yet:', error)
  }

  const serializedDays = metrics.map((metric) => {
    const consumed = metric.total_calories_consumed
    const burned = metric.exercise_calories
    const net = Math.max(0, consumed - burned)
    const target = activeProfile.daily_calorie_target || 0
    const delta = target - net

    return {
      id: metric.id,
      metricDate: metric.metric_date.toISOString().slice(0, 10),
      consumed,
      burned,
      net,
      delta,
    }
  })

  const serializedWorkouts = workouts.map((workout) => ({
    id: workout.id,
    date: workout.log_date.toISOString().slice(0, 10),
    workoutType: workout.workout_type,
    caloriesBurned: workout.calories_burned,
    durationMinutes: workout.duration_minutes,
    notes: workout.notes,
  }))

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="sticky top-0 glass px-6 pt-12 pb-6 shadow-sm z-40">
        <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-2 font-medium">
          <ArrowLeft className="w-5 h-5" /> Volver al Dashboard
        </Link>
        <div className="mt-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Actividad</h1>
            <p className="text-slate-500 mt-1 font-medium">Vista global de entrenamientos, balance y calendario.</p>
          </div>
          <div className="rounded-[1.6rem] bg-orange-50 px-4 py-3 text-orange-600">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto space-y-8">
        <ActivityClient
          targetCalories={activeProfile.daily_calorie_target || 0}
          targetLossPerWeek={activeProfile.target_loss_per_week || 0}
          days={serializedDays}
          workouts={serializedWorkouts}
        />
      </main>
    </div>
  )
}
