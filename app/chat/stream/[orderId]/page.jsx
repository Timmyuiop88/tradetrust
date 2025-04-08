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
  Info
} from 'lucide-react';
import { StreamChat } from 'stream-chat';
import { 
  Chat as StreamChatComponent,
  Channel as StreamChannel,
  Window as StreamWindow,
  MessageList as StreamMessageList,
  MessageInput as StreamMessageInput,
  Thread as StreamThread,
  useChannelStateContext,
  useChannelActionContext,
  useMessageContext,
  MessageSimple,
  Avatar,
  useChatContext
} from 'stream-chat-react';
import NextImage from 'next/image';
import Link from 'next/link';
import { Button } from '@/app/components/button';
import { Badge } from '@/app/components/badge';
import { cn } from '@/app/lib/utils';
import { Skeleton } from '@/app/components/ui/skeleton';
import 'stream-chat-react/dist/css/v2/index.css';


const MessageSkeleton = ({ align = 'left' }) => (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[75%] ${align === 'right' ? 'bg-primary/30' : 'bg-muted'} rounded-lg px-4 py-2 shadow-sm animate-pulse`}>
        <div className="h-4 w-24 bg-muted-foreground/20 rounded mb-2"></div>
        <div className="space-y-2">
          <div className="h-3 w-48 bg-muted-foreground/20 rounded"></div>
          <div className="h-3 w-32 bg-muted-foreground/20 rounded"></div>
        </div>
        <div className="flex justify-end mt-1">
          <div className="h-3 w-12 bg-muted-foreground/20 rounded"></div>
        </div>
      </div>
    </div>
  );

// Create a skeleton loader for the chat interface
const ChatSkeleton = () => {
  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
    {/* Header skeleton */}
    <div className="border-b p-4 animate-pulse">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-muted"></div>
        <div className="ml-3">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-3 w-16 bg-muted rounded mt-1"></div>
        </div>
      </div>
    </div>
    
    {/* Chat container with skeleton messages */}
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <MessageSkeleton align="left" />
      <MessageSkeleton align="right" />
      <MessageSkeleton align="left" />
      <MessageSkeleton align="right" />
    </div>
    
    {/* Input skeleton */}
    <div className="border-t p-4 animate-pulse">
      <div className="flex items-center">
        <div className="flex-1 h-10 bg-muted rounded-md"></div>
        <div className="h-10 w-10 bg-muted rounded-full ml-2"></div>
      </div>
    </div>
  </div>
   
  );
};

// Create a global cache for Stream chat clients
const clientCache = new Map();

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
  const [connecting, setConnecting] = useState(false);
  const hasInitialized = useRef(false);
  
  // Token Provider function
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
  
  // Initialize Stream client - optimized to avoid unnecessary reconnections
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id || hasInitialized.current) {
      if (status === 'unauthenticated') {
        router.push('/login');
      }
      return;
    }
    
    // Set initialization flag to avoid duplicate initializations
    hasInitialized.current = true;
    
    const initializeChat = async () => {
      setConnecting(true);
      
      try {
        // Get API key
        let streamApiKey;
        
        // Check if we have the API key in cache
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
        setError(err.message);
      } finally {
        setConnecting(false);
      }
    };
    
    initializeChat();
    
    // Return cleanup function
    return () => {
      // We don't disconnect the client on unmount to persist connection
      // The client will be reused if the user navigates back
    };
  }, [status, session, router]);
  
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
          members: [buyerId, sellerId], // Include both buyer and seller
          order_id: orderId
        }
      );
      
      try {
        await orderChannel.watch();
        
        // Get channel members to identify the other participant
        const members = await orderChannel.queryMembers({});
        console.log('Channel members:', members);
      } catch (channelError) {
        if (channelError.code === 403 || channelError.code === 17) {
          // Handle permission errors specifically
          console.error('Permission error:', channelError);
          throw new Error('You do not have permission to access this chat channel. This may happen if you are not a participant in this order.');
        }
        throw channelError;
      }
      
      setClient(chatClient);
      setChannel(orderChannel);
      setLoading(false);
    } catch (err) {
      console.error('Error initializing chat:', err);
      setError(err.message);
      setLoading(false);
    }
  };
  
  const fetchOrderDetails = async (retryCount = 0) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        // If we get a 404 or 403, don't retry
        if (response.status === 404 || response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`Order not found or access denied: ${errorData.error || response.status}`);
          return;
        }
        
        // For other errors, retry up to 3 times
        if (retryCount < 3) {
          console.log(`Retrying order fetch (${retryCount + 1}/3)...`);
          // Wait a bit before retrying (exponential backoff)
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount)));
          return fetchOrderDetails(retryCount + 1);
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch order details: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON response received from API");
        return;
      }
      
      const data = await response.json();
      
      // Check if we have valid order data with defensive programming
      if (!data || typeof data !== 'object') {
        console.error("Invalid order data format", data);
        return;
      }
      
      // Set the order details even if some expected fields might be missing
      setOrderDetails(data);
    } catch (err) {
      console.error('Error fetching order:', err);
      // Don't set error state here, just log it - we don't want to break the chat
      // if order details can't be fetched
    }
  };
  
  // Handle connection state visibility changes to avoid unnecessary reconnections
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && client) {
        // If the tab becomes visible and we already have a client,
        // just refresh the channel data without reconnecting
        if (channel) {
          channel.watch().catch(err => {
            console.error('Error refreshing channel:', err);
          });
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [client, channel]);
  
  // Add a help component to render in error cases
  const ErrorHelp = ({ error, orderId, retry }) => {
    return (
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium mb-2 dark:text-gray-200">Troubleshooting Tips</h3>
        <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300">
          {error.includes("permission") && (
            <>
              <li>• You might not be a participant in this order</li>
              <li>• The channel may have been created without you as a member</li>
              <li>• Try viewing the order details before accessing the chat</li>
            </>
          )}
          <li>• Make sure you're logged in with the correct account</li>
          <li>• Check that the order ID is correct: {orderId.substring(0, 8)}</li>
          <li>• If this is a new order, the chat channel may still be initializing</li>
          <li>• Try refreshing the page or coming back in a few minutes</li>
        </ul>
        {retry && (
          <Button 
            onClick={retry} 
            className="mt-4 w-full text-xs"
            variant="outline"
            size="sm"
          >
            <span className="flex items-center">
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Try again
            </span>
          </Button>
        )}
      </div>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="flex gap-3 items-center mb-4 sm:mb-6">
          <button 
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold dark:text-gray-200">Chat Error</h1>
        </div>
        
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-4 rounded-lg mb-4">
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
        
        <ErrorHelp 
          error={error} 
          orderId={orderId} 
          retry={() => {
            setError(null);
            setLoading(true);
            // Retry initialization
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
        />
      </div>
    );
  }
  
  if (status === 'loading' || loading) {
    return <ChatSkeleton />;
  }
  
  if (!client || !channel) {
    return <ChatSkeleton />;
  }

  // Custom Components for Stream Chat
  const CustomChannelHeader = () => {
    const [updating, setUpdating] = useState(false);
    
    // Refresh order details when clicked
    const handleRefresh = async () => {
      setUpdating(true);
      await fetchOrderDetails();
      setTimeout(() => setUpdating(false), 1000); // Ensure the spinner shows for at least 1 second
    };
    
    return (
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button 
            onClick={() => router.push('/dashboard/orders')}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1.5 flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          
          <div className="overflow-hidden">
            <h3 className="font-medium text-sm sm:text-base truncate dark:text-gray-200">
              {orderDetails ? `Order #${orderDetails.orderNumber || orderId.substring(0, 8)}` : `Order Chat`}
            </h3>
            {orderDetails && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <button
                  onClick={handleRefresh}
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                >
                  {updating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <span>
                      {orderDetails.status === 'COMPLETED' ? (
                        <Badge variant="success" className="text-[10px] h-5 px-1.5">Completed</Badge>
                      ) : orderDetails.status === 'PENDING' ? (
                        <Badge variant="warning" className="text-[10px] h-5 px-1.5">Pending</Badge>
                      ) : orderDetails.status === 'CANCELLED' ? (
                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Cancelled</Badge>
                      ) : (
                        <Badge className="text-[10px] h-5 px-1.5">{orderDetails.status}</Badge>
                      )}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInfoModalOpen(true)}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full p-1.5 text-muted-foreground hidden sm:flex"
            aria-label="View information"
          >
            <Info className="h-4 w-4" />
          </button>
          
          {orderDetails && (
            <Link 
              href={`/dashboard/orders/${orderId}`}
              className="text-xs sm:text-sm text-primary hover:underline px-2 py-1 rounded-md hover:bg-primary/5 transition-colors"
            >
              View Order
            </Link>
          )}
        </div>
      </div>
    );
  };

  // Custom Message component for better styling
  const CustomMessage = (props) => {
    const { message } = useMessageContext();
    const { channel } = useChannelStateContext();
    const isMyMessage = message.user?.id === session?.user?.id;
    
    return (
      <div 
        className={cn(
          "py-2 px-1 sm:px-2 flex w-full",
          isMyMessage ? "justify-end" : "justify-start"
        )}
      >
        {!isMyMessage && (
          <div className="mr-2 sm:mr-3 flex-shrink-0 self-end mb-1">
            <Avatar 
              image={message.user?.image} 
              name={message.user?.name || message.user?.id || 'User'} 
              size={28}
              shape="rounded"
            />
          </div>
        )}
        
        <div 
          className={cn(
            "max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 break-words",
            isMyMessage 
              ? "bg-primary text-primary-foreground rounded-tr-sm" 
              : "bg-gray-100 dark:bg-gray-800 text-foreground dark:text-gray-200 rounded-tl-sm"
          )}
        >
          {!isMyMessage && message.user?.name && (
            <div className="text-xs font-medium mb-1 dark:text-gray-200">
              {message.user.name}
            </div>
          )}
          
          {message.text && (
            <div className="whitespace-pre-wrap text-sm">{message.text}</div>
          )}
          
          {message.attachments?.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment, index) => {
                if (attachment.type === 'image') {
                  return (
                    <div key={index} className="rounded-md overflow-hidden">
                      <NextImage
                        src={attachment.image_url}
                        alt="Attachment"
                        width={300}
                        height={200}
                        className="object-contain max-h-[200px] w-auto"
                      />
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
          
          <div className={cn(
            "text-[10px] mt-1 flex items-center",
            isMyMessage ? "justify-end text-white/70" : "justify-end text-gray-500 dark:text-gray-400"
          )}>
            {new Date(message.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
            {isMyMessage && (
              <span className="ml-1">
                {message.status === 'received' && <Check className="inline-block h-3 w-3" />}
                {message.status === 'sending' && <Clock className="inline-block h-3 w-3" />}
              </span>
            )}
          </div>
        </div>
        
        {isMyMessage && (
          <div className="ml-2 sm:ml-3 flex-shrink-0 self-end mb-1">
            <Avatar 
              image={session.user?.image} 
              name={session.user?.name || session.user?.email || 'You'} 
              size={28}
              shape="rounded"
            />
          </div>
        )}
      </div>
    );
  };

  // Custom Message Input component
  const CustomInput = () => {
    const { sendMessage } = useChannelActionContext();
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const fileInputRef = useRef(null);
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!text.trim() && !fileInputRef.current?.files?.length) return;
      
      setSending(true);
      
      try {
        // Handle file uploads
        const attachments = [];
        if (fileInputRef.current?.files?.length) {
          const file = fileInputRef.current.files[0];
          
          // Create a FormData to upload the file
          const formData = new FormData();
          formData.append('file', file);
          
          // Upload via our channel and get the URL
          const response = await channel.sendImage(file);
          if (response.file) {
            attachments.push({
              type: 'image',
              image_url: response.file,
              fallback: file.name,
            });
          }
        }
        
        // Send the message
        await sendMessage({
          text,
          attachments: attachments.length ? attachments : undefined,
        });
        
        // Reset the input
        setText('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setSending(false);
      }
    };
    
    return (
      <div className="px-2 sm:px-4 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900  bottom-0 w-full fixed pb-5">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full flex-shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-5 w-5" />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={() => {}}
            />
          </button>
          
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 py-2 px-3 text-sm rounded-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-transparent dark:text-gray-200 dark:placeholder-gray-500"
          />
          
          <button
            type="submit"
            disabled={sending || (!text.trim() && !fileInputRef.current?.files?.length)}
            className="p-2 bg-primary text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    );
  };

  // Chat Information Modal
  const InfoModal = ({ isOpen, onClose, orderDetails, channel }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h3 className="font-semibold text-lg dark:text-gray-200">Chat Information</h3>
            <button 
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800 p-1 rounded-full"
            >
              <XCircle className="h-5 w-5 dark:text-gray-400" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Order Details</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Order ID:</span>
                  <span className="text-sm font-medium dark:text-gray-200">{orderDetails?.orderNumber || orderId.substring(0, 8)}</span>
                </div>
                {orderDetails?.status && (
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
                {orderDetails?.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-sm dark:text-gray-300">Date:</span>
                    <span className="text-sm font-medium dark:text-gray-200">
                      {new Date(orderDetails.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Channel Information</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Channel Type:</span>
                  <span className="text-sm font-medium dark:text-gray-200">Order Chat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Message Delivery:</span>
                  <Badge className="text-xs" variant="outline">End-to-End</Badge>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              <p>Messages are delivered only to the participants in this order (buyer and seller). Your chat is private and secure.</p>
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

  return (
    <div className="flex flex-col h-[100dvh] bg-red-500 dark:bg-red-900 pb-18 ">
      {/* Info modal */}
      <InfoModal 
        isOpen={infoModalOpen} 
        onClose={() => setInfoModalOpen(false)} 
        orderDetails={orderDetails}
        channel={channel}
      />
      
      {/* Custom header outside of Stream components */}
      <CustomChannelHeader />
      
      {/* Main chat container */}
      <div className="flex-1 overflow-hidden">
        <StreamChatComponent client={client} theme="messaging light dark:messaging dark" className="h-full dark:text-white">
          <StreamChannel channel={channel} Message={CustomMessage}>
            <StreamWindow hideOnThread>
                <div className="flex flex-col h-[calc(100%-60px)] bg-green-500 pb-18">
                    <StreamMessageList />
                </div>
           
              <CustomInput />
            </StreamWindow>
            <StreamThread fullWidth />
          </StreamChannel>
        </StreamChatComponent>
      </div>
    </div>
  );
}
