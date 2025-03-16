import { Star } from "lucide-react";
import { cn } from "../lib/utils";

export function StarRating({ rating, size = "small", showValue = false, className }) {
  // Calculate the number of full, half, and empty stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  // Determine star size based on the size prop
  const starSize = size === "small" ? "h-3.5 w-3.5" : 
                  size === "medium" ? "h-4 w-4" : 
                  size === "large" ? "h-5 w-5" : "h-3.5 w-3.5";
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star 
            key={`full-${i}`} 
            className={cn(starSize, "text-yellow-500 fill-yellow-500")} 
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <span className="relative">
            <Star className={cn(starSize, "text-yellow-500")} />
            <span className="absolute inset-0 overflow-hidden w-[50%]">
              <Star className={cn(starSize, "text-yellow-500 fill-yellow-500")} />
            </span>
          </span>
        )}
        
        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star 
            key={`empty-${i}`} 
            className={cn(starSize, "text-yellow-500")} 
          />
        ))}
      </div>
      
      {/* Optional numeric rating */}
      {showValue && rating > 0 && (
        <span className="ml-1.5 text-xs text-muted-foreground">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}