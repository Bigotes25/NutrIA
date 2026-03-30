'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'

type MealItemInput = {
  food_name: string
  quantity_value: number
  quantity_unit: string
  estimated_grams?: number | null
  calories: number
  protein: number
  carbs: number
  fats: number
}

type MealUpdateInput = {
  category: string
  parsed: {
    title_summary: string
    total_calories: number
    total_protein: number
    total_carbs: number
    total_fats: number
    items: MealItemInput[]
  }
}

export async function updateMealEntry(id: string, data: MealUpdateInput) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const oldMeal = await prisma.mealEntry.findUnique({
    where: { id, user_id: session.user.id }
  })

  if (!oldMeal) throw new Error("Meal not found")

  const diffCalories = data.parsed.total_calories - oldMeal.total_calories

  // Update meal items and entry in a transaction
  await prisma.$transaction([
    prisma.mealItem.deleteMany({ where: { meal_entry_id: id } }),
    prisma.mealEntry.update({
      where: { id },
      data: {
        category: data.category,
        title_summary: data.parsed.title_summary,
        total_calories: data.parsed.total_calories,
        total_protein: data.parsed.total_protein,
        total_carbs: data.parsed.total_carbs,
        total_fats: data.parsed.total_fats,
        items: {
          create: data.parsed.items.map((i) => ({
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
    }),
    prisma.dailyMetric.upsert({
      where: { 
        user_id_metric_date: { 
          user_id: session.user.id, 
          metric_date: new Date(new Date(oldMeal.entry_date).setUTCHours(0,0,0,0))
        } 
      },
      update: { total_calories_consumed: { increment: diffCalories } },
      create: { 
        user_id: session.user.id, 
        metric_date: new Date(new Date(oldMeal.entry_date).setUTCHours(0,0,0,0)),
        total_calories_consumed: data.parsed.total_calories 
      }
    })
  ])

  revalidatePath('/dashboard')
  revalidatePath('/history')
  revalidatePath(`/history/${format(new Date(oldMeal.entry_date), 'yyyy-MM-dd')}`)
  revalidatePath(`/meal/${id}`)
  revalidatePath('/profile/analytics')
}

export async function deleteMealEntry(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const meal = await prisma.mealEntry.findUnique({
    where: { id, user_id: session.user.id }
  })

  if (!meal) throw new Error("Meal not found")

  await prisma.$transaction([
    prisma.mealEntry.delete({ where: { id } }),
    prisma.dailyMetric.update({
      where: { 
        user_id_metric_date: { 
          user_id: session.user.id, 
          metric_date: new Date(new Date(meal.entry_date).setUTCHours(0,0,0,0))
        } 
      },
      data: { total_calories_consumed: { decrement: meal.total_calories } }
    })
  ])

  revalidatePath('/dashboard')
  revalidatePath('/history')
  revalidatePath(`/history/${format(new Date(meal.entry_date), 'yyyy-MM-dd')}`)
  revalidatePath('/profile/analytics')
  redirect('/dashboard')
}
