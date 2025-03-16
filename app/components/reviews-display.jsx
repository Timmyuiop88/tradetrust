"use client";

import { useState } from "react";
import { useReviews } from "@/app/hooks/useReviews";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/app/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs";
import { Star, ChevronRight, Loader2, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/avatar";
import Link from "next/link";

export function ReviewsDisplay({ userId, compact = true }) {
  const [currentTab, setCurrentTab] = useState("all");
  const { useGetReviews } = useReviews();
  
  const rating = currentTab === "all" ? null : 
                currentTab === "positive" ? "positive" : "negative";
  
  const { data, isLoading, isError } = useGetReviews({
    userId,
    rating,
    page: 1,
    limit: compact ? 5 : 10,
  });

  const reviews = data?.reviews || [];
  const pagination = data?.pagination || { totalPages: 1, total: 0 };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex flex-row items-center justify-between w-full">
          Reviews
          <Link href={`/dashboard/profile/${userId}/reviews`} className="flex-end">
            <Button variant="outline" className="w-full">
              View All Reviews
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          </CardTitle>
        {pagination.total > 0 && (
          <div className="text-sm text-muted-foreground">
            {pagination.total} total
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Reviews</TabsTrigger>
            <TabsTrigger value="positive">Positive</TabsTrigger>
            <TabsTrigger value="negative">Negative</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(compact ? 3 : 5)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full ml-1"></div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="mt-2 h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center text-red-500 py-4">
            Failed to load reviews. Please try again.
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No reviews found.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={review.reviewer.image} />
                      <AvatarFallback>
                        {getInitials(review.reviewer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{review.reviewer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <div className="mt-3 text-sm">{review.comment}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {review.listing ? (
                    <>
                      For: {review.listing.username || 'Unknown listing'}
                      {review.listing.platform?.name ? ` on ${review.listing.platform.name}` : ''}
                    </>
                  ) : (
                    'For: Unknown listing'
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
        <CardFooter className="pt-0">
          
        </CardFooter>
      
      {!compact && pagination.totalPages > 1 && (
        <CardFooter className="flex justify-between items-center">
          <div className="flex-1">
            <div className="text-sm text-center">
              Showing page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full" 
                style={{ width: `${(pagination.currentPage / pagination.totalPages) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 