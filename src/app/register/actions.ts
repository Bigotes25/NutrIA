'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password || password.length < 6) {
    redirect('/register?error=invalid_data')
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    redirect('/register?error=email_taken')
  }

  const password_hash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password_hash,
      role: 'USER',
      profile: {
        create: {} 
      }
    }
  })

  // NextAuth typical flow logic: user created -> go login
  redirect('/login?registered=true')
}
