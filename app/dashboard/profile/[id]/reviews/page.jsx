"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useReviews } from "@/app/hooks/useReviews";
import { Button } from "@/app/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ReviewsDisplay } from "@/app/components/reviews-display";
import Link from "next/link";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/pagination";
import { useParams } from "next/navigation";

// Component that uses search params
function ReviewsPageContent() {
  const params = useParams();
  const userId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialTab = searchParams.get("filter") || "all";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const { useGetReviews } = useReviews();
  
  const rating = currentTab === "all" ? null : 
                currentTab === "positive" ? "positive" : "negative";
  
  const { data, isLoading } = useGetReviews({
    userId,
    rating,
    page: currentPage,
    limit: 10,
  });

  const pagination = data?.pagination || { totalPages: 1, total: 0, currentPage: 1 };

  // Update URL when filter or page changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentTab !== "all") {
      params.set("filter", currentTab);
    }
    if (currentPage !== 1) {
      params.set("page", currentPage.toString());
    }
    
    const query = params.toString();
    const url = `/dashboard/profile/${userId}/reviews${query ? `?${query}` : ''}`;
    
    router.push(url, { scroll: false });
  }, [currentTab, currentPage, userId, router]);

  // Handle tab change
  const handleTabChange = (value) => {
    setCurrentTab(value);
    setCurrentPage(1); // Reset to page 1 when changing tabs
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;
    const currentPageNum = pagination.currentPage;
    
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always include first, last, and pages around current
    const pages = [1];
    
    if (currentPageNum > 3) {
      pages.push("ellipsis-start");
    }
    
    // Pages around current
    const start = Math.max(2, currentPageNum - 1);
    const end = Math.min(totalPages - 1, currentPageNum + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPageNum < totalPages - 2) {
      pages.push("ellipsis-end");
    }
    
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <ArrowLeft onClick={() => router.back()} className="h-4 w-4 mr-2" />
        <h1 className="text-2xl font-bold">User Reviews</h1>
      </div>
      
          
      <ReviewsDisplay userId={userId} compact={false} />
      
      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(currentPage - 1)}
                  />
                </PaginationItem>
              )}
              
              {getPageNumbers().map((page, i) => {
                if (page === "ellipsis-start" || page === "ellipsis-end") {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {currentPage < pagination.totalPages && (
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

// Fallback loading component
function ReviewsPageFallback() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">User Reviews</h1>
      </div>
      <div className="flex justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ReviewsPage() {
  return (
    <Suspense fallback={<ReviewsPageFallback />}>
      <ReviewsPageContent />
    </Suspense>
  );
} 