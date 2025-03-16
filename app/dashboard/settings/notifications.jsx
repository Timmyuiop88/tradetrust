"use client"

import { useState } from 'react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'
import { Switch } from '@/app/components/switch'
import { Button } from '@/app/components/button'
import { Bell, BellOff, AlertTriangle, Info } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/card"

export default function NotificationSettings() {
  const { isSupported, permission, subscription, subscribe } = usePushNotifications()
  const [isSubscribing, setIsSubscribing] = useState(false)
  
  const handleSubscribe = async () => {
    setIsSubscribing(true)
    try {
      await subscribe()
    } finally {
      setIsSubscribing(false)
    }
  }
  
  if (!isSupported) {
    return (
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Push notifications are not supported in your current browser. 
            Try using a modern browser like Chrome, Firefox, or Edge.
          </p>
        </CardContent>
      </Card>
    )
  }
  
  if (permission === 'denied') {
    return (
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <BellOff className="h-5 w-5 text-orange-500" />
            Notifications Blocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You've blocked notifications in your browser settings. To enable notifications:
          </p>
          <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
            <li>Click the lock/info icon in your browser's address bar</li>
            <li>Find "Notifications" permissions</li>
            <li>Change the setting to "Allow"</li>
            <li>Refresh this page</li>
          </ol>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Order Notifications</CardTitle>
          {subscription ? (
            <div className="flex items-center gap-2 text-sm text-green-500">
              <Bell className="h-4 w-4" />
              <span>Enabled</span>
            </div>
          ) : (
            <Button 
              onClick={handleSubscribe} 
              variant="outline" 
              size="sm"
              disabled={isSubscribing}
            >
              {isSubscribing ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Enabling...
                </>
              ) : (
                <>Enable Notifications</>
              )}
            </Button>
          )}
        </div>
        <CardDescription>
          Get real-time alerts about your orders and account activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="new-orders" checked={!!subscription} disabled />
              <label htmlFor="new-orders" className="text-sm font-medium">
                New orders (when selling)
              </label>
            </div>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="account-details" checked={!!subscription} disabled />
              <label htmlFor="account-details" className="text-sm font-medium">
                Account details provided (when buying)
              </label>
            </div>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="order-completed" checked={!!subscription} disabled />
              <label htmlFor="order-completed" className="text-sm font-medium">
                Order completed
              </label>
            </div>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
        <p>
          You'll receive notifications even when you're not actively using the site.
          {!subscription && " Enable notifications above to get started."}
        </p>
      </CardFooter>
    </Card>
  )
} 