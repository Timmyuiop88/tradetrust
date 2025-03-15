"use client";

import { useState, useEffect } from "react";
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

export default function FollowersPage({ params }) {
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>*/}

      <Card>
        <CardHeader>
          <CardTitle>Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="following">Favourites</TabsTrigger>
            </TabsList>
            
            {isError && (
              <div className="mt-6 text-center text-red-500">
                <p>Failed to load data. Please try again.</p>
              </div>
            )}
            
            <TabsContent value="followers">
              {isLoadingFollowers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : followers.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No followers yet
                </div>
              ) : (
                <div className="space-y-4">
                  {followers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.image} />
                          <AvatarFallback>
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center">
                            {user.firstName} {user.lastName}
                            {user.isKycVerified && (
                              <Badge variant="success" className="ml-2 h-5 px-1">
                                <Shield className="h-3 w-3 mr-1" />
                                <span className="text-xs">Verified</span>
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => router.push(`/dashboard/profile/${user.id}`)}
                        >
                          View
                        </Button>
                        {currentUserId !== user.id && (
                          <FollowButton userId={user.id} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="following">
              {isLoadingFollowing ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : following.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  Not following anyone yet
                </div>
              ) : (
                <div className="space-y-4">
                  {following.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.image} />
                          <AvatarFallback>
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center">
                            {user.firstName} {user.lastName}
                            {user.isKycVerified && (
                              <Badge variant="success" className="ml-2 h-5 px-1">
                                <Shield className="h-3 w-3 mr-1" />
                                <span className="text-xs">Verified</span>
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => router.push(`/dashboard/profile/${user.id}`)}
                        >
                          View
                        </Button>
                        {currentUserId !== user.id && (
                          <FollowButton userId={user.id} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {activeTab === "followers" && followersPagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {followersPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page === followersPagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {activeTab === "following" && followingPagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {followingPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={page === followingPagination.totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 