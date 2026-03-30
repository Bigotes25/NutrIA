'use server'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { calculateProfileTargets } from '@/lib/profile-targets'

export async function completeOnboarding(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id

  const name = formData.get('name') as string
  const sex = formData.get('sex') as string
  const age = parseInt(formData.get('age') as string)
  const height_cm = parseFloat(formData.get('height_cm') as string)
  const current_weight_kg = parseFloat(formData.get('current_weight_kg') as string)
  const goal_weight_kg = parseFloat(formData.get('goal_weight_kg') as string)
  const activity_level = formData.get('activity_level') as string
  const target_loss_per_week = parseFloat(formData.get('target_loss_per_week') as string)

  const targets = calculateProfileTargets({
    sex,
    age,
    heightCm: height_cm,
    currentWeightKg: current_weight_kg,
    activityLevel: activity_level,
    targetLossPerWeek: target_loss_per_week,
  })

  // Save to user profile & weight log
  await prisma.userProfile.upsert({
    where: { user_id: userId },
    update: {
      name, sex, age, height_cm, current_weight_kg, goal_weight_kg, 
      activity_level, target_loss_per_week,
      daily_calorie_target: targets.dailyCalories,
      daily_protein_target: targets.proteinTarget,
      daily_carbs_target: targets.carbsTarget,
      daily_fats_target: targets.fatsTarget,
      daily_water_target_ml: targets.waterTargetMl,
      daily_steps_target: targets.stepsTarget,
    },
    create: {
      user_id: userId,
      name, sex, age, height_cm, current_weight_kg, goal_weight_kg, 
      activity_level, target_loss_per_week,
      daily_calorie_target: targets.dailyCalories,
      daily_protein_target: targets.proteinTarget,
      daily_carbs_target: targets.carbsTarget,
      daily_fats_target: targets.fatsTarget,
      daily_water_target_ml: targets.waterTargetMl,
      daily_steps_target: targets.stepsTarget,
    }
  })

  // Prevent duplicate today logs
  const today = new Date()
  today.setHours(0,0,0,0)

  // Find if log exists
  const existingWeight = await prisma.weightLog.findFirst({
    where: {
      user_id: userId,
      log_date: {
        gte: today
      }
    }
  })

  if (!existingWeight) {
    await prisma.weightLog.create({
      data: {
        user_id: userId,
        weight_kg: current_weight_kg,
        log_date: new Date()
      }
    })
  }

  redirect('/dashboard')
}
