"use client"

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "./sheet"
import { Bell, ShieldCheck, AlertCircle } from "lucide-react"
import { Button } from "./button"
import { cn } from "../lib/utils"

const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    title: "Account Purchase Successful",
    message: "Instagram account transfer completed",
    time: "2 minutes ago",
    type: "success",
  },
  {
    id: 2,
    title: "New Message",
    message: "You have a new message from seller",
    time: "1 hour ago",
    type: "info",
  },
  // Add more notifications...
]

export function NotificationsSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          {DEMO_NOTIFICATIONS.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start space-x-4 rounded-lg p-3 hover:bg-muted/50 transition-colors"
            >
              <div className={cn(
                "mt-0.5 rounded-full p-1",
                notification.type === "success" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
              )}>
                {notification.type === "success" ? (
                  <ShieldCheck className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
                <p className="text-xs text-muted-foreground">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
} 