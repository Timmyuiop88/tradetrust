"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/app/components/custom-toast"

// Fetch the user's balance
const fetchBalance = async () => {
  const response = await fetch('/api/user/balance')
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch balance')
  }
  return response.json()
}

// Deposit funds to the user's balance
const depositFunds = async ({ amount, paymentMethod }) => {
  const response = await fetch('/api/user/balance/deposit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount, paymentMethod })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to deposit funds')
  }
  
  return response.json()
}

export function useBalance() {
  const queryClient = useQueryClient()

  // Query hook for fetching the balance
  const useGetBalance = () => {
    return useQuery({
      queryKey: ['balance'],
      queryFn: fetchBalance,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    })
  }

  // Mutation hook for depositing funds
  const useDepositFunds = () => {
    return useMutation({
      mutationFn: depositFunds,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['balance'] })
        toast.success('Funds deposited successfully')
      },
      onError: (error) => {
        toast.error(error.message)
      }
    })
  }

  return {
    useGetBalance,
    useDepositFunds
  }
}

// Helper function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
} 