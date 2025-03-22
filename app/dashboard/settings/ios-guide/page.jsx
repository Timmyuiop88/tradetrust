"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/app/components/button'
import { ArrowLeft, Share, PlusSquare, Home, Moon, Sun } from 'lucide-react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/card"
import Image from 'next/image'

export default function IOSGuide() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-lg font-medium text-center">
            Add to Home Screen
          </CardTitle>
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
                src="/images/sharebutton.png" 
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
                src="/images/add.png" 
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
                src="/images/confirm.png" 
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