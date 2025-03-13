'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  AlertCircle, ArrowLeft, Loader2, X, Send, 
  PaperclipIcon, MessageSquare, User, RefreshCw,
  ShoppingBag, AlertTriangle, ExternalLink, Camera, Circle, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useChat } from '@/app/hooks/useChat';

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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { messages, order, sendMessage, uploadImage } = useChat({ orderId });

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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.data]);

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
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await messages?.refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Set up periodic refresh
  useEffect(() => {
    if (!orderId) return;

    const intervalId = setInterval(() => {
      if (!isRefreshing && !isSending) {
        messages?.refetch();
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId);
  }, [orderId, isRefreshing, isSending, messages]);

  // Function to handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedImage) || !orderId || isSending) {
      return;
    }
    
    setIsSending(true);

    // Create a temporary message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      senderId: session.user.id,
      sender: session.user,
      createdAt: new Date().toISOString(),
      isPending: true,
      disputeId: activeDispute?.id
    };
    
    // If there's an image, add it to the temporary message
    if (selectedImage && imagePreview) {
      tempMessage.content = `${tempMessage.content}\n\n[IMAGE]${imagePreview}[/IMAGE]`;
    }
    
    // Add the temporary message to the pending messages
    setPendingMessages(prev => [...prev, tempMessage]);
    
    try {
      // Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        setIsUploading(true);
        toast.info('Uploading image...');
        
        try {
          imageUrl = await uploadImage(selectedImage);
          if (!imageUrl) {
            throw new Error('Failed to upload image');
          }
        } catch (error) {
          console.error('Image upload error:', error);
          toast.error('Failed to upload image. Please try again.');
          // Remove the temporary message on failure
          setPendingMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
          setIsUploading(false);
          setIsSending(false);
          return;
        }
        
        setIsUploading(false);
      }
      
      // Prepare message content
      const messageContent = imageUrl 
        ? `${newMessage.trim()}\n\n[IMAGE]${imageUrl}[/IMAGE]` 
        : newMessage.trim();
      
      // Send the message - if there's an active dispute, include the disputeId
      const success = await sendMessage.mutate({
        content: messageContent,
        disputeId: activeDispute?.id
      });
      
      if (success) {
        // Clear form
        setNewMessage('');
        setSelectedImage(null);
        setImagePreview('');
        // Remove the temporary message as it will be replaced by the real one
        setPendingMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      } else {
        toast.error('Failed to send message');
        // Mark the temporary message as failed
        setPendingMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...msg, isPending: false, isFailed: true }
            : msg
        ));
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Mark the temporary message as failed
      setPendingMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, isPending: false, isFailed: true }
          : msg
      ));
    } finally {
      setIsSending(false);
    }
  };

  // Determine the other user based on the order details
  const otherUser = order ? 
    (session?.user?.id === order.buyer.id ? order.listing.seller : order.buyer) : null;

  if (messages?.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-background">
      {/* Header */}
      <div className="border-b p-4 bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{otherUser?.email || 'Chat'}</p>
                <p className="text-xs text-muted-foreground">
                  {order ? (
                    <>
                      Order #{order.id.substring(0, 8)} • 
                      {activeDispute ? (
                        <span className="text-amber-600">Disputed</span>
                      ) : (
                        <span className={
                          order.status === 'COMPLETED' ? 'text-green-600' :
                          order.status === 'CANCELLED' ? 'text-red-600' :
                          'text-blue-600'
                        }>
                          {order.status}
                        </span>
                      )}
                    </>
                  ) : (
                    'Loading order details...'
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className="p-2 rounded-full hover:bg-muted"
              disabled={messages?.isLoading}
            >
              <RefreshCw className={`h-5 w-5 ${messages?.isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            {activeDispute && (
              <Link
                href={`/disputes/${activeDispute.id}`}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium"
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
        <div className="border-b bg-amber-50 p-3">
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
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-muted/10">
        <div className="p-4 pb-6">
          {messages?.error ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-2">{messages.error}</p>
              <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
                There was a problem connecting to the chat service. This might be due to a missing API route or server issue.
              </p>
              <div className="flex gap-2">
                <button 
                  className="flex items-center px-3 py-2 border rounded-md hover:bg-muted"
                  onClick={handleManualRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </button>
                <button 
                  className="flex items-center px-3 py-2 border rounded-md hover:bg-muted"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </button>
              </div>
            </div>
          ) : !messages?.data && !pendingMessages.length ? (
            <div className="flex flex-col items-center justify-center h-full p-4">
              <MessageSquare className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start the conversation by sending a message below.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Display dispute creation system message if applicable */}
              {disputeCreationTime && (
                <div className="flex justify-center mb-4">
                  <div className="bg-amber-100 text-amber-800 rounded-lg px-4 py-2 text-sm text-center max-w-md">
                    <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                    A dispute was opened on {new Date(disputeCreationTime).toLocaleDateString()} at {new Date(disputeCreationTime).toLocaleTimeString()}
                  </div>
                </div>
              )}
              
              {/* Messages with optimistic updates */}
              {[...(messages?.data || []), ...pendingMessages]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((message) => {
                  const isCurrentUser = message.senderId === session?.user?.id;
                  const isAdmin = message.sender?.role === 'ADMIN';
                  const messageTime = new Date(message.createdAt);
                  
                  // Determine if message should be displayed as a dispute message
                  // Messages with a disputeId or sent after dispute creation should be styled as dispute messages
                  const isAfterDispute = disputeCreationTime && messageTime > disputeCreationTime;
                  const isDisputeMessage = message.disputeId != null;
                  const shouldShowAsDisputeMessage = isDisputeMessage || isAfterDispute;
                  
                  // Check if message contains an image
                  const hasImage = message.content.includes('[IMAGE]') && message.content.includes('[/IMAGE]');
                  let textContent = message.content;
                  let imageUrl = null;
                  
                  if (hasImage) {
                    const imageMatch = message.content.match(/\[IMAGE\](.*?)\[\/IMAGE\]/);
                    if (imageMatch && imageMatch[1]) {
                      imageUrl = imageMatch[1].trim();
                      textContent = message.content.replace(/\[IMAGE\].*?\[\/IMAGE\]/s, '').trim();
                    }
                  }
                  
                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
                      <div className={`max-w-[75%] ${
                        isCurrentUser 
                          ? shouldShowAsDisputeMessage 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-primary text-primary-foreground' 
                          : isAdmin 
                            ? 'bg-blue-100 text-blue-800' 
                            : shouldShowAsDisputeMessage 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-muted'
                      } rounded-lg px-4 py-2 shadow-sm`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">
                            {isCurrentUser ? 'You' : message.sender?.email || 'Unknown User'}
                            {isAdmin && ' (Admin)'}
                          </span>
                          {shouldShowAsDisputeMessage && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800">
                              Dispute
                            </span>
                          )}
                        </div>
                        
                        {/* Display image first if present */}
                        {imageUrl && (
                          <div className="mb-2">
                            <a 
                              href={imageUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="block"
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(imageUrl, '_blank');
                              }}
                            >
                              <div className="relative w-full max-w-[300px] h-[200px] rounded-md overflow-hidden">
                                <img
                                  src={imageUrl}
                                  alt="Attached image"
                                  className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                                />
                              </div>
                            </a>
                          </div>
                        )}
                        
                        {/* Display text content after image */}
                        {textContent && <p className="whitespace-pre-wrap break-words">{textContent}</p>}
                        
                        <div className="flex items-center justify-end gap-2 mt-1">
                          <span className="text-xs opacity-70">
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {isCurrentUser && (
                            <span className="text-xs opacity-70">
                              {message.isPending ? (
                                <span className="flex items-center">
                                  <Loader2 className="h-3 w-3 mr-0.5 animate-spin" />
                                  Sending...
                                </span>
                              ) : message.isFailed ? (
                                <span className="flex items-center text-red-500">
                                  <AlertCircle className="h-3 w-3 mr-0.5" />
                                  Failed
                                </span>
                              ) : message.isRead ? (
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-0.5" />
                                  Read
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <Circle className="h-3 w-3 mr-0.5" />
                                  Sent
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      
      {/* Message input - Fixed at bottom */}
      <div className="border-t p-3 bg-background sticky bottom-0 z-10">
        <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
          {imagePreview && (
            <div className="relative mb-2 inline-block">
              <div className="relative w-32 h-32 rounded-md overflow-hidden border border-muted">
                <img
                  src={imagePreview}
                  alt="Selected image"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-red-500 rounded-full p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex gap-2 items-end">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={selectedImage ? "Add a message with your image..." : "Type your message..."}
              className="min-h-[40px] max-h-[120px] flex-1 rounded-2xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
            />
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
            
            <button 
              type="button"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !!selectedImage || isSending}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            
            <button 
              type="submit" 
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition-colors"
              disabled={isUploading || isSending || (!newMessage.trim() && !selectedImage)}
            >
              {isUploading || isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
        
        {activeDispute && (
          <div className="mt-2 text-xs text-amber-600 flex items-center justify-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            This order has an active dispute. Messages will be marked as dispute messages.
          </div>
        )}
        
        {(messages?.error || isSending) && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center justify-end">
            <span className="flex items-center">
              {messages?.error ? (
                <>
                  <Circle className="h-2 w-2 fill-red-500 text-red-500 mr-1" />
                  Connection error - Trying to reconnect
                </>
              ) : isSending ? (
                <>
                  <Loader2 className="h-2 w-2 animate-spin mr-1" />
                  {isUploading ? 'Uploading image...' : 'Sending message...'}
                </>
              ) : null}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 