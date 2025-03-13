import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEdgeStore } from '@/app/lib/edgeStore';
import { toast } from 'sonner';

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

  // Use React Query to fetch messages
  const messagesQuery = useQuery({
    queryKey: ['chat', orderId],
    queryFn: async () => {
      if (!session || !orderId) throw new Error('Missing session or order ID');
      
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/chat/${orderId}?t=${timestamp}`);
      
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
  });

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file) => {
      if (!file || !edgestore) {
        throw new Error('No file or EdgeStore not available');
      }
      
      const res = await edgestore.publicFiles.upload({
        file,
        options: { temporary: false },
      });
      
      return res.url;
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      if (!session || !orderId || !messageData.content) {
        throw new Error('Missing required data to send message');
      }
      
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          content: messageData.content,
          isDisputeMessage: messageData.isDisputeMessage || false,
          disputeId: messageData.disputeId || null,
          isModOnly: messageData.isModOnly || false,
          recipientId: messageData.recipientId || null,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send message');
      }
      
      updateLastSeen();
      const responseData = await response.json();
      return responseData;
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

  return {
    messages: messagesQuery,
    order: messagesQuery.data?.order || null,
    sendMessage: sendMessageMutation,
    uploadImage: uploadImageMutation.mutateAsync,
    uploadImageStatus: uploadImageMutation.status,
  };
} 