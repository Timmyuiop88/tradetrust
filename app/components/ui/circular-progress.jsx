"use client"

import React from "react"
import { cn } from "@/app/lib/utils"

export function CircularProgress({ 
  value = 0, 
  size = 40, 
  strokeWidth = 3, 
  color = "primary", 
  className,
  showValue = true
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(Math.max(value, 0), 100)
  const offset = circumference - (progress / 100) * circumference
  
  const colorClasses = {
    primary: "text-primary stroke-primary",
    secondary: "text-secondary stroke-secondary",
    success: "text-green-500 stroke-green-500",
    warning: "text-yellow-500 stroke-yellow-500",
    danger: "text-red-500 stroke-red-500",
    gray: "text-gray-400 stroke-gray-400"
  }
  
  const selectedColor = colorClasses[color] || colorClasses.primary
  
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          className="stroke-muted"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          className={selectedColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showValue && (
        <div className="absolute text-xs font-medium">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
} 