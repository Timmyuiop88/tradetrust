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
import { CredentialsInput } from "./credentials"
import { ReviewListing } from "./review-listing"
import { useKycStatus } from "@/app/hooks/useKyc"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Shield, AlertCircle, Crown } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/app/components/dialog"
import { toast } from "sonner"

const STEPS = [
  { id: 1, title: "Account Details" },
  { id: 2, title: "Media & Proof" },
  { id: 3, title: "Pricing" },
  { id: 4, title: "Credentials" },
  { id: 5, title: "Review" },
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
    mediaProof: [],
    price: "",
    negotiable: false,
    credentials: {},
    previewLink: "",
    accountCountry: "",
    transferMethod: "credentials"
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
      
      toast.success('Listing created successfully')
      router.push(`/dashboard/listings/${data.listing.id}`)
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
        return <CredentialsInput data={formData} onUpdate={updateFormData} />
      case 5:
        return <ReviewListing data={formData} />
      default:
        return null
    }
  }

  // Validate current step
  const isStepValid = () => {
    switch(currentStep) {
      case 1:
        return formData.platform && formData.category && formData.description
      case 2:
        return formData.media && formData.media.length > 0
      case 3:
        return formData.price
      case 4:
        // Credentials are optional, but if email is provided, password should be too
        if (formData.credentials?.email && !formData.credentials?.password) {
          return false
        }
        return true
      case 5:
        return true
      default:
        return false
    }
  }

  // Get current plan info
  const currentPlan = subscription?.plan || { tier: 'FREE', maxListings: 3 }
  
  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-6 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold">Create New Listing</h1>
      
      {/* Update subscription banner */}
      <div className="bg-muted/50 border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <div>
            <p className="text-xs sm:text-sm font-medium">
              Current Plan: <span className="font-semibold">{currentPlan.tier}</span>
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              You can create up to {currentPlan.maxListings === 999999 ? 'unlimited' : currentPlan.maxListings} listings
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/dashboard/subscription')}
          className="w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
        >
          Upgrade
        </Button>
      </div>
      
      <Steps steps={STEPS} currentStep={currentStep} />
      
      <Card className="p-3 sm:p-6 shadow-lg border border-gray-100 dark:border-gray-800 rounded-xl">
        {renderStep()}
        
        {error && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-xs sm:text-sm">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-800 gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
            className="px-3 sm:px-5 text-xs sm:text-sm h-8 sm:h-10"
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
            className="px-3 sm:px-5 text-xs sm:text-sm h-8 sm:h-10 bg-gradient-to-r from-primary to-primary/90"
          >
            {currentStep === STEPS.length 
              ? (isSubmitting ? "Creating..." : "Create Listing") 
              : "Next"}
          </Button>
        </div>
      </Card>
      
      {/* Update dialog content */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="p-4 sm:p-6 max-w-[90vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Listing Limit Reached</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              You've reached the maximum number of listings allowed on your current plan.
              Upgrade to create more listings and unlock additional benefits.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted rounded-lg">
              <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-primary p-1.5 sm:p-2 bg-primary/10 rounded-full" />
              <div>
                <p className="text-sm sm:text-base font-medium">Upgrade your subscription</p>
                <p className="text-xs text-muted-foreground">Get more listings, lower fees, and premium features</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowUpgradeDialog(false)}
              className="text-xs sm:text-sm h-8 sm:h-10"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/subscription')}
              className="text-xs sm:text-sm h-8 sm:h-10"
            >
              View Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 