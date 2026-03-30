'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Calendar, Home, User } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()
  
  if (!pathname || pathname.match(/^\/(login|register|onboarding|add)$/) || pathname === '/') return null

  return (
    <nav className="fixed bottom-6 left-6 right-6 h-20 glass rounded-[2.5rem] shadow-2xl z-50 flex items-center px-4 mb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center w-full max-w-xl mx-auto">
        <Link href="/dashboard" className={`relative flex flex-col items-center justify-center transition-all duration-300 ${pathname === '/dashboard' ? 'text-emerald-600 scale-110' : 'text-slate-400 opacity-60 hover:opacity-100 scale-90'}`}>
          <Home className={`w-7 h-7 ${pathname === '/dashboard' ? 'fill-emerald-600/10' : ''}`} />
          <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Hoy</span>
          {pathname === '/dashboard' && <div className="absolute -bottom-2 w-1 h-1 bg-emerald-600 rounded-full" />}
        </Link>
        <Link href="/history" className={`relative flex flex-col items-center justify-center transition-all duration-300 ${pathname === '/history' ? 'text-emerald-600 scale-110' : 'text-slate-400 opacity-60 hover:opacity-100 scale-90'}`}>
          <Calendar className={`w-7 h-7 ${pathname === '/history' ? 'fill-emerald-600/10' : ''}`} />
          <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Historial</span>
          {pathname === '/history' && <div className="absolute -bottom-2 w-1 h-1 bg-emerald-600 rounded-full" />}
        </Link>
        <Link href="/activity" className={`relative flex flex-col items-center justify-center transition-all duration-300 ${pathname === '/activity' ? 'text-emerald-600 scale-110' : 'text-slate-400 opacity-60 hover:opacity-100 scale-90'}`}>
          <Activity className={`w-7 h-7 ${pathname === '/activity' ? 'fill-emerald-600/10' : ''}`} />
          <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Actividad</span>
          {pathname === '/activity' && <div className="absolute -bottom-2 w-1 h-1 bg-emerald-600 rounded-full" />}
        </Link>
        <Link href="/profile" className={`relative flex flex-col items-center justify-center transition-all duration-300 ${pathname === '/profile' ? 'text-emerald-600 scale-110' : 'text-slate-400 opacity-60 hover:opacity-100 scale-90'}`}>
          <User className={`w-7 h-7 ${pathname === '/profile' ? 'fill-emerald-600/10' : ''}`} />
          <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Perfil</span>
          {pathname === '/profile' && <div className="absolute -bottom-2 w-1 h-1 bg-emerald-600 rounded-full" />}
        </Link>
      </div>
    </nav>
  )
}
