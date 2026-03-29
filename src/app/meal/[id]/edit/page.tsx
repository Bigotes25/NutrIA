import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { EditMealClient } from './EditMealClient'

export default async function EditMealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const meal = await prisma.mealEntry.findUnique({
    where: { id, user_id: session.user.id },
    include: { items: true }
  })

  if (!meal) redirect('/dashboard')

  // Transform to the shape expected by the UI
  const initialData = {
    category: meal.category,
    source_type: meal.source_type,
    parsed: {
      title_summary: meal.title_summary || "",
      total_calories: meal.total_calories,
      total_protein: meal.total_protein || 0,
      total_carbs: meal.total_carbs || 0,
      total_fats: meal.total_fats || 0,
      items: meal.items.map((item: any) => ({
        food_name: item.food_name,
        quantity_value: item.quantity_value,
        quantity_unit: item.quantity_unit,
        estimated_grams: item.estimated_grams,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
      }))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <EditMealClient initialData={initialData} mealId={id} />
    </div>
  )
}
