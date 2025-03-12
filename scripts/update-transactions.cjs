const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Get the first admin user or any user to assign to existing transactions
  const defaultUser = await prisma.user.findFirst({
    where: {
      role: 'USER'
    }
  })
  
  if (!defaultUser) {
    console.error('No default user found to assign transactions to')
    return
  }
  
  // Update all transactions that don't have a userId
  const updated = await prisma.transaction.updateMany({
    where: {
      userId: null
    },
    data: {
      userId: defaultUser.id
    }
  })
  
  console.log(`Updated ${updated.count} transactions with default user ID`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 