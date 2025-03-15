"use client";

import { useFollow } from "@/app/hooks/useFollow";
import Link from "next/link";
import { Users } from "lucide-react";

export function FollowersCount({ userId, displayMode = "normal" }) {
  const { useFollowersCount, useFollowingCount } = useFollow();
  const { data: followersCount, isLoading: isLoadingFollowers } = useFollowersCount(userId);
  const { data: followingCount, isLoading: isLoadingFollowing } = useFollowingCount(userId);

  if (displayMode === "compact") {
    return (
      <>
        {isLoadingFollowing ? (
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <span className="font-medium">{followingCount || 0}</span>
        )}
      </>
    );
  }

  return (
    <div className="flex space-x-4 text-sm">
      {/*<Link href={`/dashboard/profile/${userId}/followers`} className="flex items-center hover:text-primary transition-colors">
        <Users className="h-4 w-4 mr-1" />
        {isLoadingFollowers ? (
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <span>
            <span className="font-medium">{followersCount || 0}</span> Followers
          </span>
        )}
      </Link>*/}
      <Link href={`/dashboard/profile/${userId}/followers?tab=following`} className="flex items-center hover:text-primary transition-colors">
        <Users className="h-4 w-4 mr-1" />
        {isLoadingFollowing ? (
          <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ) : (
          <span>
            <span className="font-medium">{followingCount || 0}</span> Favourites
          </span>
        )}
      </Link>
    </div>
  );
} 