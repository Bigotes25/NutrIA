import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { User, Target, Zap, Droplets, LogOut, BarChart2, Edit3, ChevronRight, Shield } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'
import { t } from '@/lib/i18n'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  const profile = await prisma.userProfile.findUnique({
    where: { user_id: session.user.id }
  })

  if (!profile) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="sticky top-0 glass px-6 pt-12 pb-6 shadow-sm z-40">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic leading-none">Mi Cuenta</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 px-1">Configuración y Rendimiento</p>
      </header>

      <main className="px-6 py-8 space-y-8 max-w-lg mx-auto">
        {/* User Card */}
        <div className="premium-card p-6 flex items-center gap-5 group">
          <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-slate-900/20 group-hover:bg-emerald-600 transition-all duration-500">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{profile.name}</h2>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Plan Gratuito • Activo</p>
          </div>
        </div>

        {/* Goals Section */}
        <section>
          <div className="flex justify-between items-center mb-5 px-1">
            <h3 className="font-black text-xl text-slate-900 italic tracking-tight underline decoration-emerald-500/30 decoration-4 underline-offset-4">Mis Objetivos</h3>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">En Marcha</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="premium-card p-6 space-y-3">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
                 <Zap className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Meta Energía</p>
                <p className="text-xl font-black text-slate-900 tabular-nums">{profile.daily_calorie_target} <span className="text-[10px] text-slate-400 font-bold">kcal</span></p>
              </div>
            </div>
            <div className="premium-card p-6 space-y-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                 <Droplets className="w-5 h-5 fill-blue-500" />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Meta Agua</p>
                <p className="text-xl font-black text-slate-900 tabular-nums">{profile.daily_water_target_ml} <span className="text-[10px] text-slate-400 font-bold">ml</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* Action Links */}
        <div className="space-y-4">
          <Link href="/profile/edit" className="premium-card p-6 flex justify-between items-center group active:scale-[0.98] transition-all">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 rounded-2xl flex items-center justify-center transition-colors shadow-sm">
                <Edit3 className="w-6 h-6" />
              </div>
              <span className="font-black text-slate-800 tracking-tight">Editar Perfil & Metas</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-all translate-x-0 group-hover:translate-x-1" />
          </Link>

          <Link href="/profile/analytics" className="premium-card p-6 flex justify-between items-center group active:scale-[0.98] transition-all">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-2xl flex items-center justify-center transition-colors shadow-sm">
                <BarChart2 className="w-6 h-6" />
              </div>
              <span className="font-black text-slate-800 tracking-tight">Evolución & Analytics</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-all translate-x-0 group-hover:translate-x-1" />
          </Link>

          {user?.role === 'SUPERADMIN' && (
            <Link href="/superadmin" className="premium-card p-6 flex justify-between items-center group active:scale-[0.98] transition-all border-emerald-100 bg-emerald-50/30">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center transition-colors shadow-premium">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-black text-slate-900 tracking-tight block">Panel Superadmin</span>
                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Control del Sistema</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-emerald-500 transition-all translate-x-0 group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Danger Zone */}
        <div className="pt-6">
           <LogoutButton />
        </div>
      </main>
    </div>
  )
}
