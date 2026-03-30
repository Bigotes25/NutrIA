'use server'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { calculateMacroTargets, calculateProfileTargets } from '@/lib/profile-targets'

export async function updateProfile(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  
  const name = formData.get('name') as string
  const sex = formData.get('sex') as string
  const age = parseInt(formData.get('age') as string)
  const height_cm = parseFloat(formData.get('height_cm') as string)
  const current_weight_kg = parseFloat(formData.get('current_weight_kg') as string)
  const goal_weight_kg = parseFloat(formData.get('goal_weight_kg') as string)
  const activity_level = formData.get('activity_level') as string
  const target_loss_per_week = parseFloat(formData.get('target_loss_per_week') as string)
  
  const isAuto = formData.get('calc_mode') === 'auto'
  let target_cals = parseInt(formData.get('manual_calories') as string)
  let target_water = parseInt(formData.get('manual_water') as string)
  const autoTargets = calculateProfileTargets({
    sex,
    age,
    heightCm: height_cm,
    currentWeightKg: current_weight_kg,
    activityLevel: activity_level,
    targetLossPerWeek: target_loss_per_week,
  })

  if (isAuto) {
    target_cals = autoTargets.dailyCalories
    target_water = autoTargets.waterTargetMl
  }

  const safeCalories = Number.isFinite(target_cals) ? Math.max(1200, target_cals) : autoTargets.dailyCalories
  const safeWater = Number.isFinite(target_water) ? Math.max(0, target_water) : autoTargets.waterTargetMl
  const macros = calculateMacroTargets(current_weight_kg, safeCalories)

  await prisma.userProfile.update({
    where: { user_id: userId },
    data: {
      name, sex, age, height_cm, current_weight_kg, goal_weight_kg,
      activity_level, target_loss_per_week,
      daily_calorie_target: safeCalories,
      daily_water_target_ml: safeWater,
      daily_protein_target: macros.proteinTarget,
      daily_carbs_target: macros.carbsTarget,
      daily_fats_target: macros.fatsTarget,
      daily_steps_target: autoTargets.stepsTarget,
    }
  })

  // Sync weight log for today
  const today = new Date()
  today.setUTCHours(0,0,0,0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const existingWeight = await prisma.weightLog.findFirst({
    where: { 
      user_id: userId,
      log_date: {
        gte: today,
        lt: tomorrow
      }
    }
  })

  if (existingWeight) {
    await prisma.weightLog.update({
      where: { id: existingWeight.id },
      data: { weight_kg: current_weight_kg }
    })
  } else {
    await prisma.weightLog.create({
      data: { user_id: userId, weight_kg: current_weight_kg, log_date: today }
    })
  }

  revalidatePath('/profile')
  revalidatePath('/dashboard')
  redirect('/profile')
}
