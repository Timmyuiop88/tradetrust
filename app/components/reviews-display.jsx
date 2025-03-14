"use client";

import { useState } from "react";
import { useReviews } from "@/app/hooks/useReviews";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs";
import { Star, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/avatar";

export function ReviewsDisplay({ userId }) {
  const [currentTab, setCurrentTab] = useState("all");
  const [page, setPage] = useState(1);
  const { useGetReviews } = useReviews();
  
  const rating = currentTab === "all" ? null : currentTab;
  const { data, isLoading, isError } = useGetReviews({
    userId,
    rating,
    page,
    limit: 5,
  });

  const reviews = data?.reviews || [];
  const pagination = data?.pagination || { totalPages: 1 };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) setPage(page + 1);
  };

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
      <CardHeader>
        <CardTitle>Reviews</CardTitle>
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
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <>
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
                    For: {review.listing.title}
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
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
                  Page {page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 