'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveAIMeal(data: any, isFavorite: boolean = false) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const userId = session.user.id
  const parsed = data.parsed

  const meal = await prisma.mealEntry.create({
    data: {
      user_id: userId,
      category: data.category || 'OTHER',
      source_type: data.source_type || 'MANUAL',
      title_summary: parsed.title_summary,
      total_calories: parsed.total_calories,
      total_protein: parsed.total_protein,
      total_carbs: parsed.total_carbs,
      total_fats: parsed.total_fats,
      ai_confidence: 0.9, 
      items: {
        create: parsed.items.map((i: any) => ({
             food_name: i.food_name,
             quantity_value: i.quantity_value,
             quantity_unit: i.quantity_unit,
             estimated_grams: i.estimated_grams || null,
             calories: i.calories,
             protein: i.protein,
             carbs: i.carbs,
             fats: i.fats,
        }))
      }
    }
  })

  // Optionally save media log if photo/audio uploaded to a real S3
  if (data.media_url && data.media_url.startsWith('http')) {
    await prisma.mealMedia.create({
      data: {
        meal_entry_id: meal.id,
        media_type: data.source_type === 'PHOTO' ? 'IMAGE' : 'AUDIO',
        file_url: data.media_url
      }
    })
  }

  const today = new Date()
  today.setUTCHours(0,0,0,0) 

  await prisma.dailyMetric.upsert({
    where: { user_id_metric_date: { user_id: userId, metric_date: today } },
    update: {
      total_calories_consumed: { increment: parsed.total_calories }
    },
    create: {
      user_id: userId,
      metric_date: today,
      total_calories_consumed: parsed.total_calories
    }
  })

  if (isFavorite) {
    await prisma.favoriteMeal.create({
      data: {
        user_id: userId,
        title: parsed.title_summary,
        category: data.category || 'OTHER',
        total_calories: parsed.total_calories,
        total_protein: parsed.total_protein,
        total_carbs: parsed.total_carbs,
        total_fats: parsed.total_fats,
        items: {
          create: parsed.items.map((i: any) => ({
            food_name: i.food_name,
            quantity_value: i.quantity_value,
            quantity_unit: i.quantity_unit,
            calories: i.calories,
            protein: i.protein,
            carbs: i.carbs,
            fats: i.fats,
          }))
        }
      }
    })
  }

  return true;
}
