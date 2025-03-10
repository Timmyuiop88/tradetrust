'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useChat } from '@/app/hooks/useChat';
import { Button } from '@/app/components/button';
import { Textarea } from '@/app/components/textarea';
import { Card } from '@/app/components/card';
import { Avatar } from '@/app/components/avatar';
import { Loader2, OctagonAlert } from 'lucide-react';
import { MessageCircle, Send, AlertCircle, ArrowLeft, RefreshCw, Circle, Clock, MessageCircleWarningIcon, ExclamationTriangle, Camera, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useEdgeStore } from '@/app/lib/edgeStore';
import Image from 'next/image';

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

export default function ChatPage() {
  const { orderId } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const { edgestore } = useEdgeStore();
    const [isSending, setIsSending] = useState(false);
  
  const {
    messages,
    loading,
    error,
    sendMessage,
    isConnected,
    isWebSocketAvailable,
    refreshMessages,
        otherUserStatus,
        otherUserId,
        formatLastSeen,
        markMessagesAsRead,
  } = useChat(orderId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

    // Polling mechanism to refresh messages every few seconds
    useEffect(() => {
        // Initial fetch once
        refreshMessages();
        
        // Temporarily disable polling to troubleshoot the error
        /*
        const intervalId = setInterval(() => {
            // Only refresh if not currently loading and no error
            if (!loading && !error) {
                refreshMessages();
            } else if (error) {
                // If there's an error, try again after a longer delay
                console.log('Delaying refresh due to error:', error);
            }
        }, 8000);
        
        // Clean up on unmount
        return () => clearInterval(intervalId);
        */
    }, [refreshMessages]);

    // Add this effect to log messages and session when they change
    useEffect(() => {
        console.log('Current session:', session);
        console.log('Messages state in component:', messages);
        console.log('Other user status:', otherUserStatus);

        if (messages && messages.length > 0) {
            console.log('Messages with missing sender:',
                messages.filter(msg => !msg.sender).map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    senderId: msg.senderId,
                    createdAt: msg.createdAt
                }))
            );
        }
    }, [messages, session, otherUserStatus]);

    // Mark messages as read when the component is visible
    useEffect(() => {
        if (messages.length > 0 && !loading && !error) {
            markMessagesAsRead();
        }
    }, [messages, loading, error, markMessagesAsRead]);

  const handleSendMessage = async (e) => {
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

                success = await sendMessage(messageContent);

                // Clean up
                setSelectedImage(null);
                if (imagePreview) {
                    URL.revokeObjectURL(imagePreview);
                    setImagePreview('');
                }
            } else {
                // Just send the text message
                success = await sendMessage(newMessage);
            }
    
    if (success) {
      setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsUploading(false);
            setIsSending(false); // Reset sending state
        }
    };

    // Get the other user's email from messages if available
    const getOtherUserEmail = () => {
        if (!messages || !messages.length || !session) return 'Other User';

        const otherUserMessage = messages.find(msg => msg.senderId !== session.user.id && msg.sender);
        return otherUserMessage?.sender?.email || 'Other User';
    };

    // Redirect to login page if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Show loading state while checking authentication
    if (status === 'loading' || status === 'unauthenticated') {
        return (
            <MessageSkeleton />
        );
    }

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

    return (
        <div className="flex flex-col h-[85vh] md:h-screen">

            <Card className="flex-1 flex flex-col overflow-hidden border-0 rounded-none">
                <div className="p-4 border-b flex items-center justify-between bg-background">
          <div className="flex items-center">

                        <div onClick={() => router.back()} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground cursor-pointer pr-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
          </div>

                        <div>
                            <h2 className="font-medium">{getOtherUserEmail()}</h2>
                            <div className="flex items-center text-xs text-muted-foreground">
                                {otherUserStatus.online ? (
                                    <>
                                        <Circle className="h-2 w-2 fill-green-500 text-green-500 mr-1" />
                                        <span>Online</span>
                </>
              ) : (
                <>
                                        <Clock className="h-3 w-3 mr-1" />
                                        <span>Last seen {formatLastSeen(otherUserStatus.lastSeen)}</span>
                </>
              )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
            <Button 
                            variant="ghost"
              size="sm"
                            onClick={() => {
                                // Manual refresh with visual feedback
                                refreshMessages();
                            }}
              className="flex items-center"
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
            </Button>
          </div>
        </div>
        
                <div className="flex-1 overflow-y-auto p-4 bg-muted/30">
                    <div className="flex justify-center bg-grey p-4 mb-4">
                        <p className="text-muted-foreground text-black font-bold text-[8px] md:text-[10px] flex items-center"><OctagonAlert className="h-4 w-4 mr-2" />Trusttrade Moderators have a green checkmark. Be careful with scammers!</p>
                    </div>
          {loading ? (
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
              <Button variant="outline" onClick={refreshMessages}>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
                                <Button variant="outline" onClick={() => router.back()}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Go Back
                                </Button>
                            </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageCircle className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start the conversation by sending a message below.</p>
            </div>
                    ) : error && error.includes('WebSocket') && messages.length > 0 ? (
                        <>
                            {messages.map((message, index) => {
                                // Render messages as normal
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
                            <div className="mt-4">
                                <MessageSkeleton />
                            </div>
                        </>
          ) : (
            <>
                            {messages.map((message, index) => {
                                // Determine if this message is from the current user
                                // Use senderId directly from the message object instead of relying on message.sender.id
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
                    <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
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
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={selectedImage ? "Add a message with your image..." : "Type your message..."}
                                className="min-h-[60px] max-h-[120px] flex-1 h-[10px] w-[calc(100%-120px)]"
                                disabled={isSending}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                                        e.preventDefault();
                                        handleSendMessage(e);
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
            <Button 
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading || !!selectedImage || isSending}
                                    className="h-10 w-10 flex items-center justify-center"
                                >
                                    {isUploading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Camera className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button type="submit" className="h-10 w-10" size="icon" disabled={isUploading || isSending}>
                                    {isUploading || isSending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
            </Button>
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
      </Card>
    </div>
  );
} 