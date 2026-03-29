const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst()
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'SUPERADMIN' }
    })
    console.log(`User ${user.email} is now SUPERADMIN`)
  } else {
    console.log('No user found')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
