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
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 