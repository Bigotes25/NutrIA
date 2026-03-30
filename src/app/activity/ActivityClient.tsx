'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  List,
  Pencil,
  Plus,
  Save,
  Timer,
  Trash2,
  X,
} from 'lucide-react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { createWorkout, deleteWorkout, updateWorkout } from '@/app/dashboard/actions'

type MetricDay = {
  id: string
  metricDate: string
  consumed: number
  burned: number
  net: number
  delta: number
}

type WorkoutItem = {
  id: string
  date: string
  workoutType: string
  caloriesBurned: number
  durationMinutes: number | null
  notes: string | null
}

interface ActivityClientProps {
  targetCalories: number
  targetLossPerWeek: number
  days: MetricDay[]
  workouts: WorkoutItem[]
}

const workoutOptions = [
  { value: 'FUERZA', label: 'Fuerza' },
  { value: 'RUNNING', label: 'Running' },
  { value: 'CAMINATA', label: 'Caminata' },
  { value: 'CICLISMO', label: 'Ciclismo' },
  { value: 'OTRO', label: 'Otro' },
]

const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

type EditorState = {
  workoutId: string
  workoutType: string
  caloriesBurned: string
  durationMinutes: string
  notes: string
  logDate: string
}

export function ActivityClient({ targetCalories, targetLossPerWeek, days, workouts }: ActivityClientProps) {
  const router = useRouter()
  const [view, setView] = useState<'LIST' | 'CALENDAR'>('LIST')
  const [isPending, startTransition] = useTransition()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [createForm, setCreateForm] = useState({
    workoutType: 'FUERZA',
    caloriesBurned: '',
    durationMinutes: '',
    notes: '',
    logDate: format(new Date(), 'yyyy-MM-dd'),
  })

  const metricsMap = useMemo(() => {
    const map = new Map<string, MetricDay>()
    for (const day of days) {
      map.set(day.metricDate, day)
    }
    return map
  }, [days])

  const workoutsByDate = useMemo(() => {
    const map = new Map<string, WorkoutItem[]>()
    for (const workout of workouts) {
      const key = workout.date
      const current = map.get(key) ?? []
      current.push(workout)
      map.set(key, current)
    }
    return map
  }, [workouts])

  const selectedMetric = metricsMap.get(selectedDate) ?? {
    id: `empty-${selectedDate}`,
    metricDate: selectedDate,
    consumed: 0,
    burned: 0,
    net: 0,
    delta: targetCalories,
  }

  const selectedWorkouts = workoutsByDate.get(selectedDate) ?? []
  const recentDays = days.slice(0, 30)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDay = (getDay(monthStart) + 6) % 7

  const weeklyDelta = days.slice(0, 7).reduce((sum, day) => sum + day.delta, 0)
  const expectedKgChange = weeklyDelta / 7700

  const handleCreate = () => {
    setError(null)

    startTransition(async () => {
      try {
        await createWorkout({
          workoutType: createForm.workoutType,
          caloriesBurned: Number(createForm.caloriesBurned),
          durationMinutes: createForm.durationMinutes ? Number(createForm.durationMinutes) : null,
          notes: createForm.notes,
          logDate: `${createForm.logDate}T12:00:00.000Z`,
        })

        setSelectedDate(createForm.logDate)
        setCreateForm((current) => ({
          ...current,
          caloriesBurned: '',
          durationMinutes: '',
          notes: '',
        }))
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo guardar el entrenamiento')
      }
    })
  }

  const handleUpdate = () => {
    if (!editor) return
    setError(null)

    startTransition(async () => {
      try {
        await updateWorkout({
          workoutId: editor.workoutId,
          workoutType: editor.workoutType,
          caloriesBurned: Number(editor.caloriesBurned),
          durationMinutes: editor.durationMinutes ? Number(editor.durationMinutes) : null,
          notes: editor.notes,
          logDate: `${editor.logDate}T12:00:00.000Z`,
        })

        setSelectedDate(editor.logDate)
        setEditor(null)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo actualizar el entrenamiento')
      }
    })
  }

  const handleDelete = (workoutId: string) => {
    setError(null)

    startTransition(async () => {
      try {
        await deleteWorkout(workoutId)
        if (editor?.workoutId === workoutId) {
          setEditor(null)
        }
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo borrar el entrenamiento')
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-slate-900 bg-slate-950 p-6 text-white shadow-[0_25px_60px_-20px_rgba(15,23,42,0.55)]">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300/80">Balance semanal estimado</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-4xl font-black tabular-nums text-white">
              {weeklyDelta > 0 ? '+' : ''}
              {weeklyDelta}
              <span className="ml-1 text-sm text-white/50">kcal</span>
            </p>
            <p className="mt-2 text-sm font-bold text-slate-300">
              Aproximacion teorica: {expectedKgChange > 0 ? '-' : '+'}
              {Math.abs(expectedKgChange).toFixed(2)} kg
            </p>
          </div>
          <div className="rounded-3xl bg-emerald-400/10 p-4 text-emerald-300 ring-1 ring-emerald-300/10">
            <Flame className="w-6 h-6" />
          </div>
        </div>
        <p className="mt-4 text-sm font-medium leading-relaxed text-slate-300">
          Este calculo combina tus calorias consumidas, las quemadas en entrenamientos y la meta diaria definida en tu perfil.
          {targetLossPerWeek > 0 ? ` Tu ritmo objetivo actual es de ${targetLossPerWeek} kg por semana.` : ''}
        </p>
      </div>

      <div className="mx-auto flex max-w-[320px] gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
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
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Historial de actividad</h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">30 dias</span>
          </div>
          <div className="space-y-3">
            {recentDays.map((day) => (
              <button
                key={day.id}
                type="button"
                onClick={() => {
                  setSelectedDate(day.metricDate)
                  setCreateForm((current) => ({ ...current, logDate: day.metricDate }))
                }}
                className={`w-full premium-card p-5 flex items-center justify-between gap-4 text-left transition-all ${selectedDate === day.metricDate ? 'ring-2 ring-emerald-500/30' : ''}`}
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {format(new Date(`${day.metricDate}T00:00:00`), 'EEEE, d MMM', { locale: es })}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {day.consumed} kcal consumidas / {day.burned} kcal quemadas
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-black text-slate-900 tabular-nums">{day.net}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${day.delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {day.delta >= 0 ? `-${day.delta} vs meta` : `+${Math.abs(day.delta)} vs meta`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="premium-card animate-in fade-in slide-in-from-bottom-4 duration-500 p-6">
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
            {weekDays.map((dayName) => (
              <span key={dayName} className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{dayName}</span>
            ))}

            {Array.from({ length: startDay }).map((_, index) => (
              <div key={`pad-${index}`} />
            ))}

            {daysInMonth.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const metric = metricsMap.get(dateKey)
              const hasActivity = (metric?.burned ?? 0) > 0 || (workoutsByDate.get(dateKey)?.length ?? 0) > 0
              const active = selectedDate === dateKey

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => {
                    setSelectedDate(dateKey)
                    setCreateForm((current) => ({ ...current, logDate: dateKey }))
                  }}
                  className="relative flex flex-col items-center group"
                >
                  <div
                    className={`relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all ${
                      active
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : isToday(day)
                        ? 'border-2 border-emerald-500 text-emerald-600'
                        : hasActivity
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  {hasActivity ? (
                    <div className="absolute -bottom-1 sm:-bottom-2 flex gap-0.5">
                      <div className="w-1 h-1 bg-orange-500 rounded-full" />
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Dia seleccionado</h2>
            <p className="text-sm font-medium text-slate-500">
              {format(new Date(`${selectedDate}T00:00:00`), "EEEE, d 'de' MMMM", { locale: es })}
            </p>
          </div>
          <div className="rounded-[1.4rem] border border-orange-100 bg-orange-50 px-4 py-3 text-right shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-orange-500">Netas</p>
            <p className="text-lg font-black tabular-nums text-orange-600">{selectedMetric.net}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Consumidas</p>
            <p className="text-lg font-black text-slate-900 tabular-nums">{selectedMetric.consumed}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Quemadas</p>
            <p className="text-lg font-black text-emerald-700 tabular-nums">{selectedMetric.burned}</p>
          </div>
          <div className="rounded-2xl border border-slate-900 bg-slate-950 p-4 shadow-[0_20px_35px_-18px_rgba(15,23,42,0.55)]">
            <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-white/50">Vs Meta</p>
            <p className={`text-lg font-black tabular-nums ${selectedMetric.delta >= 0 ? 'text-white' : 'text-red-300'}`}>
              {selectedMetric.delta > 0 ? `+${selectedMetric.delta}` : selectedMetric.delta}
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Registrar entrenamiento</h4>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <CalendarIcon className="w-3 h-3" />
              {createForm.logDate}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</span>
              <input
                type="date"
                value={createForm.logDate}
                onChange={(e) => {
                  setCreateForm((current) => ({ ...current, logDate: e.target.value }))
                  setSelectedDate(e.target.value)
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</span>
              <select
                value={createForm.workoutType}
                onChange={(e) => setCreateForm((current) => ({ ...current, workoutType: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none"
              >
                {workoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kcal quemadas</span>
              <input
                type="number"
                min="1"
                value={createForm.caloriesBurned}
                onChange={(e) => setCreateForm((current) => ({ ...current, caloriesBurned: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                placeholder="350"
              />
            </label>

            <label className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Minutos</span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={createForm.durationMinutes}
                  onChange={(e) => setCreateForm((current) => ({ ...current, durationMinutes: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-900 outline-none"
                  placeholder="45"
                />
                <Timer className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              </div>
            </label>
          </div>

          <label className="space-y-1 block">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nota</span>
            <input
              value={createForm.notes}
              onChange={(e) => setCreateForm((current) => ({ ...current, notes: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none"
              placeholder="Pierna, rodaje suave, tirada larga..."
            />
          </label>

          {error ? <p className="text-sm font-bold text-red-500">{error}</p> : null}

          <button
            type="button"
            onClick={handleCreate}
            disabled={isPending || !createForm.caloriesBurned}
            className="w-full rounded-[1.4rem] bg-orange-500 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {isPending ? 'Guardando...' : 'Guardar Entrenamiento'}
            </span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Entrenos del dia</h4>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedWorkouts.length} registros</span>
          </div>

          {selectedWorkouts.length === 0 ? (
            <div className="rounded-[1.8rem] border border-dashed border-slate-200 bg-transparent px-5 py-8 text-center">
              <p className="text-sm font-bold italic text-slate-400">No has registrado actividad en este dia.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedWorkouts.map((workout) => {
                const isEditing = editor?.workoutId === workout.id

                return (
                  <div key={workout.id} className="rounded-[1.8rem] border border-slate-100 bg-white px-5 py-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <label className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fecha</span>
                            <input
                              type="date"
                              value={editor.logDate}
                              onChange={(e) => setEditor((current) => current ? { ...current, logDate: e.target.value } : current)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo</span>
                            <select
                              value={editor.workoutType}
                              onChange={(e) => setEditor((current) => current ? { ...current, workoutType: e.target.value } : current)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                            >
                              {workoutOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <label className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kcal</span>
                            <input
                              type="number"
                              min="1"
                              value={editor.caloriesBurned}
                              onChange={(e) => setEditor((current) => current ? { ...current, caloriesBurned: e.target.value } : current)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Minutos</span>
                            <input
                              type="number"
                              min="0"
                              value={editor.durationMinutes}
                              onChange={(e) => setEditor((current) => current ? { ...current, durationMinutes: e.target.value } : current)}
                              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                            />
                          </label>
                        </div>

                        <input
                          value={editor.notes}
                          onChange={(e) => setEditor((current) => current ? { ...current, notes: e.target.value } : current)}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none"
                          placeholder="Nota"
                        />

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditor(null)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500"
                          >
                            <span className="inline-flex items-center gap-2">
                              <X className="w-4 h-4" />
                              Cancelar
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={handleUpdate}
                            disabled={isPending}
                            className="rounded-2xl bg-slate-900 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Save className="w-4 h-4" />
                              Guardar
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{workout.workoutType}</p>
                          <p className="truncate text-sm font-bold text-slate-800">
                            {workout.notes || 'Entrenamiento registrado manualmente'}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>{workout.durationMinutes ? `${workout.durationMinutes} min` : 'Duracion libre'}</span>
                            <div className="h-1 w-1 rounded-full bg-slate-300" />
                            <span>{workout.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <p className="text-right text-lg font-black tabular-nums text-slate-900">
                            {workout.caloriesBurned}
                            <span className="ml-1 text-[10px] uppercase tracking-widest text-slate-400">kcal</span>
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setEditor({
                                workoutId: workout.id,
                                workoutType: workout.workoutType,
                                caloriesBurned: String(workout.caloriesBurned),
                                durationMinutes: workout.durationMinutes ? String(workout.durationMinutes) : '',
                                notes: workout.notes || '',
                                logDate: workout.date,
                              })
                            }
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-500 transition-all active:scale-90"
                            aria-label={`Editar entrenamiento ${workout.workoutType}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(workout.id)}
                            disabled={isPending}
                            className="rounded-2xl border border-red-100 bg-red-50 p-3 text-red-500 transition-all active:scale-90 disabled:opacity-50"
                            aria-label={`Borrar entrenamiento ${workout.workoutType}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Link href="/history" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600">
            <ChevronDown className="w-4 h-4 -rotate-90" />
            Ver comidas de ese dia
          </Link>
        </div>
      </section>
    </div>
  )
}
