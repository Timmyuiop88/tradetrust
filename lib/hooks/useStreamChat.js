import { useState, useEffect, useCallback, useRef } from 'react';
import { StreamChat } from 'stream-chat';
import { useSession } from 'next-auth/react';

// Create a global cache for Stream chat clients
const clientCache = new Map();

export function useStreamChat(orderId) {
  const { data: session } = useSession();
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const clientInitializing = useRef(false);

  useEffect(() => {
    if (!session?.user?.id || !orderId || clientInitializing.current) return;

    clientInitializing.current = true;
    let chatClient;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get Stream credentials and initialize channel
        const response = await fetch('/api/chat/stream/token');
        if (!response.ok) {
          throw new Error('Failed to get chat credentials');
        }
        
        const { apiKey, token } = await response.json();
        
        // Initialize Stream client
        chatClient = StreamChat.getInstance(apiKey);
        
        // Connect user with proper data
        await chatClient.connectUser(
          {
            id: session.user.id,
            name: session.user.name || session.user.email,
            image: session.user.image,
            // Add privacy settings
            privacy_settings: {
              typing_indicators: { enabled: true },
              read_receipts: { enabled: true }
            }
          },
          token
        );

        // Initialize channel through our API
        const channelResponse = await fetch('/api/chat/stream/channel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });

        if (!channelResponse.ok) {
          const errorData = await channelResponse.json();
          throw new Error(errorData.error || 'Failed to initialize chat channel');
        }

        const { channelId } = await channelResponse.json();

        // Watch the channel
        const orderChannel = chatClient.channel('messaging', channelId);
        await orderChannel.watch();

        setClient(chatClient);
        setChannel(orderChannel);
      } catch (err) {
        console.error('Chat initialization error:', err);
        setError(err);
      } finally {
        setLoading(false);
        clientInitializing.current = false;
      }
    };

    initializeChat();

    return () => {
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [session, orderId]);

  // Reconnection handler for visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && channel) {
        channel.watch().catch(console.error);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [channel]);

  return {
    client,
    channel,
    loading,
    error
  };
}
