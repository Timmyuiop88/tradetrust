"use client"

import { useState, useEffect } from "react"
import { Button } from "./button"
import { Switch } from "./switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"

export function CookieSettings({ trigger }) {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Essential cookies can't be disabled
    functional: false,
    analytics: false,
    marketing: false,
  })
  const [open, setOpen] = useState(false)
  
  // Load saved preferences when component mounts
  useEffect(() => {
    const savedPreferences = localStorage.getItem("cookie-preferences")
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setCookiePreferences({
          ...cookiePreferences,
          ...parsed
        })
      } catch (e) {
        console.error("Error parsing cookie preferences", e)
      }
    }
  }, [])
  
  const updatePreference = (type) => {
    setCookiePreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }
  
  const acceptAll = () => {
    const allEnabled = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    setCookiePreferences(allEnabled)
    savePreferences(allEnabled)
    setOpen(false)
  }
  
  const acceptEssential = () => {
    const essentialOnly = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    setCookiePreferences(essentialOnly)
    savePreferences(essentialOnly)
    setOpen(false)
  }
  
  const savePreferences = (preferences = cookiePreferences) => {
    localStorage.setItem("cookie-consent", "custom")
    localStorage.setItem("cookie-preferences", JSON.stringify(preferences))
  }
  
  const handleSave = () => {
    savePreferences()
    setOpen(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="link">Cookie Settings</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cookie Settings</DialogTitle>
          <DialogDescription>
            Customize which cookies you want to accept. Essential cookies cannot be disabled as they are necessary for the website to function properly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Essential Cookies</h4>
              <p className="text-sm text-muted-foreground">Required for the website to function</p>
            </div>
            <Switch checked disabled />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Functional Cookies</h4>
              <p className="text-sm text-muted-foreground">Enhanced features and personalization</p>
            </div>
            <Switch 
              checked={cookiePreferences.functional} 
              onCheckedChange={() => updatePreference('functional')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Analytics Cookies</h4>
              <p className="text-sm text-muted-foreground">Usage data to improve our website</p>
            </div>
            <Switch 
              checked={cookiePreferences.analytics} 
              onCheckedChange={() => updatePreference('analytics')} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Marketing Cookies</h4>
              <p className="text-sm text-muted-foreground">Personalized advertisements</p>
            </div>
            <Switch 
              checked={cookiePreferences.marketing} 
              onCheckedChange={() => updatePreference('marketing')} 
            />
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={acceptEssential}>Essential Only</Button>
          <Button variant="outline" onClick={acceptAll}>Accept All</Button>
          <Button onClick={handleSave}>Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 