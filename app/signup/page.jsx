"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AuthCard } from "../components/auth/auth-card"
import { AuthInput } from "../components/auth/auth-input"
import { Button } from "../components/button"
import Link from "next/link"
import { Loader2, Mail, Lock, User } from "lucide-react"

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const NAME_REGEX = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
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
      email: e.target.email.value.trim(),
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

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setErrors({ submit: "Error signing in after signup" })
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      setErrors({ submit: "Something went wrong" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard
      title="Create your account"
      description="Start trading social media accounts securely"
    >
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
      <div className="mt-6 text-center space-y-4">
        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
        <p className="text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </AuthCard>
  )
} 