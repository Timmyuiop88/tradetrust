"use client"

import { useState, useEffect } from "react"
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Clock, DollarSign, 
  CreditCard, AlertCircle, Plane, ChevronLeft, RefreshCw,
  MoreVertical
} from "lucide-react"
import { Button } from "@/app/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { AddBalanceSheet } from "@/app/components/add-balance-sheet"
import { WithdrawSheet } from "@/app/components/withdraw-sheet"
import { toast } from "sonner"
import Link from "next/link"
import { Badge } from "@/app/components/badge"
import { useBalance, formatCurrency } from "@/app/hooks/useBalance"
import { useQueryClient } from "@tanstack/react-query"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

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
  const [refreshingPayment, setRefreshingPayment] = useState(null)
  
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
  
  const handleRefreshPaymentStatus = async (transaction) => {
    try {
      setRefreshingPayment(transaction.id)
      
      const findResponse = await fetch(`/api/payments/oxapay/find-by-transaction/${transaction.id}`)
      
      if (!findResponse.ok) {
        const error = await findResponse.json()
        throw new Error(error.message || 'Failed to find payment')
      }
      
      const paymentData = await findResponse.json()
      
      const statusResponse = await fetch(`/api/payments/oxapay/status/${paymentData.paymentId}`)
      
      if (!statusResponse.ok) {
        const error = await statusResponse.json()
        throw new Error(error.message || 'Failed to check payment status')
      }
      
      const statusData = await statusResponse.json()
      
      if (statusData.status === 'COMPLETED') {
        toast.success("Payment Completed", {
          description: "Your deposit has been successfully processed."
        })
        
        refetchBalance()
      } else if (statusData.status === 'CONFIRMED') {
        toast.info("Payment Confirming", {
          description: "Your payment is being confirmed. Please wait a moment."
        })
      } else if (statusData.status === 'FAILED') {
        toast.error("Payment Failed", {
          description: "Your payment has failed. Please try again."
        })
      } else {
        toast.warning("Payment Pending", {
          description: "Your payment is still pending. Please complete the payment."
        })
      }
    } catch (error) {
      console.error('Error refreshing payment status:', error)
      toast.error("Error", {
        description: error.message || "Failed to refresh payment status"
      })
    } finally {
      setRefreshingPayment(null)
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
  
  const getTransactionStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'PROCESSING':
        return <Badge variant="secondary">Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }
  
  const getWithdrawalStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'PROCESSING':
        return <Badge variant="secondary">Processing</Badge>;
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }
  
  if (loading) {
    return (
      <div className="container max-w-screen-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <ChevronLeft className="h-5 w-5" />
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Back to Dashboard
          </Link>
        </div>
        <div className="space-y-6">
          <div className="h-[200px] rounded-lg border bg-card animate-pulse" />
          <div className="h-[400px] rounded-lg border bg-card animate-pulse" />
        </div>
      </div>
    )
  }
  
  if (isError) {
    return (
      <div className="container max-w-screen-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <ChevronLeft className="h-5 w-5" />
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Back to Dashboard
          </Link>
        </div>
        <div className="p-6 rounded-lg border bg-destructive/10 text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p>Error loading balance: {error?.message || 'Unknown error'}</p>
        </div>
      </div>
    )
  }
  
  const { balance, recentTransactions = [] } = balanceData || {}
  
  return (
    <div className="container max-w-screen-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <ChevronLeft className="h-5 w-5" />
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
          Back to Dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Buying Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold mb-4">
                {formatCurrency(balance?.buyingBalance || 0)}
              </span>
              <AddBalanceSheet>
                <Button className="w-full sm:w-auto">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Add Funds
                </Button>
              </AddBalanceSheet>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-500" />
              Selling Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-3xl font-bold mb-4">
                {formatCurrency(balance?.sellingBalance || 0)}
              </span>
              <WithdrawSheet balance={balance?.sellingBalance || 0}>
                <Button variant="outline" className="w-full sm:w-auto">
                  <ArrowDownRight className="h-4 w-4 mr-2" />
                  Withdraw Funds
                </Button>
              </WithdrawSheet>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Transaction History</CardTitle>
              <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <TabsContent value="transactions">
              {recentTransactions.length > 0 ? (
                <div className="space-y-1">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b last:border-0">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{transaction.description || transaction.type}</p>
                          {transaction.status !== 'COMPLETED' && (
                            getTransactionStatusBadge(transaction.status)
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                      <div className={`font-medium whitespace-nowrap ${transaction.type === 'DEPOSIT' || transaction.type === 'SALE' ? 'text-green-600' : transaction.type === 'WITHDRAWAL' || transaction.type === 'PURCHASE' ? 'text-red-600' : ''}`}>
                        {transaction.type === 'DEPOSIT' || transaction.type === 'SALE' ? '+' : transaction.type === 'WITHDRAWAL' || transaction.type === 'PURCHASE' ? '-' : ''}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </div>
                      
                      {/* Add refresh button for pending deposits */}
                      {transaction.status === 'PENDING' && transaction.type === 'DEPOSIT' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              {refreshingPayment === transaction.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleRefreshPaymentStatus(transaction)}
                              disabled={refreshingPayment === transaction.id}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Refresh Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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