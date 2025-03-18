"use client"

import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'
import { Switch } from '@/app/components/switch'
import { Button } from '@/app/components/button'
import { Bell, BellOff, AlertTriangle, Info, ArrowLeft, Share, PlusSquare, Home } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import Image from 'next/image'

export default function NotificationSettings() {
  const { isSupported, permission, subscription, subscribe } = usePushNotifications()
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  
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
  
  // iOS-specific PWA installation guide
  if (showIOSGuide) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1" 
              onClick={() => setShowIOSGuide(false)}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <CardTitle className="text-lg font-medium text-center">
              Add to Home Screen
            </CardTitle>
            <div className="w-[70px]"></div> {/* Spacer for balance */}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-sm text-muted-foreground">
            Follow these steps to install TrustTrade as an app on your home screen and enable notifications
          </p>
          
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <Share className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Step 1: Tap the Share button</h3>
              <div className="bg-muted/30 rounded-lg p-4 w-full max-w-[280px] flex flex-col items-center">
                <Image 
                  src="/images/ios-share.png" 
                  width={200} 
                  height={120} 
                  alt="iOS share button location"
                  className="rounded-md mb-2"
                />
                <p className="text-xs text-center text-muted-foreground">
                  Tap the share icon in Safari's bottom menu bar
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <PlusSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Step 2: Add to Home Screen</h3>
              <div className="bg-muted/30 rounded-lg p-4 w-full max-w-[280px] flex flex-col items-center">
                <Image 
                  src="/images/ios-add-home.png" 
                  width={200} 
                  height={150} 
                  alt="Add to Home Screen option" 
                  className="rounded-md mb-2"
                />
                <p className="text-xs text-center text-muted-foreground">
                  Scroll down and tap "Add to Home Screen"
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 mb-3">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Step 3: Confirm and Launch</h3>
              <div className="bg-muted/30 rounded-lg p-4 w-full max-w-[280px] flex flex-col items-center">
                <Image 
                  src="/images/ios-confirm.png" 
                  width={200} 
                  height={150} 
                  alt="Confirm adding to home screen" 
                  className="rounded-md mb-2"
                />
                <p className="text-xs text-center text-muted-foreground">
                  Tap "Add" in the top right, then open the app from your home screen
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-xs text-center text-muted-foreground max-w-[90%]">
            Opening TrustTrade from your home screen will provide a full-screen app experience and enable push notifications
          </p>
        </CardFooter>
      </Card>
    )
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
        <CardContent className="space-y-4">
          {isIOS ? (
            <>
              <p className="text-sm text-muted-foreground">
                Push notifications require installing TrustTrade as an app on your iOS device.
              </p>
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setShowIOSGuide(true)}
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
        <CardTitle className="text-lg font-medium">Order Notifications</CardTitle>
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