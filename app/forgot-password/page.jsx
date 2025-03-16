"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "../components/button";
import { AuthCard } from "../components/auth/auth-card";
import { AuthInput } from "../components/auth/auth-input";

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const validateEmail = (email) => {
    return EMAIL_REGEX.test(email);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Normalize email to lowercase
    const normalizedEmail = email.trim().toLowerCase();
    
    if (!validateEmail(normalizedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      
      setSuccess(true);
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthCard
      title="Reset Password"
      description="Enter your email and we'll send you a link to reset your password"
    >
      {success ? (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Check your email</h2>
          <p className="text-muted-foreground mb-2">
            If an account with that email exists, we've sent a password reset link.
          </p>
          <p className="text-muted-foreground mb-6">
            Please check your inbox and follow the instructions.
          </p>
          <Link href="/login">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            label="Email Address"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            icon={Mail}
            error={error}
            required
          />
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
          
          <div className="text-center">
            <Link href="/login" className="text-sm text-primary hover:underline flex items-center justify-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
} 