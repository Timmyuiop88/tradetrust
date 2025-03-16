// app/components/notification-bell.jsx
"use client"

import { usePushNotifications } from '@/lib/hooks/usePushNotifications'
import { Bell, BellOff } from 'lucide-react'
import { Button } from '@/app/components/button'
import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/tooltip'

export function NotificationBell() {
  const { isSupported, permission, subscription, subscribe } = usePushNotifications()
  const [isSubscribing, setIsSubscribing] = useState(false)
  
  const handleSubscribe = async () => {
    if (!isSupported) return
    
    setIsSubscribing(true)
    try {
      await subscribe()
    } finally {
      setIsSubscribing(false)
    }
  }
  
  if (!isSupported) {
    return null
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
            onClick={handleSubscribe}
            disabled={isSubscribing || permission === 'denied'}
          >
            {subscription ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            
            {isSubscribing && (
              <span className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {subscription 
            ? "Notifications enabled" 
            : permission === 'denied'
              ? "Notifications blocked in browser settings"
              : "Enable order notifications"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}