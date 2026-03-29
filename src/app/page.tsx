import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-8 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-slate-50 rounded-full blur-3xl opacity-50" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-32 h-32 mb-8 premium-card p-1 flex items-center justify-center bg-white shadow-2xl shadow-emerald-500/10 border-slate-100 animate-in fade-in zoom-in duration-700 overflow-hidden">
          <Image 
            src="/branding/logo.png" 
            alt="NutrIA Logo" 
            width={128} 
            height={128} 
            className="w-full h-full object-contain rounded-[1.8rem]" 
            priority
          />
        </div>
        
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter italic">
          Nutr<span className="text-emerald-500 not-italic">IA</span>
        </h1>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em] mb-12 max-w-[280px] leading-relaxed">
          Tu Nutria Inteligente para una Nutrición <span className="text-slate-900 border-b-2 border-emerald-500/30">Premium</span>
        </p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link href="/register" className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black py-6 px-8 rounded-[2rem] shadow-2xl shadow-slate-900/20 transition-all active:scale-95 uppercase tracking-widest text-xs">
            Comenzar Experiencia
          </Link>
          <Link href="/login" className="w-full bg-white text-slate-900 border border-slate-100 hover:bg-slate-50 font-black py-6 px-8 rounded-[2rem] shadow-sm transition-all active:scale-95 uppercase tracking-widest text-[10px]">
            Iniciar Sesión
          </Link>
        </div>
        
        <p className="mt-12 text-[10px] font-black text-slate-300 uppercase tracking-widest">
          Desarrollado con IA de Vanguardia ⚡
        </p>
      </div>
    </div>
  )
}
