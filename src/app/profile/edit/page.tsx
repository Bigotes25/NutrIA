import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import EditProfileForm from './EditProfileForm'
import { hasCompletedProfile } from '@/lib/profile-completion'

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.userProfile.findUnique({
    where: { user_id: session.user.id }
  })

  if (!hasCompletedProfile(profile)) redirect('/onboarding')

  return <EditProfileForm initialData={profile} />
}
