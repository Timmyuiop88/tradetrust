"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'
import { useTheme } from 'next-themes'
import { Switch } from '@/app/components/switch'
import { Button } from '@/app/components/button'
import { Bell, BellOff, AlertTriangle, Info, Moon, Sun } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"

export default function NotificationSettings() {
  const router = useRouter()
  const { isSupported, permission, subscription, subscribe } = usePushNotifications()
  const { theme, setTheme } = useTheme()
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  
  useEffect(() => {
    // Check if user is on iOS device
    const userAgent = window.navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(userAgent))
  }, [])
  
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Notifications Not Supported
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="gap-1"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isIOS ? (
            <>
              <p className="text-sm text-muted-foreground">
                Push notifications require installing TrustTrade as an app on your iOS device.
              </p>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => router.push('/dashboard/settings/ios-guide')}
              >
                <Info className="h-4 w-4" />
                View iOS Installation Guide
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Push notifications are not supported in your current browser. 
              Try using a modern browser like Chrome, Firefox, or Edge.
            </p>
          )}
        </CardContent>
      </Card>
    )
  }
  
  if (permission === 'denied') {
    return (
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <BellOff className="h-5 w-5 text-orange-500" />
              Notifications Blocked
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="gap-1"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
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
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Settings
          </CardTitle>
          
        </div>
        <CardDescription>
          Get notified about transactions, orders, and messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Push Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Receive notifications when you're not on the site
            </p>
          </div>
          {permission === 'denied' ? (
            <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
              <BellOff className="h-4 w-4" />
              Blocked by Browser
            </Button>
          ) : (
            <Button
              size="sm"
              variant={subscription ? "outline" : "default"}
              className="flex items-center gap-2"
              onClick={handleSubscribe}
              disabled={isSubscribing}
            >
              {isSubscribing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Subscribing...
                </>
              ) : subscription ? (
                <>
                  <Bell className="h-4 w-4" />
                  Notifications Enabled
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4" />
                  Enable Notifications
                </>
              )}
            </Button>
          )}
        </div>
        
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