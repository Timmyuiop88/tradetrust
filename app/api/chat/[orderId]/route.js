import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { chatService } from '@/lib/services/chatService';

/**
 * GET /api/chat/[orderId]
 * Fetches messages for a specific order
 */
export async function GET(req, { params }) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get orderId from params directly
    const orderId = params.orderId;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    // Parse URL to get query parameters
    const url = new URL(req.url);
    const markAsRead = url.searchParams.get('markAsRead') !== 'false'; // Default to true
    
    try {
      // Use the chat service to get messages
      const result = await chatService.getOrderMessages({
        orderId,
        userId: session.user.id,
        markAsRead
      });
      
      // Add cache control headers for better performance
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=0, s-maxage=0, stale-while-revalidate=5'
        }
      });
    } catch (serviceError) {
      console.error('Chat service error:', serviceError);
      
      if (serviceError.message === 'Order not found') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      
      if (serviceError.message === 'Unauthorized access to order') {
        return NextResponse.json({ error: 'You do not have permission to view this order' }, { status: 403 });
      }
      
      throw serviceError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      message: error.message 
    }, { status: 500 });
  }
} 