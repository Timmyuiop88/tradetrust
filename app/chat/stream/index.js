import { StreamChat } from 'stream-chat';
import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Custom hook to use Stream Chat client with automatic token refreshing
 * @returns {Object} Stream Chat client instance and loading state
 */
export function useStreamChatClient() {
  const { data: session } = useSession();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token provider function that gets a fresh token
  const tokenProvider = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/stream/token');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get chat token');
      }
      
      const data = await response.json();
      return data.token;
    } catch (err) {
      console.error('Error in token provider:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    let streamClient;

    const initClient = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        // Fetch API key and initial token
        const response = await fetch('/api/chat/stream/token');
        
        if (!response.ok) {
          throw new Error('Failed to get chat token');
        }
        
        const { apiKey } = await response.json();
        
        // Initialize client
        streamClient = StreamChat.getInstance(apiKey);
        
        // Connect user with token provider
        await streamClient.connectUser(
          {
            id: session.user.id,
            name: session.user.name || session.user.email,
            image: session.user.image,
          },
          tokenProvider // Pass the token provider function for automatic token refresh
        );

        setClient(streamClient);
        setError(null);
      } catch (err) {
        console.error('Error initializing Stream chat client:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initClient();

    // Cleanup function
    return () => {
      if (streamClient) {
        streamClient.disconnectUser().catch(error => {
          console.error('Error disconnecting Stream user:', error);
        });
      }
    };
  }, [session, tokenProvider]);

  return { client, loading, error };
}

/**
 * Custom hook to use a Stream Chat channel
 * @param {Object} client - Stream Chat client instance
 * @param {string} channelId - Channel ID
 * @param {Object} options - Additional channel options
 * @returns {Object} Channel instance and loading state
 */
export function useStreamChannel(client, channelId, options = {}) {
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!client || !channelId) return;

    const initChannel = async () => {
      try {
        setLoading(true);
        
        // Get or create channel
        const channelInstance = client.channel('messaging', channelId, {
          ...options,
        });
        
        // Watch channel for updates
        await channelInstance.watch();
        
        setChannel(channelInstance);
        setError(null);
      } catch (err) {
        console.error('Error initializing Stream channel:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initChannel();
    
    // Return cleanup function
    return () => {
      // No need to explicitly stop watching the channel
      // as it's handled automatically when the client disconnects
    };
  }, [client, channelId, options]);

  return { channel, loading, error };
}

/**
 * Helper function to format a Stream Chat message
 * @param {Object} message - Stream Chat message object
 * @returns {Object} Formatted message object
 */
export function formatStreamChatMessage(message) {
  return {
    id: message.id,
    text: message.text,
    createdAt: new Date(message.created_at),
    sender: {
      id: message.user.id,
      name: message.user.name,
      image: message.user.image,
    },
    attachments: message.attachments || [],
    status: message.status,
  };
}

/**
 * Creates a system message in a channel
 * @param {Object} channel - Stream Chat channel instance
 * @param {string} text - Message text
 */
export async function sendSystemMessage(channel, text) {
  if (!channel) return;
  
  try {
    await channel.sendMessage({
      text,
      user_id: 'system',
      user: { id: 'system', name: 'System' },
    });
  } catch (error) {
    console.error('Error sending system message:', error);
  }
}

export default {
  useStreamChatClient,
  useStreamChannel,
  formatStreamChatMessage,
  sendSystemMessage,
}; 