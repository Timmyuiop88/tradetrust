"use client"

import { cn } from "../../lib/utils"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { useState } from "react"

export function AuthInput({ 
  label, 
  type = "text", 
  error, 
  className,
  icon: Icon,
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === "password" && showPassword ? "text" : type

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
        <input
          type={inputType}
          className={cn(
            "flex h-11 w-full rounded-md border bg-background px-3 py-2",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            Icon && "pl-10",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="flex items-center space-x-1 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  )
} 