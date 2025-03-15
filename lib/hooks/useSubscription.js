"use client"

import { useQuery } from '@tanstack/react-query'

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await fetch('/api/user/subscription')
      if (!response.ok) {
        throw new Error('Failed to fetch subscription')
      }
      return response.json()
    }
  })
} 