"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FollowButton } from "@/app/components/follow-button";
import { FollowersCount } from "@/app/components/followers-count";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/app/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/avatar";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs";
import { Loader2, User, Mail, Calendar, Shield, CheckCircle, ArrowLeft, Star, Clock, AlertTriangle, ExternalLink, ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { UserListings } from "@/app/components/user-listings";
import { UserReviews } from "../user-reviews";
import { cn } from "@/lib/utils";
import { CompletionRate } from "@/app/components/completion-rate";
import Link from "next/link";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id;
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUserData(data.user);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Check for hash in URL and set active tab accordingly
  useEffect(() => {
    // Get the hash from the URL (e.g., #payment)
    const hash = window.location.hash.replace('#', '');
    
    // If hash exists and matches one of our tabs, set it as active
    if (hash && ['overview', 'listings'].includes(hash)) {
      setActiveTab(hash);
    }
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Get initials for avatar
  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
        {/* Profile Header Skeleton */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
              {/* Avatar Skeleton */}
              <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              
              <div className="flex-1 text-center md:text-left w-full">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4 w-full">
                  <div className="w-full">
                    {/* Name Skeleton */}
                    <div className="h-6 sm:h-8 w-36 sm:w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto md:mx-0"></div>
                    {/* Email Skeleton */}
                    <div className="h-4 w-28 sm:w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2 mx-auto md:mx-0"></div>
                    
                    {/* Badges Skeleton */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 justify-center md:justify-start">
                      <div className="h-5 sm:h-6 w-20 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="h-5 sm:h-6 w-24 sm:w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Follow Button Skeleton */}
                  <div className="h-8 sm:h-10 w-full md:w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
        
        {/* Content Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate Skeleton */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Skeleton */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                        <div>
                          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full ml-1 animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="mt-2 h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-red-500">
                <Shield className="h-12 w-12" />
              </div>
              <h2 className="text-xl font-semibold">Error Loading Profile</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => router.back()}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="mb-4 sm:mb-6 h-8 sm:h-9 px-2 sm:px-3" 
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        Back
      </Button>

      {/* Profile Header Card */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6">
            {/* Avatar - smaller on mobile */}
            <Avatar className="h-16 w-16 sm:h-24 sm:w-24 border-2 border-primary">
              <AvatarImage src={userData?.image} alt={userData?.firstName || "User"} />
              <AvatarFallback className="text-base sm:text-lg">
                {getInitials(userData?.firstName, userData?.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold">
                    {userData?.firstName} {userData?.lastName}
                  </h1>
                  <p className="text-sm text-muted-foreground">{userData?.email}</p>
                  
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 justify-center md:justify-start">
                    {userData?.isKycVerified && (
                      <Badge variant="success" className="bg-green-500 text-[10px] sm:text-xs px-2 py-0.5">
                        KYC Verified
                      </Badge>
                    )}
                    {userData?.isEmailVerified && (
                      <Badge variant="success" className="bg-green-500 text-[10px] sm:text-xs px-2 py-0.5">
                        Email Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Follow button - adjust size for mobile */}
                {currentUserId !== userId && (
                  <div className="w-full md:w-auto">
                    <FollowButton 
                      userId={userId} 
                      className="w-full md:w-auto h-8 sm:h-9 text-xs sm:text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs - make scrollable on mobile */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
          <TabsTrigger value="listings" className="text-xs sm:text-sm">Listings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-3 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Full Name</p>
                  <p className="text-sm sm:text-base font-medium">
                    {userData?.firstName && userData?.lastName 
                      ? `${userData.firstName} ${userData.lastName}` 
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                  <p className="text-sm sm:text-base font-medium">{userData?.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Member Since</p>
                  <p className="text-sm sm:text-base font-medium">{formatDate(userData?.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Verification Status</p>
                  <div className="flex items-center gap-1.5">
                    {userData?.isKycVerified ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                        <span className="text-sm sm:text-base font-medium">Verified</span>
                      </>
                    ) : (
                      <span className="text-sm sm:text-base font-medium">Not Verified</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="listings" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6">
              <CardTitle className="text-base sm:text-lg">Listings</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <UserListings userId={userId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Completion Rate and Reviews sections */}
      <div className="mt-4 sm:mt-6">
        <CompletionRate userId={userId} />
      </div>

      <div className="mt-4 sm:mt-6">
        <UserReviews userId={userId} />
      </div>
    </div>
  );
} 