import { getAiUsageStats, getUsersList } from './actions'
import { UsageCharts } from './UsageCharts'
import { UserTable } from './UserTable'
import { Shield, ArrowLeft, TrendingUp, Zap, CheckCircle, Users } from 'lucide-react'
import Link from 'next/link'

export default async function SuperadminPage() {
  const [stats, users] = await Promise.all([
    getAiUsageStats(),
    getUsersList()
  ])

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 glass px-6 pt-12 pb-6 flex justify-between items-center z-40 border-b border-white/20">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Admin Console</h1>
            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">Status: Online - NutrIA System</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
          <Shield className="w-5 h-5" />
        </div>
      </header>

      <main className="px-6 py-8 max-w-4xl mx-auto space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="premium-card p-5 bg-white border-l-4 border-emerald-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Coste Total (30d)
            </p>
            <h4 className="text-2xl font-black text-slate-900 tabular-nums">${stats.summary.totalCost}</h4>
          </div>
          <div className="premium-card p-5 bg-white border-l-4 border-slate-900">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Latencia Media
            </p>
            <h4 className="text-2xl font-black text-slate-900 tabular-nums">{stats.summary.avgLatency}ms</h4>
          </div>
          <div className="premium-card p-5 bg-white border-l-4 border-blue-500">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Éxito IA
            </p>
            <h4 className="text-2xl font-black text-slate-900 tabular-nums">{stats.summary.successRate}%</h4>
          </div>
          <div className="premium-card p-5 bg-white border-l-4 border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peticiones</p>
            <h4 className="text-2xl font-black text-slate-900 tabular-nums">{stats.summary.totalRequests}</h4>
          </div>
        </div>

        {/* Charts Section */}
        <UsageCharts data={stats.chartData} />

        {/* Users Management Section */}
        <section className="pt-10 flex flex-col gap-8">
            <header className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <Users className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Gestión de Usuarios</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Control de acceso y actividad</p>
                </div>
            </header>
            
            <UserTable users={users} />
        </section>

        <div className="pt-8 opacity-50 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">End of report · NutrIA v1.0 Premium</p>
        </div>
      </main>
    </div>
  )
}
