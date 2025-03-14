'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  AlertCircle, ArrowLeft, Clock, Loader2, Shield, X, Send, 
  CheckCircle, XCircle, AlertTriangle, HelpCircle, FileText,
  Camera, PaperclipIcon, MessageSquare, User, UserCheck, RefreshCw,
  ShoppingBag, Circle,Image as ImageIcon, Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { useChat } from '@/app/hooks/useChat';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDispute } from '@/app/hooks/useDispute';
import { useQueryClient } from '@tanstack/react-query';

// Helper function to get status badge
const getStatusBadge = (status) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="h-3 w-3 mr-1" />
          Open
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Shield className="h-3 w-3 mr-1" />
          Under Review
        </span>
      );
    case 'RESOLVED_BUYER_FAVOR':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved (Buyer)
        </span>
      );
    case 'RESOLVED_SELLER_FAVOR':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved (Seller)
        </span>
      );
    case 'RESOLVED_COMPROMISE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved (Compromise)
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <HelpCircle className="h-3 w-3 mr-1" />
          {status}
        </span>
      );
  }
};

// Helper function to get reason badge
const getReasonBadge = (reason) => {
  switch (reason) {
    case 'ITEM_NOT_RECEIVED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Not Received
        </span>
      );
    case 'ITEM_NOT_AS_DESCRIBED':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Not As Described
        </span>
      );
    case 'PAYMENT_ISSUE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Payment Issue
        </span>
      );
    case 'COMMUNICATION_ISSUE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Communication
        </span>
      );
    case 'ACCOUNT_ACCESS_ISSUE':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Account Access
        </span>
      );
    case 'OTHER':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Other
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {reason}
        </span>
      );
  }
};

// Message skeleton for loading state
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

// Dispute content skeleton
const DisputeDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8 max-w-4xl">
    <div className="flex gap-4 items-center mb-6">
      <div className="w-8 h-8 rounded-full bg-muted-foreground/20 animate-pulse"></div>
      <div className="h-8 w-48 bg-muted-foreground/20 rounded animate-pulse"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Sidebar skeleton */}
      <div className="md:col-span-1">
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-4 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-32 bg-muted-foreground/20 rounded"></div>
            <div className="h-6 w-20 bg-muted-foreground/20 rounded-full"></div>
          </div>
          
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <div className="h-4 w-24 bg-muted-foreground/20 rounded mb-2"></div>
                <div className="h-5 w-full bg-muted-foreground/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Chat skeleton */}
      <div className="md:col-span-2">
        <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b flex items-center justify-between bg-background">
            <div className="h-6 w-40 bg-muted-foreground/20 rounded"></div>
            <div className="h-8 w-8 rounded-full bg-muted-foreground/20"></div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-muted/5 p-4">
            <div className="space-y-4 py-4">
              <MessageSkeleton align="left" />
              <MessageSkeleton align="right" />
              <MessageSkeleton align="left" />
            </div>
          </div>
          
          <div className="border-t bg-background p-4">
            <div className="flex items-center gap-2">
              <div className="h-12 w-full bg-muted-foreground/20 rounded-lg"></div>
              <div className="h-12 w-12 bg-muted-foreground/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// First, let's modify the message display section to be more efficient
const MessageList = React.memo(({ messages, pendingMessages, session }) => {
  // Combine and process messages only when dependencies change
  const processedMessages = useMemo(() => {
    // Create a map to track seen message IDs
    const seenIds = new Map();
    
    // Process real messages first (they take precedence)
    const realMessages = (messages || []).map(msg => ({
      ...msg,
      _source: 'server',
      _key: `server-${msg.id}`
    }));
    
    // Process pending messages
    const tempMessages = (pendingMessages || []).map(msg => ({
      ...msg,
      _source: 'pending',
      _key: `pending-${msg.id}`
    }));
    
    // Combine all messages
    const allMessages = [...realMessages, ...tempMessages];
    
    // Sort by creation time
    allMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // First pass: identify and mark duplicates
    const messageMap = new Map();
    
    allMessages.forEach(message => {
      // For messages with images, extract the text content for comparison
      let compareContent = message.content;
      let hasImage = false;
      
      if (message.content && message.content.includes('[IMAGE]')) {
        hasImage = true;
        compareContent = message.content.replace(/\[IMAGE\].*?\[\/IMAGE\]/, '').trim();
      }
      
      // Create a key that ignores the image URL but considers the text and sender
      const key = `${compareContent}-${message.senderId}-${hasImage}`;
      
      if (!messageMap.has(key)) {
        messageMap.set(key, []);
      }
      
      messageMap.get(key).push(message);
    });
    
    // Second pass: select the best message from each group
    const uniqueMessages = [];
    
    messageMap.forEach((messages, key) => {
      // If there's only one message with this key, use it
      if (messages.length === 1) {
        uniqueMessages.push(messages[0]);
        return;
      }
      
      // If we have multiple messages, prefer server messages over pending ones
      const serverMessages = messages.filter(m => m._source === 'server');
      if (serverMessages.length > 0) {
        // Use the most recent server message
        const mostRecentServerMessage = serverMessages.reduce((latest, current) => 
          new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
        );
        uniqueMessages.push(mostRecentServerMessage);
      } else {
        // If no server messages, use the most recent pending message
        const mostRecentPendingMessage = messages.reduce((latest, current) => 
          new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
        );
        uniqueMessages.push(mostRecentPendingMessage);
      }
    });
    
    // Sort the unique messages by creation time
    return uniqueMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages, pendingMessages]);
  
  return (
    <AnimatePresence initial={false}>
      {processedMessages.map(message => {
        const isCurrentUser = message.senderId === session.user.id;
        const isPending = message.isPending;
        const isFailed = message.isFailed;
        
        // Extract image from content if present
        const hasImage = message.content && message.content.includes('[IMAGE]') && message.content.includes('[/IMAGE]');
        let imageSrc = null;
        let textContent = message.content || '';
        
        if (hasImage) {
          const imageMatch = message.content.match(/\[IMAGE\](.*?)\[\/IMAGE\]/);
          if (imageMatch && imageMatch[1]) {
            imageSrc = imageMatch[1].trim();
            textContent = message.content.replace(/\[IMAGE\].*?\[\/IMAGE\]/, '').trim();
          }
        }
        
        // Use the special _key property for React's key prop
        return (
          <motion.div
            key={message._key || `${message._source}-${message.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div className={cn(
              "rounded-lg px-4 py-2 shadow-sm",
              isPending && "opacity-70",
              isFailed && "border border-destructive",
              isCurrentUser 
                ? "bg-primary text-primary-foreground"
                : message.disputeId 
                  ? "bg-amber-100 text-amber-800"
                  : "bg-muted"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium">
                  {isCurrentUser ? 'You' : (message.sender?.email || 'Unknown')}
                </span>
                {message.isModOnly && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800">
                    Moderator Only
                  </span>
                )}
              </div>
              
              {/* Message content */}
              {textContent && (
                <p className="whitespace-pre-wrap break-words">{textContent}</p>
              )}
              
              {/* Display image if present */}
              {imageSrc && (
                <div className="mt-2 rounded-md overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt="Message image"
                    width={300}
                    height={200}
                    className="max-w-full object-contain"
                  />
                </div>
              )}
              
              {/* Message timestamp and read status */}
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className="text-xs opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                {isCurrentUser && (
                  <span className="text-xs">
                    {isPending ? (
                      <Clock className="h-3 w-3 animate-pulse" />
                    ) : isFailed ? (
                      <AlertCircle className="h-3 w-3 text-destructive" />
                    ) : message.isRead ? (
                      <UserCheck className="h-3 w-3 text-primary" />
                    ) : (
                      <Circle className="h-2 w-2 fill-muted-foreground/70" />
                    )}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
});

export default function DisputeDetailPage() {
  const { disputeId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const messagesEndRef = useRef(null);
  const [disputeCreationTime, setDisputeCreationTime] = useState(null);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef(null);

  // Add the useDispute hook
  const { 
    data: disputeData,
    isLoading: disputeLoading,
    error: disputeError,
    refetch: refetchDispute
  } = useDispute(disputeId);

  // Use the chat hook with orderId from dispute
  const {
    messages: { 
      data: chatMessagesData, 
      isLoading: chatMessagesLoading, 
      error: chatMessagesError, 
      refetch 
    },
    order,
    sendMessage,
    uploadImage,
  } = useChat({ 
    orderId: disputeData?.orderId,
    onSuccess: () => {
      // Clear pending messages that have been confirmed
      setPendingMessages(prev => 
        prev.filter(msg => {
          // Check if this pending message exists in the actual messages
          const matchingMessage = chatMessagesData?.messages?.find(m => 
            m.content === msg.content && 
            Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 5000
          );
          // Keep the message if it's not found in actual messages
          return !matchingMessage;
        })
      );
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessagesData]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Function to handle file selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    
    setSelectedImage(file);
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Function to remove the selected file
  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview('');
    }
  };

  // Function to handle manual refresh without full reload
  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Set up periodic refresh
  useEffect(() => {
    if (!disputeData?.orderId) return;

    const intervalId = setInterval(() => {
      if (!isRefreshing && !isSending) {
        refetch();
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId);
  }, [disputeData?.orderId, isRefreshing, isSending, refetch]);

  // Add this near your other hooks
  const queryClient = useQueryClient();

  // First, determine the other user based on the dispute details
  const otherUser = useMemo(() => {
    if (!order || !session) return null;
    
    return session.user.id === order.buyerId 
      ? order.listing.seller 
      : order.buyer;
  }, [order, session]);

  // Now define handleSendMessage after otherUser is defined
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedImage) || isSending || !disputeData?.orderId) {
      return;
    }
    
    setIsSending(true);
    
    // Create a temporary message with a guaranteed unique ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempMessage = {
      id: tempId,
      content: newMessage.trim(),
      senderId: session.user.id,
      sender: session.user,
      createdAt: new Date().toISOString(),
      isPending: true,
      disputeId: disputeId,
      isRead: false
    };
    
    // Add image to temporary message if present
    if (selectedImage && imagePreview) {
      tempMessage.content = `${tempMessage.content}\n\n[IMAGE]${imagePreview}[/IMAGE]`;
    }
    
    // Store message content before clearing form
    const messageContent = newMessage;
    
    // Clear form early for better UX
    setNewMessage('');
    removeSelectedImage();
    
    // Add temporary message immediately
    setPendingMessages(prev => [...prev, tempMessage]);
    
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    try {
      // Handle image upload if present
      let imageUrl = null;
      if (selectedImage) {
        setIsUploading(true);
        imageUrl = await uploadImage(selectedImage);
        setIsUploading(false);
      }
      
      // Prepare message content
      const finalContent = imageUrl 
        ? `${messageContent}\n\n[IMAGE]${imageUrl}[/IMAGE]` 
        : messageContent;
      
      // Send the message
      const result = await sendMessage.mutateAsync({
        content: finalContent,
        disputeId: disputeId,
        recipientId: otherUser?.id
      });
      
      // Update the temporary message with the real message data
      setPendingMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { 
                ...msg, 
                content: finalContent,
                realId: result?.id,
                isPending: false,
                isSent: true,
                hasLocalImage: false
              } 
            : msg
        )
      );
      
      // And update the cleanup logic to handle image messages properly
      setTimeout(() => {
        setPendingMessages(prev => {
          // Keep only pending messages that don't have a matching real message
          return prev.filter(pm => {
            // Keep failed messages
            if (pm.isFailed) return true;
            
            // Keep pending messages
            if (pm.isPending) return true;
            
            // For sent messages, check if they exist in real messages
            const matchingRealMessage = chatMessagesData?.messages?.some(rm => {
              // For messages with images, compare without the image part
              if (pm.hasLocalImage || rm.content.includes('[IMAGE]')) {
                const pmTextContent = pm.content.replace(/\[IMAGE\].*?\[\/IMAGE\]/, '').trim();
                const rmTextContent = rm.content.replace(/\[IMAGE\].*?\[\/IMAGE\]/, '').trim();
                return rmTextContent === pmTextContent && 
                  Math.abs(new Date(rm.createdAt).getTime() - new Date(pm.createdAt).getTime()) < 5000;
              }
              
              // For regular messages, compare the full content
              return rm.content === pm.content && 
                Math.abs(new Date(rm.createdAt).getTime() - new Date(pm.createdAt).getTime()) < 5000;
            });
            
            // Keep if no matching real message found
            return !matchingRealMessage;
          });
        });
      }, 2000); // Wait 2 seconds before cleanup
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setPendingMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, isPending: false, isFailed: true }
          : msg
      ));
    } finally {
      setIsSending(false);
    }
  }, [newMessage, selectedImage, imagePreview, isSending, disputeData?.orderId, session, disputeId, otherUser?.id, uploadImage, sendMessage, chatMessagesData?.messages]);

  // Fix for status checking
  if (status === 'loading' || (disputeLoading && !disputeData)) {
    return <DisputeDetailSkeleton />;
  }
  
  // Return for data loading
  if (chatMessagesLoading && !chatMessagesData) {
    return <DisputeDetailSkeleton />;
  }

  if (disputeError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <div className="text-center">
          <span>{disputeError.message || 'Failed to load dispute details'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex gap-4 items-center mb-6">
        <div onClick={() => router.push('/disputes')} className="text-muted-foreground hover:text-foreground cursor-pointer flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
        </div>
        <h1 className="text-2xl font-bold">Dispute Details</h1>
      </div>

      {disputeData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dispute details sidebar */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Dispute Info</h2>
                {getStatusBadge(disputeData?.status)}
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="text-sm font-medium truncate">{disputeData?.orderId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <div className="mt-1">{getReasonBadge(disputeData?.reason)}</div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(disputeData?.createdAt).toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Last updated</p>
                  <p className="text-sm">{new Date(disputeData?.updatedAt).toLocaleString()}</p>
                </div>
                
                {disputeData?.assignedMod && (
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned moderator</p>
                    <p className="text-sm font-medium">{disputeData?.assignedMod.email}</p>
                  </div>
                )}
                
                {disputeData?.resolution && (
                  <div>
                    <p className="text-sm text-muted-foreground">Resolution</p>
                    <p className="text-sm">{disputeData?.resolution}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-4">
              <h2 className="text-lg font-semibold mb-4">Parties</h2>
              
              <div className="space-y-4">
                {order && (
                  <>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Buyer</p>
                        <p className="text-sm text-muted-foreground">{order.buyer.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Seller</p>
                        <p className="text-sm text-muted-foreground">{order.listing.seller.email}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Moderator actions */}
            {(session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR') && (
              <div className="bg-card rounded-lg shadow-sm border border-border p-4">
                <h2 className="text-lg font-semibold mb-4">Moderator Actions</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Update Status</label>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select status...</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="RESOLVED_BUYER_FAVOR">Resolve in Buyer's Favor</option>
                      <option value="RESOLVED_SELLER_FAVOR">Resolve in Seller's Favor</option>
                      <option value="RESOLVED_COMPROMISE">Resolve as Compromise</option>
                      <option value="CANCELLED">Cancel Dispute</option>
                    </select>
                  </div>
                  
                  {updateStatus.startsWith('RESOLVED_') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Resolution Notes</label>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Explain the resolution..."
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[80px]"
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={updateDisputeStatus}
                    disabled={!updateStatus || isUpdating}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </span>
                    ) : (
                      'Update Dispute'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Messages section */}
          <div className="md:col-span-2">
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-[600px]">
              {/* Chat header */}
              <div className="p-4 border-b flex items-center justify-between bg-background">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">
                    {otherUser ? `Chat with ${otherUser.email}` : 'Dispute Communication'}
                  </h3>
                </div>
                
                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  {/* Full screen chat button */}
                  <Link
                    href={`/chat/${disputeData?.orderId}`}
                    className={cn(
                      "p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    )}
                    aria-label="Open full chat"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Link>
                  
                  {/* Refresh button */}
                  <button 
                    onClick={handleManualRefresh}
                    className={cn(
                      "p-2 rounded-full hover:bg-muted transition-colors",
                      isRefreshing && "animate-spin text-primary"
                    )}
                    disabled={isRefreshing}
                    aria-label="Refresh messages"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Messages container */}
              <div className="flex-1 overflow-y-auto bg-muted/5 p-4">
                <MessageList 
                  messages={chatMessagesData?.messages || []} 
                  pendingMessages={pendingMessages} 
                  session={session} 
                />
                <div ref={messagesEndRef} />
              </div>
              
              {/* Message input */}
              <div className="border-t bg-background p-4">
                <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                  {/* Image preview */}
                  {imagePreview && (
                    <div className="relative w-24 h-24 border rounded-md overflow-hidden group">
                      <Image
                        src={imagePreview}
                        alt="Selected image"
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeSelectedImage}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full px-4 py-3 bg-muted rounded-lg resize-none min-h-[50px] max-h-[120px] pr-10"
                        style={{ height: Math.min(120, Math.max(50, newMessage.split('\n').length * 24)) + 'px' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        disabled={isSending || isUploading || disputeData.status !== 'OPEN'}
                      />
                      {/* Image upload button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                          (isSending || isUploading || !!selectedImage || disputeData.status !== 'OPEN') && "opacity-50 cursor-not-allowed"
                        )}
                        disabled={isSending || isUploading || !!selectedImage || disputeData.status !== 'OPEN'}
                      >
                        <ImageIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={(!newMessage.trim() && !selectedImage) || isSending || isUploading || disputeData.status !== 'OPEN'}
                      className={cn(
                        "rounded-full w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                        ((!newMessage.trim() && !selectedImage) || isSending || isUploading || disputeData.status !== 'OPEN') && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isSending || isUploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-medium mb-2">Dispute not found</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            The dispute you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            href="/disputes"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Back to Disputes
          </Link>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageSelect}
        disabled={isSending || isUploading || disputeData.status !== 'OPEN'}
      />
    </div>
  );
} 