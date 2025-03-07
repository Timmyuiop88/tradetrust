import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const useChat = (orderId) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWebSocketAvailable, setIsWebSocketAvailable] = useState(false);
  const [otherUserStatus, setOtherUserStatus] = useState({ online: false, lastSeen: null });
  const [otherUserId, setOtherUserId] = useState(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!session?.user?.id || !orderId) return;

    const userId = session.user.id;
    
    // Try to establish WebSocket connection
    const socketInstance = io(SOCKET_URL, {
      reconnectionAttempts: 3,
      timeout: 10000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('WebSocket connected for real-time updates');
      setIsWebSocketAvailable(true);
      setIsConnected(true);
      
      // Authenticate the socket connection
      socketInstance.emit('authenticate', { userId });
      
      // Join a room for this specific order to receive updates
      socketInstance.emit('joinRoom', { orderId });
    });

    socketInstance.on('authenticated', (data) => {
      console.log('Socket authenticated:', data);
      
      // If we know the other user's ID, request their status
      if (otherUserId) {
        socketInstance.emit('getUserStatus', { userIds: [otherUserId] });
      }
    });

    socketInstance.on('messageReceived', (message) => {
      console.log('Real-time message update received:', message);
      
      setMessages((prevMessages) => {
        // Check if message already exists to prevent duplicates
        const exists = prevMessages.some(m => m.id === message.id);
        if (exists) return prevMessages;
        
        return [...prevMessages, message];
      });
    });
    
    // Handle user status updates
    socketInstance.on('userStatusUpdate', (statusData) => {
      console.log('User status update received:', statusData);
      
      if (otherUserId && statusData[otherUserId]) {
        setOtherUserStatus(statusData[otherUserId]);
      }
    });
    
    // Handle individual user status changes
    socketInstance.on('userStatusChange', (data) => {
      console.log('User status change:', data);
      
      if (data.userId === otherUserId) {
        setOtherUserStatus(data.status);
      }
    });

    socketInstance.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message);
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setIsWebSocketAvailable(false);
      setIsConnected(false);
      setError(`WebSocket connection error: ${err.message}`);
      // We'll fall back to REST API
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [session, orderId, otherUserId]);

  // Fetch messages via REST API (initial load or fallback)
  const fetchMessages = useCallback(async () => {
    if (!session?.user?.id || !orderId) {
      console.log('Missing session or orderId:', { 
        sessionExists: !!session, 
        userExists: !!session?.user, 
        userId: session?.user?.id, 
        orderId 
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching messages for order:', orderId);
      
      const response = await axios.get(`/api/chat?orderId=${orderId}`);
      
      // Log the entire response
      console.log('Chat API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      
      // Extract the other user's ID from the order data
      if (response.data.order) {
        const currentUserId = session.user.id;
        const { buyerId, sellerId } = response.data.order;
        
        // Set the other user's ID based on whether the current user is the buyer or seller
        const otherId = currentUserId === buyerId ? sellerId : buyerId;
        setOtherUserId(otherId);
        
        // Request the other user's status if socket is connected
        if (socket && isConnected && otherId) {
          socket.emit('getUserStatus', { userIds: [otherId] });
        }
      }
      
      // Log each message with detailed information
      console.log('Messages array length:', response.data.messages?.length || 0);
      
      if (response.data.messages && response.data.messages.length > 0) {
        console.log('First message sample:', response.data.messages[0]);
        
        // Log all messages with their structure
        console.log('All messages detailed structure:');
        response.data.messages.forEach((msg, index) => {
          console.log(`Message ${index + 1}:`, {
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            sender: msg.sender,
            senderId: msg.senderId,
            hasValidSender: !!msg.sender,
            senderIdFromObject: msg.sender?.id,
            senderEmail: msg.sender?.email
          });
        });
      } else {
        console.log('No messages received in response');
      }
      
      setMessages(response.data.messages || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [session, orderId, socket, isConnected]);

  // Initial fetch of messages
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Send a message function
  const sendMessage = useCallback(async (content, receiverId) => {
    if (!session?.user?.id || !orderId || !content) {
      setError('Missing required information to send message');
      return false;
    }

    try {
      // Always use REST API for sending messages
      const response = await axios.post('/api/chat', {
        orderId,
        content,
        receiverId: receiverId || otherUserId, // Use the stored otherUserId if receiverId is not provided
      });
      
      // Add the new message to the state
      setMessages((prevMessages) => [...prevMessages, response.data.message]);
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.error || 'Failed to send message');
      return false;
    }
  }, [session, orderId, otherUserId]);

  // Format the last seen time in a human-readable format
  const formatLastSeen = useCallback((lastSeenDate) => {
    if (!lastSeenDate) return 'Never';
    
    const date = new Date(lastSeenDate);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return date.toLocaleString();
    }
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    isConnected,
    isWebSocketAvailable,
    refreshMessages: fetchMessages,
    otherUserStatus,
    otherUserId,
    formatLastSeen,
  };
}; 