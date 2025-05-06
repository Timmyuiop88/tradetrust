import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { StreamChat } from 'stream-chat'
import { useStreamChat } from './useStreamChat'

/**
 * Hook to get unread message count for a user, optionally filtered by orderId
 * @param {string} orderId - Optional order ID to filter messages
 * @returns {Object} - { count, isLoading, error, refetch }
 */
export function useUnreadMessageCount(orderId = null) {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const { client, channel, loading: chatLoading } = useStreamChat(orderId)

  useEffect(() => {
    if (!client || !channel) return

    const handleEvent = (event) => {
      if (event.total_unread_count !== undefined && !orderId) {
        setUnreadCount(event.total_unread_count)
      }
      
      if (orderId && event.channel?.id === `order-${orderId}`) {
        if (event.type === 'message.new') {
          setUnreadCount(prev => prev + 1)
        } else if (event.type === 'message.read') {
          setUnreadCount(0)
        }
      }
    }

    // Get initial unread count
    const getUnreadCount = async () => {
      try {
        if (orderId) {
          setUnreadCount(channel.state.unreadCount || 0)
        } else {
          const response = await client.getUnreadCount()
          setUnreadCount(response.total_unread_count || 0)
        }
      } catch (err) {
        console.error('Error getting unread count:', err)
      }
    }

    getUnreadCount()
    client.on('notification.message_new', handleEvent)
    client.on('notification.mark_read', handleEvent)

    return () => {
      client.off('notification.message_new', handleEvent)
      client.off('notification.mark_read', handleEvent)
    }
  }, [client, channel, orderId])

  const refetch = async () => {
    try {
      const response = await client.getUnreadCount()
      
      if (orderId) {
        setUnreadCount(channel.state.unreadCount || 0)
      } else {
        setUnreadCount(response.total_unread_count || 0)
      }
    } catch (err) {
      console.error('Error refetching unread count:', err)
    }
  }

  return {
    count: unreadCount,
    isLoading: chatLoading,
    refetch
  }
} 