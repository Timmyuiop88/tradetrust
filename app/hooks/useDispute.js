import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useDispute(disputeId) {
  return useQuery({
    queryKey: ['dispute', disputeId],
    queryFn: async () => {
      const response = await fetch(`/api/disputes/${disputeId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch dispute');
      }
      return response.json();
    },
    staleTime: 30000, // 30 seconds
    retry: 2,
    onError: (error) => {
      toast.error(error.message || 'Failed to fetch dispute details');
    }
  });
} 