"use client";

import { ReviewsDisplay } from "@/app/components/reviews-display";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card";
import { useSession } from "next-auth/react";

export function UserReviews({ userId }) {
  const { data: session } = useSession();
  const displayUserId = userId || session?.user?.id;

  if (!displayUserId) {
    return null;
  }

  return (
    <div className="mt-8">
      <ReviewsDisplay userId={displayUserId} />
    </div>
  );
} 