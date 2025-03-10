"use client"

import React from 'react';
import { Skeleton } from "@/app/components/ui/skeleton";

export default function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Left side message (other user) */}
      <div className="flex mb-4 justify-start">
        <div className="max-w-[80%]">
          <Skeleton className="h-24 w-64 rounded-lg rounded-tl-none" />
          <div className="flex mt-1">
            <Skeleton className="h-3 w-12 mt-1" />
          </div>
        </div>
      </div>
      
      {/* Right side message (current user) */}
      <div className="flex mb-4 justify-end">
        <div className="max-w-[80%]">
          <Skeleton className="h-16 w-48 rounded-lg rounded-tr-none" />
          <div className="flex justify-end mt-1">
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>
      </div>
      
      {/* Left side message (other user) - shorter */}
      <div className="flex mb-4 justify-start">
        <div className="max-w-[80%]">
          <Skeleton className="h-12 w-40 rounded-lg rounded-tl-none" />
          <div className="flex mt-1">
            <Skeleton className="h-3 w-12 mt-1" />
          </div>
        </div>
      </div>
      
      {/* Date separator */}
      <div className="flex justify-center my-4">
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      
      {/* Right side message with image (current user) */}
      <div className="flex mb-4 justify-end">
        <div className="max-w-[80%]">
          <Skeleton className="h-40 w-56 rounded-lg rounded-tr-none mb-2" />
          <Skeleton className="h-8 w-40 rounded-lg" />
          <div className="flex justify-end mt-1">
            <Skeleton className="h-3 w-16 mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
