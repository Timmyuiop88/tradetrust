# GetStream.io Chat Implementation

This directory contains a complete implementation of the TradeTrust chat functionality using GetStream.io's Chat API.

## Features

- Real-time messaging for order-related communications
- Image attachments support
- Message status indicators (sent, read)
- Secure authentication using Stream tokens with expiration
- Token provider pattern for automatic token refreshing
- Automatic channel creation when orders are placed

## Required Environment Variables

Add these variables to your `.env` file:

```
GETSTREAM_API_KEY=your_stream_api_key
GETSTREAM_API_SECRET=your_stream_api_secret
```

## Implementation Structure

- `[orderId]/page.jsx` - Chat UI for a specific order
- `index.js` - Custom hooks and utility functions for Stream Chat
- API Endpoints:
  - `/api/chat/stream/token` - Generates user tokens for Stream Chat with 24-hour expiration
  - `/api/chat/stream/channel` - Creates or fetches a chat channel

## Security Considerations

This implementation includes:
- Server-side token generation with 24-hour expiration
- Token provider pattern for automatic refreshing of expired tokens
- User authentication verification before channel access
- Limiting channel access to only order participants (buyer and seller)
- Proper cleanup of chat connections

## Token Provider Pattern

This implementation uses the token provider pattern as recommended in the GetStream.io documentation:

1. Instead of using a static token, we pass a token provider function to the Stream client
2. If a token expires during a session, the client will automatically request a new token
3. The token provider returns a fresh token from our API
4. This ensures uninterrupted chat experience even with token expiration

## How to Use

1. When an order is created, a chat channel is automatically created
2. Users can access the chat by navigating to `/chat/stream/[orderId]`
3. Messages are sent in real-time and include read receipts
4. The chat allows attachment of images
5. Tokens automatically refresh when they expire

## GetStream SDK

This implementation uses the official GetStream SDKs:
- `stream-chat` - Server-side operations
- `stream-chat-react` - Client-side components and hooks 