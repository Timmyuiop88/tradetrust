import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

export async function POST(req) {
  try {
    console.log('Received order creation request');
    
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('Unauthorized: No valid session');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('User authenticated:', session.user.id);
    
    // Get request body
    const body = await req.json();
    const { listingId } = body;
    
    console.log('Request body:', { listingId });
    
    if (!listingId) {
      console.log('Missing listingId in request');
      return new NextResponse(
        JSON.stringify({ error: 'Listing ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the listing
    console.log('Fetching listing:', listingId);
    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
    });
    
    if (!listing) {
      console.log('Listing not found:', listingId);
      return new NextResponse(
        JSON.stringify({ error: 'Listing not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Found listing:', listing.id, 'Seller:', listing.sellerId);
    
    // Check if the current user is not the seller
    if (listing.sellerId === session.user.id) {
      console.log('User is the seller, cannot create order for own listing');
      return new NextResponse(
        JSON.stringify({ error: 'You cannot create an order for your own listing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Prepare order data
    const orderData = {
      buyerId: session.user.id,
      sellerId: listing.sellerId,
      listingId: listingId,
      status: 'PENDING',
      price: listing.price,
      escrowAmount: listing.price * 0.1,
      escrowReleased: false,
      isNegotiated: false,
    };
    
    console.log('Creating order with data:', orderData);
    
    // Create the order
    const order = await prisma.order.create({
      data: orderData,
    });
    
    console.log('Order created successfully:', order.id);
    
    // Create an initial message from the buyer
    console.log('Creating initial message');
    await prisma.chatMessage.create({
      data: {
        orderId: order.id,
        senderId: session.user.id,
        content: "Hi, I'm interested in this listing. Can we discuss the details?",
      },
    });
    
    console.log('Initial message created');
    
    return new NextResponse(
      JSON.stringify({ 
        success: true,
        orderId: order.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Check for Prisma-specific errors
    if (error.code) {
      console.error('Prisma error code:', error.code);
      console.error('Prisma error meta:', error.meta);
    }
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create order: ' + error.message,
        details: error.code ? `Prisma error: ${error.code}` : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 