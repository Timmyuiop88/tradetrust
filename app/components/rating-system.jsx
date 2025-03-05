"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "../lib/utils"

export function RatingSystem({ initialRating = 0, onChange, readOnly }) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)

  const handleRating = (value) => {
    if (readOnly) return
    setRating(value)
    onChange?.(value)
  }

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          className={cn(
            "focus:outline-none transition-colors",
            readOnly && "cursor-default"
          )}
          onClick={() => handleRating(value)}
          onMouseEnter={() => !readOnly && setHover(value)}
          onMouseLeave={() => !readOnly && setHover(0)}
        >
          <Star
            className={cn(
              "w-5 h-5",
              (hover || rating) >= value 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  )
} 