'use server'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function saveManualMeal(formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = session.user.id
  const category = formData.get('category') as string
  const food_name = formData.get('food_name') as string
  const calories = parseInt(formData.get('calories') as string) || 0
  const protein = parseInt(formData.get('protein') as string) || 0
  const fats = parseInt(formData.get('fats') as string) || 0
  const carbs = parseInt(formData.get('carbs') as string) || 0

  await prisma.mealEntry.create({
    data: {
      user_id: userId,
      category,
      source_type: 'MANUAL',
      title_summary: food_name, 
      total_calories: calories,
      total_protein: protein,
      total_carbs: carbs,
      total_fats: fats,
      items: {
        create: [
          {
             food_name: food_name,
             quantity_value: 1,
             quantity_unit: 'serving',
             calories: calories,
             protein: protein,
             carbs: carbs,
             fats: fats,
          }
        ]
      }
    }
  })

  let today = new Date()
  today.setUTCHours(0,0,0,0) 

  await prisma.dailyMetric.upsert({
    where: { user_id_metric_date: { user_id: userId, metric_date: today } },
    update: {
      total_calories_consumed: { increment: calories }
    },
    create: {
      user_id: userId,
      metric_date: today,
      total_calories_consumed: calories
    }
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
