"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "../components/button";
import { AuthCard } from "../components/auth/auth-card";

// Component that uses the search params
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No verification token provided");
      return;
    }
    
    async function verifyEmail() {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        
        if (response.redirected) {
          // If the API redirects, follow the redirect
          router.push(response.url);
          return;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          setStatus("error");
          setError(data.error || "Failed to verify email");
          return;
        }
        
        setStatus("success");
      } catch (error) {
        console.error("Error verifying email:", error);
        setStatus("error");
        setError("An unexpected error occurred");
      }
    }
    
    verifyEmail();
  }, [token, router]);
  
  return (
    <AuthCard
      title="Email Verification"
      description={
        status === "loading" 
          ? "We're verifying your email address..." 
          : status === "success"
            ? "Your email has been verified successfully!"
            : "There was a problem verifying your email"
      }
    >
      <div className="text-center space-y-6">
        {status === "loading" && (
          <div className="py-6 flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="mt-4 text-muted-foreground">Please wait while we verify your email address...</p>
          </div>
        )}
        
        {status === "success" && (
          <div className="py-6 flex flex-col items-center">
            <div className="bg-green-50 p-4 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Verification Successful!</h2>
            <p className="mt-2 text-muted-foreground">You can now log in to your account.</p>
            <div className="mt-6">
              <Link href="/login?verified=true">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </div>
          </div>
        )}
        
        {status === "error" && (
          <div className="py-6 flex flex-col items-center">
            <div className="bg-red-50 p-4 rounded-full">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="mt-4 text-xl font-semibold">Verification Failed</h2>
            <p className="mt-2 text-muted-foreground">{error}</p>
            <div className="mt-6 space-y-4">
              <Link href="/signup">
                <Button className="w-full">Sign Up Again</Button>
              </Link>
              <div className="text-center pt-2">
                <Link href="/login" className="text-sm text-primary hover:underline flex items-center justify-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthCard>
  );
}

// Fallback component to show while loading
function VerifyEmailFallback() {
  return (
    <AuthCard
      title="Email Verification"
      description="Loading verification..."
    >
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </AuthCard>
  );
}

// Main page component with Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
} 