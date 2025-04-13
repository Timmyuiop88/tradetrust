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
  MessageInput,
  Thread,
  Avatar,
  ChannelHeader as DefaultChannelHeader,
  LoadingIndicator,
  useMessageInputContext,
  useChannelActionContext
} from 'stream-chat-react';
import Link from 'next/link';
import { Button } from '@/app/components/button';
import { Badge } from '@/app/components/badge';
import { cn } from '@/app/lib/utils';
import { Skeleton } from '@/app/components/ui/skeleton';
import 'stream-chat-react/dist/css/v2/index.css';
import { useStreamChat } from '@/lib/hooks/useStreamChat';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/dialog';

import { ChatInput } from './components/ChatInput';
import { ChatLoadingState } from './components/ChatLoadingState';
import { ChatErrorState } from './components/ChatErrorState';
import "./stream.css"

// Create a global cache for Stream chat clients
const clientCache = new Map();

// Stream Chat styles
const streamStyles = `
  .str-chat {
    --str-chat__primary-color: #1DA1F2;
    --str-chat__active-primary-color: #1A91DA;
    height: 100%;
    width: 100%;
    background: #FFFFFF;
    color: #0F1419;
  }

  .str-chat__list {
    background: #FFFFFF;
    padding: 0;
    max-width: 100%;
    margin: 0 auto;
    padding-bottom: 80px;
  }

  .str-chat__message-list-scroll {
    padding: 0 !important;
  }

  .str-chat__message-simple {
    margin: 0;
    padding: 8px 16px;
    border-bottom: 1px solid #EFF3F4;
  }

  .str-chat__message-simple__content {
    background: #F5F8FA;
    border-radius: 16px;
    padding: 12px 16px;
    margin: 4px 0;
    color: #0F1419;
    font-size: 15px;
    max-width: 85%;
    line-height: 1.4;
  }
  
  .str-chat__message--me .str-chat__message-simple__content {
    background: #1DA1F2;
    color: white;
  }

  .str-chat__message-simple__timestamp {
    font-size: 13px;
    color: #536471;
    margin-top: 2px;
  }

  .str-chat__date-separator {
    margin: 12px 0;
    padding: 0 16px;
  }

  .str-chat__date-separator-date {
    background: #FFFFFF;
    color: #536471;
    font-size: 13px;
    font-weight: 500;
  }

  @media (prefers-color-scheme: dark) {
    .str-chat {
      background: #15202B;
      color: #FFFFFF;
    }

    .str-chat__list {
      background: #15202B;
    }

    .str-chat__message-simple {
      border-bottom-color: #38444D;
    }

    .str-chat__message-simple__content {
      color: #FFFFFF;
    }

    .str-chat__message--me .str-chat__message-simple__content {
      color: #FFFFFF;
    }

    .str-chat__date-separator-date {
      background: #15202B;
    }
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

// Custom message input component
const CustomMessageInput = () => {
  const { sendMessage } = useChannelActionContext();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!text.trim()) return;
    
    setIsSending(true);
    
    try {
      await sendMessage({ text: text.trim() });
      setText('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 dark:bg-[#15202B]">
      <div className="px-4 py-2 max-w-screen-md mx-auto">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <textarea
          
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-black dark:text-white rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-4 py-2"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!text.trim() || isSending}
            className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center"
            aria-label="Send message"
          >
            {isSending ? <Spinner size="small" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

// Helper styles for keyboard visibility - using Twitter-like approach
const keyboardFixStyles = `
  .chat-container {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: #FFFFFF;
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
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-top: 1px solid #EFF3F4;
    padding: 12px 16px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    z-index: 1000;
  }

  @supports (-webkit-touch-callout: none) {
    .message-input-container {
      position: fixed !important;
      bottom: 0 !important;
      padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px) + var(--keyboard-height, 0px));
    }

    .keyboard-visible .message-input-container {
      padding-bottom: 10px !important;
      bottom: 0 !important;
      position: fixed !important;
    }
  }

  .message-input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    max-width: 100%;
    margin: 0 auto;
  }

  .message-input {
    flex: 1;
    background: #EFF3F4;
    border: 1px solid transparent;
    border-radius: 16px;
    color: #0F1419;
    font-size: 15px;
    line-height: 1.5;
    min-height: 24px;
    max-height: 120px;
    outline: none;
    padding: 8px 12px;
    resize: none;
    transition: all 0.2s;
  }

  .message-input:focus {
    border-color: #1DA1F2;
    background: #FFFFFF;
  }

  .message-input::placeholder {
    color: #536471;
  }

  .send-button {
    background: #1DA1F2;
    border: none;
    border-radius: 50%;
    color: white;
    height: 36px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: all 0.2s;
    flex-shrink: 0;
    margin-bottom: 2px;
  }

  .send-button:disabled {
    background: #8ECDF8;
  }

  .send-button:not(:disabled):hover {
    background: #1A91DA;
  }

  .str-chat__list {
    margin-bottom: env(safe-area-inset-bottom, 0px);
  }

  .keyboard-visible .message-list-container {
    padding-top: 250px;
    padding-bottom: 50px;
  }

  @media (prefers-color-scheme: dark) {
    .chat-container {
      background: #15202B;
    }

    .message-input-container {
      background: rgba(21, 32, 43, 0.95);
      border-top-color: #38444D;
    }

    .message-input {
      background: #273340;
      color: #FFFFFF;
    }

    .message-input:focus {
      border-color: #1DA1F2;
      background: #15202B;
    }

    .message-input::placeholder {
      color: #8899A6;
    }
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

const ErrorDisplay = ({ error, orderId }) => (
  <div className="container max-w-4xl py-6">
    <div className="flex items-center mb-6">
      <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-2xl font-bold ml-2">Chat Error</h1>
    </div>
    
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-800">Error Accessing Chat</h3>
          <p className="text-sm text-red-700 mt-1">
            {error?.message || 'Unable to access chat. Please try again.'}
          </p>
          {orderId && (
            <p className="text-xs text-red-600 mt-2">
              Order ID: {orderId}
            </p>
          )}
          <div className="mt-4">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const chatTheme = {
  '--str-chat__primary-color': 'hsl(var(--primary))',
  '--str-chat__active-primary-color': 'hsl(var(--primary))',
  '--str-chat__disabled-color': 'hsl(var(--muted))',
  '--str-chat__message-bubble-background': 'hsl(var(--muted))',
  '--str-chat__message-bubble-background-mine': 'hsl(var(--primary))',
  '--str-chat__message-bubble-text-color': 'hsl(var(--foreground))',
  '--str-chat__message-bubble-text-color-mine': 'hsl(var(--primary-foreground))',
};

const fetchOrderDetails = async (orderId) => {
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) throw new Error('Failed to fetch order details');
  return response.json();
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const { client, channel, loading, error } = useStreamChat(params.orderId);
  const messageListRef = useRef(null);
  
  const { data: order, isLoading: orderLoading, refetch, isRefetching } = useQuery({
    queryKey: ['order', params.orderId],
    queryFn: () => fetchOrderDetails(params.orderId),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // 1 minute
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnReconnect: true,
    refetchOnReconnect: true,
  });

  // Handle authentication redirect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading state
  if (status === 'loading' || loading) {
    return <LoadingView />;
  }

  // Show error state
  if (error) {
    return <ChatErrorState error={error} />;
  }

  // Show error if chat initialization failed
  if (!client || !channel) {
    return <ChatErrorState />;
  }

  return (
    <div className="flex flex-col max-h-[100svh]  min-h-[100svh] bg-white dark:bg-[#15202B] fixed bottom-0 left-0 right-0 overflow-y-hidden p-0 m-0">
      <ChatHeader order={order} isLoading={orderLoading} isRefetching={isRefetching} refetch={refetch} />
      
      <div className="flex-1 overflow-y-auto mb-16" style={{
   scrollBehavior: 'smooth',
   backgroundColor: '#070707'
 
  }}>
        <div className="max-w-screen-md mx-auto  " >
          <Chat client={client} theme="str-chat__theme-dark" style={{
            backgroundColor: 'red'
          }}>
            <Channel channel={channel} >
              <Window>
                <MessageList className="pb-16 pt-16" style={{ paddingBottom: '100px' }} />
                {/* <Thread /> */}
              </Window>
              <CustomMessageInput />
            </Channel>
          </Chat>
        </div>
      </div>
    </div>
  );
}

// Custom Channel Header Component
function CustomChannelHeader({ channel }) {
  const router = useRouter();
  
  return (
    <div className="flex h-14 items-center justify-between px-4 border-b">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/orders')}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-sm font-medium">
            Order #{channel?.data?.name?.split('#')[1]}
          </h1>
        </div>
      </div>
    </div>
  );
}

// Update the ChatHeader component first
function ChatHeader({ order, isLoading, isRefetching, refetch }) {
  const router = useRouter();
  if(isRefetching){
    return <ChatHeaderSkeleton />
  }
  return (
    <header onTouchStart={(e) => e.stopPropagation()}
    onTouchMove={(e) => e.stopPropagation()} className="sticky top-0 z-50 bg-white/95 backdrop-blur dark:bg-[#15202B]/95 border-b border-gray-200 dark:border-gray-800">
      <div className="flex h-[53px] items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/dashboard/orders/${order?.id}`)}
            className="h-9 w-9 -ml-2"
            disabled={isLoading || isRefetching}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-col relative">
          
              
        
              <>
                <h1 className={`text-[15px] font-bold leading-5 ${isRefetching ? 'opacity-40' : ''}`}>
                  Order #{order?.id?.substring(0, 8)}
                </h1>
                <div className={`flex items-center gap-2 ${isRefetching ? 'opacity-40' : ''}`}>
                  <span className="text-[13px] text-gray-500 dark:text-gray-400">
                    {order?.status || 'WAITING_FOR_SELLER'}
                  </span>
                  <span className="text-[13px] text-gray-500 dark:text-gray-400">•</span>
                  <span className="text-[13px] text-gray-500 dark:text-gray-400">
                    {order?.listing?.platform?.name || 'Windscribe Vpn'}
                  </span>
                </div>
              </>
           
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={()=>refetch()}
          disabled={isLoading || isRefetching}
        >
          <RefreshCw className={`h-5 w-5 ${isRefetching ? 'animate-spin text-primary' : ''}`} />
        </Button>
      </div>
    </header>
  );
}

// Update the MessageItem component
function MessageItem({ message }) {
  const { data: session } = useSession();
  
  if (!message) return null;
  
  const messageUser = message.user || {};
  const isOwn = messageUser.id === session?.user?.id;
  
  return (
    <div className="hover:bg-gray-50 dark:hover:bg-[#1C2732] transition-colors">
      <div className="flex gap-3 px-4 py-2.5">
        {!isOwn && (
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={messageUser.image} />
            <AvatarFallback>
              {(messageUser.name?.[0] || '?').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn(
          "flex flex-col min-w-0",
          isOwn && "items-end ml-auto"
        )}>
          {!isOwn && (
            <span className="font-bold text-[15px] leading-5">
              {messageUser.name}
            </span>
          )}
          
          <div className={cn(
            "rounded-2xl px-4 py-2 mt-1",
            isOwn 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-foreground"
          )}>
            <p className="text-[15px] leading-5 whitespace-pre-wrap break-words">
              {message.text}
            </p>
          </div>
          
          <span className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
            {formatMessageTime(message.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChatHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur dark:bg-[#15202B]/95 border-b border-gray-200 dark:border-gray-800">
      <div className="flex h-[53px] items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          
          <div className="flex flex-col">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-3.5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3.5 w-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3.5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      </div>
    </header>
  );
}
