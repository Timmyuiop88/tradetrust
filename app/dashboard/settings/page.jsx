"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/app/hooks/useUser"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { PasswordChangeForm } from "./password-change-form"
import { PaymentSettingsSection } from "./payment-settings-section"
import { LegalComplianceSection } from "./legal-compliance-section"
import { Loader2 } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/app/components/button"
export default function SettingsPage() {
  const { data: userData, isLoading } = useUser()
  const [activeTab, setActiveTab] = useState("account")

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full grid grid-cols-4 gap-2 px-1">
          <TabsTrigger value="account" className="px-1 py-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
            Account
          </TabsTrigger>
          <TabsTrigger value="payment" className="px-1 py-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
            Payment
          </TabsTrigger>
          <TabsTrigger value="legal" className="px-1 py-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
            Legal
          </TabsTrigger>
          <TabsTrigger value="logout" className="px-1 py-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
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