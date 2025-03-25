"use client";

import { useState, useEffect, Suspense } from "react";
import { useFollow } from "@/app/hooks/useFollow";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs";
import { Button } from "@/app/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/avatar";
import { FollowButton } from "@/app/components/follow-button";
import { Loader2, ChevronLeft, ChevronRight, ArrowLeft, Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import { Badge } from "@/app/components/badge";
import { useParams } from "next/navigation";

// Component that uses search params
function FollowersPageContent() {
  const params = useParams();
  const userId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'following' ? 'following' : 'followers';
  
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [page, setPage] = useState(1);
  const { useGetFollowers, useGetFollowing } = useFollow();
  
  // Update URL when tab changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (activeTab === 'following') {
      newParams.set('tab', 'following');
    } else {
      newParams.delete('tab');
    }
    router.replace(`/dashboard/profile/${userId}/followers?${newParams.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams, userId]);
  
  const { 
    data: followersData, 
    isLoading: isLoadingFollowers,
    error: followersError
  } = useGetFollowers(userId, page, 20);
  
  const { 
    data: followingData, 
    isLoading: isLoadingFollowing,
    error: followingError
  } = useGetFollowing(userId, page, 20);

  const followers = followersData?.followers || [];
  const following = followingData?.following || [];
  const followersPagination = followersData?.pagination || { totalPages: 1 };
  const followingPagination = followingData?.pagination || { totalPages: 1 };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    const pagination = activeTab === "followers" ? followersPagination : followingPagination;
    if (page < pagination.totalPages) setPage(page + 1);
  };

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const isError = activeTab === 'followers' ? followersError : followingError;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <Card>
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 mr-2"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <CardTitle className="text-base sm:text-lg">Connections</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-6">
            <TabsList className="grid w-full grid-cols-1 h-9 sm:h-10">
              <TabsTrigger value="following" className="text-xs sm:text-sm">Favourites</TabsTrigger>
            </TabsList>
            
            {isError && (
              <div className="mt-4 sm:mt-6 text-center text-red-500 text-sm">
                <p>Failed to load data. Please try again.</p>
              </div>
            )}
            
            <TabsContent value="followers">
              {isLoadingFollowers ? (
                <div className="flex justify-center py-6 sm:py-8">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                </div>
              ) : followers.length === 0 ? (
                <div className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
                  No followers yet
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-4">
                  {followers.map((user) => (
                    <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarImage src={user.image} />
                          <AvatarFallback className="text-xs sm:text-sm">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center flex-wrap gap-1 sm:gap-2 text-sm sm:text-base">
                            {user.firstName} {user.lastName}
                            {user.isKycVerified && (
                              <Badge variant="success" className="h-4 sm:h-5 px-1 text-[10px] sm:text-xs">
                                <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                <span>Verified</span>
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs sm:text-sm"
                          onClick={() => router.push(`/dashboard/profile/${user.id}`)}
                        >
                          View
                        </Button>
                        {currentUserId !== user.id && (
                          <FollowButton 
                            userId={user.id} 
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="following">
              {isLoadingFollowing ? (
                <div className="flex justify-center py-6 sm:py-8">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
                </div>
              ) : following.length === 0 ? (
                <div className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
                  Not following anyone yet
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-4">
                  {following.map((user) => (
                    <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarFallback className="text-xs sm:text-sm">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center flex-wrap gap-1 sm:gap-2 text-sm sm:text-base">
                            {user.firstName} {user.lastName}
                            {user.isKycVerified && (
                              <Badge variant="success" className="h-4 sm:h-5 px-1 text-[10px] sm:text-xs">
                                <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                                <span>Verified</span>
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 text-xs sm:text-sm"
                          onClick={() => router.push(`/dashboard/profile/${user.id}`)}
                        >
                          View
                        </Button>
                        {currentUserId !== user.id && (
                          <FollowButton 
                            userId={user.id} 
                            className="h-8 text-xs sm:text-sm"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination - Updated for better mobile display */}
          {activeTab === "followers" && followersPagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 sm:mt-6 px-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1}
                className="h-8 text-xs sm:text-sm px-2 sm:px-3"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                Prev
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {page} / {followersPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page === followersPagination.totalPages}
                className="h-8 text-xs sm:text-sm px-2 sm:px-3"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" />
              </Button>
            </div>
          )}

          {activeTab === "following" && followingPagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 sm:mt-6 px-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1}
                className="h-8 text-xs sm:text-sm px-2 sm:px-3"
              >
                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                Prev
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {page} / {followingPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page === followingPagination.totalPages}
                className="h-8 text-xs sm:text-sm px-2 sm:px-3"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Update loading fallback for better mobile display
function FollowersPageFallback() {
  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <Card>
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Connections</CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex justify-center py-8 sm:py-12">
            <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with Suspense boundary
export default function FollowersPage() {
  return (
    <Suspense fallback={<FollowersPageFallback />}>
      <FollowersPageContent />
    </Suspense>
  );
} 