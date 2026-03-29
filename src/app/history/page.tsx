import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { HistoryClient } from './HistoryClient'

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

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
