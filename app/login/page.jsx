"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthCard } from "../components/auth/auth-card"
import { AuthInput } from "../components/auth/auth-input"
import { Button } from "../components/button"
import Link from "next/link"
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react"

// Create a client component that uses the search params
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get("verified") === "true"
  const error = searchParams.get("error")
  
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false)
  const [emailForVerification, setEmailForVerification] = useState("")
  const [resendingVerification, setResendingVerification] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  
  useEffect(() => {
    if (verified) {
      setShowVerifiedMessage(true)
      // Hide the message after 5 seconds
      const timer = setTimeout(() => {
        setShowVerifiedMessage(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [verified])
  
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setLoginError("")
    
    const email = e.target.email.value.trim().toLowerCase()
    const password = e.target.password.value
    
    // Save email in case we need to resend verification
    setEmailForVerification(email)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      if (result.error.includes("verify your email")) {
        // Redirect to verification pending page instead of showing error
        router.push(`/verification-pending?email=${encodeURIComponent(email)}&source=login`)
      } else {
        setLoginError("Invalid email or password")
        setLoading(false)
      }
    } else {
      router.push("/dashboard")
    }
  }
  
  async function handleResendVerification() {
    if (!emailForVerification) return
    
    setResendingVerification(true)
    setResendSuccess(false)
    
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailForVerification }),
      })
      
      if (response.ok) {
        setResendSuccess(true)
      } else {
        const data = await response.json()
        setLoginError(data.error || "Failed to resend verification email")
      }
    } catch (error) {
      setLoginError("An error occurred. Please try again.")
    } finally {
      setResendingVerification(false)
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Enter your email to sign in to your account"
    >
      {showVerifiedMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center text-green-700">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-sm">Your email has been verified successfully!</p>
        </div>
      )}
      
      {resendSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center text-green-700">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p className="text-sm">Verification email has been resent. Please check your inbox.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
        />
        <div className="space-y-1">
          <AuthInput
            label="Password"
            name="password"
            type="password"
            required
          />
          <div className="text-right">
            <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        
        {loginError && (
          <div className="text-sm p-3 border rounded-md bg-red-50 border-red-200 text-red-500">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
              <p>{loginError}</p>
            </div>
          </div>
        )}
        
        <Button className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : "Sign In"}
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </AuthCard>
  )
}

// Fallback component while login content is loading
function LoginFallback() {
  return (
    <AuthCard
      title="Welcome back"
      description="Enter your email to sign in to your account"
    >
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </AuthCard>
  )
}

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  )
} 