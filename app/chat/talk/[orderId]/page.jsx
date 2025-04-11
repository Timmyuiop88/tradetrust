'use client';

import { useCallback } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Loader2, 
  AlertCircle,
  XCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';
import Talk from 'talkjs';
import { Session, Chatbox } from '@talkjs/react';
import { Button } from '@/app/components/button';
import { Badge } from '@/app/components/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import './talk.css';
// Chat skeleton for loading state
const ChatSkeleton = () => {
  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b p-4 animate-pulse">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-muted/20"></div>
          <div className="ml-3">
            <div className="h-4 w-24 bg-muted-foreground/20 rounded"></div>
            <div className="h-3 w-16 bg-muted-foreground/20 rounded mt-1"></div>
          </div>
        </div>
      </div>
      
      {/* Chat container with skeleton messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'} mb-4`}>
            <div className={`max-w-[75%] ${i % 2 === 0 ? 'bg-muted/20' : 'bg-primary/30'} rounded-lg px-4 py-2 shadow-sm animate-pulse`}>
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
        ))}
      </div>
      
      {/* Input skeleton */}
      <div className="border-t p-4 animate-pulse">
        <div className="flex items-center">
          <div className="flex-1 h-10 bg-muted/20 rounded-md"></div>
          <div className="h-10 w-10 bg-muted/20 rounded-full ml-2"></div>
        </div>
      </div>
    </div>
  );
};

function useWindowHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      // Dynamically get the innerHeight to exclude keyboard/URL bar
      setHeight(window.innerHeight);
    };

    updateHeight(); // Initial call

    // Listen for resize events including keyboard open/close
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return height;
}

export default function OrderTalkChat() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId;
  const windowHeight = useWindowHeight();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [chatHeight, setChatHeight] = useState('100vh');
  
  // Handle viewport/keyboard height adjustments


  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      
      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
          throw new Error('You do not have permission to access this order');
        }
        throw new Error('Failed to fetch order details');
      }
      
      const data = await response.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid order data received');
      }
      
      setOrderDetails(data);
      return data;
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message);
      throw err;
    }
  };

  // Load order details
  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrderDetails().then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, orderId]);
  

  
  // Sync conversation using the TalkJS React SDK - connects to conversation created on backend

  
  // Custom header component
  const CustomHeader = () => {
    const [updating, setUpdating] = useState(false);
    
    const handleRefresh = async () => {
      setUpdating(true);
      try {
        await fetchOrderDetails();
      } catch (error) {
        console.error('Error refreshing order details:', error);
      }
      setTimeout(() => setUpdating(false), 1000);
    };
    
    return (
      <div className="flex h-20 sticky bottom-0 z-10  items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900  shadow-sm">
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
  
  // Modal component
  const InfoModal = ({ isOpen, onClose, orderDetails }) => {
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
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">TalkJS Chat Information</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Chat Type:</span>
                  <span className="text-sm font-medium dark:text-gray-200">Order Chat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm dark:text-gray-300">Privacy:</span>
                  <Badge className="text-xs" variant="outline">Private</Badge>
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
  
  // Error component
  const ErrorDisplay = ({ message, retry }) => {
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
            <span>{message}</span>
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
        
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium mb-2 dark:text-gray-200">Troubleshooting Tips</h3>
          <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300">
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
      </div>
    );
  };

  if (error) {
    return (
      <ErrorDisplay 
        message={error} 
        retry={() => {
          setError(null);
          setLoading(true);
          fetchOrderDetails().then(() => {
            setLoading(false);
          }).catch(() => {
            setLoading(false);
          });
        }} 
      />
    );
  }

  if (loading || status !== 'authenticated' || !orderDetails) {
    return <ChatSkeleton />;
  }

  return (


<div
    
      className="bg-red-500  m-0 p-0 w-full cht"
    >
      <div className="h-20 w-full bg-blue-500 fixed top-0 left-0 right-0 z-10">
        <CustomHeader />
      </div>

      <div className=" h-full overflow-hidden">
        
      <InfoModal 
        isOpen={infoModalOpen} 
        onClose={() => setInfoModalOpen(false)} 
        orderDetails={orderDetails}
      />
      
    
      
   
        <Session 
        
          appId={process.env.NEXT_PUBLIC_TALKJS_APP_ID} 
          userId={session?.user?.id}
        >
          <Chatbox
          loadingComponent={<div className=''>Loading...</div>}
           className='h-full w-20'
            conversationId={`order_${orderId}`}
            style={{ height: '100%', width: '100%' }}
            showChatHeader={false}
          />
        </Session> 
    
      </div>
    </div>

    


      

  );
}
