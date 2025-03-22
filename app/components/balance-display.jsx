"use client"

import { Wallet } from "lucide-react"
import { Skeleton } from "@/app/components/skeleton"
import { useBalance, formatCurrency } from "@/app/hooks/useBalance"

export function BalanceDisplay() {
  const { useGetBalance } = useBalance()
  const { data: balanceData, isLoading, isError } = useGetBalance()
  
  if (isLoading) {
    return (
      <div className="flex items-center space-x-1">
        <Wallet className="h-4 w-4 text-primary" />
        <Skeleton className="h-5 w-24" />
      </div>
    )
  }
  
  if (isError || !balanceData?.balance) {
    return (
      <div className="flex items-center space-x-1 text-sm">
        <Wallet className="h-4 w-4 text-primary" />
        <span className="font-medium">$0.00</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center space-x-1 text-sm">
      <Wallet className="h-4 w-4 text-primary" />
      <span className="font-medium">{formatCurrency(balanceData.balance.buyingBalance)}</span>
    </div>
  )
} 