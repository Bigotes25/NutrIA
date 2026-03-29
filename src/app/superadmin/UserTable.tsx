'use client'

import { useState } from 'react'
import { Search, User as UserIcon, Shield, ShieldOff, MoreHorizontal, Calendar, Utensils, Scale, ChevronDown, Activity, Zap } from 'lucide-react'
import { updateUserRole } from './actions'

interface UserEntry {
  id: string
  email: string
  name: string
  role: string
  createdAt: Date
  stats: {
    meals: number
    weights: number
    aiLogs: number
    totalCost: string
    recentLogs: {
        id: string
        type: string
        model: string
        cost: string
        date: Date
        status: string
    }[]
  }
}

export function UserTable({ users }: { users: UserEntry[] }) {
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({})

  const toggleExpand = (userId: string) => {
    setExpandedUsers(prev => ({ ...prev, [userId]: !prev[userId] }))
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'SUPERADMIN' ? 'USER' : 'SUPERADMIN'
    if (!confirm(`¿Quieres cambiar el rol de este usuario a ${newRole}?`)) return
    
    setLoadingId(userId)
    try {
      await updateUserRole(userId, newRole)
    } catch (err: any) {
      alert(err.message || "Error al actualizar el rol")
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar usuarios por nombre o email..."
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="premium-card p-5 bg-white flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{user.name}</h4>
                  <p className="text-[10px] font-medium text-slate-400">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggleRole(user.id, user.role)}
                disabled={loadingId === user.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all ${
                  user.role === 'SUPERADMIN' 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                } ${loadingId === user.id ? 'opacity-50 animate-pulse' : 'active:scale-95'}`}
              >
                {user.role === 'SUPERADMIN' ? (
                  <><Shield className="w-3 h-3" /> Admin</>
                ) : (
                  <><ShieldOff className="w-3 h-3" /> User</>
                )}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1 sm:gap-2 py-3 border-t border-slate-50">
              <div className="text-center">
                <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-tight sm:tracking-widest mb-1 flex items-center justify-center gap-0.5">
                  <Utensils className="w-2 sm:w-2.5 h-2 sm:h-2.5" /> Comidas
                </p>
                <p className="text-[10px] sm:text-xs font-black text-slate-900 tabular-nums">{user.stats.meals}</p>
              </div>
              <div className="text-center">
                <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-tight sm:tracking-widest mb-1 flex items-center justify-center gap-0.5">
                  <Scale className="w-2 sm:w-2.5 h-2 sm:h-2.5" /> Pesos
                </p>
                <p className="text-[10px] sm:text-xs font-black text-slate-900 tabular-nums">{user.stats.weights}</p>
              </div>
              <div className="text-center">
                <p className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-tight sm:tracking-widest mb-1 flex items-center justify-center gap-0.5">
                  <Calendar className="w-2 sm:w-2.5 h-2 sm:h-2.5" /> IA Logs
                </p>
                <p className="text-[10px] sm:text-xs font-black text-slate-900 tabular-nums">{user.stats.aiLogs}</p>
              </div>
              <div className="text-center">
                <p className="text-[7px] sm:text-[8px] font-black text-emerald-600 uppercase tracking-tight sm:tracking-widest mb-1">Coste IA</p>
                <p className="text-[10px] sm:text-xs font-black text-emerald-700 tabular-nums">${user.stats.totalCost}</p>
              </div>
            </div>

            <div className="flex justify-center border-t border-slate-50 pt-3">
                <button 
                  onClick={() => toggleExpand(user.id)}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-emerald-600 transition-colors"
                >
                    <Activity className="w-3.5 h-3.5" />
                    {expandedUsers[user.id] ? 'Ocultar Auditoría' : 'Ver Auditoría IA'}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedUsers[user.id] ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {expandedUsers[user.id] && (
                <div className="mt-2 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2">
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-amber-500" /> Últimas 10 Peticiones
                    </h5>
                    {user.stats.recentLogs.length > 0 ? (
                        <div className="space-y-2">
                            {user.stats.recentLogs.map((log) => (
                                <div key={log.id} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                            {log.type === 'TRANSCRIPTION' ? '🎙️' : log.type === 'VISION' ? '📸' : '🦦'}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{log.type}</p>
                                            <p className="text-[8px] font-medium text-slate-400">{log.model}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-emerald-600 tabular-nums">${log.cost}</p>
                                        <p className="text-[8px] font-medium text-slate-300">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[10px] font-bold text-slate-400 italic text-center py-4">Sin actividad reciente en la IA</p>
                    )}
                </div>
            )}

            <p className="text-[8px] font-medium text-slate-300 italic text-right mt-1">
              Registrado: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
            <p className="text-sm font-bold text-slate-400">No se encontraron usuarios</p>
          </div>
        )}
      </div>
    </div>
  )
}
