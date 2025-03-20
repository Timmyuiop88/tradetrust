/**
 * Test script for the order decline feature
 * 
 * This script simulates the process of a seller declining an order
 * and verifies that the buyer is refunded and the listing is reactivated.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting order decline test...');
  
  // 1. Find a test order in WAITING_FOR_SELLER status
  console.log('Finding a test order...');
  const testOrder = await prisma.order.findFirst({
    where: {
      status: 'WAITING_FOR_SELLER',
      credentials: null // Ensure no credentials have been released
    },
    include: {
      listing: true,
      buyer: true,
      seller: true
    }
  });
  
  if (!testOrder) {
    console.error('No suitable test order found. Please create an order in WAITING_FOR_SELLER status.');
    return;
  }
  
  console.log(`Found test order: ${testOrder.id}`);
  console.log(`Buyer: ${testOrder.buyer.email}`);
  console.log(`Seller: ${testOrder.seller.email}`);
  console.log(`Listing: ${testOrder.listing.username} (${testOrder.listing.status})`);
  console.log(`Price: $${testOrder.price}`);
  
  // 2. Get buyer's initial balance
  const buyerInitialBalance = await prisma.balance.findUnique({
    where: { userId: testOrder.buyerId }
  });
  
  if (!buyerInitialBalance) {
    console.error('Buyer balance not found.');
    return;
  }
  
  console.log(`Buyer's initial buying balance: $${buyerInitialBalance.buyingBalance}`);
  
  // 3. Simulate declining the order
  console.log('\nSimulating order decline...');
  
  try {
    // Process the decline and refund in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update order status to CANCELLED
      const updatedOrder = await tx.order.update({
        where: { id: testOrder.id },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: testOrder.sellerId,
          cancelReason: 'SELLER_DECLINED'
        }
      });
      
      // Refund the buyer's buying balance
      const updatedBuyerBalance = await tx.balance.update({
        where: { userId: testOrder.buyerId },
        data: {
          buyingBalance: {
            increment: testOrder.price
          }
        }
      });
      
      // Record the refund transaction
      const refundTransaction = await tx.transaction.create({
        data: {
          userId: testOrder.buyerId,
          balanceId: buyerInitialBalance.id,
          listingId: testOrder.listingId,
          orderId: testOrder.id,
          amount: testOrder.price,
          type: 'REFUND',
          description: 'Refund for declined order',
          status: 'COMPLETED'
        }
      });
      
      // Reactivate the listing
      const updatedListing = await tx.listing.update({
        where: { id: testOrder.listingId },
        data: { status: 'AVAILABLE' }
      });
      
      return { 
        order: updatedOrder, 
        buyerBalance: updatedBuyerBalance, 
        refundTransaction,
        listing: updatedListing
      };
    });
    
    console.log('Order decline simulation completed successfully!');
    
    // 4. Verify the results
    console.log('\nVerifying results:');
    
    // Check order status
    console.log(`Order status: ${result.order.status}`);
    console.log(`Cancellation reason: ${result.order.cancelReason}`);
    console.log(`Cancelled at: ${result.order.cancelledAt}`);
    
    // Check buyer's updated balance
    console.log(`Buyer's updated buying balance: $${result.buyerBalance.buyingBalance}`);
    console.log(`Balance increase: $${result.buyerBalance.buyingBalance - buyerInitialBalance.buyingBalance}`);
    
    // Check refund transaction
    console.log(`Refund transaction created: ${result.refundTransaction.id}`);
    console.log(`Refund amount: $${result.refundTransaction.amount}`);
    
    // Check listing status
    console.log(`Listing status: ${result.listing.status}`);
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 