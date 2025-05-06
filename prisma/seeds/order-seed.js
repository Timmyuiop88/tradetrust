import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const userId = '338830e9-84f6-4616-a797-31048dba4bec';
  const listingId = '65b33141-3ee0-4444-96bf-08b33f89120a';
  

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 