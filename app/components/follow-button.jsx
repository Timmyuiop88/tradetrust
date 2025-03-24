"use client";

import { useState } from "react";
import { Button } from "@/app/components/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "@/app/components/custom-toast";

export function FollowButton({ sellerId, isFollowing: initialIsFollowing = false, size = "default" }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  
  const handleFollow = async () => {
    if (!session?.user) {
      toast.error("You need to be logged in to follow sellers");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/sellers/${sellerId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update follow status");
      }
      
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed seller" : "Following seller");
    } catch (error) {
      console.error("Follow error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size={size}
      onClick={handleFollow}
      disabled={isLoading}
      className="gap-1"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
} 