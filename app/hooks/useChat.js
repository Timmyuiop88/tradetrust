import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useEdgeStore } from '@/app/lib/edgeStore';

export function useChat(options = {}) {
  const { orderId } = options;
  const [messages, setMessages] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const lastFetchTimeRef = useRef(0);
  const { edgestore } = useEdgeStore();

  // Function to fetch messages
  const fetchMessages = useCallback(async () => {
    if (!session || !orderId) return;

    // Rate limit: only fetch every 20 seconds
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 20000) {
      console.log('Skipping fetch - rate limited (20s)');
      return;
    }
    
    // Update the last fetch time
    lastFetchTimeRef.current = now;

    try {
      setLoading(true);
      
      // Use only the orderId for the API endpoint
      const apiUrl = `/api/chat/${orderId}`;
      console.log(`Fetching messages from: ${apiUrl}`);
      
      const timestamp = new Date().getTime();
      const response = await fetch(`${apiUrl}?t=${timestamp}`);
      
      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Messages fetched successfully:', data);
      
      setMessages(data.messages || []);
      setOrder(data.order || null);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session, orderId]);

  // Function to refresh messages (exposed to component)
  const refreshMessages = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Initialize and fetch messages
  useEffect(() => {
    if (session && orderId) {
      fetchMessages();
      
      // Update user's last seen status when they view the chat
      updateLastSeen();
      
      // Set up a polling interval with a 20-second delay
      const pollingInterval = setInterval(() => {
        fetchMessages();
      }, 5000); // 5 seconds
      
      // Clean up the interval when the component unmounts
      return () => clearInterval(pollingInterval);
    }
  }, [session, orderId, fetchMessages]);

  // Function to update user's last seen status
  const updateLastSeen = async () => {
    if (!session) return;
    
    try {
      await fetch('/api/users/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastSeen: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Error updating last seen status:', err);
    }
  };

  // Function to upload image to EdgeStore
  const uploadImage = async (file) => {
    if (!file || !edgestore) {
      console.error('No file or EdgeStore not available');
      return null;
    }
    
    try {
      console.log('Uploading image to EdgeStore...');
      
      // Upload the file to EdgeStore
      const res = await edgestore.publicFiles.upload({
        file,
        options: {
          temporary: false,
        },
      });
      
      console.log('Image uploaded successfully:', res);
      
      // Return the URL of the uploaded image
      return res.url;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error('Failed to upload image');
    }
  };

  // Function to send a message
  const sendMessage = async (messageData) => {
    if (!session || !orderId || !messageData.content) return false;
    
    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          content: messageData.content,
          isDisputeMessage: messageData.isDisputeMessage || false,
          disputeId: messageData.disputeId || null,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }
      
      // Update last seen status when sending a message
      updateLastSeen();
      
      // Refresh messages to get the new message
      await fetchMessages();
      
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
      return false;
    }
  };

  return {
    messages: {
      data: messages,
      isLoading: loading,
      error: error,
      refetch: refreshMessages,
    },
    order: order,
    sendMessage: {
      mutate: sendMessage,
      isLoading: false,
    },
    uploadImage,
  };
} 