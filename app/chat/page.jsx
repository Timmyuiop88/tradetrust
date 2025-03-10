'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Plus, X, Loader2, AlertCircle, Search, Users } from 'lucide-react';

export default function ChatOverview() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUserId, setNewUserId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      fetchConversations();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chat/conversations');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch conversations');
      }
      
      const data = await response.json();
      setConversations(data.conversations);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = async (e) => {
    e.preventDefault();
    
    if (!newUserId.trim()) {
      setError('Please enter a valid user ID');
      return;
    }
    
    try {
      // Validate if user exists
      const response = await fetch(`/api/users/check?userId=${newUserId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'User not found');
      }
      
      // Redirect to chat with this user
      router.push(`/chat/${newUserId}`);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error starting new chat:', err);
      setError(err.message);
    }
  };

  // Filter conversations based on search query
  const filteredConversations = searchQuery
    ? conversations.filter(conv => 
        conv.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
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
      ) : filteredConversations.length > 0 ? (
        <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
          <ul className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <li key={conversation.userId} className="hover:bg-muted/50 transition-colors">
                <Link href={`/chat/${conversation.userId}`}>
                  <div className="px-6 py-4 flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 flex-shrink-0">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {conversation.email}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      {conversation.unreadCount > 0 ? (
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          {conversation.unreadCount}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          Read
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No conversations yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Start a new conversation by clicking the plus button below
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Start a conversation
          </button>
        </div>
      )}
      
      {/* Floating action button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Modal for starting a new chat */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-semibold mb-4">Start a new conversation</h2>
            
            <form onSubmit={startNewChat}>
              <div className="mb-4">
                <label htmlFor="userId" className="block text-sm font-medium mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  id="userId"
                  placeholder="Enter user ID"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the ID of the user you want to chat with
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-input rounded-md text-sm font-medium bg-background hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Start Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 