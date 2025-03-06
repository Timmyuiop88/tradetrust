"use client"

import { cn } from "../lib/utils"

export function Textarea({
  className,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled = false,
  ...props
}) {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      {...props}
    />
  )
} 