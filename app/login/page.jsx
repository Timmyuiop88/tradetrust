"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthInput } from "../components/auth/auth-input"
import { Button } from "../components/button"
import Link from "next/link"
import { Loader2, Mail, Lock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

// Create a separate component for the login form that uses searchParams
function LoginForm() {
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
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (verified) {
      setShowVerifiedMessage(true)
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

    setEmailForVerification(email)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      if (result.error.includes("verify your email")) {
        router.push(`/verification-pending?email=${encodeURIComponent(email)}&source=login`)
      } else {
        setLoginError("Invalid email or password")
        setLoading(false)
      }
    } else {
      router.push("/marketplace")
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
    <>
      <Link href="/" className="flex items-center space-x-2 mb-8">
        {mounted && (
          theme === "dark" ? (
            <Image
              src="/images/logovero-dark.webp"
              alt="TradeVero"
              width={200}
              height={200}
              priority
            />
          ) : (
            <Image
              src="/images/logovero-light.webp"
              alt="TradeVero"
              width={200}
              height={200}
              priority
            />
          )
        )}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Sign in to your account</h1>
        <p className="text-muted-foreground">
          Welcome back! Please enter your details to continue.
        </p>
      </div>

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
          label="Email Address"
          name="email"
          type="email"
          icon={Mail}
          placeholder="name@example.com"
          required
        />
        <div className="space-y-1">
          <AuthInput
            label="Password"
            name="password"
            type="password"
            icon={Lock}
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

        <Button className="w-full h-11" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 space-y-4">
        <div className="text-sm text-muted-foreground text-center">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </>
  )
}

// Main page component with Suspense boundary
export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Form Section */}
      <div className="w-full lg:w-[480px] p-8 md:p-12 flex flex-col justify-center min-h-screen">
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>

      {/* Gradient Section */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative w-full h-full flex items-center justify-center p-12">
          <div className="max-w-lg text-center">
            <h2 className="text-3xl font-bold mb-4">
              Turn Your Digital Content Into Income
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of creators selling ebooks, courses, design assets, and more on the most powerful digital marketplace.
            </p>
            <div className="grid grid-cols-2 gap-6 text-left">
              {[
                "Instant product delivery",
                "Secure payment processing",
                "Content protection & DRM",
                "Analytics & insights",
                "Multiple file formats",
                "Global audience reach"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}