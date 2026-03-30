'use server'

import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

async function checkSuperadmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (user?.role !== 'SUPERADMIN') {
    throw new Error("Forbidden")
  }
  return user
}

export async function getAiUsageStats() {
  await checkSuperadmin()

  // Get logs from the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const logs = await prisma.aiUsageLog.findMany({
    where: {
      created_at: { gte: thirtyDaysAgo }
    },
    orderBy: { created_at: 'asc' }
  })

  // Basic aggregations
  const totalCost = logs.reduce((acc, log) => acc + log.estimated_cost_usd, 0)
  const avgLatency = logs.length > 0 
    ? logs.reduce((acc, log) => acc + log.latency_ms, 0) / logs.length 
    : 0
  
  const successRate = logs.length > 0
    ? (logs.filter(l => l.status === 'SUCCESS').length / logs.length) * 100
    : 0

  // Group by day for the chart
  const dailyStats: Record<string, { date: string, cost: number, count: number }> = {}
  
  logs.forEach(log => {
    const dateStr = log.created_at.toISOString().split('T')[0]
    if (!dailyStats[dateStr]) {
      dailyStats[dateStr] = { date: dateStr, cost: 0, count: 0 }
    }
    dailyStats[dateStr].cost += log.estimated_cost_usd
    dailyStats[dateStr].count += 1
  })

  return {
    summary: {
      totalRequests: logs.length,
      totalCost: totalCost.toFixed(4),
      avgLatency: Math.round(avgLatency),
      successRate: successRate.toFixed(1)
    },
    chartData: Object.values(dailyStats)
  }
}

export async function getUsersList() {
  await checkSuperadmin()

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          meal_entries: true,
          weight_logs: true,
          ai_usage_logs: true
        }
      },
      ai_usage_logs: {
        orderBy: { created_at: 'desc' },
        take: 10,
        select: {
          id: true,
          request_type: true,
          model_used: true,
          estimated_cost_usd: true,
          created_at: true,
          status: true
        }
      },
      profile: {
        select: { name: true }
      }
    },
    orderBy: { created_at: 'desc' }
  })

  return users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.profile?.name || 'Pro User',
    role: u.role,
    isActive: u.is_active,
    createdAt: u.created_at,
    stats: {
      meals: u._count.meal_entries,
      weights: u._count.weight_logs,
      aiLogs: u._count.ai_usage_logs,
      totalCost: u.ai_usage_logs.reduce((sum, log) => sum + log.estimated_cost_usd, 0).toFixed(4),
      recentLogs: u.ai_usage_logs.map(log => ({
        id: log.id,
        type: log.request_type,
        model: log.model_used,
        cost: log.estimated_cost_usd.toFixed(4),
        date: log.created_at,
        status: log.status
      }))
    }
  }))
}

export async function updateUserRole(targetUserId: string, newRole: string) {
  const admin = await checkSuperadmin()
  
  // Prevent admin from demoting themselves (safety)
  if (targetUserId === admin.id && newRole !== 'SUPERADMIN') {
    throw new Error("No puedes quitarte el rol de Superadmin a ti mismo")
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole }
  })

  revalidatePath('/superadmin')
}

export async function createUser(input: {
  email: string
  password: string
  name?: string
  role?: string
  isActive?: boolean
}) {
  await checkSuperadmin()

  const email = input.email.trim().toLowerCase()
  const password = input.password.trim()
  const name = input.name?.trim() || null
  const role = input.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'USER'
  const isActive = input.isActive ?? true

  if (!email || !password) {
    throw new Error('Email y contraseña son obligatorios')
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres')
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error('Ya existe un usuario con ese email')
  }

  const password_hash = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      email,
      password_hash,
      role,
      is_active: isActive,
      profile: {
        create: {
          name
        }
      }
    }
  })

  revalidatePath('/superadmin')
}

export async function updateUser(input: {
  userId: string
  email: string
  name?: string
  role: string
  isActive: boolean
  password?: string
}) {
  const admin = await checkSuperadmin()

  const userId = input.userId
  const email = input.email.trim().toLowerCase()
  const name = input.name?.trim() || null
  const role = input.role === 'SUPERADMIN' ? 'SUPERADMIN' : 'USER'
  const isActive = input.isActive
  const password = input.password?.trim()

  if (!email) {
    throw new Error('El email es obligatorio')
  }

  if (userId === admin.id && role !== 'SUPERADMIN') {
    throw new Error('No puedes quitarte el rol de Superadmin a ti mismo')
  }

  if (userId === admin.id && !isActive) {
    throw new Error('No puedes desactivar tu propia cuenta')
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true }
  })

  if (!existingUser) {
    throw new Error('Usuario no encontrado')
  }

  const emailOwner = await prisma.user.findUnique({
    where: { email }
  })

  if (emailOwner && emailOwner.id !== userId) {
    throw new Error('Ese email ya está en uso por otro usuario')
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      email,
      role,
      is_active: isActive,
      ...(password
        ? { password_hash: await bcrypt.hash(password, 10) }
        : {}),
      profile: existingUser.profile
        ? {
            update: {
              name
            }
          }
        : {
            create: {
              name
            }
          }
    }
  })

  revalidatePath('/superadmin')
}

export async function deleteUser(targetUserId: string) {
  const admin = await checkSuperadmin()

  if (targetUserId === admin.id) {
    throw new Error('No puedes borrar tu propia cuenta')
  }

  await prisma.user.delete({
    where: { id: targetUserId }
  })

  revalidatePath('/superadmin')
}
