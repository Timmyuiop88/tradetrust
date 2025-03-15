"use client";

import { Button } from "@/app/components/button";
import { useFollow } from "@/app/hooks/useFollow";
import { Loader2, HeartIcon, HeartOffIcon } from "lucide-react";

export function FollowButton({ userId, className }) {
  const { useIsFollowing, useFollowUser, useUnfollowUser } = useFollow();
  const { data: isFollowing, isLoading: isCheckingFollow } = useIsFollowing(userId);
  const { mutate: followUser, isPending: isFollowingPending } = useFollowUser();
  const { mutate: unfollowUser, isPending: isUnfollowingPending } = useUnfollowUser();

  const handleToggleFollow = () => {
    if (isFollowing) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };

  const isLoading = isCheckingFollow || isFollowingPending || isUnfollowingPending;

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={className}
      onClick={handleToggleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <HeartOffIcon className="h-4 w-4" />
      ) : (
        <HeartIcon className="h-4 w-4" />
      )}
    </Button>
  );
} 