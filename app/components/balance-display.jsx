"use client"

import { useState, useEffect } from "react"
import { Wallet } from "lucide-react"
import { Skeleton } from "@/app/components/skeleton"

export function BalanceDisplay() {
  const [balanceData, setBalanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/user/balance')
        if (response.ok) {
          const data = await response.json()
          setBalanceData(data)
        }
      } catch (error) {
        console.error('Error fetching balance:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBalance()
  }, [])
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  }
  
  if (loading) {
    return (
      <div className="flex items-center space-x-1">
        <Wallet className="h-4 w-4 text-primary" />
        <Skeleton className="h-5 w-24" />
      </div>
    )
  }
  
  if (!balanceData?.balance) {
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