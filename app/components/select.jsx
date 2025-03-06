"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "../lib/utils"

export function Select({ value, onChange, options, placeholder = "Select an option...", disabled = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState("")
  const selectRef = useRef(null)

  // Set the selected label based on the value
  useEffect(() => {
    const selected = options.find(option => option.value === value)
    setSelectedLabel(selected ? selected.label : placeholder)
  }, [value, options, placeholder])

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (option) => {
    onChange(option.value)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={selectRef}>
      <button
        type="button"
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "transition-colors duration-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={cn(
          "block truncate",
          !value && "text-gray-500 dark:text-gray-400"
        )}>
          {selectedLabel}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-400",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                className={cn(
                  "px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                  value === option.value && "bg-primary/10 text-primary"
                )}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
} 