import { StreamChat } from "stream-chat";

// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(
  process.env.GETSTREAM_API_KEY,
  process.env.GETSTREAM_API_SECRET
);

/**
 * Creates a chat channel for a new order
 * @param {Object} order - The order object
 * @param {string} order.id - Order ID
 * @param {string} order.sellerId - Seller ID
 * @param {string} order.buyerId - Buyer ID
 */
export async function createOrderChatChannel(order) {
  try {
    if (!order || !order.id || !order.sellerId || !order.buyerId) {
      console.error("Missing required order information for chat channel creation");
      return;
    }
    
    // Create a channel for this order
    const channelId = `order-${order.id}`;
    const channel = serverClient.channel("messaging", channelId, {
      members: [order.buyerId, order.sellerId],
      created_by_id: "system",
      order_id: order.id,
      name: `Order #${order.orderNumber || order.id.substring(0, 8)}`,
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