'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getFavoriteMeals() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return []

  return await prisma.favoriteMeal.findMany({
    where: { user_id: session.user.id },
    include: { items: true },
    orderBy: { created_at: 'desc' }
  })
}

export async function saveAsFavorite(mealEntryId: string, customTitle?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const mealEntry = await prisma.mealEntry.findUnique({
    where: { id: mealEntryId },
    include: { items: true }
  })

  if (!mealEntry) throw new Error("Meal entry not found")

  const favorite = await prisma.favoriteMeal.create({
    data: {
      user_id: session.user.id,
      title: customTitle || mealEntry.title_summary || "Favorito sin nombre",
      category: mealEntry.category,
      total_calories: mealEntry.total_calories,
      total_protein: mealEntry.total_protein,
      total_carbs: mealEntry.total_carbs,
      total_fats: mealEntry.total_fats,
      items: {
        create: mealEntry.items.map(item => ({
          food_name: item.food_name,
          quantity_value: item.quantity_value,
          quantity_unit: item.quantity_unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats
        }))
      }
    }
  })

  revalidatePath('/add')
  return favorite
}

export async function applyFavoriteMeal(favoriteId: string, category?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const favorite = await prisma.favoriteMeal.findUnique({
    where: { id: favoriteId },
    include: { items: true }
  })

  if (!favorite) throw new Error("Favorite not found")

  // Create a new meal entry from the favorite
  const newEntry = await prisma.mealEntry.create({
    data: {
      user_id: session.user.id,
      category: category || favorite.category || 'OTHER',
      source_type: 'MANUAL',
      title_summary: favorite.title,
      total_calories: favorite.total_calories,
      total_protein: favorite.total_protein,
      total_carbs: favorite.total_carbs,
      total_fats: favorite.total_fats,
      items: {
        create: favorite.items.map(item => ({
          food_name: item.food_name,
          quantity_value: item.quantity_value,
          quantity_unit: item.quantity_unit,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats
        }))
      }
    }
  })

  // Update metrics
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  await prisma.dailyMetric.upsert({
    where: { user_id_metric_date: { user_id: session.user.id, metric_date: today } },
    update: {
      total_calories_consumed: { increment: favorite.total_calories }
    },
    create: {
      user_id: session.user.id,
      metric_date: today,
      total_calories_consumed: favorite.total_calories
    }
  })

  revalidatePath('/dashboard')
  return newEntry
}

export async function deleteFavorite(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.favoriteMeal.delete({
    where: { id, user_id: session.user.id }
  })

  revalidatePath('/add')
}
