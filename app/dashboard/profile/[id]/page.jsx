"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FollowButton } from "@/app/components/follow-button";
import { FollowersCount } from "@/app/components/followers-count";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/avatar";
import { Badge } from "@/app/components/badge";
import { Button } from "@/app/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs";
import { Loader2, User, Mail, Calendar, Shield, CheckCircle, ArrowLeft, Star, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { UserListings } from "@/app/components/user-listings";
import { UserReviews } from "../user-reviews";
import { cn } from "@/lib/utils";
import { CompletionRate } from "@/app/components/completion-rate";

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
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>*/}

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={userData?.image} alt={userData?.firstName || "User"} />
              <AvatarFallback>
                {getInitials(userData?.firstName, userData?.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">
                    {userData?.firstName} {userData?.lastName}
                  </h1>
                  <p className="text-muted-foreground">{userData?.email}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                    {userData?.isKycVerified && (
                      <Badge variant="success" className="bg-green-500">KYC Verified</Badge>
                    )}
                    {userData?.isEmailVerified && (
                      <Badge variant="success" className="bg-green-500">Email Verified</Badge>
                    )}
                  </div>
                </div>
                
                {/* Only show follow button if viewing someone else's profile */}
                {currentUserId !== userId && (
                  <FollowButton userId={userId} />
                )}
              </div>
              
              {/* Add followers count */}
              <div className="mt-4">
                <FollowersCount userId={userId} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="listings">Listings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {userData?.firstName && userData?.lastName 
                      ? `${userData.firstName} ${userData.lastName}` 
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{userData?.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{formatDate(userData?.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verification Status</p>
                  <div className="flex items-center gap-2">
                    {userData?.isKycVerified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Verified</span>
                      </>
                    ) : (
                      <span className="font-medium">Not Verified</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="listings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <UserListings userId={userId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CompletionRate userId={userId} />
      
      <UserReviews userId={userId} />

      
    </div>
  );
} 