"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Shield } from "lucide-react"
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
  const [kycSteps, setKycSteps] = useState(INITIAL_STEPS)
  const router = useRouter()
  
  // Use the KYC status hook instead of manual fetching
  const { data: kycData, isLoading: kycLoading, error: kycError } = useKycStatus()
  console.log("KYC Data:", kycData)
  
  // Update steps based on KYC verification status
  useEffect(() => {
    if (kycData) {
      // If user is KYC verified, mark all steps as completed
      if (kycData.isKycVerified) {
        setKycSteps(INITIAL_STEPS.map(step => ({
          ...step,
          status: "completed"
        })))
      }
    }
  }, [kycData])

  const handleStartStep = (stepId) => {
    router.push(`/dashboard/sell/kyc/${stepId}`)
  }

  // Show loading skeleton while session is loading
  if (sessionStatus === "loading" || kycLoading) {
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
            <KycStepsSkeleton />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (sessionStatus === "unauthenticated") {
    router.push('/login')
    return null
  }

  // Check if KYC is verified from the API response
  const isKycVerified = kycData?.isKycVerified || false

  if (!isKycVerified) {
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
            <KycSteps steps={kycSteps} onStartStep={handleStartStep} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return <SellingInterface />
} 