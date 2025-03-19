"use client"

import { useState, useEffect } from "react"
import { Button } from "./button"
import { X } from "lucide-react"
import { cn } from "@/app/lib/utils"

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Check if user has already responded to cookie consent
    const consentGiven = localStorage.getItem("cookie-consent")
    
    // If no consent record is found, show the banner
    if (!consentGiven) {
      // Small delay to prevent the banner from showing immediately on page load
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [])
  
  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "all")
    setIsVisible(false)
  }
  
  const acceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential")
    setIsVisible(false)
  }
  
  if (!isVisible) return null
  
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg transition-transform duration-300",
      "transform translate-y-0"
    )}>
      <div className="container mx-auto py-4 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 pr-8">
            <h3 className="text-lg font-semibold mb-1">Cookie Settings</h3>
            <p className="text-muted-foreground text-sm">
              We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
              By clicking "Accept All", you consent to our use of cookies. You can also choose "Essential Only" 
              for only the essential cookies needed for the site to function.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
            <Button
              variant="outline"
              size="sm"
              onClick={acceptEssential}
              className="whitespace-nowrap"
            >
              Essential Only
            </Button>
            <Button
              size="sm"
              onClick={acceptAll}
              className="whitespace-nowrap bg-primary hover:bg-primary/90"
            >
              Accept All
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 sm:hidden"
            onClick={acceptEssential}
            aria-label="Dismiss cookie banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 