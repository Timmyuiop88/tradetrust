"use client"

import React from "react"
import { Star } from "lucide-react"
import { cn } from "@/app/lib/utils"

export function StarRating({ 
  rating = 0, 
  maxRating = 5, 
  size = "sm", 
  showValue = false,
  className = "",
  color = "amber" 
}) {
  const fullStars = Math.floor(rating)
  const partialStar = rating % 1
  const emptyStars = Math.floor(maxRating - rating)
  
  const colorClasses = {
    amber: "text-amber-400",
    yellow: "text-yellow-400",
    gold: "text-yellow-500",
    primary: "text-primary"
  }
  
  const selectedColor = colorClasses[color] || colorClasses.amber
  
  const sizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }
  
  const selectedSize = sizes[size] || sizes.sm
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className={cn(selectedSize, selectedColor, "fill-current")} />
        ))}
        
        {/* Partial star */}
        {partialStar > 0 && (
          <div className="relative">
            <Star className={cn(selectedSize, "text-gray-300 fill-current")} />
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${partialStar * 100}%` }}>
              <Star className={cn(selectedSize, selectedColor, "fill-current")} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className={cn(selectedSize, "text-gray-300")} />
        ))}
      </div>
      
      {showValue && (
        <span className="ml-1 text-sm font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}