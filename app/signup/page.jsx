"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AuthInput } from "../components/auth/auth-input"
import { Button } from "../components/button"
import Link from "next/link"
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const NAME_REGEX = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  async function validateForm(data) {
    const newErrors = {}
    
    if (!NAME_REGEX.test(data.firstName)) {
      newErrors.firstName = "Please enter a valid first name"
    }
    
    if (!NAME_REGEX.test(data.lastName)) {
      newErrors.lastName = "Please enter a valid last name"
    }
    
    if (!EMAIL_REGEX.test(data.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!PASSWORD_REGEX.test(data.password)) {
      newErrors.password = "Password must contain at least 8 characters, including uppercase, lowercase, number and special character (@$!%*?&)"
    }
    
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const formData = {
      firstName: e.target.firstName.value.trim(),
      lastName: e.target.lastName.value.trim(),
      email: e.target.email.value.trim().toLowerCase(),
      password: e.target.password.value,
      confirmPassword: e.target.confirmPassword.value,
    }

    if (!await validateForm(formData)) {
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors({ submit: data.error })
        return
      }

      // Redirect to verification pending page with the email
      router.push(`/verification-pending?email=${encodeURIComponent(formData.email)}&source=signup`)
    } catch (error) {
      setErrors({ submit: "Something went wrong" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Form Section */}
      <div className="w-full lg:w-[480px] p-8 md:p-12 flex flex-col justify-between">
        <div>
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
            <h1 className="text-2xl font-bold mb-2">Create your account</h1>
            <p className="text-muted-foreground">
              Start selling your digital products in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <AuthInput
                label="First Name"
                name="firstName"
                icon={User}
                placeholder="John"
                error={errors.firstName}
                required
              />
              <AuthInput
                label="Last Name"
                name="lastName"
                icon={User}
                placeholder="Doe"
                error={errors.lastName}
                required
              />
            </div>
            <AuthInput
              label="Email Address"
              name="email"
              type="email"
              icon={Mail}
              placeholder="john.doe@example.com"
              error={errors.email}
              required
            />
            <AuthInput
              label="Create Password"
              name="password"
              type="password"
              icon={Lock}
              error={errors.password}
              required
            />
            <AuthInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              icon={Lock}
              error={errors.confirmPassword}
              required
            />
            {errors.submit && (
              <div className="p-3 rounded-md bg-red-500/10 text-red-500 text-sm text-center">
                {errors.submit}
              </div>
            )}
            <Button className="w-full h-11" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : "Create Account"}
            </Button>
          </form>
        </div>

        <div className="mt-6 space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </div>
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