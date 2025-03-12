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
import { toast } from "sonner"
import Link from "next/link"
import { Badge } from "@/app/components/badge"

export default function BalancePage() {
  const [balanceData, setBalanceData] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("transactions")
  
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/user/balance')
        if (response.ok) {
          const data = await response.json()
          setBalanceData(data)
          setTransactions(data.recentTransactions || [])
          setTransactionsLoading(false)
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
  
  useEffect(() => {
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
    
    fetchWithdrawals()
  }, [])
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
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
    setLoading(true)
    setTransactionsLoading(true)
    setWithdrawalsLoading(true)
    
    try {
      const [balanceResponse, withdrawalsResponse] = await Promise.all([
        fetch('/api/user/balance'),
        fetch('/api/withdrawals')
      ])
      
      if (balanceResponse.ok) {
        const data = await balanceResponse.json()
        setBalanceData(data)
        setTransactions(data.recentTransactions || [])
      }
      
      if (withdrawalsResponse.ok) {
        const data = await withdrawalsResponse.json()
        setWithdrawals(data.withdrawalRequests || [])
      }
      
      toast.success("Data refreshed successfully")
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error("Failed to refresh data")
    } finally {
      setLoading(false)
      setTransactionsLoading(false)
      setWithdrawalsLoading(false)
    }
  }
  
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
                      <div className="text-right self-end sm:self-center">
                        <div className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                        </div>
                        {transaction.fee > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Fee: {formatCurrency(transaction.fee)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6 text-muted-foreground" />
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
                          <p className="font-medium">Withdrawal via {withdrawal.payoutSetting?.method || 'bank'}</p>
                          {getWithdrawalStatusBadge(withdrawal.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(withdrawal.createdAt)}
                        </p>
                      </div>
                      <div className="text-right self-end sm:self-center">
                        <div className="font-medium text-red-600">
                          -{formatCurrency(withdrawal.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Fee: {formatCurrency(withdrawal.fee)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Plane className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-1">No withdrawals yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your withdrawal history will appear here
                  </p>
                  <WithdrawSheet balance={balanceData?.balance?.sellingBalance || 0} onSuccess={refreshData}>
                    <Button>Make Your First Withdrawal</Button>
                  </WithdrawSheet>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
} 