import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { StreamChat } from "stream-chat";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(
  process.env.GETSTREAM_API_KEY,
  process.env.GETSTREAM_API_SECRET
);

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Use internal API call instead of fetch for order verification
    const prisma = new PrismaClient();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
  
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify user is buyer or seller
    if (session.user.id !== order.buyerId && session.user.id !== order.sellerId) {
      return NextResponse.json(
        { error: "You don't have permission to access this chat" },
        { status: 403 }
      );
    }

    const channelId = `order-${orderId}`;
    
    try {
      // Check if channel exists
      const existingChannels = await serverClient.queryChannels({ 
        id: channelId,
        type: 'messaging' 
      });

      let channel;
      
      if (existingChannels?.length > 0) {
        channel = existingChannels[0];
        
        // Ensure both users are members
        await channel.addMembers([
          { user_id: order.buyerId },
          { user_id: order.sellerId }
        ]);
      } else {
        // Create new channel with proper permissions
        channel = serverClient.channel('messaging', channelId, {
          members: [order.buyerId, order.sellerId],
          created_by_id: 'system',
          order_id: orderId,
          name: `Order #${order.orderNumber || orderId.substring(0, 8)}`,
          // Add custom data
          data: {
            order_type: order.type,
            created_at: new Date().toISOString(),
          }
        });
        
        await channel.create();
        
        // Add welcome message
        await channel.sendMessage({
          text: "A secure chat session has commenced for this order. You can now communicate privately. The seller is obligated to provide all secure information via the credentials options for secure escrow coverage.",
          
          user: { id: 'system', name: 'System' },
        });
      }

      return NextResponse.json({
        status: "success",
        channelId,
        members: [order.buyerId, order.sellerId]
      });
    } catch (streamError) {
      console.error("Stream error:", streamError);
      return NextResponse.json(
        { error: "Failed to initialize chat channel" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in channel creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 