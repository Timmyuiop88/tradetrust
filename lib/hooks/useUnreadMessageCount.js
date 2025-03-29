import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

/**
 * Hook to get unread message count for a user, optionally filtered by orderId
 * @param {string} orderId - Optional order ID to filter messages
 * @returns {Object} - { count, isLoading, error, refetch }
 */
export function useUnreadMessageCount(orderId = null) {
  const { data: session } = useSession()
  
  const fetchUnreadCount = async () => {
    if (!session?.user?.id) {
      return 0
    }
    
    const url = orderId 
      ? `/api/messages/unread-count?orderId=${orderId}`
      : '/api/messages/unread-count'
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch unread message count')
    }
    
    const data = await response.json()
    return data.count || 0
  }

  const queryKey = orderId 
    ? ['unreadMessageCount', session?.user?.id, orderId] 
    : ['unreadMessageCount', session?.user?.id]
  
  const { data: count = 0, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: fetchUnreadCount,
    enabled: !!session?.user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 10000, // Consider data stale after 10 seconds
  })

  return { 
    count, 
    isLoading, 
    error, 
    refetch 
  }
} 