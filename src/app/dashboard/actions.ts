'use server'

import { revalidatePath } from 'next/cache'
import { generateCoachTip } from '@/lib/ai/service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function addWater(amount_ml: number) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return

  const today = new Date()
  today.setUTCHours(0,0,0,0) 

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
  const today = new Date()
  today.setUTCHours(0,0,0,0)
  
  const metrics = await prisma.dailyMetric.findUnique({
    where: { user_id_metric_date: { user_id: userId, metric_date: today } }
  })

  if (!profile || !metrics) return null

  // In a real app we'd cache this in the DB to avoid tokens on every refresh
  // but for the MVP demo, we'll generate it.
  return await generateCoachTip(userId, profile, metrics)
}


