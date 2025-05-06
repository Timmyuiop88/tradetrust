import { useState, useEffect, useRef } from 'react';
import { StreamChat } from 'stream-chat';
import { useSession } from 'next-auth/react';

// Global client instance for caching
let globalClient = null;

export function useStreamChat(orderId) {
  const { data: session, status } = useSession();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const clientRef = useRef(null);
  
  useEffect(() => {
    // Don't initialize until session is loaded and we have orderId
    if (!orderId || status === 'loading') {
      return;
    }
    
    // If no user session, set error and exit
    if (status === 'unauthenticated' || !session?.user?.id) {
      setError(new Error('User authentication required'));
      setLoading(false);
      return;
    }
    
    let isMounted = true;
    
    const initializeChat = async () => {
      try {
        setLoading(true);
        
        // Only create a new client if one doesn't exist
        if (!globalClient) {
          // Fetch token and user data
          const response = await fetch('/api/chat/stream/token');
          if (!response.ok) throw new Error('Failed to get token');
          
          const data = await response.json();
          
          // Validate API response
          if (!data.apiKey || !data.token) {
            throw new Error('Invalid API response: Missing required data');
          }
          
          // Ensure we have valid user data
          const userData = data.userData || {
            id: session.user.id,
            name: session.user.name || session.user.firstName + " " + session.user.lastName || "User",
            // image: "https://img.icons8.com/ios-glyphs/30/person-male.png"
          };
          
          // Initialize client once
          const client = new StreamChat(data.apiKey);
          
          // Connect user once with proper error handling
          await client.connectUser(userData, data.token);
          
          // Store in global variable and ref
          globalClient = client;
        }
        
        // Set client reference
        clientRef.current = globalClient;
        
        // Create/get channel for this order
        const channelId = `order_${orderId}`;
        const orderChannel = clientRef.current.channel('messaging', channelId);
        
        // Watch channel (don't create, just watch)
        await orderChannel.watch();
        
        if (isMounted) {
          setChannel(orderChannel);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };
    
    initializeChat();
    
    return () => {
      isMounted = false;
    };
  }, [orderId, session, status]);
  
  // Return client from ref to ensure stability
  return { 
    client: clientRef.current,
    channel,
    loading,
    error
  };
}
