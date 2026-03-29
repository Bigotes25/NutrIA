'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="w-full bg-white text-red-500 font-black py-5 px-6 rounded-[2rem] flex items-center justify-center gap-3 border border-red-50 shadow-xl shadow-red-500/5 hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
    >
      <LogOut className="w-5 h-5" />
      Cerrar Sesión
    </button>
  )
}
