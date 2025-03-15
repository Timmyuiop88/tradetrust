import { PrismaClient } from '@prisma/client'
import { platforms } from '../app/lib/seeds/platforms.js'
import { categories } from '../app/lib/seeds/categories.js'

const prisma = new PrismaClient()

async function main() {
  // Seed Platforms
  await Promise.all(
    platforms.map(platform =>
      prisma.platform.upsert({
        where: { name: platform.name },
        update: {},
        create: {
          name: platform.name,
          icon: platform.icon,
          isActive: true
        }
      })
    )
  )

  // Seed Categories
  await Promise.all(
    categories.map(category =>
      prisma.category.upsert({
        where: { name: category.name },
        update: {},
        create: {
          name: category.name,
          description: category.description,
          isActive: true
        }
      })
    )
  )

  // Create default plans
  const plans = [
    {
      name: 'Free',
      description: 'Basic features for getting started',
      tier: 'FREE',
      price: 0,
      maxListings: 2,
      commissionRate: 0.10,
      featuredListings: 0,
      minimumWithdrawal: 100,
      withdrawalSpeed: 168, // 7 days in hours
    },
    {
      name: 'Basic',
      description: 'Perfect for occasional sellers',
      tier: 'BASIC',
      price: 9.99,
      maxListings: 5,
      commissionRate: 0.08,
      featuredListings: 1,
      minimumWithdrawal: 50,
      withdrawalSpeed: 120, // 5 days in hours
    },
    {
      name: 'Pro',
      description: 'For serious sellers',
      tier: 'PRO',
      price: 19.99,
      maxListings: 15,
      commissionRate: 0.06,
      featuredListings: 3,
      minimumWithdrawal: 25,
      withdrawalSpeed: 72, // 3 days in hours
    },
    {
      name: 'Premium',
      description: 'Ultimate selling power',
      tier: 'PREMIUM',
      price: 49.99,
      maxListings: 999999,
      commissionRate: 0.04,
      featuredListings: 10,
      minimumWithdrawal: 0,
      withdrawalSpeed: 24, // 1 day in hours
    }
  ]

  console.log('Starting to seed plans...')
  
  for (const plan of plans) {
    const result = await prisma.plan.upsert({
      where: {
        tier: plan.tier
      },
      update: plan,
      create: plan
    })
    console.log(`Created/updated plan: ${result.name} (${result.tier})`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding the database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 