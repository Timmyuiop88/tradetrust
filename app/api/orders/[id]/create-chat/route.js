import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {prisma} from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    // Get authenticated session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Get order details directly from Prisma
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true, // User model
        listing: {
          select: {
            id: true,
            price: true,
            description: true,
            platform: true,
            seller: true,
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Security check - only allow participants to create chat
    const currentUserId = session.user.id;
    const buyerId = order.buyerId;
    const sellerId = order.sellerId || order.listing?.seller?.id;
    
    if (currentUserId !== buyerId && currentUserId !== sellerId) {
      return NextResponse.json({ error: 'You do not have permission to create this chat' }, { status: 403 });
    }
    
    if (!buyerId || !sellerId) {
      return NextResponse.json({ error: 'Order is missing buyer or seller information' }, { status: 400 });
    }
    
    // Get buyer and seller information with better error handling
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });
    
    if (!buyer) {
      return NextResponse.json({ error: `Buyer with ID ${buyerId} not found` }, { status: 400 });
    }
    
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });
    
    if (!seller) {
      return NextResponse.json({ error: `Seller with ID ${sellerId} not found` }, { status: 400 });
    }
    
    // Log the user data we're about to sync with TalkJS
    console.log('Syncing buyer data:', {
      id: buyerId,
      name: buyer.firstName && buyer.lastName 
          ? `${buyer.firstName} ${buyer.lastName}` 
          : buyer.email.split('@')[0],
      email: buyer.email
    });
    
    console.log('Syncing seller data:', {
      id: sellerId,
      name: seller.firstName && seller.lastName 
          ? `${seller.firstName} ${seller.lastName}` 
          : seller.email.split('@')[0],
      email: seller.email
    });
    
    // Step 1: Synchronize buyer user data with TalkJS - exactly as in the documentation
    const buyerResponse = await fetch(`https://api.talkjs.com/v1/${process.env.NEXT_PUBLIC_TALKJS_APP_ID}/users/${buyerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TALKJS_SECRET_KEY}`
      },
      body: JSON.stringify({
        name: buyer.firstName && buyer.lastName 
          ? `${buyer.firstName} ${buyer.lastName}` 
          : buyer.email.split('@')[0],
        email: [buyer.email], // Note: array of emails as per docs
        photoUrl: 'https://img.icons8.com/ios/50/name--v1.png',         // Optional but included for clarity
        role: 'buyer'         // Custom user role
      })
    });
    
    if (!buyerResponse.ok) {
      const buyerError = await buyerResponse.text();
      console.error('TalkJS error syncing buyer:', buyerError);
      // Continue anyway, but log the error
    }
    
    // Step 1: Synchronize seller user data with TalkJS - exactly as in the documentation
    const sellerResponse = await fetch(`https://api.talkjs.com/v1/${process.env.NEXT_PUBLIC_TALKJS_APP_ID}/users/${sellerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TALKJS_SECRET_KEY}`
      },
      body: JSON.stringify({
        name: seller.firstName && seller.lastName 
          ? `${seller.firstName} ${seller.lastName}` 
          : seller.email.split('@')[0],
        email: [seller.email], // Note: array of emails as per docs
        photoUrl: 'https://img.icons8.com/ios/50/name--v1.png',          // Optional but included for clarity
        role: 'seller'         // Custom user role
      })
    });
    
    if (!sellerResponse.ok) {
      const sellerError = await sellerResponse.text();
      console.error('TalkJS error syncing seller:', sellerError);
      // Continue anyway, but log the error
    }
    
    // Step 2: Create a conversation - FIXED to match documentation exactly
    const conversationId = `order_${orderId}`; // Using underscore instead of hyphen
    const talkJSResponse = await fetch(`https://api.talkjs.com/v1/${process.env.NEXT_PUBLIC_TALKJS_APP_ID}/conversations/${conversationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TALKJS_SECRET_KEY}`
      },
      body: JSON.stringify({
        participants: [buyerId, sellerId], // Just the IDs in an array
        subject: `Order #${orderId.substring(0, 8)}`,
        custom: { 
          // All values must be strings according to docs
          orderId: orderId,
          orderStatus: order.status,
          orderDate: order.createdAt.toISOString(),
          price: order.price.toString(),
          platform: order.listing?.platform?.name || '',
          type: "order_conversation"
        }
      })
    });
    
    if (!talkJSResponse.ok) {
      const talkJSError = await talkJSResponse.text();
      console.error('TalkJS error creating conversation:', talkJSError);
      return NextResponse.json({ 
        error: 'Failed to create TalkJS conversation', 
        details: talkJSError
      }, { status: 500 });
    }
    
    // Step 3: Send a welcome message - make sure this matches the docs exactly
    const messageResponse = await fetch(`https://api.talkjs.com/v1/${process.env.NEXT_PUBLIC_TALKJS_APP_ID}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TALKJS_SECRET_KEY}`
      },
      body: JSON.stringify([
        {
          text: `Welcome to the chat for Order #${orderId.substring(0, 8)}. You can use this chat to communicate about your order.`,
          type: "SystemMessage", // Ensure correct casing
          custom: {
            messageType: "welcome"
          }
        }
      ])
    });
    
    if (!messageResponse.ok) {
      const messageError = await messageResponse.text();
      console.error('TalkJS error sending welcome message:', messageError);
    }
    
    // Create a chat message in our system as well
    try {
      await prisma.chatMessage.create({
        data: {
          orderId: orderId,
          senderId: session.user.id, // System message but attributed to current user
          content: `Chat started for Order #${orderId.substring(0, 8)}`,
          recipientId: session.user.id === buyerId ? sellerId : buyerId,
        }
      });
    } catch (chatError) {
      console.error('Error creating initial chat message:', chatError);
      // Continue even if this fails
    }
    
    return NextResponse.json({ 
      success: true,
      conversationId,
      message: 'Chat conversation created successfully'
    });
    
  } catch (error) {
    console.error('Error creating TalkJS conversation:', error);
    return NextResponse.json({ 
      error: 'Failed to create chat conversation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Update GET method to use the same conversation ID format
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const orderId = params.id;
    const conversationId = `order_${orderId}`; // Updated to use underscore
    
    // Get order to verify permissions
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        buyerId: true,
        sellerId: true
      }
    });
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Security check
    const currentUserId = session.user.id;
    const buyerId = order.buyerId;
    const sellerId = order.sellerId;
    
    if (currentUserId !== buyerId && currentUserId !== sellerId) {
      return NextResponse.json({ error: 'You do not have permission to access this chat' }, { status: 403 });
    }
    
    // First check if we have any chat messages for this order in our DB
    const chatExists = await prisma.chatMessage.findFirst({
      where: { orderId: orderId },
      select: { id: true }
    });
    
    if (chatExists) {
      return NextResponse.json({ 
        exists: true,
        conversationId
      });
    }
    
    // If no local messages, check if the conversation exists in TalkJS
    const talkJSResponse = await fetch(`https://api.talkjs.com/v1/${process.env.NEXT_PUBLIC_TALKJS_APP_ID}/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TALKJS_SECRET_KEY}`
      }
    });
    
    // If 404, the conversation doesn't exist
    if (talkJSResponse.status === 404) {
      return NextResponse.json({ exists: false });
    }
    
    // If there's any other error
    if (!talkJSResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to check conversation status',
        status: talkJSResponse.status
      }, { status: 500 });
    }
    
    // Conversation exists in TalkJS but not in our database
    return NextResponse.json({ 
      exists: true,
      conversationId,
      note: 'Conversation exists in TalkJS but not in local database'
    });
    
  } catch (error) {
    console.error('Error checking TalkJS conversation:', error);
    return NextResponse.json({ error: 'Failed to check conversation status' }, { status: 500 });
  }
}
