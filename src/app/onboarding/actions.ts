'use server'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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

  // Calcs - Mifflin-St Jeor BMR
  let bmr = 10 * current_weight_kg + 6.25 * height_cm - 5 * age
  if (sex === 'M') {
    bmr += 5
  } else if (sex === 'F') {
    bmr -= 161
  } else {
    bmr -= 78
  }

  // Activity multipliers
  const multipliers: Record<string, number> = {
    SEDENTARY: 1.2,
    LIGHT: 1.375,
    MODERATE: 1.55,
    ACTIVE: 1.725
  }

  const tdee = bmr * (multipliers[activity_level] || 1.2)

  // Deficit (1kg fat = ~7700 kcal -> ~1100 kcal deficit per day for 1kg/week)
  const daily_deficit = target_loss_per_week * 1000
  let target_cals = Math.round(tdee - daily_deficit)
  
  // Floor calories to 1200 for extreme safety
  if (target_cals < 1200) target_cals = 1200

  // Macros calculation
  // Protein: ~2g per kg of body weight
  const protein_target = Math.round(current_weight_kg * 2.2) 
  const protein_cals = protein_target * 4
  
  // Fats: ~25% of total calories
  const fats_target_cals = Math.round(target_cals * 0.25)
  const fats_target = Math.round(fats_target_cals / 9)
  
  // Carbs: rest
  const carbs_target_cals = target_cals - protein_cals - fats_target_cals
  const carbs_target = Math.round(Math.max(0, carbs_target_cals) / 4)

  const steps_target = 8000
  const water_ml_target = Math.round(current_weight_kg * 35)

  // Save to user profile & weight log
  await prisma.userProfile.upsert({
    where: { user_id: userId },
    update: {
      name, sex, age, height_cm, current_weight_kg, goal_weight_kg, 
      activity_level, target_loss_per_week,
      daily_calorie_target: target_cals,
      daily_protein_target: protein_target,
      daily_carbs_target: carbs_target,
      daily_fats_target: fats_target,
      daily_water_target_ml: water_ml_target,
      daily_steps_target: steps_target,
    },
    create: {
      user_id: userId,
      name, sex, age, height_cm, current_weight_kg, goal_weight_kg, 
      activity_level, target_loss_per_week,
      daily_calorie_target: target_cals,
      daily_protein_target: protein_target,
      daily_carbs_target: carbs_target,
      daily_fats_target: fats_target,
      daily_water_target_ml: water_ml_target,
      daily_steps_target: steps_target,
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
