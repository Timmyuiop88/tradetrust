'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle, 
  User, 
  Check, 
  Clock, 
  MoreHorizontal,
  XCircle,
  Calendar,
  Eye,
  Info,
  RefreshCw,
  Paperclip,
  Smile,
  X
} from 'lucide-react';
import { StreamChat } from 'stream-chat';
import { 
  Chat, 
  Channel, 
  Window, 
  MessageList, 
  Thread,
  Avatar,
  ChannelHeader as DefaultChannelHeader,
  LoadingIndicator,
  useMessageInputContext
} from 'stream-chat-react';
import Link from 'next/link';
import { Button } from '@/app/components/button';
import { Badge } from '@/app/components/badge';
import { cn } from '@/app/lib/utils';
import { Skeleton } from '@/app/components/ui/skeleton';
import 'stream-chat-react/dist/css/v2/index.css';

// Create a global cache for Stream chat clients
const clientCache = new Map();

// Stream Chat styles
const streamStyles = `
  .str-chat {
    --str-chat__primary-color: #00BD3F;
    --str-chat__active-primary-color: #00A836;
    height: 100%;
    width: 100%;
    background: #0B0E11;
    color: white;
  }

  .str-chat__list {
    background: #0B0E11;
    padding: 12px;
    padding-top: 70px;
    padding-bottom: 80px;
  }

  .str-chat__message-list-scroll {
    padding-bottom: 80px !important;
  }

  .str-chat__message-simple {
    margin: 0.5rem 0;
  }

  .str-chat__message-simple__content {
    background: #1A1D21;
    border-radius: 16px;
    padding: 10px 14px;
    margin: 0;
    color: #E9ECEF;
    font-size: 0.9375rem;
    max-width: 80%;
  }
  
  .str-chat__message--me .str-chat__message-simple__content {
    background: #00BD3F;
    color: white;
  }

  .str-chat__message-simple__actions {
    display: none;
  }

  .str-chat__message-simple__timestamp {
    font-size: 0.75rem;
    color: #6B7280;
    margin-top: 4px;
  }

  .str-chat__message--me {
    justify-content: flex-end;
  }

  .str-chat__message--me .str-chat__message-simple__content {
    margin-left: auto;
  }

  .str-chat__input-flat-wrapper {
    display: none !important;
  }

  .str-chat__date-separator {
    margin: 1.5rem 0;
    text-align: center;
  }

  .str-chat__date-separator-date {
    background: #1A1D21;
    color: #6B7280;
    font-size: 0.75rem;
    padding: 4px 12px;
    border-radius: 12px;
  }
`;

// Loading spinner for various states
const Spinner = ({ size = "medium" }) => {
  const sizeClass = size === "small" ? "h-4 w-4" : size === "large" ? "h-8 w-8" : "h-6 w-6";
  return <Loader2 className={`${sizeClass} animate-spin text-primary`} />;
};

// Loading view for the chat
const LoadingView = () => (
  <div className="flex flex-col h-screen items-center justify-center bg-white dark:bg-gray-900">
    <Spinner size="large" />
    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading chat...</p>
  </div>
);

// Custom message input component with better mobile support
const CustomMessageInput = ({ channel, keyboardVisible }) => {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!text.trim()) return;
    
    setIsSending(true);
    
    try {
      await channel.sendMessage({
        text: text.trim()
      });
      setText('');
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.blur();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
    
 
      setIsSending(false);
    }
  };

  return (
    <div 
      className={`message-input-container ${keyboardVisible ? 'keyboard-visible' : ''}`}
      style={{
        '--keyboard-height': keyboardVisible ? '320px' : '0px',
      }}
    >
      <form onSubmit={handleSubmit}>
        <div className="message-input-wrapper">
          <textarea
            id="chatInput"
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (text.trim()) {
                  handleSubmit(e);
                }
              }
            }}
          />
          <button
            type="submit"
            disabled={!text.trim() || isSending}
            className="send-button"
            aria-label="Send message"
          >
            {isSending ? <Spinner size="small" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper styles for keyboard visibility - using Twitter-like approach
const keyboardFixStyles = `
  .chat-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #0B0E11;
    position: relative;
  }

  .message-list-container {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 80px;
  }

  .message-input-container {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #0B0E11;
    border-top: 1px solid #1A1D21;
    padding: 8px 12px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    z-index: 1000;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
  }

  @supports (-webkit-touch-callout: none) {
    .message-input-container {

      position: fixed !important;
      bottom: 0 !important;
      padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px) + var(--keyboard-height, 0px));
    }

    .keyboard-visible .message-input-container {
      // background: red;
      padding-bottom: 10px !important;
      bottom: 0 !important;
      position: fixed !important;
    }
  }

  .message-input-wrapper {
    background: #1A1D21;
    border-radius: 24px;
    display: flex;
    align-items: center;
    padding: 6px;
    max-width: 100%;
    margin: 0 auto;
  }

  .message-input {
    background: transparent;
    border: none;
    color: #E9ECEF;
    flex: 1;
    font-size: 0.9375rem;
    margin: 0 8px;
    min-height: 36px;
    outline: none;
    padding: 8px;
    resize: none;
    max-height: 100px;
    overflow-y: auto;
  }

  .message-input::placeholder {
    color: #6B7280;
  }

  .send-button {
    background: #00BD3F;
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    height: 36px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: background-color 0.2s;
    flex-shrink: 0;
  }

  .send-button:disabled {
    background: #1A1D21;
    cursor: default;
  }

  .str-chat__list {
    margin-bottom: env(safe-area-inset-bottom, 0px);
  }

  .keyboard-visible .message-list-container {
    padding-top: 250px;
    padding-bottom: 50px;
  }
`;

// Custom message component with typing indicator
const ChatContainer = ({ children }) => (
  <div className="flex flex-col h-full">{children}</div>
);

function useWindowHeight() {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // More reliable keyboard detection, especially for iOS
    const detectKeyboard = () => {
      if (window.visualViewport) {
        // Modern approach using visualViewport
        const heightRatio = window.visualViewport.height / window.innerHeight;
        setKeyboardVisible(heightRatio < 0.8); // If viewport height is less than 80% of window height, keyboard is likely visible
      }
    };
    
    // Focus/blur events are more reliable than simply checking height
    const handleFocus = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        setKeyboardVisible(true);
      }
    };
    
    const handleBlur = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Small delay to check if another input is focused
        setTimeout(() => {
          if (!document.activeElement || 
              (document.activeElement.tagName !== 'INPUT' && 
               document.activeElement.tagName !== 'TEXTAREA')) {
            setKeyboardVisible(false);
          }
        }, 50);
      }
    };
    
    // Initialize
    detectKeyboard();
    
    // Add event listeners
    window.addEventListener('resize', detectKeyboard);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', detectKeyboard);
    }
    
    return () => {
      window.removeEventListener('resize', detectKeyboard);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', detectKeyboard);
      }
    };
  }, []);
  
  return { keyboardVisible };
}

export default function OrderStreamChat() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId;
  
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const clientInitializing = useRef(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { keyboardVisible } = useWindowHeight();
  const messageListRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Check dark mode on initial render and when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initial check
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      // Listen for changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => setIsDarkMode(e.matches);
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);
  
  // Token Provider function - used to get a token for Stream Chat
  const tokenProvider = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/stream/token');
      if (!response.ok) throw new Error('Failed to get chat token');
      
      const data = await response.json();
      return data.token;
    } catch (err) {
      console.error('Error in token provider:', err);
      throw err;
    }
  }, []);
  
  // Initialize Stream client
  useEffect(() => {
    // Return early if not authenticated or already initializing
    if (status !== 'authenticated' || !session?.user?.id || clientInitializing.current) {
      if (status === 'unauthenticated') {
        router.push('/login');
      }
      return;
    }
    
    // Set initialization flag to avoid duplicate initializations
    clientInitializing.current = true;
    
    const initializeChat = async () => {
      try {
        // Get API key if we don't have it yet
        let streamApiKey;
        if (!apiKey) {
          const response = await fetch('/api/chat/stream/token');
          if (!response.ok) throw new Error('Failed to get API key');
          
          const data = await response.json();
          streamApiKey = data.apiKey;
          setApiKey(data.apiKey);
        } else {
          streamApiKey = apiKey;
        }
        
        // Fetch order details
        await fetchOrderDetails();
        
        // Initialize the chat client
        await initChat(streamApiKey);
      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError(err.message || 'Failed to connect to chat');
      } finally {
        clientInitializing.current = false;
      }
    };
    
    initializeChat();
  }, [status, session, router, apiKey, tokenProvider]);
  
  // Function to initialize the chat client and channel
  const initChat = async (streamApiKey) => {
    try {
      setLoading(true);
      
      // First check if user has access to this order
      const orderResponse = await fetch(`/api/orders/${orderId}`);
      
      if (!orderResponse.ok) {
        if (orderResponse.status === 403) {
          throw new Error('You do not have permission to access this order chat');
        }
        throw new Error('Failed to verify order access');
      }
      
      // Parse order data to get buyer and seller IDs
      const orderData = await orderResponse.json();
      if (!orderData || !orderData.id) {
        throw new Error('Invalid order data received');
      }
      
      // Set order details
      setOrderDetails(orderData);
      
      // Extract buyer and seller IDs from the order
      const buyerId = orderData.buyerId || orderData.userId;
      const sellerId = orderData.sellerId;
      
      if (!buyerId || !sellerId) {
        throw new Error('Order is missing buyer or seller information');
      }
      
      // Check if we have a cached client for this user
      const cacheKey = `${session.user.id}-${streamApiKey}`;
      let chatClient;
      
      if (clientCache.has(cacheKey)) {
        chatClient = clientCache.get(cacheKey);
        console.log('Using cached Stream client');
      } else {
        // Initialize StreamChat client with API key
        chatClient = StreamChat.getInstance(streamApiKey);
        
        // Connect user with token provider
        await chatClient.connectUser(
          {
            id: session.user.id,
            name: session.user.name || session.user.email,
            image: session.user.image,
          },
          tokenProvider
        );
        
        // Cache the client for future use
        clientCache.set(cacheKey, chatClient);
        console.log('Created new Stream client and cached it');
      }
      
      // Create or get channel for this order
      const orderChannel = chatClient.channel(
        'messaging',
        `order-${orderId}`,
        {
          name: `Order #${orderId}`,
          members: [buyerId, sellerId],
          order_id: orderId
        }
      );
      
      try {
        await orderChannel.watch();
      } catch (channelError) {
        if (channelError.code === 403 || channelError.code === 17) {
          // Handle permission errors specifically
          console.error('Permission error:', channelError);
          throw new Error('You do not have permission to access this chat channel');
        }
        throw channelError;
      }
      
      setClient(chatClient);
      setChannel(orderChannel);
      setLoading(false);
    } catch (err) {
      console.error('Error initializing chat:', err);
      setError(err.message || 'Failed to initialize chat');
      setLoading(false);
    }
  };
  
  // Function to fetch order details
  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        console.error(`Error fetching order: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      setOrderDetails(data);
    } catch (err) {
      console.error('Error fetching order:', err);
    }
  };
  
  // Smart reconnection handling when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && client && channel) {
        // Just refresh the channel data without reconnecting
        channel.watch().catch(err => {
          console.error('Error refreshing channel:', err);
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [client, channel]);

  // Manage scroll position
  useEffect(() => {
    // This effect handles keyboard visibility changes
    if (chatContainerRef.current) {
      if (keyboardVisible) {
        chatContainerRef.current.classList.add('keyboard-open');
      } else {
        chatContainerRef.current.classList.remove('keyboard-open');
      }
    }
  }, [keyboardVisible]);

  // Auto-scroll message list when keyboard appears
  useEffect(() => {
    if (keyboardVisible && messageListRef.current) {
      messageListRef.current.scrollTo({ top: messageListRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [keyboardVisible]);

  // Auto-scroll on new message if the user is near the bottom
  useEffect(() => {
    if (!channel) return;

    const handleNewMessage = () => {
      if (messageListRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
        // If the user is near the bottom, auto-scroll to show the new message
        if (scrollHeight - (scrollTop + clientHeight) < 100) {
          messageListRef.current.scrollTo({ top: scrollHeight, behavior: 'smooth' });
        }
      }
    };

    channel.on('message.new', handleNewMessage);
    return () => {
      channel.off('message.new', handleNewMessage);
    };
  }, [channel]);

  // Custom header component for the chat
 // Custom header component for the chat
 const CustomChannelHeader = () => {
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrderDetails();
    setTimeout(() => setRefreshing(false), 800);
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => router.push('/dashboard/orders')}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1.5"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        
        <div>
          <h3 className="font-medium text-sm dark:text-white">
            {orderDetails ? `Order #${orderDetails.orderNumber || orderId.substring(0, 8)}` : 'Order Chat'}
          </h3>
          {orderDetails && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              {orderDetails.status === 'COMPLETED' ? (
                <Badge variant="success" className="text-[10px] px-1.5">Completed</Badge>
              ) : orderDetails.status === 'PENDING' ? (
                <Badge variant="warning" className="text-[10px] px-1.5">Pending</Badge>
              ) : orderDetails.status === 'CANCELLED' ? (
                <Badge variant="destructive" className="text-[10px] px-1.5">Cancelled</Badge>
              ) : (
                <Badge className="text-[10px] px-1.5">{orderDetails.status}</Badge>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1.5 text-gray-500 dark:text-gray-400"
          aria-label="Refresh"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
        </button>
        
        <button
          onClick={() => setInfoModalOpen(true)}
          className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1.5 text-gray-500 dark:text-gray-400"
          aria-label="Info"
        >
          <Info className="h-4 w-4" />
        </button>
        
        {orderDetails && (
          <Link 
            href={`/dashboard/orders/${orderId}`}
            className="text-xs text-primary px-2 py-1 hover:bg-primary/5 rounded-md"
          >
            View Order
          </Link>
        )}
      </div>
    </div>
  );
};

  // Modal for displaying chat information
  const InfoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h3 className="font-semibold text-lg dark:text-white">Chat Information</h3>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
              <XCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {orderDetails && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Order Details</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm dark:text-gray-300">Order ID:</span>
                    <span className="text-sm font-medium dark:text-gray-200">{orderDetails.orderNumber || orderId.substring(0, 8)}</span>
                  </div>
                  {orderDetails.status && (
                    <div className="flex justify-between">
                      <span className="text-sm dark:text-gray-300">Status:</span>
                      <Badge 
                        variant={
                          orderDetails.status === 'COMPLETED' ? 'success' : 
                          orderDetails.status === 'PENDING' ? 'warning' : 
                          orderDetails.status === 'CANCELLED' ? 'destructive' : 'default'
                        }
                        className="text-xs"
                      >
                        {orderDetails.status}
                      </Badge>
                    </div>
                  )}
                  {orderDetails.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-sm dark:text-gray-300">Date:</span>
                      <span className="text-sm font-medium dark:text-gray-200">
                        {new Date(orderDetails.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              <p>Messages are delivered only to the participants in this order. Your chat is private and secure.</p>
            </div>
          </div>
          
          <div className="p-4 border-t dark:border-gray-700 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Component to display in case of errors
  const ErrorDisplay = () => (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex gap-3 items-center mb-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-xl font-bold dark:text-white">Chat Error</h1>
      </div>
      
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-4 rounded-lg mb-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
        <div className="flex gap-3 mt-4">
          <Button 
            onClick={() => router.push('/dashboard/orders')}
            className="text-xs"
            variant="outline"
          >
            Return to Orders
          </Button>
          <Button 
            onClick={() => router.push(`/dashboard/orders/${orderId}`)}
            className="text-xs"
            variant="default"
          >
            View Order Details
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2 dark:text-gray-200">Troubleshooting Tips</h3>
        <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300">
          <li>• Check that you're a participant in this order</li>
          <li>• Make sure you're logged in with the correct account</li>
          <li>• Verify the order ID: {orderId.substring(0, 8)}</li>
          <li>• Try refreshing the page</li>
        </ul>
        
        <Button 
          onClick={() => {
            setError(null);
            setLoading(true);
            
            if (apiKey) {
              initChat(apiKey);
            } else {
              fetch('/api/chat/stream/token')
                .then(res => res.json())
                .then(data => {
                  setApiKey(data.apiKey);
                  initChat(data.apiKey);
                })
                .catch(err => {
                  console.error('Error fetching API key:', err);
                  setError('Failed to get API key');
                  setLoading(false);
                });
            }
          }}
          className="mt-4 w-full text-xs"
          variant="outline"
          size="sm"
        >
          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
          Try again
        </Button>
      </div>
    </div>
  );

  // Add this function in your component
  const scrollToBottom = (behavior = 'auto') => {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior
      });
    }
  };

  // Auto-scroll when keyboard appears
  useEffect(() => {
    if (keyboardVisible) {
      // Use a short timeout to ensure layout is complete
      setTimeout(() => scrollToBottom(), 150);
    }
  }, [keyboardVisible]);

  // Auto-scroll when new messages arrive if user is at bottom
  useEffect(() => {
    if (!channel) return;
    
    const handleNewMessage = () => {
      if (messageListRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
        
        if (isAtBottom) {
          // Small delay to ensure the new message is rendered
          setTimeout(() => scrollToBottom('smooth'), 100);
        }
      }
    };
    
    channel.on('message.new', handleNewMessage);
    return () => channel.off('message.new', handleNewMessage);
  }, [channel]);
  const scrollRef = useRef(null);
  useEffect(() => {
    if (keyboardVisible && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [keyboardVisible]);

  // Main render
  if (error) {
    return <ErrorDisplay />;
  }
  
  if (status === 'loading' || loading) {
    return <LoadingView />;
  }
 
  return (
    <div 
      ref={chatContainerRef}
      className={`chat-container ${keyboardVisible ? 'keyboard-visible' : ''}`}
    >
      {!client || !channel ? (
        <LoadingView />
      ) : (
        <>
          <style>{streamStyles}</style>
          <style>{keyboardFixStyles}</style>
          
          <CustomChannelHeader />
          
          <div className="message-list-container" ref={scrollRef}>
            <Chat client={client} theme={isDarkMode ? 'dark' : 'light'}>
              <Channel 
                channel={channel}
                LoadingIndicator={LoadingIndicator}
              >
                <Window hideOnThread>
                  <MessageList messageListRef={messageListRef} />
                </Window>
                <Thread fullWidth />
              </Channel>
            </Chat>
          </div>
          
          <CustomMessageInput 
            channel={channel} 
            keyboardVisible={keyboardVisible} 
          />
          
          <InfoModal isOpen={infoModalOpen} onClose={() => setInfoModalOpen(false)}/>
        </>
      )}
    </div>
  );
}
