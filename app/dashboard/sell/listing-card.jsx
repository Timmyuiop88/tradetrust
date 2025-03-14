import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/app/components/card";
import { Badge } from "@/app/components/badge";
import { formatCurrency } from "@/lib/utils";

export function ListingCard({ listing }) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="flex-grow p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{listing.title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2">{listing.description}</p>
        </div>
        <Badge variant={listing.status === "ACTIVE" ? "success" : "secondary"}>
          {listing.status}
        </Badge>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <span className="font-bold">{formatCurrency(listing.price)}</span>
        <span className="text-xs text-muted-foreground">
          Listed: {new Date(listing.createdAt).toLocaleDateString()}
        </span>
      </CardFooter>
    </Card>
  );
}

export function ListingCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardContent className="flex-grow p-4 flex items-center justify-between">
        <div className="w-3/4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-1 animate-pulse"></div>
        </div>
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </CardFooter>
    </Card>
  );
} 