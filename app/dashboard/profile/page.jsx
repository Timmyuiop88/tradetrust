"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/hooks/useUser"
import { useKycStatus } from "@/app/hooks/useKyc"
import { Button } from "@/app/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/avatar"
import { Badge } from "@/app/components/badge"
//import { Separator } from "@/app/components/separator"
import { 
  User, Mail, Calendar, Shield, CheckCircle, XCircle, 
  AlertCircle, MapPin, FileText, CreditCard, Package, 
  Settings, Edit, ExternalLink
} from "lucide-react"
import { format } from "date-fns"

export default function ProfilePage() {
  const router = useRouter()
  const { data: userData, isLoading: userLoading, error: userError } = useUser()
  const { data: kycData, isLoading: kycLoading } = useKycStatus()
  const [activeTab, setActiveTab] = useState("overview")
  
  // Define formatDate function at the top level
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (error) {
      console.error('Error formatting date:', error, dateString)
      return "Invalid date"
    }
  }
  
  // Add detailed debugging
  {useEffect(() => {
    console.log('Profile page loaded with userData:', userData)
    if (userData) {
      console.log('User data details:', {
        id: userData.id,
        email: userData.email,
        hasKyc: userData.kyc,
      })
      
      if (userData.kyc) {
        console.log('KYC data:', {
          fullName: userData.kyc.fullName,
          country: userData.kyc.country,
          countryType: typeof userData.kyc.country,
          address: userData.kyc.address,
          verified: userData.kyc.verified,
          hasDocuments: !!userData.kyc.documents,
        })
      }
    }
  }, [userData])}

  if (userLoading || kycLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="h-24 bg-muted animate-pulse rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
          </div>
          <div className="md:col-span-2">
            <div className="h-64 bg-muted animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (userError) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="h-5 w-5" />
              <p>Error loading profile: {userError.message || "Please try again later"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = userData || {}
  const isKycVerified = user.isKycVerified || kycData?.isKycVerified
  const kycDocuments = user.kyc?.documents || {}
  const hasIdDocument = !!kycDocuments.governmentId
  const hasFaceVerification = !!kycDocuments.faceScan
  const hasAddressProof = !!kycDocuments.addressProof
  
  // Log the final user object we're using for rendering
  console.log('Final user object for rendering:', {
    name: user.name || user.kyc?.fullName,
    email: user.email,
    country: user.kyc?.country,
    hasKyc: !!user.kyc,
  })
  
  const getInitials = (name) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image} alt={user.name || "User"} />
              <AvatarFallback><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11 21H5.6C5.03995 21 4.75992 21 4.54601 20.891C4.35785 20.7951 4.20487 20.6422 4.10899 20.454C4 20.2401 4 19.9601 4 19.4V17.6841C4 17.0485 4 16.7306 4.04798 16.4656C4.27087 15.2344 5.23442 14.2709 6.46558 14.048C6.5425 14.0341 6.6237 14.0242 6.71575 14.0172C6.94079 14 7.05331 13.9914 7.20361 14.0026C7.35983 14.0143 7.4472 14.0297 7.59797 14.0722C7.74302 14.1131 8.00429 14.2315 8.52682 14.4682C8.98953 14.6778 9.48358 14.8304 10 14.917M19.8726 15.2038C19.8044 15.2079 19.7357 15.21 19.6667 15.21C18.6422 15.21 17.7077 14.7524 17 14C16.2923 14.7524 15.3578 15.2099 14.3333 15.2099C14.2643 15.2099 14.1956 15.2078 14.1274 15.2037C14.0442 15.5853 14 15.9855 14 16.3979C14 18.6121 15.2748 20.4725 17 21C18.7252 20.4725 20 18.6121 20 16.3979C20 15.9855 19.9558 15.5853 19.8726 15.2038ZM15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z" stroke="#12b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path> </g></svg></AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{user.name || user.kyc?.fullName || "User"}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                <Badge variant={user.role === "ADMIN" ? "destructive" : "default"}>
                  {user.role || "USER"}
                </Badge>
                <Badge variant={isKycVerified ? "success" : "outline"}>
                  {isKycVerified ? "KYC Verified" : "KYC Incomplete"}
                </Badge>
                <Badge variant={user.isEmailVerified ? "success" : "outline"}>
                  {user.isEmailVerified ? "Email Verified" : "Email Unverified"}
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full grid grid-cols-4 gap-2 px-1 h-[60px]">
          <TabsTrigger value="overview" className="px-1 py-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Overview</TabsTrigger>
          <TabsTrigger value="verification" className="px-1 py-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Verification</TabsTrigger>
          <TabsTrigger value="listings" className="px-1 py-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Listings</TabsTrigger>
          <TabsTrigger value="transactions" className="px-1 py-2 text-[10px] sm:text-xs md:text-sm whitespace-nowrap">Transactions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/*<div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p>{user.name || user.kyc?.fullName || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{user.email}</p>
                  </div>
                </div>*/}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p>{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p>{user.kyc?.country || "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Listings</p>
                    <p className="text-2xl font-bold">{user._count?.listings || 0}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">{user._count?.orders || 0}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Verification Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {isKycVerified ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <p className="font-medium">Verified</p>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                          <p className="font-medium">Incomplete</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>KYC Verification Status</CardTitle>
              <CardDescription>
                Your identity verification status and documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <p className="font-medium">ID Verification</p>
                    </div>
                    {hasIdDocument ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {hasIdDocument ? "Document uploaded" : "Document required"}
                  </p>
                  {!hasIdDocument && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => router.push('/dashboard/sell/kyc/1')}
                    >
                      Complete
                    </Button>
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <p className="font-medium">Address Verification</p>
                    </div>
                    {hasAddressProof ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {hasAddressProof ? "Document uploaded" : "Document required"}
                  </p>
                  {!hasAddressProof && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => router.push('/dashboard/sell/kyc/2')}
                    >
                      Complete
                    </Button>
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <p className="font-medium">Face Verification</p>
                    </div>
                    {hasFaceVerification ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {hasFaceVerification ? "Verification complete" : "Verification required"}
                  </p>
                  {!hasFaceVerification && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => router.push('/dashboard/sell/kyc/3')}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium">Overall Verification Status</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs md:text-sm">
                  {isKycVerified ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <p>Your account is fully verified. You can now sell on our platform.</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <p>Please complete all verification steps to start selling.</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Listings Tab */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
              <CardDescription>
                Manage your account listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.listings && user.listings.length > 0 ? (
                <div className="space-y-4">
                  {user.listings.map((listing) => (
                    <div key={listing.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{listing.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <p>${listing.price}</p>
                          <span>•</span>
                          <p>{formatDate(listing.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          listing.status === "AVAILABLE" ? "success" : 
                          listing.status === "SOLD" ? "destructive" : "outline"
                        }>
                          {listing.status}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => router.push(`/dashboard/listings/${listing.id}`)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No listings yet</h3>
                  <p className="text-muted-foreground mb-4">You haven't created any listings yet.</p>
                  <Button onClick={() => router.push('/dashboard/sell/create')}>
                    Create Listing
                  </Button>
                </div>
              )}
            </CardContent>
            {user.listings && user.listings.length > 0 && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/dashboard/listings')}
                >
                  View All Listings
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your recent transactions and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No transactions yet</h3>
                <p className="text-muted-foreground">Your transaction history will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 