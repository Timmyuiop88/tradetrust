"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/app/hooks/useUser"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { PasswordChangeForm } from "./password-change-form"
import { PaymentSettingsSection } from "./payment-settings-section"
import { LegalComplianceSection } from "./legal-compliance-section"
import { Loader2, ArrowLeft } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/app/components/button"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { data: userData, isLoading } = useUser()
  const [activeTab, setActiveTab] = useState("account")
  const router = useRouter()
  // Check for hash in URL and set active tab accordingly
  useEffect(() => {
    // Get the hash from the URL (e.g., #payment)
    const hash = window.location.hash.replace('#', '');
    
    // If hash exists and matches one of our tabs, set it as active
    if (hash && ['account', 'payment', 'legal', 'logout'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header Skeleton */}
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          <div className="h-8 w-48 ml-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        
        {/* Tabs Skeleton */}
        <div className="mb-6 w-full grid grid-cols-4 gap-2 px-1">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            ></div>
          ))}
        </div>
        
        {/* Card Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-64 mt-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            {/* Form Fields Skeleton */}
            <div className="space-y-6">
              {/* Field 1 */}
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              
              {/* Field 2 */}
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              
              {/* Field 3 */}
              <div className="space-y-2">
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
              
              {/* Button Skeleton */}
              <div className="pt-4">
                <div className="h-10 w-32 bg-primary dark:bg-primary rounded animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Account Settings</h1>
        </div>
      
      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full grid grid-cols-4 gap-2 px-1">
          <TabsTrigger value="account" className="tabtext">
            Account
          </TabsTrigger>
          <TabsTrigger value="payment" className="tabtext">
            Payment
          </TabsTrigger>
          <TabsTrigger value="legal" className="tabtext">
            Legal
          </TabsTrigger>
          <TabsTrigger value="logout" className="tabtext">
            Logout
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Password Settings</CardTitle>
              <CardDescription>
                Change your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordChangeForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payment" id="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payout methods for receiving payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentSettingsSection userData={userData} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Legal & Compliance</CardTitle>
              <CardDescription>
                Review and accept legal agreements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LegalComplianceSection userData={userData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logout">
          <Card>
            <CardHeader>
              <CardTitle>Logout</CardTitle>
              <CardDescription>
                Are you sure you want to logout?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleLogout}>Yes, logout</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 