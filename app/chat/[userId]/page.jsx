'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, OctagonAlert, MessageCircle, Send, AlertCircle, ArrowLeft, RefreshCw, Circle, Clock, Camera } from 'lucide-react';
import { useEdgeStore } from '@/app/lib/edgeStore';

const MessageSkeleton = () => {
    return (
        <div className="space-y-4">
            {/* Other user message */}
            <div className="flex mb-4 justify-start">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse mr-2"></div>
                <div className="max-w-[70%] p-3 rounded-lg bg-card dark:bg-card/80 rounded-tl-none">
                    <div className="h-4 bg-muted/60 rounded w-24 animate-pulse"></div>
                    <div className="h-12 bg-muted/60 rounded w-full mt-2 animate-pulse"></div>
                    <div className="h-3 bg-muted/60 rounded w-16 mt-1 animate-pulse"></div>
                </div>
            </div>

            {/* Current user message */}
            <div className="flex mb-4 justify-end">
                <div className="max-w-[70%] p-3 rounded-lg bg-primary/70 text-primary-foreground rounded-tr-none">
                    <div className="h-4 bg-primary-foreground/20 rounded w-24 animate-pulse"></div>
                    <div className="h-12 bg-primary-foreground/20 rounded w-full mt-2 animate-pulse"></div>
                    <div className="h-3 bg-primary-foreground/20 rounded w-16 mt-1 animate-pulse"></div>
                </div>
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse ml-2"></div>
            </div>

            {/* Other user message */}
            <div className="flex mb-4 justify-start">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse mr-2"></div>
                <div className="max-w-[70%] p-3 rounded-lg bg-card dark:bg-card/80 rounded-tl-none">
                    <div className="h-4 bg-muted/60 rounded w-32 animate-pulse"></div>
                    <div className="h-8 bg-muted/60 rounded w-full mt-2 animate-pulse"></div>
                    <div className="h-3 bg-muted/60 rounded w-16 mt-1 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default function ChatDetail({ params }) {
  // Access userId directly from params
  const { userId } = useParams();
  
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const { edgestore } = useEdgeStore();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchMessages();
      const interval = setInterval(fetchMessages, 15000); // Poll for new messages every 15 seconds
      return () => clearInterval(interval);
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, userId, router]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data.messages);
      setOtherUser(data.otherUser);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    // Check if there's a message or image to send
    if (!newMessage.trim() && !selectedImage) return;

    try {
      let success = false;
      setIsSending(true); // Set sending state to true

      // If there's an image to upload
      if (selectedImage) {
        setIsUploading(true);

        // Upload to EdgeStore
        const res = await edgestore.publicFiles.upload({
          file: selectedImage,
          onProgressChange: (progress) => {
            console.log(`Upload progress: ${progress}%`);
          },
        });

        console.log('Upload complete:', res);

        // Send the image URL as a message, along with any text
        // Place the image marker first, then the text (if any)
        const imageUrl = res.url;
        const messageContent = newMessage.trim()
          ? `[IMAGE]${imageUrl}\n${newMessage}`
          : `[IMAGE]${imageUrl}`;

        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId: userId,
            content: messageContent,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send message');
        }
        
        // Add the new message to the list
        const data = await response.json();
        setMessages([...messages, data.message]);
        success = true;

        // Clean up
        setSelectedImage(null);
        if (imagePreview) {
          URL.revokeObjectURL(imagePreview);
          setImagePreview('');
        }
      } else {
        // Just send the text message
        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId: userId,
            content: newMessage,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to send message');
        }
        
        // Add the new message to the list
        const data = await response.json();
        setMessages([...messages, data.message]);
        success = true;
      }
    
      if (success) {
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
      setIsSending(false); // Reset sending state
    }
  };

  // Function to handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Store the selected file
    setSelectedImage(file);

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Focus on the textarea for adding a message with the image
    setTimeout(() => {
      if (document.activeElement !== document.body) {
        document.activeElement.blur();
      }
    }, 100);
  };

  // Function to remove the selected image
  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview('');
    }
  };

  // Function to format date for the date separator
  const formatMessageDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the message was sent today
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if the message was sent yesterday
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // For other dates, show the full date
    return messageDate.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };
  
  // Function to check if two dates are on different days
  const isDifferentDay = (date1, date2) => {
    if (!date1 || !date2) return true;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() !== d2.toDateString();
  };

  // Get the other user's email
  const getOtherUserEmail = () => {
    return otherUser?.email || 'Other User';
  };

  // Format last seen time
  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'a while ago';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    
    return lastSeenDate.toLocaleDateString();
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex flex-col h-[85vh] md:h-screen">
        <div className="flex-1 flex flex-col overflow-hidden border-0 rounded-none">
          <div className="p-4 border-b flex items-center justify-between bg-background">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse mr-2"></div>
              <div>
                <div className="h-4 bg-muted/60 rounded w-24 animate-pulse"></div>
                <div className="h-3 bg-muted/60 rounded w-16 mt-1 animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-muted/30">
            <MessageSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[85vh] md:h-screen">
      <div className="flex-1 flex flex-col overflow-hidden border-0 rounded-none">
        <div className="p-4 border-b flex items-center justify-between bg-background">
          <div className="flex items-center">
            <div onClick={() => router.back()} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground cursor-pointer pr-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
            </div>

            <div>
              <h2 className="font-medium">{getOtherUserEmail()}</h2>
              <div className="flex items-center text-xs text-muted-foreground">
                {otherUser?.isOnline ? (
                  <>
                    <Circle className="h-2 w-2 fill-green-500 text-green-500 mr-1" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Last seen {formatLastSeen(otherUser?.lastSeen)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <button 
              className="flex items-center px-2 py-1 text-sm rounded-md hover:bg-muted"
              onClick={fetchMessages}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-muted/30">
          <div className="flex justify-center bg-grey p-4 mb-4">
            <p className="text-muted-foreground text-black font-bold text-[8px] md:text-[10px] flex items-center">
              <OctagonAlert className="h-4 w-4 mr-2" />
              Trusttrade Moderators have a green checkmark. Be careful with scammers!
            </p>
          </div>
          
          {loading && messages.length === 0 ? (
            <div className="flex flex-col justify-center h-full">
              <MessageSkeleton />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
              <p className="text-muted-foreground text-sm mb-4 text-center max-w-md">
                There was a problem connecting to the chat service. This might be due to a missing API route or server issue.
              </p>
              <div className="flex gap-2">
                <button 
                  className="flex items-center px-3 py-2 border rounded-md hover:bg-muted"
                  onClick={fetchMessages}
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
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageCircle className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start the conversation by sending a message below.</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                // Determine if this message is from the current user
                const isCurrentUser = message.senderId === session?.user?.id;
                
                // Check if we need to show a date separator
                const showDateSeparator = index === 0 || 
                  isDifferentDay(message.createdAt, messages[index - 1]?.createdAt);
                
                return (
                  <React.Fragment key={message.id || `msg-${index}`}>
                    {/* Date separator */}
                    {showDateSeparator && (
                      <div className="flex justify-center my-4">
                        <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                          {formatMessageDate(message.createdAt)}
                        </div>
                      </div>
                    )}
                    
                    {/* Message */}
                    <div
                      className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[70%] p-3 rounded-lg ${isCurrentUser
                          ? 'bg-primary text-primary-foreground rounded-tr-none' 
                          : 'bg-card dark:bg-card/80 rounded-tl-none'
                        }`}
                      >
                        {message.content.includes('[IMAGE]') ? (
                          <>
                            {/* Display the image */}
                            <div className="mb-2">
                              <Image
                                src={message.content.split('[IMAGE]')[1].split('\n')[0]}
                                alt="Shared image"
                                width={250}
                                height={250}
                                className="rounded-md max-w-full object-cover"
                                style={{ maxHeight: '250px' }}
                              />
                            </div>

                            {/* Extract and display text part if it exists, but not the image URL */}
                            {message.content.includes('\n') && message.content.split('\n').slice(1).join('\n').trim() && (
                              <p className="text-sm mt-2">
                                {message.content.split('\n').slice(1).join('\n').replace('[READ]', '')}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-sm">{message.content.replace('[READ]', '')}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1 flex justify-between items-center">
                          <span>
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isCurrentUser && (
                            <span className="text-[10px] ml-2">
                              {message.content.includes("[READ]") ? 'Read' : 'Sent'}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        <div className="p-4 border-t bg-background">
          <form onSubmit={sendMessage} className="flex flex-col gap-2">
            {imagePreview && (
              <div className="relative mb-2 inline-block">
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Selected image"
                    className="h-32 rounded-md object-cover border border-muted"
                  />
                  <button
                    type="button"
                    onClick={removeSelectedImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={selectedImage ? "Add a message with your image..." : "Type your message..."}
                className="min-h-[60px] max-h-[120px] flex-1 h-[10px] w-[calc(100%-120px)] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
              <div className="flex flex-row gap-2 self-end">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button 
                  type="button"
                  className="h-10 w-10 flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
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
                  className="h-10 w-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center"
                  disabled={isUploading || isSending}
                >
                  {isUploading || isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-2 text-xs text-muted-foreground flex items-center justify-end">
            <span className="flex items-center">
              {error ? (
                <>
                  <Circle className="h-2 w-2 fill-red-500 text-red-500 mr-1" />
                  Connection error - Trying to reconnect
                </>
              ) : isSending ? (
                <>
                  <Loader2 className="h-2 w-2 animate-spin mr-1" />
                  Sending message...
                </>
              ) : loading ? (
                <>
                  <Loader2 className="h-2 w-2 animate-spin mr-1" />
                  Refreshing messages...
                </>
              ) : (
                <>
                  <Circle className="h-2 w-2 fill-amber-500 text-amber-500 mr-1" />
                  Click refresh to update messages
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 