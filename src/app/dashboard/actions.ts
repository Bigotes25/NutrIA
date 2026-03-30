'use server'

import { revalidatePath } from 'next/cache'
import { Prisma } from '@prisma/client'
import { generateCoachTip } from '@/lib/ai/service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

function getTodayUtcStart() {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return today
}

function getUtcDayStart(input?: Date | string) {
  const value = input ? new Date(input) : new Date()
  value.setUTCHours(0, 0, 0, 0)
  return value
}

function getUtcDayEnd(start: Date) {
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 1)
  return end
}

async function syncExerciseCaloriesForDate(tx: Prisma.TransactionClient, userId: string, dayStart: Date) {
  const dayEnd = getUtcDayEnd(dayStart)
  const aggregate = await tx.workout.aggregate({
    where: {
      user_id: userId,
      log_date: {
        gte: dayStart,
        lt: dayEnd,
      },
    },
    _sum: {
      calories_burned: true,
    },
  })

  const total = aggregate._sum.calories_burned ?? 0

  await tx.dailyMetric.upsert({
    where: { user_id_metric_date: { user_id: userId, metric_date: dayStart } },
    update: { exercise_calories: total },
    create: {
      user_id: userId,
      metric_date: dayStart,
      exercise_calories: total,
    },
  })
}

export async function addWater(amount_ml: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return

  const today = getTodayUtcStart()

  await prisma.dailyMetric.upsert({
    where: { user_id_metric_date: { user_id: session.user.id, metric_date: today } },
    update: { water_ml: { increment: amount_ml } },
    create: { user_id: session.user.id, metric_date: today, water_ml: amount_ml }
  })

  revalidatePath('/dashboard')
}

export async function logWeight(weight: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const userId = session.user.id

  await prisma.weightLog.create({
    data: {
      user_id: userId,
      weight_kg: weight,
      log_date: new Date()
    }
  })

  await prisma.userProfile.update({
    where: { user_id: userId },
    data: { current_weight_kg: weight }
  })

  revalidatePath('/dashboard')
  revalidatePath('/profile/analytics')
}

export async function getCoachTip() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const userId = session.user.id
  
  const profile = await prisma.userProfile.findUnique({ where: { user_id: userId } })
  const today = getTodayUtcStart()
  
  const metrics = await prisma.dailyMetric.findUnique({
    where: { user_id_metric_date: { user_id: userId, metric_date: today } }
  })

  if (!profile || !metrics) return null

  // In a real app we'd cache this in the DB to avoid tokens on every refresh
  // but for the MVP demo, we'll generate it.
  return await generateCoachTip(userId, profile, metrics)
}

export async function createWorkout(input: {
  workoutType: string
  caloriesBurned: number
  durationMinutes?: number | null
  notes?: string
  logDate?: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthorized')

  const workoutType = input.workoutType.trim()
  const caloriesBurned = Math.max(0, Math.round(input.caloriesBurned))
  const durationMinutes = input.durationMinutes ? Math.max(0, Math.round(input.durationMinutes)) : null
  const notes = input.notes?.trim() || null

  if (!workoutType) {
    throw new Error('El tipo de entrenamiento es obligatorio')
  }

  if (caloriesBurned <= 0) {
    throw new Error('Las calorias quemadas deben ser mayores que 0')
  }

  const workoutDate = input.logDate ? new Date(input.logDate) : new Date()
  const metricDate = getUtcDayStart(workoutDate)

  await prisma.$transaction(async (tx) => {
    await tx.workout.create({
      data: {
        user_id: session.user.id,
        log_date: workoutDate,
        workout_type: workoutType,
        calories_burned: caloriesBurned,
        duration_minutes: durationMinutes,
        notes,
      },
    })

    await syncExerciseCaloriesForDate(tx, session.user.id, metricDate)
  })

  revalidatePath('/dashboard')
  revalidatePath('/history')
  revalidatePath('/activity')
}

export async function updateWorkout(input: {
  workoutId: string
  workoutType: string
  caloriesBurned: number
  durationMinutes?: number | null
  notes?: string
  logDate: string
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthorized')

  const workoutType = input.workoutType.trim()
  const caloriesBurned = Math.max(0, Math.round(input.caloriesBurned))
  const durationMinutes = input.durationMinutes ? Math.max(0, Math.round(input.durationMinutes)) : null
  const notes = input.notes?.trim() || null
  const logDate = new Date(input.logDate)

  if (!workoutType) {
    throw new Error('El tipo de entrenamiento es obligatorio')
  }

  if (caloriesBurned <= 0) {
    throw new Error('Las calorias quemadas deben ser mayores que 0')
  }

  const workout = await prisma.workout.findFirst({
    where: {
      id: input.workoutId,
      user_id: session.user.id,
    },
  })

  if (!workout) {
    throw new Error('Entrenamiento no encontrado')
  }

  const previousMetricDate = getUtcDayStart(workout.log_date)
  const nextMetricDate = getUtcDayStart(logDate)

  await prisma.$transaction(async (tx) => {
    await tx.workout.update({
      where: { id: workout.id },
      data: {
        workout_type: workoutType,
        calories_burned: caloriesBurned,
        duration_minutes: durationMinutes,
        notes,
        log_date: logDate,
      },
    })

    await syncExerciseCaloriesForDate(tx, session.user.id, previousMetricDate)
    if (previousMetricDate.getTime() !== nextMetricDate.getTime()) {
      await syncExerciseCaloriesForDate(tx, session.user.id, nextMetricDate)
    } else {
      await syncExerciseCaloriesForDate(tx, session.user.id, nextMetricDate)
    }
  })

  revalidatePath('/dashboard')
  revalidatePath('/history')
  revalidatePath('/activity')
}

export async function deleteWorkout(workoutId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthorized')

  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      user_id: session.user.id,
    },
  })

  if (!workout) {
    throw new Error('Entrenamiento no encontrado')
  }

  const workoutMetricDate = new Date(workout.log_date)
  workoutMetricDate.setUTCHours(0, 0, 0, 0)
  await prisma.$transaction(async (tx) => {
    await tx.workout.delete({
      where: { id: workout.id },
    })

    await syncExerciseCaloriesForDate(tx, session.user.id, workoutMetricDate)
  })

  revalidatePath('/dashboard')
  revalidatePath('/history')
  revalidatePath('/activity')
}
