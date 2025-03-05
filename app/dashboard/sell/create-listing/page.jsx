"use client"

import { useState } from "react"
import { Button } from "../../../components/button"
import { Card } from "../../../components/card"
import { Steps } from "./steps"
import { AccountDetails } from "./account-details"
import { MediaUpload } from "./media-upload"
import { PricingDetails } from "./pricing-details"
import { ReviewListing } from "./review-listing"

const STEPS = [
  { id: 1, title: "Account Details" },
  { id: 2, title: "Media & Proof" },
  { id: 3, title: "Pricing" },
  { id: 4, title: "Review" },
]

export default function CreateListingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    platform: "",
    category: "",
    followers: "",
    engagement: "",
    description: "",
    media: [],
    price: "",
    transferMethod: "",
  })

  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Steps steps={STEPS} currentStep={currentStep} />
      
      <Card className="p-6">
        {renderStep()}
        
        <div className="flex justify-between mt-6 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => {
              if (currentStep === STEPS.length) {
                // Submit form
                return
              }
              setCurrentStep(prev => prev + 1)
            }}
          >
            {currentStep === STEPS.length ? "Create Listing" : "Next"}
          </Button>
        </div>
      </Card>
    </div>
  )
} 