import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const userId = '338830e9-84f6-4616-a797-31048dba4bec';
  const listingId = '65b33141-3ee0-4444-96bf-08b33f89120a';
  
  try {
    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.error('User not found');
      return;
    }
    
    // Verify the listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { seller: true }
    });
    
    if (!listing) {
      console.error('Listing not found');
      return;
    }
    
    // Create test orders with different statuses
    const orderStatuses = ['PENDING', 'WAITING_FOR_SELLER', 'WAITING_FOR_BUYER', 'COMPLETED', 'DISPUTED'];
    
    for (const status of orderStatuses) {
      const order = await prisma.order.create({
        data: {
          listing: { connect: { id: listingId } },
          buyer: { connect: { id: userId } },
          sellerId: listing.sellerId,
          price: listing.price,
          status: status,
          escrowAmount: listing.price,
          escrowReleased: status === 'COMPLETED',
        }
      });
      
      console.log(`Created order with ID: ${order.id} and status: ${status}`);
      
      // Add some test messages for each order
      if (status !== 'PENDING') {
        // Buyer message
        await prisma.chatMessage.create({
          data: {
            order: { connect: { id: order.id } },
            sender: { connect: { id: userId } },
            content: `Hello, I'm interested in this ${listing.username} account. Can you provide more details?`
          }
        });
        
        // Seller message
        await prisma.chatMessage.create({
          data: {
            order: { connect: { id: order.id } },
            sender: { connect: { id: listing.sellerId } },
            content: `Hi there! Thanks for your interest. This account has ${listing.followers} followers and great engagement. What would you like to know?`
          }
        });
        
        // Another buyer message
        await prisma.chatMessage.create({
          data: {
            order: { connect: { id: order.id } },
            sender: { connect: { id: userId } },
            content: 'What is the account niche? And how long have you had it?'
          }
        });
        
        console.log(`Added test messages to order: ${order.id}`);
      }
    }
    
    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error seeding orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 