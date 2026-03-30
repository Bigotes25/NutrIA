'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, Pencil, Plus, Save, Timer, Trash2, X } from 'lucide-react'
import { createWorkout, deleteWorkout, updateWorkout } from '@/app/dashboard/actions'

type WorkoutItem = {
  id: string
  date: string
  workoutType: string
  caloriesBurned: number
  durationMinutes: number | null
  notes: string | null
}

interface HistoryWorkoutSectionProps {
  date: string
  consumedCalories: number
  burnedCalories: number
  targetCalories: number
  workouts: WorkoutItem[]
}

const workoutOptions = [
  { value: 'FUERZA', label: 'Fuerza' },
  { value: 'RUNNING', label: 'Running' },
  { value: 'CAMINATA', label: 'Caminata' },
  { value: 'CICLISMO', label: 'Ciclismo' },
  { value: 'OTRO', label: 'Otro' },
]

type EditorState = {
  workoutId: string
  workoutType: string
  caloriesBurned: string
  durationMinutes: string
  notes: string
}

export function HistoryWorkoutSection({
  date,
  consumedCalories,
  burnedCalories,
  targetCalories,
  workouts,
}: HistoryWorkoutSectionProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [createForm, setCreateForm] = useState({
    workoutType: 'FUERZA',
    caloriesBurned: '',
    durationMinutes: '',
    notes: '',
  })

  const netCalories = Math.max(0, consumedCalories - burnedCalories)
  const delta = targetCalories - netCalories

  const handleCreate = () => {
    setError(null)

    startTransition(async () => {
      try {
        await createWorkout({
          workoutType: createForm.workoutType,
          caloriesBurned: Number(createForm.caloriesBurned),
          durationMinutes: createForm.durationMinutes ? Number(createForm.durationMinutes) : null,
          notes: createForm.notes,
          logDate: `${date}T12:00:00.000Z`,
        })

        setCreateForm({
          workoutType: 'FUERZA',
          caloriesBurned: '',
          durationMinutes: '',
          notes: '',
        })
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
          logDate: `${date}T12:00:00.000Z`,
        })
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
    <section className="space-y-4 mt-10">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-black text-xl text-slate-900 italic tracking-tight underline decoration-orange-500/30 decoration-4 underline-offset-4">
          Actividad
        </h3>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{workouts.length} entrenos</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Consumidas</p>
          <p className="text-lg font-black text-slate-900 tabular-nums">{consumedCalories}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Quemadas</p>
          <p className="text-lg font-black text-emerald-700 tabular-nums">{burnedCalories}</p>
        </div>
        <div className="rounded-2xl bg-slate-900 p-4 border border-slate-900">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Vs Meta</p>
          <p className={`text-lg font-black tabular-nums ${delta >= 0 ? 'text-white' : 'text-red-300'}`}>
            {delta > 0 ? `+${delta}` : delta}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <p className="text-sm font-medium text-slate-600">
          El balance del dia sale de tus calorias registradas y tu meta diaria del perfil. Si ajustas peso, actividad o ritmo objetivo, estas referencias se actualizan automaticamente.
        </p>
      </div>

      <div className="premium-card p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Anadir entrenamiento</h4>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
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

          <label className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kcal</span>
            <input
              type="number"
              min="1"
              value={createForm.caloriesBurned}
              onChange={(e) => setCreateForm((current) => ({ ...current, caloriesBurned: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none"
              placeholder="350"
            />
          </label>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <label className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nota</span>
            <input
              value={createForm.notes}
              onChange={(e) => setCreateForm((current) => ({ ...current, notes: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none"
              placeholder="Pierna, series, paseo largo..."
            />
          </label>

          <label className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min</span>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={createForm.durationMinutes}
                onChange={(e) => setCreateForm((current) => ({ ...current, durationMinutes: e.target.value }))}
                className="w-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-bold text-slate-900 outline-none"
                placeholder="45"
              />
              <Timer className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
            </div>
          </label>
        </div>

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

      {workouts.length === 0 ? (
        <div className="premium-card p-12 text-center border-dashed border-2 border-slate-200 bg-transparent shadow-none">
          <p className="text-slate-400 font-bold italic">No registraste entrenamientos en este dia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => {
            const isEditing = editor?.workoutId === workout.id

            return (
              <div key={workout.id} className="premium-card p-5">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
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
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-3">
                      <input
                        value={editor.notes}
                        onChange={(e) => setEditor((current) => current ? { ...current, notes: e.target.value } : current)}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none"
                        placeholder="Nota"
                      />
                      <input
                        type="number"
                        min="0"
                        value={editor.durationMinutes}
                        onChange={(e) => setEditor((current) => current ? { ...current, durationMinutes: e.target.value } : current)}
                        className="w-24 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                        placeholder="Min"
                      />
                    </div>

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
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 inline-flex items-center gap-2">
                        <Dumbbell className="w-3.5 h-3.5 text-orange-500" />
                        {workout.workoutType}
                      </p>
                      <p className="truncate text-sm font-bold text-slate-800">
                        {workout.notes || 'Entrenamiento registrado manualmente'}
                      </p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {workout.durationMinutes ? `${workout.durationMinutes} min` : 'Duracion libre'}
                      </p>
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
    </section>
  )
}
