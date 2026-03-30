import Link from 'next/link'
import Image from 'next/image'
import { signup } from './actions'

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

const errorMessages: Record<string, string> = {
  invalid_data: 'Introduce un email valido y una contrasena de al menos 6 caracteres.',
  email_taken: 'Ese email ya esta registrado.',
  db_connection: 'No hemos podido conectar con la base de datos. Revisa Vercel y vuelve a intentarlo.',
  server_error: 'No hemos podido crear tu cuenta. Intentalo de nuevo en unos segundos.'
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams
  const errorMessage = error ? errorMessages[error] ?? errorMessages.server_error : null

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
          <p className="text-slate-400 mt-3 text-[10px] font-black uppercase tracking-[0.2em] px-4 leading-relaxed">
            Tu viaje hacia una nutrición <span className="text-slate-900 border-b-2 border-emerald-500/20">consciente</span> comienza aquí
          </p>
        </div>

        <form className="space-y-6">
          {errorMessage ? (
            <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700" aria-live="polite">
              {errorMessage}
            </div>
          ) : null}
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
            formAction={signup}
            className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-black py-6 px-4 rounded-[2rem] shadow-2xl shadow-slate-900/10 transition-all active:scale-[0.98] mt-4 uppercase tracking-widest text-xs"
          >
            Crear Cuenta 🦦
          </button>
        </form>

        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pt-4">
          ¿Ya eres parte de NutrIA? <Link href="/login" className="text-emerald-600 hover:text-slate-900 transition-colors underline underline-offset-4 decoration-2">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
