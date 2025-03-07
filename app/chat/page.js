'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Card } from '@/app/components/card';
import { Button } from '@/app/components/button';
import { Avatar } from '@/app/components/avatar';
import { Loader2 } from 'lucide-react';
import { MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ChatIndexPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (status !== 'authenticated') return;

      try {
        setLoading(true);
        // Fetch orders where the user is either buyer or seller
        const response = await axios.get('/api/orders');
        setOrders(response.data.orders);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.error || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [status]);

  const navigateToChat = (orderId) => {
    router.push(`/chat/${orderId}`);
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DISPUTED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Conversations</h1>
        <Button className="text-[10px]" variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
          Browse Listings
        </Button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </div>
      ) : error ? (
        <Card className="p-6 text-center bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
          <p className="text-muted-foreground mb-6">You don't have any active conversations yet.</p>
          <Button onClick={() => router.push('/dashboard')}>Browse Listings</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => {
            const lastMessage = order.chatMessages?.[0];
            const isCurrentUserBuyer = session.user.id === order.buyerId;
            const otherUserEmail = isCurrentUserBuyer 
              ? order.listing.seller.email 
              : order.buyer.email;
            
            return (
              <Card 
                key={order.id} 
                className="overflow-hidden hover:shadow-md transition-shadow"
                onClick={() => navigateToChat(order.id)}
              >
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Avatar className="mr-3" />
                      <div>
                        <h3 className="font-medium">{otherUserEmail}</h3>
                        <p className="text-xs text-muted-foreground">
                          {isCurrentUserBuyer ? 'Seller' : 'Buyer'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className="text-xs ml-1">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    Order #{order.id.slice(0, 8)} • {order.listing.username}
                  </p>
                </div>
                
                <div className="p-4 bg-muted/30">
                  {lastMessage ? (
                    <div>
                      <p className="text-sm font-medium mb-1">Last message:</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {lastMessage.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(lastMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No messages yet</p>
                  )}
                </div>
                
                <div className="p-3 bg-background flex justify-end">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Open Chat
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 