import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { StreamChat } from 'stream-chat'

/**
 * Hook to get unread message count for a user, optionally filtered by orderId
 * @param {string} orderId - Optional order ID to filter messages
 * @returns {Object} - { count, isLoading, error, refetch }
 */
export function useUnreadMessageCount(orderId = null) {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    let client
    let channel
    
    const initializeUnreadCount = async () => {
      if (!session?.user?.id) {
        setIsLoading(false)
        return
      }

      try {
        // Initialize Stream client
        client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY)
        
        // Connect user
        const response = await client.connectUser(
          {
            id: session.user.id,
            name: session.user.name || session.user.email,
            image: session.user.image,
          },
          client.devToken(session.user.id)
        )

        // Set initial unread count
        if (orderId) {
          // If orderId is provided, get unread count for specific channel
          channel = client.channel('messaging', `order-${orderId}`)
          await channel.watch()
          setUnreadCount(channel.state.unreadCount || 0)
        } else {
          // Get total unread count across all channels
          setUnreadCount(response.me.total_unread_count || 0)
        }

        // Listen for unread count updates
        client.on(event => {
          if (event.total_unread_count !== undefined) {
            if (!orderId) {
              setUnreadCount(event.total_unread_count)
            }
          }
          
          // For specific channel updates
          if (orderId && event.channel?.id === `order-${orderId}`) {
            if (event.type === 'message.new') {
              setUnreadCount(prev => prev + 1)
            } else if (event.type === 'message.read') {
              setUnreadCount(0)
            }
          }
        })

        setIsLoading(false)
      } catch (err) {
        console.error('Error initializing unread count:', err)
        setError(err)
        setIsLoading(false)
      }
    }

    initializeUnreadCount()

    // Cleanup
    return () => {
      if (channel) {
        channel.stopWatching()
      }
      if (client) {
        client.disconnectUser()
      }
    }
  }, [session, orderId])

  const refetch = async () => {
    try {
      setIsLoading(true)
      const client = StreamChat.getInstance(process.env.NEXT_PUBLIC_STREAM_KEY)
      const response = await client.getUnreadCount(session?.user?.id)
      
      if (orderId) {
        const channel = client.channel('messaging', `order-${orderId}`)
        await channel.watch()
        setUnreadCount(channel.state.unreadCount || 0)
      } else {
        setUnreadCount(response.total_unread_count || 0)
      }
      
      setIsLoading(false)
    } catch (err) {
      console.error('Error refetching unread count:', err)
      setError(err)
      setIsLoading(false)
    }
  }

  return {
    count: unreadCount,
    isLoading,
    error,
    refetch
  }
} 