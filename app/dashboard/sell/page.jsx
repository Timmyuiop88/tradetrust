"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Shield } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/components/card"
import { KycSteps } from "./kyc/kyc-steps"
import { useRouter } from "next/navigation"
import { SellingInterface } from "./selling-interface"
import { KycStepsSkeleton } from "./kyc/kyc-steps-skeleton"

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
    status: "locked",
  },
  {
    id: 3,
    type: "face",
    title: "Face Verification",
    description: "Quick selfie verification",
    status: "locked",
  },
]

export default function SellPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [kycSteps, setKycSteps] = useState(INITIAL_STEPS)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (sessionStatus === "authenticated" && session?.user) {
      fetchKycStatus()
    }
  }, [sessionStatus, session])

  const fetchKycStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/kyc/status')
      const data = await response.json()
      
      if (data.steps) {
        setKycSteps(data.steps)
      }
    } catch (error) {
      console.error('Failed to fetch KYC status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartStep = (stepId) => {
    router.push(`/dashboard/sell/kyc/${stepId}`)
  }

  // Show loading skeleton while session is loading
  if (sessionStatus === "loading" || isLoading) {
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

  const isKycVerified = kycSteps.every(step => step.status === "completed")

  // if (!isKycVerified) {
  //   return (
  //     <div className="max-w-2xl mx-auto space-y-6">
  //       <Card>
  //         <CardHeader>
  //           <CardTitle className="flex items-center space-x-2">
  //             <Shield className="h-5 w-5 text-primary" />
  //             <span>Verification Required</span>
  //           </CardTitle>
  //           <CardDescription>
  //             Complete verification to start selling accounts
  //           </CardDescription>
  //         </CardHeader>
  //         <CardContent>
  //           <KycSteps steps={kycSteps} onStartStep={handleStartStep} />
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  return <SellingInterface />
} 