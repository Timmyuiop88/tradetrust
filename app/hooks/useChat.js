import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEdgeStore } from '@/app/lib/edgeStore';
import { toast } from 'sonner';

/**
 * Custom hook for chat functionality
 * @param {Object} options - Hook options
 * @param {string} options.orderId - Order ID
 * @param {number} options.refetchInterval - Interval for refetching messages in ms
 * @param {number} options.staleTime - Stale time for cache in ms
 * @param {number} options.cacheTime - Cache time in ms
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @param {boolean} options.enabled - Whether the query is enabled
 * @returns {Object} - Chat functionality
 */
export function useChat({
  orderId,
  refetchInterval = 5000,
  staleTime = 10000,
  cacheTime = 1000 * 60 * 5, // 5 minutes
  onSuccess,
  onError,
  enabled = true,
} = {}) {
  const { data: session } = useSession();
  const { edgestore } = useEdgeStore();
  const queryClient = useQueryClient();
  
  // Update user's last seen status
  const updateLastSeen = useCallback(async () => {
    if (!session) return;
    
    try {
      await fetch('/api/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastSeen: new Date().toISOString() }),
      });
    } catch (err) {
      console.error('Error updating last seen status:', err);
    }
  }, [session]);

  // Use React Query to fetch messages with optimized settings
  const messagesQuery = useQuery({
    queryKey: ['chat', orderId],
    queryFn: async ({ signal }) => {
      if (!session || !orderId) throw new Error('Missing session or order ID');
      
      // Add cache-busting parameter and signal for abort controller
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/chat/${orderId}?t=${timestamp}`, { signal });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch messages: ${response.status}`);
      }
      
      const data = await response.json();
      updateLastSeen();
      return data;
    },
    enabled: !!session && !!orderId && enabled,
    refetchInterval,
    staleTime,
    gcTime: cacheTime,
    onSuccess,
    onError: (error) => {
      console.error('Error fetching messages:', error);
      if (onError) onError(error);
    },
    retry: (failureCount, error) => {
      // Don't retry on 404 or 403 errors
      if (error.message.includes('404') || error.message.includes('403')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });

  // Image upload mutation with better error handling
  const uploadImageMutation = useMutation({
    mutationFn: async (file) => {
      if (!file || !edgestore) {
        throw new Error('No file or EdgeStore not available');
      }
      
      try {
        const res = await edgestore.publicFiles.upload({
          file,
          options: { 
            temporary: false,
            maxFileSize: 5 * 1024 * 1024, // 5MB limit
          },
          onProgressChange: (progress) => {
            // You could use this to show upload progress
            console.log(`Upload progress: ${progress}%`);
          },
        });
        
        return res.url;
      } catch (error) {
        console.error('EdgeStore upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
      }
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    },
  });

  // Send message mutation with better error handling and retry logic
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      if (!session || !orderId || !messageData.content) {
        throw new Error('Missing required data to send message');
      }
      
      // Implement retry logic
      const maxRetries = 3;
      let retries = 0;
      let lastError = null;
      
      while (retries < maxRetries) {
        try {
          const response = await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              content: messageData.content,
              disputeId: messageData.disputeId || null,
              isModOnly: messageData.isModOnly || false,
              recipientId: messageData.recipientId || null,
            }),
          });
          
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || `Failed to send message: ${response.status}`);
          }
          
          updateLastSeen();
          const responseData = await response.json();
          return responseData;
        } catch (error) {
          lastError = error;
          retries++;
          
          // Don't retry for certain errors
          if (error.message.includes('not authorized') || 
              error.message.includes('not found')) {
            break;
          }
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
        }
      }
      
      // If we've exhausted retries, throw the last error
      throw lastError || new Error('Failed to send message after multiple attempts');
    },
    onSuccess: () => {
      // Invalidate and refetch messages after sending
      queryClient.invalidateQueries({ queryKey: ['chat', orderId] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    },
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!session || !orderId) {
        throw new Error('Missing session or order ID');
      }
      
      const response = await fetch('/api/chat/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to mark messages as read');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Update the cache to mark messages as read
      queryClient.setQueryData(['chat', orderId], (oldData) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          messages: oldData.messages.map(msg => ({
            ...msg,
            isRead: msg.recipientId === session?.user?.id ? true : msg.isRead
          }))
        };
      });
    }
  });

  return {
    messages: messagesQuery,
    order: messagesQuery.data?.order || null,
    dispute: messagesQuery.data?.dispute || null,
    sendMessage: sendMessageMutation,
    uploadImage: uploadImageMutation.mutateAsync,
    uploadImageStatus: uploadImageMutation.status,
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
  };
} 