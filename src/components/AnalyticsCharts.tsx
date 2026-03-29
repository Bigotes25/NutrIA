'use client'

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState, useEffect } from 'react'

interface AnalyticsChartsProps {
  data: any[]
  weightData: any[]
}

export default function AnalyticsCharts({ data, weightData }: AnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="space-y-12 animate-pulse">
      <div className="h-64 bg-slate-100 rounded-3xl" />
      <div className="h-64 bg-slate-100 rounded-3xl" />
    </div>
  }

  // Format data for Recharts
  const calorieChartData = data.map(d => ({
    name: format(new Date(d.metric_date), 'dd MMM', { locale: es }),
    calorias: d.total_calories_consumed,
    objetivo: 2000 
  })).reverse()

  const weightChartData = weightData.map(w => ({
    name: format(new Date(w.log_date), 'dd MMM', { locale: es }),
    peso: w.weight_kg
  })).reverse()

  return (
    <div className="space-y-12">
      {/* Weight Chart */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">Evolución de Peso</h3>
          <p className="text-sm text-slate-400 font-medium">Últimos 30 días</p>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightChartData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
                dy={10}
              />
              <YAxis 
                hide 
                domain={['dataMin - 2', 'dataMax + 2']} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="peso" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorWeight)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Calories Chart */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800">Consumo Calórico</h3>
          <p className="text-sm text-slate-400 font-medium">Objetivo vs Realidad</p>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calorieChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 600}} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="calorias" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="objetivo" 
                stroke="#cbd5e1" 
                strokeDasharray="5 5" 
                strokeWidth={2} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
