import { StreamChat } from "stream-chat";

// Initialize Stream Chat server client
const getServerClient = () => {
  return StreamChat.getInstance(
    process.env.GETSTREAM_API_KEY,
    process.env.GETSTREAM_API_SECRET
  );
};

/**
 * Creates a chat channel for a new order
 * @param {Object} order - The order object
 * @param {string} order.id - Order ID
 * @param {string} order.sellerId - Seller ID
 * @param {string} order.buyerId - Buyer ID
 * @param {string} [order.orderNumber] - Order number for display
 */
export async function createOrderChatChannel(order) {
  try {
    if (!process.env.GETSTREAM_API_KEY || !process.env.GETSTREAM_API_SECRET) {
      console.warn('Stream Chat credentials not configured - skipping channel creation');
      return false;
    }
    
    if (!order || !order.id || !order.sellerId || !order.buyerId) {
      console.error("Missing required order information for chat channel creation");
      return false;
    }
    
    const serverClient = getServerClient();
    const channelId = `order-${order.id}`;
    
    // Check if the channel already exists
    const existingChannels = await serverClient.queryChannels({ 
      id: channelId, 
      type: 'messaging' 
    });
    
    if (existingChannels && existingChannels.length > 0) {
      console.log(`Channel already exists for order: ${order.id} - ensuring members are updated`);
      
      const channel = existingChannels[0];
      
      // Check if both participants are already members
      const members = await channel.queryMembers({});
      const memberIds = members.members.map(m => m.user_id);
      
      // If both are already members, no need to update
      if (memberIds.includes(order.buyerId) && memberIds.includes(order.sellerId)) {
        return true;
      }
      
      // Update members to include both buyer and seller
      await channel.addMembers([order.buyerId, order.sellerId]);
      console.log(`Updated members for existing channel: ${channelId}`);
      return true;
    }
    
    // Create a new channel for this order
    const channel = serverClient.channel("messaging", channelId, {
      members: [order.buyerId, order.sellerId],
      created_by_id: "system",
      order_id: order.id,
      name: `Order #${order.orderNumber || order.id.substring(0, 8)}`,
      // Add metadata for better organization
      metadata: {
        orderNumber: order.orderNumber,
        orderType: order.type,
        createdAt: new Date().toISOString()
      }
    });
    
    // Save the channel
    await channel.create();
    
    // Add a welcome message
    await channel.sendMessage({
      text: "Order chat started. You can now communicate securely about this order.",
      user_id: "system",
      user: { id: "system", name: "System" },
    });
    
    console.log(`Chat channel created for order: ${order.id}`);
    return true;
  } catch (error) {
    console.error("Error creating chat channel for order:", error);
    return false;
  }
} 