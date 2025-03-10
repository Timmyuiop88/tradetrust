import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export function useChat(orderId, userId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const [otherUserStatus, setOtherUserStatus] = useState({ online: false, lastSeen: null });
  const [otherUserId, setOtherUserId] = useState(userId || null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWebSocketAvailable, setIsWebSocketAvailable] = useState(false);

  // WebSocket functionality is temporarily disabled
  // const socket = useRef(null);

  // Function to format last seen time
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'a while ago';
    
    const lastSeen = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    
    return lastSeen.toLocaleDateString();
  };

  // Function to mark messages as read
  const markMessagesAsRead = useCallback(async () => {
    if (!session || !orderId || !messages.length) return;
    
    try {
      // Find unread messages from the other user
      // Since we don't have an isRead field, we'll check if the message content contains [READ]
      const unreadMessages = messages.filter(msg => 
        msg.senderId !== session.user.id && !msg.content.includes("[READ]")
      );
      
      if (unreadMessages.length === 0) return;
      
      console.log("Marking messages as read:", unreadMessages.map(m => m.id));
      
      // Call API to mark messages as read
      const response = await fetch('/api/chat/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          messageIds: unreadMessages.map(msg => msg.id),
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to mark messages as read:', response.status);
        return;
      }
      
      const result = await response.json();
      console.log("Mark as read response:", result);
      
      if (result.messages && result.messages.length > 0) {
        // Update local message state with the updated messages from the server
        setMessages(prevMessages => 
          prevMessages.map(msg => {
            const updatedMsg = result.messages.find(m => m.id === msg.id);
            return updatedMsg || msg;
          })
        );
      }
      
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [session, orderId, messages]);

  // Function to fetch messages
  const fetchMessages = useCallback(async () => {
    if (!session || (!orderId && !otherUserId)) return;

    try {
      setLoading(true);
      
      // Determine which API endpoint to use
      const apiUrl = orderId ? `/api/chat/${orderId}` : `/api/chat/user/${otherUserId}`;
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
      
      if (data.otherUser) {
        setOtherUserId(data.otherUser.id);
        const lastActive = new Date(data.otherUser.lastSeen || 0);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        setOtherUserStatus({
          online: lastActive > fiveMinutesAgo,
          lastSeen: data.otherUser.lastSeen
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session, orderId, otherUserId]);

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
    }
    
    // WebSocket connection is temporarily disabled
    /*
    // Initialize WebSocket connection
    if (session && orderId && typeof window !== 'undefined') {
      try {
        // Close any existing connection
        if (socket.current && socket.current.readyState !== WebSocket.CLOSED) {
          socket.current.close();
        }
        
        // Create new WebSocket connection
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/ws?orderId=${orderId}&userId=${session.user.id}`;
        
        socket.current = new WebSocket(wsUrl);
        
        socket.current.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setIsWebSocketAvailable(true);
        };
        
        socket.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === 'message') {
            // Add new message to state
            setMessages(prev => [...prev, data.message]);
          } else if (data.type === 'status') {
            // Update user status
            setOtherUserStatus(data.status);
          }
        };
        
        socket.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
          setError('WebSocket connection error. Using manual refresh instead.');
        };
        
        socket.current.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
        };
        
        // Ping to keep connection alive
        const pingInterval = setInterval(() => {
          if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
        
        return () => {
          clearInterval(pingInterval);
          if (socket.current) {
            socket.current.close();
          }
        };
      } catch (err) {
        console.error('Error setting up WebSocket:', err);
        setIsWebSocketAvailable(false);
        setError('WebSocket not available. Using manual refresh instead.');
      }
    }
    */
  }, [session, orderId, fetchMessages]);
  
  // Mark messages as read when viewing the chat
  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages, markMessagesAsRead]);

  // Function to update user's last seen status
  const updateLastSeen = async () => {
    if (!session || !orderId) return;
    
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

  // Function to send a message
  const sendMessage = async ({ recipientId, content, orderId: specificOrderId }) => {
    if (!session || (!orderId && !recipientId) || !content) return false;
    
    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: specificOrderId || orderId,
          recipientId: recipientId || otherUserId,
          content,
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
    messages,
    loading,
    error,
    sendMessage,
    isConnected: false, // Always false since WebSocket is disabled
    isWebSocketAvailable: false, // Always false since WebSocket is disabled
    refreshMessages,
    otherUserStatus,
    otherUserId,
    formatLastSeen,
    markMessagesAsRead,
  };
} 