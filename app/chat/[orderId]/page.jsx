'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  AlertCircle, ArrowLeft, Loader2, X, Send, 
  PaperclipIcon, MessageSquare, User, RefreshCw,
  ShoppingBag, AlertTriangle, ExternalLink, Camera, 
  Circle, Clock, Image as ImageIcon, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useChat } from '@/app/hooks/useChat';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

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

export default function ChatPage() {
  const { orderId } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [activeDispute, setActiveDispute] = useState(null);
  const [disputeCreationTime, setDisputeCreationTime] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const chatContainerRef = useRef(null);
  const queryClient = useQueryClient();

  // Use the enhanced chat hook with optimized refetch settings
  const { 
    messages, 
    order, 
    sendMessage, 
    uploadImage 
  } = useChat({ 
    orderId,
    refetchInterval: 5000,
    staleTime: 3000,
    onSuccess: () => {
      // Remove any pending messages that have been confirmed
      setPendingMessages(prev => 
        prev.filter(msg => !messages.data?.messages?.some(m => 
          m.content === msg.content && 
          Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 5000
        ))
      );
    }
  });

  // Fetch dispute information for this order
  useEffect(() => {
    const fetchDisputeInfo = async () => {
      if (!orderId || !session) return;
      
      try {
        const response = await fetch(`/api/orders/${orderId}/dispute`);
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.id) {
            setActiveDispute(data);
            setDisputeCreationTime(new Date(data.createdAt));
          }
        }
      } catch (error) {
        console.error('Error fetching dispute info:', error);
      }
    };
    
    fetchDisputeInfo();
  }, [orderId, session]);

  // Preserve scroll position during refetches
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;
    
    // Record the scroll position and height before update
    const scrollHeight = chatContainer.scrollHeight;
    const scrollTop = chatContainer.scrollTop;
    const clientHeight = chatContainer.clientHeight;
    const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    // After update, maintain position or scroll to bottom if we were at the bottom
    const handleContentLoaded = () => {
      if (isScrolledToBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        const newScrollHeight = chatContainer.scrollHeight;
        chatContainer.scrollTop = scrollTop + (newScrollHeight - scrollHeight);
      }
    };
    
    // Call after content has had a chance to render
    const timeoutId = setTimeout(handleContentLoaded, 100);
    return () => clearTimeout(timeoutId);
  }, [messages.data?.messages]);

  // Function to handle file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
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
    if (messages.isFetching) return;
    messages.refetch();
  };

  // Create a more sophisticated message processing function
  const processMessages = useCallback((realMessages, pendingMessages) => {
    // Create a map to track seen message IDs
    const seenIds = new Map();
    
    // Process real messages first (they take precedence)
    const realMessagesList = (realMessages || []).map(msg => ({
      ...msg,
      _source: 'server',
      _key: `server-${msg.id}`
    }));
    
    // Process pending messages
    const pendingMessagesList = (pendingMessages || []).map(msg => ({
      ...msg,
      _source: 'pending',
      _key: `pending-${msg.id}`
    }));
    
    // Combine all messages
    const allMessages = [...realMessagesList, ...pendingMessagesList];
    
    // Sort by creation time
    allMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Filter out duplicates with a sophisticated approach
    const uniqueMessages = [];
    
    for (const message of allMessages) {
      // If we've seen this exact ID before, skip it
      if (seenIds.has(message.id)) continue;
      
      // Mark this ID as seen
      seenIds.set(message.id, true);
      
      // For pending messages that have been sent successfully, check if they exist in real messages
      if (message._source === 'pending' && !message.isPending && !message.isFailed) {
        // Look for a matching real message with similar content and timestamp
        const matchingRealMessage = realMessagesList.find(rm => 
          rm.content === message.content && 
          Math.abs(new Date(rm.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000
        );
        
        // If we found a matching real message, skip this pending message
        if (matchingRealMessage) continue;
      }
      
      // For real messages, check if there's a pending version with the same content
      if (message._source === 'server') {
        // Look for a matching pending message with similar content and timestamp
        const matchingPendingMessage = pendingMessagesList.find(pm => 
          pm.content === message.content && 
          Math.abs(new Date(pm.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000
        );
        
        // If we found a matching pending message, skip this real message if the pending one is already in our list
        if (matchingPendingMessage && uniqueMessages.some(um => um.id === matchingPendingMessage.id)) continue;
      }
      
      // This message passed all our checks, add it to the unique list
      uniqueMessages.push(message);
    }
    
    return uniqueMessages;
  }, []);

  // Update the handleSendMessage function
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedImage) || !orderId || isSending) {
      return;
    }
    
    setIsSending(true);

    // Create a temporary message with a truly unique ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tempMessage = {
      id: tempId,
      content: newMessage.trim(),
      senderId: session.user.id,
      sender: session.user,
      createdAt: new Date().toISOString(),
      isPending: true,
      disputeId: activeDispute?.id,
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
      // Upload image if selected
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
      
      // Determine recipient ID from order
      const recipientId = order ? 
        (session.user.id === order.buyerId ? order.listing.sellerId : order.buyerId) : 
        null;
        
      if (!recipientId) {
        throw new Error("Could not determine message recipient");
      }
      
      // Send the message
      const result = await sendMessage.mutateAsync({
        content: finalContent,
        disputeId: activeDispute?.id,
        recipientId: recipientId
      });
      
      // Update the temporary message with the real message data
      setPendingMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { 
                ...msg, 
                realId: result?.id,
                isPending: false,
                isSent: true
              } 
            : msg
        )
      );

      // After a short delay, clean up any duplicate messages
      setTimeout(() => {
        setPendingMessages(prev => {
          // Keep only pending messages that don't have a matching real message
          return prev.filter(pm => {
            // Keep failed messages
            if (pm.isFailed) return true;
            
            // Keep pending messages
            if (pm.isPending) return true;
            
            // For sent messages, check if they exist in real messages
            const matchingRealMessage = messages.data?.messages?.some(rm => 
              rm.content === pm.content && 
              Math.abs(new Date(rm.createdAt).getTime() - new Date(pm.createdAt).getTime()) < 5000
            );
            
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
  }, [newMessage, selectedImage, imagePreview, isSending, orderId, session, activeDispute?.id, uploadImage, sendMessage, order]);

  // Determine the other user based on the order details
  const otherUser = order ? 
    (session?.user?.id === order.buyer.id ? order.listing.seller : order.buyer) : null;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      {/* Header */}
      <div className="border-b p-4 bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2">
              {otherUser ? (
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center overflow-hidden shadow-sm">
                  {otherUser.avatar ? (
                    <Image 
                      src={otherUser.avatar} 
                      alt={otherUser.email || 'User'} 
                      width={40} 
                      height={40} 
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-primary-foreground" />
                  )}
                </div>
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground/50" />
                </div>
              )}
              
              <div>
                {otherUser ? (
                  <p className="font-medium">{otherUser.email || 'Chat'}</p>
                ) : (
                  <div className="h-5 w-36 bg-muted animate-pulse rounded-sm"></div>
                )}
                
                {order ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShoppingBag className="h-3 w-3" />
                    Order #{order.id.substring(0, 8)} • 
                    {activeDispute ? (
                      <span className="text-amber-600 font-medium">Disputed</span>
                    ) : (
                      <span className={cn(
                        "font-medium",
                        order.status === 'COMPLETED' ? 'text-green-600' :
                        order.status === 'CANCELLED' ? 'text-red-600' :
                        'text-blue-600'
                      )}>
                        {order.status}
                      </span>
                    )}
                  </p>
                ) : (
                  <div className="h-3 w-24 bg-muted animate-pulse rounded-sm mt-1"></div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
              disabled={messages.isFetching}
              aria-label="Refresh messages"
            >
              <RefreshCw className={cn(
                "h-5 w-5 text-muted-foreground", 
                messages.isFetching && "animate-spin text-primary"
              )} />
            </button>
            
            {activeDispute && (
              <Link
                href={`/disputes/${activeDispute.id}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium hover:bg-amber-200 transition-colors"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                View Dispute
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Dispute Warning Banner (if applicable) */}
      {activeDispute && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b bg-amber-50 p-3"
        >
          <div className="flex items-center gap-2 text-amber-800 max-w-3xl mx-auto">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">This order has an active dispute</p>
              <p className="text-sm">
                Dispute reason: {activeDispute.reason}. 
                <Link href={`/disputes/${activeDispute.id}`} className="ml-1 underline">
                  View dispute details
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto bg-muted/5 scroll-smooth" 
        ref={chatContainerRef}
      >
        {messages.error ? (
          <div className="flex flex-col items-center justify-center h-full p-4">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-2">
              {messages.error instanceof Error ? messages.error.message : 'An error occurred'}
            </p>
            <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
              There was a problem loading the chat. Please try refreshing the page.
            </p>
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : (
          <div className="p-4 pb-6 space-y-4">
            {/* Loading state */}
            {messages.isLoading && !messages.data?.messages?.length && (
              <div className="space-y-4 py-4">
                <MessageSkeleton align="left" />
                <MessageSkeleton align="right" />
                <MessageSkeleton align="left" />
              </div>
            )}
            
            {/* Empty state */}
            {!messages.isLoading && (!messages.data?.messages || messages.data.messages.length === 0) && pendingMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-1">No messages yet</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Start the conversation with {otherUser?.email || 'the other user'} about this order.
                </p>
              </div>
            )}
            
            {/* Messages list */}
            <AnimatePresence initial={false}>
              {processMessages(messages.data?.messages, pendingMessages).map(message => {
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
                
                return (
                  <motion.div
                    key={message._key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div className={cn(
                      "rounded-lg px-4 py-2 shadow-sm max-w-[80%]",
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
            
         
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Message Input */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
          {/* Image preview */}
          {imagePreview && (
            <div className="relative w-24 h-24 border rounded-md overflow-hidden group">
              <Image
                src={imagePreview}
                alt="Selected image"
                fill
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
                disabled={isSending || isUploading}
              />
              {/* Image upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
                  (isSending || isUploading) && "opacity-50 cursor-not-allowed"
                )}
                disabled={isSending || isUploading}
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
                disabled={isSending || isUploading}
              />
            </div>
            
            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedImage) || isSending || isUploading}
              className={cn(
                "rounded-full w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                ((!newMessage.trim() && !selectedImage) || isSending || isUploading) && "opacity-50 cursor-not-allowed"
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
  );
} 