import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export function useChat(orderId) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { data: session } = useSession();
    const [otherUserStatus, setOtherUserStatus] = useState({ online: false, lastSeen: null });
    const [otherUserId, setOtherUserId] = useState(null);
    
    // WebSocket functionality is temporarily disabled
    // const socket = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isWebSocketAvailable, setIsWebSocketAvailable] = useState(false);

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

    // Function to fetch messages
    const fetchMessages = useCallback(async () => {
        if (!session || !orderId) return;
        
        try {
            setLoading(true);
            console.log(`Fetching messages for order: ${orderId}`);
            
            // Check if the API endpoint exists
            const apiUrl = `/api/chat/${orderId}`;
            console.log(`API URL: ${apiUrl}`);
            
            // Add a cache-busting parameter to prevent browser caching
            const timestamp = new Date().getTime();
            const response = await fetch(`${apiUrl}?t=${timestamp}`);
            
            if (!response.ok) {
                console.error(`API error: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch messages: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Messages fetched successfully:', data);
            
            // Update messages - handle chatMessages instead of messages if needed
            const messageData = data.messages || [];
            setMessages(messageData);
            
            // Update other user status
            if (data.otherUser) {
                setOtherUserId(data.otherUser.id);
                
                // Simple approach for online status without WebSockets
                // Consider a user online if they've been active in the last 5 minutes
                // Use lastSeen from API (which is actually updatedAt)
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
            
            // Set empty messages to avoid showing old messages
            // setMessages([]);  // Commented out to prevent clearing messages on error
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
    const sendMessage = async (content) => {
        if (!session || !orderId || !content) return false;
        
        try {
            const response = await fetch('/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    content,
                }),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to send message: ${response.status}`);
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
    };
} 