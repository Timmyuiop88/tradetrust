"use client"

import { useState, useEffect } from "react"
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, DollarSign, CreditCard, AlertCircle } from "lucide-react"
import { Button } from "@/app/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { AddBalanceSheet } from "@/app/components/add-balance-sheet"
import { toast } from "sonner"

export default function BalancePage() {
  const [balanceData, setBalanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/balance')
        if (response.ok) {
          const data = await response.json()
          setBalanceData(data)
        }
      } catch (error) {
        console.error('Error fetching balance:', error)
        toast.error("Failed to load balance data")
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
  
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(new Date(date));
  }
  
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'WITHDRAWAL':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />
      case 'SALE':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'PURCHASE':
        return <CreditCard className="h-4 w-4 text-blue-500" />
      case 'REFUND':
        return <ArrowUpRight className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }
  
  return (
    <div className="container max-w-5xl py-6 space-y-8 px-1">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Balance</h1>
        <p className="text-muted-foreground">Manage your funds and view transaction history</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Buying Balance</CardTitle>
            <p className="text-sm text-muted-foreground">Available for purchases</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {loading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  formatCurrency(balanceData?.balance?.buyingBalance || 0)
                )}
              </div>
              <AddBalanceSheet>
                <Button>Add Funds</Button>
              </AddBalanceSheet>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Selling Balance</CardTitle>
            <p className="text-sm text-muted-foreground">Earnings from sales (not available for purchases)</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">
                {loading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  formatCurrency(balanceData?.balance?.sellingBalance || 0)
                )}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>Withdrawals coming soon</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : balanceData?.recentTransactions?.length > 0 ? (
            <div className="space-y-4">
              {balanceData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No transactions yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your transaction history will appear here
              </p>
              <AddBalanceSheet>
                <Button>Add Your First Funds</Button>
              </AddBalanceSheet>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 