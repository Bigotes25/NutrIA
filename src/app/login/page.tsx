'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LogIn } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') as string).trim().toLowerCase()
    const password = formData.get('password') as string

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/dashboard'
    })

    if (res?.error) {
      setError('Credenciales incorrectas')
      setLoading(false)
    } else {
      window.location.assign(res?.url ?? '/dashboard')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-slate-900 px-8 pb-32">
      <div className="w-full max-w-md space-y-12">
        <div className="text-center flex flex-col items-center">
          <div className="w-20 h-20 mb-6 premium-card p-0.5 flex items-center justify-center bg-white shadow-xl shadow-emerald-500/5 transition-all overflow-hidden">
             <Image 
               src="/branding/logo.png" 
               alt="NutrIA Logo" 
               width={80} 
               height={80} 
               className="w-full h-full object-contain rounded-[1.1rem]" 
               priority
             />
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic">Nutr<span className="text-emerald-500 not-italic">IA</span></h1>
          <p className="text-slate-400 mt-3 text-[10px] font-black uppercase tracking-[0.2em] px-4 leading-relaxed text-center">
            Bienvenido de nuevo a tu espacio de <span className="text-slate-900 border-b-2 border-emerald-500/20">salud inteligente</span>
          </p>
        </div>

        {error && <div className="text-red-500 text-[10px] text-center font-black uppercase tracking-widest bg-red-50 rounded-2xl p-4 border border-red-100 animate-in fade-in slide-in-from-top-1">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1" htmlFor="email">Tu Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="hola@ejemplo.com" 
              required 
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-300 font-black text-slate-800"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1" htmlFor="password">Tu Contraseña</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              required 
              className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 outline-none transition-all font-black text-slate-800"
            />
          </div>

          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-slate-900 hover:bg-emerald-600 disabled:opacity-75 text-white font-black py-6 px-4 rounded-[2rem] shadow-2xl shadow-slate-900/10 transition-all active:scale-[0.98] mt-4 uppercase tracking-widest text-xs"
          >
            {loading ? 'Accediendo...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pt-4">
          ¿Nuevo en NutrIA? <Link href="/register" className="text-emerald-600 hover:text-slate-900 transition-colors underline underline-offset-4 decoration-2">Crea tu cuenta 🦦</Link>
        </p>
      </div>
    </div>
  )
}
