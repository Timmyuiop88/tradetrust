"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AuthCard } from "../components/auth/auth-card"
import { AuthInput } from "../components/auth/auth-input"
import { Button } from "../components/button"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email: e.target.email.value,
      password: e.target.password.value,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      router.push("/browse")
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Enter your email to sign in to your account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="name@example.com"
          required
        />
        <AuthInput
          label="Password"
          name="password"
          type="password"
          required
        />
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
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