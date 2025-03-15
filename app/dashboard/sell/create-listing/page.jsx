"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "../../../components/button"
import { Card } from "../../../components/card"
import { Steps } from "./steps"
import { AccountDetails } from "./account-details"
import { MediaUpload } from "./media-upload"
import { PricingDetails } from "./pricing-details"
import { ReviewListing } from "./review-listing"
import { useKycStatus } from "@/app/hooks/useKyc"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Shield, AlertCircle, Crown } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/dialog"

const STEPS = [
  { id: 1, title: "Account Details" },
  { id: 2, title: "Media & Proof" },
  { id: 3, title: "Pricing" },
  { id: 4, title: "Review" },
]

export default function CreateListingPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const { data: kycData, isLoading: kycLoading } = useKycStatus()
  const { data: subscription } = useSubscription()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    platform: "",
    category: "",
    username: "",
    followers: "",
    engagement: "",
    description: "",
    accountAge: "",
    posts: "",
    media: [],
    price: "",
    transferMethod: "",
    negotiable: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)

  // Redirect if not authenticated
  if (sessionStatus === "unauthenticated") {
    router.push('/login')
    return null
  }

  // Check if KYC is verified
  const isKycVerified = kycData?.isKycVerified || false

  // If KYC is not verified, redirect to sell page
  if (!isKycVerified && !kycLoading && sessionStatus === "authenticated") {
    router.push('/dashboard/sell')
    return null
  }

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (data.upgrade) {
          setShowUpgradeDialog(true)
          throw new Error('Listing limit reached for your subscription tier')
        }
        throw new Error(data.error || 'Failed to create listing')
      }
      
      router.push(`/dashboard/listings/${data.id}`)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return <AccountDetails data={formData} onUpdate={updateFormData} />
      case 2:
        return <MediaUpload data={formData} onUpdate={updateFormData} />
      case 3:
        return <PricingDetails data={formData} onUpdate={updateFormData} />
      case 4:
        return <ReviewListing data={formData} />
      default:
        return null
    }
  }

  // Validate current step
  const isStepValid = () => {
    switch(currentStep) {
      case 1:
        return formData.platform && formData.category && formData.followers && formData.description
      case 2:
        return formData.media && formData.media.length > 0
      case 3:
        return formData.price && formData.transferMethod
      case 4:
        return true
      default:
        return false
    }
  }

  // Get current plan info
  const currentPlan = subscription?.plan || { tier: 'FREE', maxListings: 3 }
  
  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <h1 className="text-2xl font-bold">Create New Listing</h1>
      
      {/* Subscription info banner */}
      <div className="bg-muted/50 border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Current Plan: <span className="font-semibold">{currentPlan.tier}</span></p>
            <p className="text-xs text-muted-foreground">
              You can create up to {currentPlan.maxListings === 999999 ? 'unlimited' : currentPlan.maxListings} listings
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/dashboard/subscription')}
        >
          Upgrade
        </Button>
      </div>
      
      <Steps steps={STEPS} currentStep={currentStep} />
      
      <Card className="p-6 shadow-lg border border-gray-100 dark:border-gray-800 rounded-xl">
        {renderStep()}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
            className="px-5"
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (currentStep === STEPS.length) {
                handleSubmit()
                return
              }
              setCurrentStep(prev => prev + 1)
            }}
            disabled={!isStepValid() || isSubmitting}
            className="px-5 bg-gradient-to-r from-primary to-primary/90"
          >
            {currentStep === STEPS.length 
              ? (isSubmitting ? "Creating..." : "Create Listing") 
              : "Next"}
          </Button>
        </div>
      </Card>
      
      {/* Upgrade Plan Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Listing Limit Reached</DialogTitle>
            <DialogDescription>
              You've reached the maximum number of listings allowed on your current plan.
              Upgrade to create more listings and unlock additional benefits.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Crown className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />
              <div>
                <p className="font-medium">Upgrade your subscription</p>
                <p className="text-sm text-muted-foreground">Get more listings, lower fees, and premium features</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => router.push('/dashboard/subscription')}>
              View Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 