import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { StreamChat } from "stream-chat";

// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(
  process.env.GETSTREAM_API_KEY,
  process.env.GETSTREAM_API_SECRET
);

export async function POST(request) {
  try {
    // Get the user session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - User not authenticated" },
        { status: 401 }
      );
    }
    
    const { orderId, sellerId, buyerId } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }
    
    if (!buyerId || !sellerId) {
      return NextResponse.json(
        { error: "Both buyer and seller IDs are required" },
        { status: 400 }
      );
    }
    
    // Ensure the user is either the buyer or seller
    const userId = session.user.id;
    if (userId !== buyerId && userId !== sellerId) {
      return NextResponse.json(
        { error: "Unauthorized - User is not a participant in this order" },
        { status: 403 }
      );
    }
    
    // Create a channel for this order
    const channelId = `order-${orderId}`;
    
    try {
      // First check if channel already exists
      const existingChannels = await serverClient.queryChannels({ 
        id: channelId, 
        type: 'messaging' 
      });
      
      let channel;
      
      // If channel exists, verify members include both buyer and seller
      if (existingChannels && existingChannels.length > 0) {
        channel = existingChannels[0];
        
        // Check if buyer and seller are members
        const members = await channel.queryMembers({});
        const memberIds = members.members.map(m => m.user_id);
        
        // Ensure both buyer and seller are members
        if (!memberIds.includes(buyerId) || !memberIds.includes(sellerId)) {
          // Update channel members to include both
          await channel.addMembers([buyerId, sellerId]);
        }
      } else {
        // Create new channel with both buyer and seller as members
        channel = serverClient.channel("messaging", channelId, {
          members: [buyerId, sellerId],
          created_by_id: "system",
          order_id: orderId,
          name: `Order #${orderId.substring(0, 8)}`,
        });
        
        // Save the channel
        await channel.create();
        
        // Add a system message
        await channel.sendMessage({
          text: "Order chat started. You can now communicate about this order.",
          user_id: "system",
          user: { id: "system", name: "System" },
        });
      }
      
      return NextResponse.json({
        status: "success",
        channelId,
        message: "Channel created or updated successfully"
      });
    } catch (channelError) {
      console.error("Channel error:", channelError);
      
      // Handle specific Stream errors
      if (channelError.code === 17) {
        return NextResponse.json(
          { error: "Permission denied: You don't have access to this channel" },
          { status: 403 }
        );
      }
      
      throw channelError;
    }
  } catch (error) {
    console.error("Error creating channel:", error);
    return NextResponse.json(
      { error: "Failed to create chat channel: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
} 