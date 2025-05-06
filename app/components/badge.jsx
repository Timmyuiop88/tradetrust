"use client"

import { cn } from "../lib/utils"

export function Badge({ variant = "default", className, children, ...props }) {


  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-primary/10 text-primary",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "PENDING" && "bg-gray-500 text-white",
        variant === "WAITING_FOR_SELLER" && "bg-yellow-500 text-white",
        variant === "WAITING_FOR_BUYER" && "bg-blue-500 text-white",
        variant === "COMPLETED" && "bg-green-500 text-white",
        variant === "CANCELLED" && "bg-red-500 text-white",
        variant === "DISPUTED" && "bg-orange-500 text-white",
        variant === "SELLER_DECLINED" && "bg-purple-500 text-white",
        
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
} 