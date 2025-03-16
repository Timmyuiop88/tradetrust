"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { ArrowLeft, Bell, Settings, Loader2, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"

async function fetchNotifications() {
  const response = await fetch('/api/notifications')
  if (!response.ok) {
    throw new Error('Failed to fetch notifications')
  }
  return response.json()
}

export default function NotificationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const notifications = data?.notifications || []

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-amber-500" />
      case 'info':
        return <Info className="h-8 w-8 text-blue-500" />
      default:
        return <Bell className="h-8 w-8 text-muted-foreground" />
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true
    return notification.type === activeTab
  })

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Notifications</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-8 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Notifications</h1>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <h2 className="text-lg font-medium mb-2">Error Loading Notifications</h2>
            <p className="text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Notifications</h1>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={() => router.push("/dashboard/settings")}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Stay updated with your account activity</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="success">Success</TabsTrigger>
              <TabsTrigger value="warning">Warnings</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h3 className="font-medium mb-1">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    You're all caught up! Check back later for updates.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                    >
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium mb-1">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 