"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "../components/button";
import { AuthCard } from "../components/auth/auth-card";
import { AuthInput } from "../components/auth/auth-input";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Create a client component that uses the search params
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No reset token provided");
    }
  }, [token]);
  
  const validatePassword = (password) => {
    return PASSWORD_REGEX.test(password);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (!validatePassword(password)) {
      setError("Password must contain at least 8 characters, including uppercase, lowercase, number and special character (@$!%*?&)");
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setStatus("error");
        setError(data.error || "Failed to reset password");
        return;
      }
      
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthCard
      title="Reset Password"
      description="Create a new password for your account"
    >
      {status === "success" ? (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Password Reset Complete</h2>
          <p className="text-muted-foreground mb-6">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <Link href="/login">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </div>
      ) : status === "error" && !token ? (
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Invalid Reset Link</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/forgot-password">
            <Button className="w-full">Request New Reset Link</Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            label="New Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            icon={Lock}
            error={error && error.includes("Password must") ? error : ""}
            required
          />
          
          <AuthInput
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            icon={Lock}
            error={error && error.includes("do not match") ? error : ""}
            required
          />
          
          {error && !error.includes("Password must") && !error.includes("do not match") && (
            <div className="flex items-center space-x-1 text-destructive">
              <XCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              "Reset Password"
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

// Fallback component to show while loading
function ResetPasswordFallback() {
  return (
    <AuthCard
      title="Reset Password"
      description="Create a new password for your account"
    >
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </AuthCard>
  );
}

// Main page component with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
} 