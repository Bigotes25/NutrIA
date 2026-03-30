'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, List, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

interface Metric {
  id: string
  metric_date: Date
  total_calories_consumed: number
  water_ml: number
  exercise_calories?: number
}

export function HistoryClient({ initialMetrics }: { initialMetrics: any[] }) {
  const [view, setView] = useState<'LIST' | 'CALENDAR'>('LIST')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Process metrics for easy lookup
  const metricsMap = new Map<string, Metric>()
  initialMetrics.forEach(m => {
    const d = new Date(m.metric_date)
    metricsMap.set(format(d, 'yyyy-MM-dd'), m)
  })

  // Calendar logic
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Padding for start of week (Sunday = 0, we want Monday = 0 if following Spanish locale, but getDay depends on locale)
  // Let's stick to standard Monday start for Spain
  const startDay = (getDay(monthStart) + 6) % 7 
  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="bg-slate-200/50 p-1.5 rounded-2xl flex gap-1 max-w-[280px] mx-auto border border-slate-200">
        <button 
          onClick={() => setView('LIST')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'LIST' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <List className="w-4 h-4" /> Lista
        </button>
        <button 
          onClick={() => setView('CALENDAR')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'CALENDAR' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <CalendarIcon className="w-4 h-4" /> Calendario
        </button>
      </div>

      {view === 'LIST' ? (
        <div className="space-y-4">
          {initialMetrics.length === 0 ? (
            <div className="premium-card p-12 text-center border-dashed border-2 border-slate-200 shadow-none bg-transparent">
              <p className="text-slate-400 font-black italic uppercase text-xs tracking-widest">No hay registros todavía... 📉</p>
            </div>
          ) : (
            initialMetrics.map((day) => {
              const d = new Date(day.metric_date)
              const dateStr = format(d, 'yyyy-MM-dd')
              return (
                <Link key={day.id} href={`/history/${dateStr}`} className="premium-card p-6 group flex items-center justify-between active:scale-[0.98] transition-all bg-white border border-slate-100">
                  <div>
                    <h3 className="font-black text-slate-800 capitalize text-lg tracking-tight group-hover:text-emerald-600 transition-colors">
                      {format(d, 'EEEE, d MMM', { locale: es })}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="font-black text-emerald-600 text-sm tabular-nums">{day.total_calories_consumed} <span className="text-[10px] text-slate-400 font-bold uppercase">kcal</span></span>
                       <div className="w-1 h-1 bg-slate-200 rounded-full" />
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                         {day.exercise_calories > 0 ? `${day.exercise_calories} kcal quemadas` : 'Resumen diario'}
                       </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                     <div className="bg-blue-600 text-white px-3 py-1.5 rounded-2xl text-[10px] font-black flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
                        {day.water_ml}<span className="text-[8px] opacity-70">ml</span> 💧
                     </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      ) : (
        <div className="premium-card p-6 bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-8 px-2">
             <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90">
                <ChevronLeft className="w-5 h-5" />
             </button>
             <h3 className="text-lg font-black text-slate-900 capitalize tracking-tight italic">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
             </h3>
             <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90">
                <ChevronRight className="w-5 h-5" />
             </button>
          </div>

          <div className="grid grid-cols-7 gap-y-6 text-center">
            {weekDays.map(d => (
              <span key={d} className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{d}</span>
            ))}
            
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}

            {daysInMonth.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const hasMetric = metricsMap.has(dateKey)
              const metric = metricsMap.get(dateKey)
              const today = isToday(day)

              return (
                <div key={dateKey} className="relative flex flex-col items-center group">
                  <Link 
                    href={`/history/${dateKey}`}
                    className={`relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all ${
                        today 
                        ? 'border-2 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/10' 
                        : hasMetric 
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10 active:scale-95' 
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {format(day, 'd')}
                  </Link>
                  {hasMetric && (
                    <div className="absolute -bottom-1 sm:-bottom-2 flex gap-0.5">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                        {metric && metric.water_ml > 0 && <div className="w-1 h-1 bg-blue-500 rounded-full" />}
                        {metric && (metric.exercise_calories ?? 0) > 0 && <div className="w-1 h-1 bg-orange-500 rounded-full" />}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="mt-10 pt-6 border-t border-slate-50 flex justify-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-900 rounded-lg shadow-lg" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registrado</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-emerald-500 rounded-lg" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hoy</span>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
