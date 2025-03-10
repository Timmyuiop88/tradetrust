const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Starting balance tables migration...')
  
  try {
    // Check if any users exist
    const users = await prisma.user.findMany({
      take: 10
    })
    
    console.log(`Found ${users.length} users`)
    
    // Create balance records for existing users
    for (const user of users) {
      const existingBalance = await prisma.balance.findUnique({
        where: { userId: user.id }
      })
      
      if (!existingBalance) {
        console.log(`Creating balance for user ${user.id}`)
        await prisma.balance.create({
          data: {
            userId: user.id,
            buyingBalance: 0,
            sellingBalance: 0
          }
        })
      }
    }
    
    console.log('Balance tables migration completed successfully')
  } catch (error) {
    console.error('Error during migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 