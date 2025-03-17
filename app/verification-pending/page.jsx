"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "../components/button";
import { AuthCard } from "../components/auth/auth-card";

// Component that uses the search params
function VerificationPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const source = searchParams.get("source") || "signup"; // 'signup' or 'login'
  
  const [loading, setLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  
  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleResendVerification = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError("");
    setResendSuccess(false);
    setAlreadyVerified(false);
    
    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();
    
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || "Failed to resend verification email");
        return;
      }
      
      if (data.message && data.message.includes("already verified")) {
        setAlreadyVerified(true);
      } else {
        setResendSuccess(true);
        setCountdown(60); // Set a 60-second cooldown
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  
  const getTitle = () => {
    return source === "login" 
      ? "Email Verification Required" 
      : "Verify Your Email";
  };
  
  const getDescription = () => {
    return source === "login"
      ? "Your email needs to be verified before you can log in"
      : "Please check your inbox to complete registration";
  };
  
  return (
    <AuthCard
      title={getTitle()}
      description={getDescription()}
    >
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-6">
          {source === "login" ? (
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          ) : (
            <Mail className="h-12 w-12 text-primary" />
          )}
        </div>
        
        {alreadyVerified ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-green-500 bg-green-500/10 p-4 rounded-md">
            <CheckCircle className="h-6 w-6" />
            <p>Your email is already verified!</p>
            <p className="text-sm text-muted-foreground">You can now log in to your account.</p>
            <Link href="/login">
              <Button variant="default" className="mt-2">
                Go to Login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                {source === "login" ? "Verification Required" : "Verification Email Sent"}
              </h2>
              <p className="text-muted-foreground">
                {source === "login" 
                  ? "We need to verify your email address:" 
                  : "We've sent a verification link to:"}
              </p>
              <p className="font-medium text-primary">{email}</p>
              <p className="text-muted-foreground mt-4">
                Please check your inbox and click the link to verify your email address.
              </p>
            </div>
            
            {resendSuccess && (
              <div className="flex items-center justify-center space-x-2 text-green-500 bg-green-500/10 p-3 rounded-md">
                <CheckCircle className="h-5 w-5" />
                <span>Verification email resent successfully!</span>
              </div>
            )}
            
            {error && (
              <div className="text-red-500 bg-red-500/10 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or:
              </p>
              
              <Button
                onClick={handleResendVerification}
                className="w-full"
                disabled={loading || countdown > 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            </div>
          </>
        )}
        
        <div className="text-center pt-2">
          <Link href="/login" className="text-sm text-primary hover:underline flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}

// Fallback component to show while loading
function VerificationPendingFallback() {
  return (
    <AuthCard
      title="Verification Pending"
      description="Please wait..."
    >
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </AuthCard>
  );
}

// Main page component with Suspense boundary
export default function VerificationPendingPage() {
  return (
    <Suspense fallback={<VerificationPendingFallback />}>
      <VerificationPendingContent />
    </Suspense>
  );
} 