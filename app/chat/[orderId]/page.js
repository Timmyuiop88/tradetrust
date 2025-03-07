'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useChat } from '@/app/hooks/useChat';
import { Button } from '@/app/components/button';
import { Textarea } from '@/app/components/textarea';
import { Card } from '@/app/components/card';
import { Avatar } from '@/app/components/avatar';
import { Loader2, OctagonAlert } from 'lucide-react';
import { MessageCircle, Send, AlertCircle, ArrowLeft, RefreshCw, Circle, Clock, MessageCircleWarningIcon, ExclamationTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
    const { orderId } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

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
    } = useChat(orderId);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        const success = await sendMessage(newMessage);

        if (success) {
            setNewMessage('');
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
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[85vh] md:h-screen">
            <div className="p-4 bg-background">
                <div onClick={() => router.back()} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-0 rounded-none">
                <div className="p-4 border-b flex items-center justify-between bg-background">
                    <div className="flex items-center">
                        <Avatar className="mr-3 h-10 w-10" />
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
                            onClick={refreshMessages}
                            className="flex items-center"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-muted/30">
                    <div className="flex justify-center bg-grey p-4 mb-4">
                        <p className="text-muted-foreground text-black font-bold text-[8px] md:text-[10px] flex items-center"><OctagonAlert className="h-4 w-4 mr-2" />Trusttrade Moderators have a green checkmark. Be careful with scammers!</p>
                    </div>
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                            <Button variant="outline" onClick={refreshMessages}>
                                Try Again
                            </Button>
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
                                // Use senderId directly from the message object instead of relying on message.sender.id
                                const isCurrentUser = message.senderId === session?.user?.id;

                                return (
                                    <div
                                        key={message.id || `msg-${index}`}
                                        className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!isCurrentUser && (
                                            <Avatar className="mr-2 h-8 w-8" />
                                        )}
                                        <div
                                            className={`max-w-[70%] p-3 rounded-lg ${isCurrentUser
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-card dark:bg-card/80 rounded-tl-none'
                                                }`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {isCurrentUser && (
                                            <Avatar className="ml-2 h-8 w-8" />
                                        )}
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                <div className="p-4 border-t bg-background">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="min-h-[60px] max-h-[120px] flex-1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        <Button type="submit" className="self-end">
                            <Send className="h-4 w-4 mr-2" />
                            Send
                        </Button>
                    </form>

                    <div className="mt-2 text-xs text-muted-foreground flex items-center justify-end">
                        {isConnected ? (
                            <span className="flex items-center">
                                <Circle className="h-2 w-2 fill-green-500 text-green-500 mr-1" />
                                Connected for real-time updates
                            </span>
                        ) : (
                            <span className="flex items-center">
                                <Circle className="h-2 w-2 fill-amber-500 text-amber-500 mr-1" />
                                Using manual refresh
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
} 