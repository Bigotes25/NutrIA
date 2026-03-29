'use server'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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

  if (isAuto) {
    // Recalculate if in auto mode
    let bmr = 10 * current_weight_kg + 6.25 * height_cm - 5 * age
    if (sex === 'M') bmr += 5
    else if (sex === 'F') bmr -= 161
    else bmr -= 78

    const multipliers: Record<string, number> = {
      SEDENTARY: 1.2,
      LIGHT: 1.375,
      MODERATE: 1.55,
      ACTIVE: 1.725
    }

    const tdee = bmr * (multipliers[activity_level] || 1.2)
    const daily_deficit = target_loss_per_week * 1000
    target_cals = Math.round(tdee - daily_deficit)
    if (target_cals < 1200) target_cals = 1200

    target_water = Math.round(current_weight_kg * 35)
  }

  // Basic macro split if recalculated or changed
  const protein_target = Math.round(current_weight_kg * 2.2) 
  const fats_target = Math.round((target_cals * 0.25) / 9)
  const carbs_target = Math.round((target_cals - (protein_target * 4) - (fats_target * 9)) / 4)

  await prisma.userProfile.update({
    where: { user_id: userId },
    data: {
      name, sex, age, height_cm, current_weight_kg, goal_weight_kg,
      activity_level, target_loss_per_week,
      daily_calorie_target: target_cals,
      daily_water_target_ml: target_water,
      daily_protein_target: protein_target,
      daily_carbs_target: carbs_target,
      daily_fats_target: fats_target,
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
