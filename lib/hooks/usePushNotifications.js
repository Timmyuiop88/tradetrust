import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function usePushNotifications() {
  const { data: session } = useSession()
  const [permission, setPermission] = useState('default')
  const [subscription, setSubscription] = useState(null)
  const [isSupported, setIsSupported] = useState(false)
  
  useEffect(() => {
    // Check if push notifications are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setIsSupported(false)
      return
    }
    
    setIsSupported(true)
    setPermission(Notification.permission)
    
    // Register service worker if not already registered
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(sub => {
          setSubscription(sub)
        })
      })
    }
  }, [])
  
  const subscribe = async () => {
    if (!session?.user?.id) return null
    
    try {
      // Request permission
      const permission = await Notification.requestPermission()
      setPermission(permission)
      
      if (permission !== 'granted') return null
      
      // Register service worker if needed
      if (!navigator.serviceWorker.controller) {
        await navigator.serviceWorker.register('/service-worker.js')
      }
      
      const registration = await navigator.serviceWorker.ready
      
      // Get existing subscription or create new one
      let sub = await registration.pushManager.getSubscription()
      
      if (!sub) {
        // Create new subscription
        const response = await fetch('/api/push/vapid-key')
        const { publicKey } = await response.json()
        
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey
        })
      }
      
      // Save subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sub)
      })
      
      setSubscription(sub)
      return sub
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      return null
    }
  }
  
  return {
    isSupported,
    permission,
    subscription,
    subscribe
  }
} 