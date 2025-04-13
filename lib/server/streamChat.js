import { StreamChat } from 'stream-chat';

let serverClient = null;

export function getStreamClient() {
  if (!serverClient) {
    serverClient = new StreamChat(
      process.env.GETSTREAM_API_KEY,
      process.env.GETSTREAM_API_SECRET
    );
  }
  return serverClient;
}

export async function createOrderChannel(order, buyer, seller) {
  const client = getStreamClient();
  console.log({buyer, seller})
  try {
    // First, upsert the users to make sure they exist in Stream
    // This will create the users if they don't exist or update them if they do
    await client.upsertUsers([
      {
        id: buyer.id,
        name: 'Buyer',
        role: 'user',
      },
      {
        id: seller.id,
        name: 'Seller',
        role: 'user',
      },
      {
        id: 'system',
        name: 'System',
        role: 'admin',
      }
    ]);
    
    // Create a channel for this order
    const channelId = `order_${order.id}`;
    const channel = client.channel('messaging', channelId, {
      name: `Order #${order.id.substring(0, 8)}`,
      order_id: order.id,
      created_at: new Date().toISOString(),
      members: [buyer.id, seller.id],
      created_by_id: 'system' // Use created_by_id instead of created_by object
    });
    
    // Save the channel
    await channel.create();
    
    // Send initial system message
    await channel.sendMessage({
      text: `Order #${order.id.substring(0, 8)} has been created. You can use this chat to communicate about the order.`,
      user: {
        id: 'system',
        name: 'System'
      }
    });
    
    return channel;
  } catch (error) {
    console.error('Error creating Stream channel:', error);
    
    // If the error is related to deleted users, we can try to create the channel without them
    if (error.message.includes('deleted user')) {
      console.log('Attempting to create channel without deleted users');
      
      // Create a fallback channel with just the system user
      const channelId = `order_${order.id}`;
      const channel = client.channel('messaging', channelId, {
        name: `Order #${order.id.substring(0, 8)}`,
        order_id: order.id,
        created_at: new Date().toISOString(),
        created_by_id: 'system'
      });
      
      await channel.create();
      
      // Send a warning message about the issue
      await channel.sendMessage({
        text: `Order #${order.id.substring(0, 8)} has been created, but there was an issue with user accounts. Please contact support if you're unable to use the chat.`,
        user: {
          id: 'system',
          name: 'System'
        }
      });
      
      return channel;
    }
    
    // If it's not a deleted user error, rethrow
    throw error;
  }
}
