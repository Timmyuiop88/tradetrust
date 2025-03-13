'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  AlertCircle, ArrowLeft, Clock, Loader2, Shield, X, Send, 
  CheckCircle, XCircle, AlertTriangle, HelpCircle, FileText,
  Camera, PaperclipIcon, MessageSquare, User, UserCheck, RefreshCw,
  ShoppingBag, Circle
} from 'lucide-react';
import { toast } from 'sonner';
import { useChat } from '@/app/hooks/useChat';

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

export default function DisputeDetailPage() {
  const { disputeId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dispute, setDispute] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isModOnly, setIsModOnly] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [disputeCreationTime, setDisputeCreationTime] = useState(null);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dispute details to get the orderId
  useEffect(() => {
    const fetchDispute = async () => {
      if (!disputeId || !session) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/disputes/${disputeId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dispute: ${response.status}`);
        }
        
        const data = await response.json();
        setDispute(data);
        setDisputeCreationTime(new Date(data.createdAt));
        setError(null);
      } catch (err) {
        console.error('Error fetching dispute:', err);
        setError(err.message);
        toast.error('Failed to load dispute details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDispute();
  }, [disputeId, session]);

  // Use the chat hook with orderId from dispute and add optimistic updates
  const {
    messages: { data: chatMessagesData, isLoading: chatMessagesLoading, error: chatMessagesError, refetch },
    order,
    sendMessage,
    uploadImage,
  } = useChat({ 
    orderId: dispute?.orderId,
    onSuccess: () => {
      // Remove any pending messages that have been confirmed
      setPendingMessages(prev => 
        prev.filter(msg => !chatMessagesData?.some(m => 
          m.content === msg.content && 
          Math.abs(new Date(m.createdAt) - new Date(msg.createdAt)) < 5000
        ))
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
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Set up periodic refresh
  useEffect(() => {
    if (!dispute?.orderId) return;

    const intervalId = setInterval(() => {
      if (!isRefreshing && !isSending) {
        refetch();
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId);
  }, [dispute?.orderId, isRefreshing, isSending, refetch]);

  // Function to handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage.trim() && !selectedImage) || isSending || !dispute?.orderId) {
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
      disputeId: disputeId
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
      
      console.log('Sending dispute message for order:', dispute.orderId);
      
      // Send the message
      const success = await sendMessage.mutate({
        content: messageContent,
        disputeId: disputeId,
        isModOnly: isModOnly
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

  if (status === 'loading' || loading || chatMessagesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex gap-4 items-center mb-6">
          <div onClick={() => router.push('/disputes')} className="text-muted-foreground hover:text-foreground cursor-pointer flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
          </div>
          <h1 className="text-2xl font-bold">Dispute Details</h1>
        </div>
        
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error || 'Failed to load dispute details'}</span>
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

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-4 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading || status === 'loading' || chatMessagesLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : dispute ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Dispute details sidebar */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Dispute Info</h2>
                {getStatusBadge(dispute.status)}
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="text-sm font-medium truncate">{dispute.orderId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <div className="mt-1">{getReasonBadge(dispute.reason)}</div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(dispute.createdAt).toLocaleString()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Last updated</p>
                  <p className="text-sm">{new Date(dispute.updatedAt).toLocaleString()}</p>
                </div>
                
                {dispute.assignedMod && (
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned moderator</p>
                    <p className="text-sm font-medium">{dispute.assignedMod.email}</p>
                  </div>
                )}
                
                {dispute.resolution && (
                  <div>
                    <p className="text-sm text-muted-foreground">Resolution</p>
                    <p className="text-sm">{dispute.resolution}</p>
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
          <div className="md:col-span-2 flex flex-col h-[70vh]">
            <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-full">
              {/* Messages header */}
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Messages</h2>
                  <div className="flex items-center space-x-2">
                    {order && (
                      <Link
                        href={`/chat/${order.id}`}
                        className="flex items-center text-sm text-primary hover:text-primary/80"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        View Full Chat
                      </Link>
                    )}
                    <button
                      onClick={handleManualRefresh}
                      className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {dispute.description}
                </p>
              </div>
              
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
                {chatMessagesError ? (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <p className="text-destructive mb-2">{chatMessagesError}</p>
                    <button 
                      className="flex items-center px-3 py-2 text-sm text-primary hover:text-primary/80"
                      onClick={handleManualRefresh}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Try Again
                    </button>
                  </div>
                ) : !chatMessagesData && !pendingMessages.length ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Dispute Creation Message */}
                    {disputeCreationTime && (
                      <div className="flex justify-center mb-4">
                        <div className="bg-amber-100 text-amber-800 rounded-lg px-4 py-2 text-sm text-center max-w-md">
                          <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                          A dispute was opened on {new Date(disputeCreationTime).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    
                    {/* Messages with optimistic updates */}
                    {[...(chatMessagesData || []), ...pendingMessages]
                      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                      .map((message) => {
                        const isCurrentUser = message.senderId === session?.user?.id;
                        const isAdmin = message.sender?.role === 'ADMIN';
                        const messageTime = new Date(message.createdAt);
                        
                        // Determine if message should be displayed as a dispute message
                        // Messages with a disputeId or sent after dispute creation should be styled as dispute messages
                        const isAfterDispute = disputeCreationTime && messageTime > disputeCreationTime;
                        const isDisputeMessage = message.disputeId === disputeId;
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
              
              {/* Message input */}
              {!dispute.status.startsWith('RESOLVED_') && !dispute.status.startsWith('CANCELLED') && (
                <div className="p-4 border-t border-border">
                  <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                    {imagePreview && (
                      <div className="relative inline-block">
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                          <img
                            src={imagePreview}
                            alt="Selected image"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeSelectedImage}
                            className="absolute top-1 right-1 bg-background/80 text-foreground rounded-full p-1 hover:bg-background/90"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={selectedImage ? "Add a message with your image..." : "Type your message..."}
                        className="flex-1 min-h-[80px] max-h-[160px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 resize-none"
                        disabled={isSending || dispute.status !== 'OPEN'}
                      />
                      
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          accept="image/*"
                          className="hidden"
                        />
                        
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent text-muted-foreground hover:text-accent-foreground disabled:opacity-50"
                          disabled={isUploading || !!selectedImage || isSending || dispute.status !== 'OPEN'}
                        >
                          {isUploading || isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <PaperclipIcon className="h-4 w-4" />
                          )}
                        </button>
                        
                        <button
                          type="submit"
                          className="h-10 w-10 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                          disabled={isUploading || isSending || (!newMessage.trim() && !selectedImage) || dispute.status !== 'OPEN'}
                        >
                          {isUploading || isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Moderator Only Toggle */}
                    {(session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR') && (
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id="modOnly"
                          checked={isModOnly}
                          onChange={(e) => setIsModOnly(e.target.checked)}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                        />
                        <label htmlFor="modOnly" className="ml-2 text-sm text-muted-foreground">
                          Moderator-only message
                        </label>
                      </div>
                    )}
                  </form>
                </div>
              )}
              
              {/* Dispute resolved message */}
              {(dispute.status.startsWith('RESOLVED_') || dispute.status.startsWith('CANCELLED')) && (
                <div className="p-4 border-t border-border bg-muted/20">
                  <div className="flex items-center justify-center text-muted-foreground">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>This dispute has been {dispute.status.toLowerCase().replace('_', ' ')}. No further messages can be sent.</span>
                  </div>
                </div>
              )}
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
    </div>
  );
} 