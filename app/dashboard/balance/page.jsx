"use client"

import { useState, useEffect } from "react"
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Clock, DollarSign, 
  CreditCard, AlertCircle, Plane, ChevronLeft, RefreshCw
} from "lucide-react"
import { Button } from "@/app/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { AddBalanceSheet } from "@/app/components/add-balance-sheet"
import { WithdrawSheet } from "@/app/components/withdraw-sheet"
import { toast } from "@/app/components/custom-toast"
import Link from "next/link"
import { Badge } from "@/app/components/badge"
import { useBalance, formatCurrency } from "@/app/hooks/useBalance"
import { useQueryClient } from "@tanstack/react-query"

export default function BalancePage() {
  const { useGetBalance } = useBalance()
  const { 
    data: balanceData, 
    isLoading: loading, 
    isError, 
    error,
    refetch: refetchBalance
  } = useGetBalance()

  const queryClient = useQueryClient()
  
  const [withdrawals, setWithdrawals] = useState([])
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("transactions")
  
  useEffect(() => {
    fetchWithdrawals()
  }, [])
  
  const fetchWithdrawals = async () => {
    try {
      setWithdrawalsLoading(true)
      const response = await fetch('/api/withdrawals')
      if (response.ok) {
        const data = await response.json()
        setWithdrawals(data.withdrawalRequests || [])
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
    } finally {
      setWithdrawalsLoading(false)
    }
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowUpRight className="h-5 w-5 text-green-500" />;
      case 'WITHDRAWAL':
        return <ArrowDownRight className="h-5 w-5 text-red-500" />;
      case 'PURCHASE':
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'SALE':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  }
  
  const getWithdrawalStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  }
  
  const refreshData = async () => {
    try {
      await Promise.all([
        refetchBalance(),
        fetchWithdrawals()
      ])
      
      toast.success("Data refreshed successfully")
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error("Failed to refresh data")
    }
  }

  // Get transactions from the balance data
  const transactions = balanceData?.recentTransactions || []
  const transactionsLoading = loading
  
  return (
    <div className="container max-w-5xl py-6 space-y-8 px-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-2">Your Balance</h1>
          <p className="text-muted-foreground">Manage your funds and view transaction history</p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData} disabled={loading || withdrawalsLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${(loading || withdrawalsLoading) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-l-4 border-l-blue-500">
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
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Selling Balance</CardTitle>
            <p className="text-sm text-muted-foreground">Available for withdrawal</p>
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
              <WithdrawSheet balance={balanceData?.balance?.sellingBalance || 0} onSuccess={refreshData}>
                <Button variant="outline">Withdraw</Button>
              </WithdrawSheet>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>
          
          <CardContent className="pt-6">
            <TabsContent value="transactions">
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
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
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b last:border-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{transaction.description || transaction.type}</p>
                          {transaction.status !== 'COMPLETED' && (
                            <Badge variant="outline" className="text-xs">
                              {transaction.status}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className={`font-medium whitespace-nowrap ${transaction.type === 'DEPOSIT' || transaction.type === 'SALE' ? 'text-green-600' : transaction.type === 'WITHDRAWAL' || transaction.type === 'PURCHASE' ? 'text-red-600' : ''}`}>
                        {transaction.type === 'DEPOSIT' || transaction.type === 'SALE' ? '+' : transaction.type === 'WITHDRAWAL' || transaction.type === 'PURCHASE' ? '-' : ''}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="withdrawals">
              {withdrawalsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
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
              ) : withdrawals.length > 0 ? (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b last:border-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Plane className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">Withdrawal to {withdrawal.paymentMethod}</p>
                          {getWithdrawalStatusBadge(withdrawal.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(withdrawal.createdAt)}
                        </p>
                      </div>
                      <div className="font-medium whitespace-nowrap text-red-600">
                        -{formatCurrency(withdrawal.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No withdrawal requests found</p>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
} 