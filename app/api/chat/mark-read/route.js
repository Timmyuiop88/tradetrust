import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { chatService } from '@/lib/services/chatService';

/**
 * POST /api/chat/mark-read
 * Marks messages as read for a specific order
 * Body:
 * - orderId: string - The ID of the order
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { orderId } = body;
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    try {
      // Use the chat service to mark messages as read
      const count = await chatService.markMessagesAsRead({
        userId: session.user.id,
        orderId
      });
      
      return NextResponse.json({ 
        success: true, 
        count 
      });
    } catch (serviceError) {
      console.error('Chat service error:', serviceError);
      return NextResponse.json({ 
        error: 'Failed to mark messages as read', 
        message: serviceError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ 
      error: 'Failed to mark messages as read', 
      message: error.message 
    }, { status: 500 });
  }
} 