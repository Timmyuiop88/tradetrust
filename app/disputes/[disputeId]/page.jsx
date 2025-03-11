'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  AlertCircle, ArrowLeft, Clock, Loader2, Shield, X, Send, 
  CheckCircle, XCircle, AlertTriangle, HelpCircle, FileText,
  Camera, PaperclipIcon, MessageSquare, User, UserCheck, RefreshCw
} from 'lucide-react';

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDispute();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, disputeId, router]);

  const fetchDispute = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/disputes/${disputeId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dispute');
      }
      
      const data = await response.json();
      setDispute(data.dispute);
      setMessages(data.dispute.messages || []);
    } catch (err) {
      console.error('Error fetching dispute:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !selectedFile) return;

    try {
      setIsSending(true);
      
      // TODO: Handle file upload if needed
      // For now, just send the text message
      
      const response = await fetch(`/api/disputes/${disputeId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          isModOnly: isModOnly,
          attachments: [], // Add file URLs here if implemented
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const data = await response.json();
      setMessages([...messages, data.message]);
      setNewMessage('');
      setIsModOnly(false);
      
      // Clear file if any
      if (selectedFile) {
        setSelectedFile(null);
        setFilePreview('');
      }
      
      // Scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const updateDisputeStatus = async () => {
    if (!updateStatus) return;
    
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/disputes/${disputeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: updateStatus,
          resolution: resolution,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update dispute');
      }
      
      const data = await response.json();
      setDispute(data.dispute);
      
      // Refresh messages to get the system message
      fetchDispute();
      
      // Reset form
      setUpdateStatus('');
      setResolution('');
    } catch (err) {
      console.error('Error updating dispute:', err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
  };

  // Function to remove the selected file
  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview('');
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if user is a moderator
  const isModerator = session?.user?.role === 'ADMIN';
  
  // Check if user is the assigned moderator
  const isAssignedMod = dispute?.assignedModId === session?.user?.id;
  
  // Check if user is the buyer
  const isBuyer = dispute?.order?.buyerId === session?.user?.id;
  
  // Check if user is the seller
  const isSeller = dispute?.order?.listing?.sellerId === session?.user?.id;

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
          <button
            onClick={() => setError(null)}
            className="ml-auto text-destructive hover:text-destructive/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
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
                  <p className="text-sm text-muted-foreground">Listing</p>
                  <p className="text-sm font-medium">{dispute.order.listing.username}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <div className="mt-1">{getReasonBadge(dispute.reason)}</div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Initiated by</p>
                  <p className="text-sm font-medium">{dispute.initiator.email}</p>
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
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Buyer</p>
                    <p className="text-sm text-muted-foreground">{dispute.order.buyer.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Seller</p>
                    <p className="text-sm text-muted-foreground">{dispute.order.listing.seller.email}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Moderator actions */}
            {(isModerator || isAssignedMod) && (
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
                  <div className="flex items-center">
                    <button
                      onClick={fetchDispute}
                      className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
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
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isCurrentUser = message.senderId === session?.user?.id;
                      const isSystemMessage = message.content.startsWith('Dispute ');
                      const isModMessage = message.isModOnly;
                      
                      if (isSystemMessage) {
                        return (
                          <div key={message.id} className="flex justify-center">
                            <div className="bg-muted/30 text-muted-foreground text-xs px-3 py-1 rounded-full">
                              {message.content}
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {isModMessage && (
                            <div className="self-start mr-2 bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded">
                              MOD
                            </div>
                          )}
                          
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              isCurrentUser
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-card dark:bg-card/80 rounded-tl-none border border-border'
                            } ${isModMessage ? 'bg-yellow-50 border-yellow-200' : ''}`}
                          >
                            <div className="flex items-center mb-1">
                              <span className="text-xs font-medium">
                                {message.sender.email}
                                {message.sender.role === 'ADMIN' && (
                                  <span className="ml-1 text-green-500">
                                    <UserCheck className="h-3 w-3 inline" />
                                  </span>
                                )}
                              </span>
                            </div>
                            
                            <p className="text-sm">{message.content}</p>
                            
                            <p className="text-xs text-muted-foreground mt-1 text-right">
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
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
                  <form onSubmit={sendMessage} className="flex flex-col gap-2">
                    {filePreview && (
                      <div className="relative mb-2 inline-block">
                        <div className="relative group">
                          <img
                            src={filePreview}
                            alt="Selected file"
                            className="h-32 rounded-md object-cover border border-muted"
                          />
                          <button
                            type="button"
                            onClick={removeSelectedFile}
                            className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 text-red-500 rounded-full p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
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
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[60px] max-h-[120px] resize-none"
                        disabled={isSending}
                      />
                      
                      <div className="flex flex-col gap-2 justify-end">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-10 w-10 rounded-md border border-input bg-background hover:bg-muted flex items-center justify-center"
                          disabled={isSending || selectedFile}
                        >
                          <PaperclipIcon className="h-4 w-4" />
                        </button>
                        
                        <button
                          type="submit"
                          className="h-10 w-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center"
                          disabled={isSending || (!newMessage.trim() && !selectedFile)}
                        >
                          {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {(isModerator || isAssignedMod) && (
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id="modOnly"
                          checked={isModOnly}
                          onChange={(e) => setIsModOnly(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="modOnly" className="ml-2 text-sm text-muted-foreground">
                          Moderator-only message (not visible to users)
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