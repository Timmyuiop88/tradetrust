"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/app/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { AccountDetailsForm } from "./account-details-form"
import { AccountMetricsForm } from "./account-metrics-form"
import { AccountPricingForm } from "./account-pricing-form"
import { AccountMediaForm } from "./account-media-form"
import { AccountCredentialsForm } from "./account-credentials-form"
import { AccountReviewForm } from "./account-review-form"
import { Progress } from "./progress"
import { EditListingSkeleton } from "../../edit-listing-skeleton"
import { toast } from "sonner"

const STEP_TITLES = [
  "Details",
  "Metrics",
  "Pricing",
  "Media",
  "Credentials",
  "Review"
]

const steps = [
  "details",
  "metrics",
  "pricing",
  "media",
  "credentials",
  "review"
]

// Function to fetch the listing data
const fetchListing = async (id) => {
  const { data } = await axios.get(`/api/listings/${id}`)
  return data
}

export default function EditListingPage() {
  const router = useRouter()
  const { id } = useParams()
  const { data: session, status } = useSession()
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Fetch the listing data
  const { data: listing, error, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListing(id),
    enabled: !!id && !!session,
    refetchOnWindowFocus: false,
  })

  // Set form data once listing is loaded
  useEffect(() => {
    if (listing) {
      setFormData({
        // Account Details
        platformId: listing.platformId,
        categoryId: listing.categoryId,
        username: listing.username || '',
        accountCountry: listing.accountCountry || '',
        previewLink: listing.previewLink || '',
        transferMethod: listing.transferMethod || '',
        verified: listing.verified || false,
        
        // Account Metrics
        followers: listing.followers || 0,
        posts: listing.posts || 0,
        accountAge: listing.accountAge || 0,
        engagement: listing.engagement || 0,
        
        // Account Pricing
        price: listing.price || 0,
        negotiable: listing.negotiable || false,
        
        // Account Media
        mediaProof: listing.mediaProof || [],
        description: listing.description || '',
        
        // Additional attributes
        credentials: listing.credentials || {},
      })
    }
  }, [listing])

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login')
    }
  }, [status, router])

  // If still loading session or listing data
  if (status === "loading" || isLoading || !formData) {
    return <EditListingSkeleton />
  }

  // If there was an error fetching the listing
  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was an error loading the listing data. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error.message}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Update form data for a specific step
  const updateFormData = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }))
  }

  // Navigate to the next step
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1)
    }
  }

  // Navigate to the previous step
  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1)
    }
  }

  // Submit the updated listing
  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Use the PATCH endpoint to update the listing
      await axios.patch(`/api/listings/${id}`, formData)
      toast.success("Listing updated successfully")
      router.push('/dashboard/sell')
    } catch (err) {
      console.error("Error updating listing:", err)
      toast.error(err.response?.data?.error || "Failed to update listing")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate progress percentage
  const progressPercentage = ((activeStep + 1) / steps.length) * 100

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          className="px-0 mb-2"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Edit Listing</h1>
        <p className="text-muted-foreground">
          Update your listing information to keep it accurate and attractive to potential buyers.
        </p>
      </div>

      <div className="mb-6">
        <Progress steps={STEP_TITLES} currentStep={activeStep} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeStep === 0 && "Account Details"}
            {activeStep === 1 && "Account Metrics"}
            {activeStep === 2 && "Pricing"}
            {activeStep === 3 && "Media & Description"}
            {activeStep === 4 && "Account Credentials"}
            {activeStep === 5 && "Review & Submit"}
          </CardTitle>
          <CardDescription>
            {activeStep === 0 && "Update the basic information about this account"}
            {activeStep === 1 && "Update the metrics and statistics of your account"}
            {activeStep === 2 && "Set your price and pricing options"}
            {activeStep === 3 && "Upload screenshots and provide a detailed description"}
            {activeStep === 4 && "Update the credentials for transferring ownership"}
            {activeStep === 5 && "Review all information before submitting"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={steps[activeStep]} className="mt-4">
            <TabsContent value="details" className="pt-4">
              <AccountDetailsForm
                formData={formData}
                updateFormData={updateFormData}
                onComplete={handleNext}
              />
            </TabsContent>
            <TabsContent value="metrics" className="pt-4">
              <AccountMetricsForm
                formData={formData}
                updateFormData={updateFormData}
                onComplete={handleNext}
              />
            </TabsContent>
            <TabsContent value="pricing" className="pt-4">
              <AccountPricingForm
                formData={formData}
                updateFormData={updateFormData}
                onComplete={handleNext}
              />
            </TabsContent>
            <TabsContent value="media" className="pt-4">
              <AccountMediaForm
                formData={formData}
                updateFormData={updateFormData}
                onComplete={handleNext}
                isEdit={true}
              />
            </TabsContent>
            <TabsContent value="credentials" className="pt-4">
              <AccountCredentialsForm
                formData={formData}
                updateFormData={updateFormData}
                onComplete={handleNext}
              />
            </TabsContent>
            <TabsContent value="review" className="pt-4">
              <AccountReviewForm
                formData={formData}
                isEdit={true}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={activeStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {activeStep < steps.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Listing"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
} 