'use server'

import { Prisma } from '@prisma/client'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function signup(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email || !password || password.length < 6) {
    redirect('/register?error=invalid_data')
  }

  let destination = '/login?registered=true'

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      redirect('/register?error=email_taken')
    }

    const password_hash = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        email,
        password_hash,
        role: 'USER',
      }
    })
  } catch (error) {
    console.error('Signup failed', {
      email,
      error
    })

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      destination = '/register?error=email_taken'
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
      destination = '/register?error=db_connection'
    } else {
      destination = '/register?error=server_error'
    }
  }

  redirect(destination)
}
