"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/app/components/button"

const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={className}
    {...props}
  />
)

const PaginationContent = ({
  className,
  ...props
}) => (
  <ul className={`flex flex-row items-center gap-1 ${className}`} {...props} />
)

const PaginationItem = ({
  className,
  ...props
}) => (
  <li className={className} {...props} />
)

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}) => (
  <Button
    aria-current={isActive ? "page" : undefined}
    variant={isActive ? "default" : "outline"}
    size={size}
    className={className}
    {...props}
  />
)

const PaginationPrevious = ({
  className,
  ...props
}) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={`gap-1 pl-2.5 ${className}`}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
)

const PaginationNext = ({
  className,
  ...props
}) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={`gap-1 pr-2.5 ${className}`}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
)

const PaginationEllipsis = ({
  className,
  ...props
}) => (
  <span
    aria-hidden
    className={`flex h-9 w-9 items-center justify-center ${className}`}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
)

export function PaginationControl({ 
  currentPage, 
  totalPages, 
  onPageChange,
  maxVisiblePages = 5
}) {
  if (totalPages <= 1) return null
  
  const renderPageNumbers = () => {
    const pages = []
    
    // Always show first page
    pages.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => onPageChange(1)}
        className="h-8 w-8 p-0"
      >
        1
      </Button>
    )
    
    // Calculate range of visible pages
    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3)
    
    if (endPage - startPage < maxVisiblePages - 3) {
      startPage = Math.max(2, endPage - (maxVisiblePages - 3) + 1)
    }
    
    // Add ellipsis if needed before visible range
    if (startPage > 2) {
      pages.push(
        <Button key="start-ellipsis" variant="ghost" size="sm" disabled className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      )
    }
    
    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          className="h-8 w-8 p-0"
        >
          {i}
        </Button>
      )
    }
    
    // Add ellipsis if needed after visible range
    if (endPage < totalPages - 1) {
      pages.push(
        <Button key="end-ellipsis" variant="ghost" size="sm" disabled className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      )
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="h-8 w-8 p-0"
        >
          {totalPages}
        </Button>
      )
    }
    
    return pages
  }
  
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {renderPageNumbers()}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} 