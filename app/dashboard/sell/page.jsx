"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Shield, Clock } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/components/card"
import { KycSteps } from "./kyc/kyc-steps"
import { useRouter } from "next/navigation"
import { SellingInterface } from "./selling-interface"
import { KycStepsSkeleton } from "./kyc/kyc-steps-skeleton"
import { useKycStatus } from "@/app/hooks/useKyc"

const INITIAL_STEPS = [
  {
    id: 1,
    type: "identity",
    title: "Identity Verification",
    description: "Upload a valid government ID",
    status: "pending",
  },
  {
    id: 2,
    type: "address",
    title: "Address Verification",
    description: "Proof of address document",
    status: "pending",
  },
  {
    id: 3,
    type: "face",
    title: "Face Verification",
    description: "Quick selfie verification",
    status: "pending",
  },
]

export default function SellPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  
  const { data: kycData, isLoading: kycLoading } = useKycStatus()
  
  // Show loading skeleton while session is loading
  if (sessionStatus === "loading" || kycLoading) {
    return <KycStepsSkeleton />
  }

  // Redirect to login if not authenticated
  if (sessionStatus === "unauthenticated") {
    router.push('/login')
    return null
  }

  // Check if all steps are in pending_review state
  const allStepsPendingReview = kycData?.steps?.every(step => step.status === "pending_review")
  
  // Check if KYC is verified
  const isKycVerified = kycData?.isKycVerified || false

  if (isKycVerified) {
    return <SellingInterface />
  }

  if (allStepsPendingReview) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span>KYC Verification Under Review</span>
            </CardTitle>
            <CardDescription>
              We are reviewing your submitted documents. This process typically takes 24-48 hours.
              We'll notify you once the verification is complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KycSteps steps={kycData.steps} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>Verification Required</span>
          </CardTitle>
          <CardDescription>
            Complete verification to start selling accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KycSteps steps={kycData.steps} />
        </CardContent>
      </Card>
    </div>
  )
} 