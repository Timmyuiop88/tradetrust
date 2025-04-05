# GetStream Chat Implementation Documentation

## Message Routing and Delivery

This documentation explains how message delivery and user targeting works in our GetStream chat implementation.

## How Receivers Are Determined

In our GetStream implementation, message delivery is based on the concept of **channels**, which act as containers for messages and participants.

### Channel Creation Process

1. **Order-Based Channels**: 
   - Each channel is tied to a specific order (`order-${orderId}`)
   - Created automatically when an order is first placed
   - Channel ID format: `order-[orderId]`

2. **Member Management**:
   - Members are explicitly added to a channel during initialization
   - For order chats, only two members are added: the buyer and seller
   - This is handled in `app/api/chat/stream/channel/route.js` during channel creation

```javascript
// Channel creation with explicit member specification 
const channel = serverClient.channel("messaging", channelId, {
  members: [buyerId, sellerId], // Only these users can access the channel
  created_by_id: userId,
  order_id: orderId,
});
```

3. **Permissions Model**:
   - GetStream provides a role-based permission system
   - Members of a channel can only see messages within that channel
   - Each message is tied to its channel and only delivered to channel members

### Message Security Flow

1. **Authentication**: 
   - Users are authenticated using JWT tokens with expiration
   - Tokens are generated server-side and verified by GetStream
   - User identity is confirmed before allowing channel access

2. **Channel Watching**:
   - When a user opens a chat, they "watch" the channel
   - GetStream validates the user is a member of the channel
   - If not a member, a 403 error is returned

```javascript
// Our code catches permission errors when watching channels
try {
  await orderChannel.watch();
} catch (channelError) {
  if (channelError.code === 403) {
    throw new Error('You do not have permission to access this chat channel');
  }
  throw channelError;
}
```

3. **Message Routing**:
   - When a message is sent, it's routed only to members of the channel
   - Messages never leave the channel boundary
   - System can confirm delivery status to all channel members

## Channel Membership Verification

Our implementation adds several security layers:

1. **Backend Verification**:
   - Before creating a channel, our API verifies the user is a participant in the order
   - This prevents non-participants from creating channels for orders they don't own

```javascript
// Ensure the user is either the buyer or seller
const userId = session.user.id;
if (userId !== buyerId && userId !== sellerId) {
  return NextResponse.json(
    { error: "Unauthorized - User is not a participant in this order" },
    { status: 403 }
  );
}
```

2. **Frontend Verification**:
   - UI shows user avatars and names to clearly identify participants
   - Info modal explains the private nature of the conversation
   - Channel membership is logged to console for debugging

3. **Real-time Status**:
   - Message status indicators show when a message is delivered to the other party

## Message Persistence and Privacy

- Messages are stored in GetStream's secure infrastructure
- End-to-end timestamps track delivery status
- Chat history persists between sessions
- Both parties can access past conversations related to their orders

## Technical Implementation

Our custom implementation in `app/chat/stream/[orderId]/page.jsx` ensures:

1. **Secure initialization**:
   - Channel is tied to order ID
   - User must be authenticated with a valid token
   - Server verifies order access rights

2. **UI context**:
   - Messages are clearly marked by sender
   - User avatars provide visual identification
   - Mobile-responsive design works on all devices

3. **Member identification**:
   - The system logs channel members during initialization
   - UI shows the current participants in the chat
   - Each message shows the sender's information

## Testing Message Delivery

To verify message delivery is working correctly:

1. Log in as a buyer and navigate to an order chat
2. Send a message and observe the status indicators
3. Log in as the seller in another browser and verify message receipt
4. Verify that other users cannot access this chat channel

This implementation ensures that messages are always delivered to the correct recipients, maintaining the privacy and security of order-related communications. 