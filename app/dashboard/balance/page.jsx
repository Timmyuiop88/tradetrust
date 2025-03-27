"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Clock, DollarSign, 
  CreditCard, AlertCircle, Plane, ChevronLeft, RefreshCw,
  MoreVertical, ExternalLink, ChevronRight, ChevronDown
} from "lucide-react"
import { Button } from "@/app/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { AddBalanceSheet } from "@/app/components/add-balance-sheet"
import { WithdrawSheet } from "@/app/components/withdraw-sheet"
import { toast } from "sonner"
import Link from "next/link"
import { Badge } from "@/app/components/badge"
import { useBalance, formatCurrency } from "@/app/hooks/useBalance"
import { useQueryClient } from "@tanstack/react-query"
import { PaginationControl } from "@/app/components/pagination"
import { Skeleton } from "@/app/components/skeleton"
import { useMediaQuery } from "@/app/hooks/use-media-query"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/app/components/ui/dropdown-menu"

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
  const isMobile = useMediaQuery("(max-width: 640px)")
  
  // State management
  const [withdrawals, setWithdrawals] = useState([])
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("transactions")
  const [refreshingPayment, setRefreshingPayment] = useState(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8) // Increased for better mobile experience
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  
  // Fetch transactions with pagination
  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      setTransactionsLoading(true)
      const response = await fetch(`/api/transactions?page=${page}&limit=${itemsPerPage}`)
      
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
        setTotalTransactions(data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error("Failed to load transactions")
    } finally {
      setTransactionsLoading(false)
    }
  }, [itemsPerPage])
  
  // Fetch withdrawals
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
  
  // Initialize data
  useEffect(() => {
    fetchTransactions(currentPage)
    fetchWithdrawals()
  }, [fetchTransactions, currentPage])
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }
  
  // Format date helper - more compact for mobile
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return isMobile 
      ? new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)
      : new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date)
  }
  
  // Handle refreshing payment status
  const handleRefreshPaymentStatus = async (transaction) => {
    try {
      setRefreshingPayment(transaction.id)
      
      // Use trackId directly from transaction if available
      const trackId = transaction.trackId
      
      if (!trackId) {
        throw new Error('No payment ID found for this transaction')
      }
      
      const statusResponse = await fetch(`/api/payments/oxapay/status/${trackId}`)
      
      if (!statusResponse.ok) {
        const error = await statusResponse.json()
        throw new Error(error.message || 'Failed to check payment status')
      }
      
      const statusData = await statusResponse.json()
      
      if (statusData.status === 'COMPLETED') {
        toast.success("Payment Completed")
        refetchBalance()
        fetchTransactions(currentPage)
      } else if (statusData.status === 'CONFIRMED') {
        toast.info("Payment Confirming")
      } else if (statusData.status === 'FAILED') {
        toast.error("Payment Failed")
      } else {
        toast.warning("Payment Pending")
      }
    } catch (error) {
      console.error('Error refreshing payment status:', error)
      toast.error(error.message || "Failed to refresh payment status")
    } finally {
      setRefreshingPayment(null)
    }
  }
  
  // Continue with Oxapay payment - PWA friendly
  const handleContinuePayment = (transaction, trackId) => {
    // For PWA, use window.location instead of window.open
    // Store current page state in sessionStorage if needed
    sessionStorage.setItem('returnToTransaction', transaction.id)
    window.location.href = `https://oxapay.com/mpay/${trackId}`
  }
  
  // Get transaction status badge
  const getTransactionStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success" className="text-xs px-1.5 py-0">Completed</Badge>
      case 'PENDING':
        return <Badge variant="warning" className="text-xs px-1.5 py-0">Pending</Badge>
      case 'FAILED':
        return <Badge variant="destructive" className="text-xs px-1.5 py-0">Failed</Badge>
      default:
        return <Badge variant="secondary" className="text-xs px-1.5 py-0">{status}</Badge>
    }
  }
  
  // Get withdrawal status badge
  const getWithdrawalStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success" className="text-xs px-1.5 py-0">Completed</Badge>
      case 'PENDING':
        return <Badge variant="warning" className="text-xs px-1.5 py-0">Pending</Badge>
      case 'REJECTED':
        return <Badge variant="destructive" className="text-xs px-1.5 py-0">Rejected</Badge>
      default:
        return <Badge variant="secondary" className="text-xs px-1.5 py-0">{status}</Badge>
    }
  }
  
  // Render balance cards
  const renderBalanceCards = () => {
    const buyingBalance = balanceData?.balance?.buyingBalance || 0
    const sellingBalance = balanceData?.balance?.sellingBalance || 0
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Wallet className="h-4 w-4 mr-2 text-primary" />
              Buying Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-3">
              {loading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                formatCurrency(buyingBalance)
              )}
            </div>
            <AddBalanceSheet>
              <Button size="sm" className="w-full sm:w-auto">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Add Funds
              </Button>
            </AddBalanceSheet>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-primary" />
              Selling Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-3">
              {loading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                formatCurrency(sellingBalance)
              )}
            </div>
            <WithdrawSheet>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                <ArrowDownRight className="h-4 w-4 mr-2" />
                Withdraw
              </Button>
            </WithdrawSheet>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Render transaction list - more compact for mobile
  const renderTransactionList = () => {
    if (transactionsLoading) {
      return (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-2 w-1/4" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      )
    }
    
    if (transactions.length === 0) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">No transactions found</p>
        </div>
      )
    }
    
    return (
      <>
        <div className="space-y-0.5">
          {transactions.map((transaction) => {
            // Get trackId directly from the transaction model
            const trackId = transaction.trackId || null;
            
            return (
              <div 
                key={transaction.id} 
                className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {transaction.type === 'DEPOSIT' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium text-sm truncate">{transaction.description}</p>
                    {/* {getTransactionStatusBadge(transaction.status)} */}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>
                
                <div className={`font-medium whitespace-nowrap text-sm ${
                  transaction.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {transaction.type === 'DEPOSIT' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </div>
                
                {/* Action menu for transactions */}
                <div className="ml-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {transaction.status === 'PENDING' && transaction.type === 'DEPOSIT' && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => handleRefreshPaymentStatus(transaction)}
                            disabled={refreshingPayment === transaction.id}
                          >
                            {refreshingPayment === transaction.id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-2" />
                            )}
                            Refresh Status
                          </DropdownMenuItem>
                          
                          {trackId && (
                            <DropdownMenuItem onClick={() => handleContinuePayment(transaction, trackId)}>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Continue Payment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem>
                        <Clock className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
        
        {totalTransactions > itemsPerPage && (
          <div className="mt-4 flex justify-center">
            <PaginationControl
              currentPage={currentPage}
              totalPages={Math.ceil(totalTransactions / itemsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </>
    )
  }
  
  // Render withdrawal list - more compact for mobile
  const renderWithdrawalList = () => {
    if (withdrawalsLoading) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-2 w-1/4" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      )
    }
    
    if (withdrawals.length === 0) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">No withdrawal requests found</p>
        </div>
      )
    }
    
    return (
      <div className="space-y-0.5">
        {withdrawals.map((withdrawal) => (
          <div 
            key={withdrawal.id} 
            className="flex items-center gap-2 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <Plane className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-sm truncate">Withdrawal to {withdrawal.paymentMethod}</p>
                {getWithdrawalStatusBadge(withdrawal.status)}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(withdrawal.createdAt)}
              </p>
            </div>
            <div className="font-medium whitespace-nowrap text-sm text-red-600">
              -{formatCurrency(withdrawal.amount)}
            </div>
            
            {/* Action menu for withdrawals */}
            <div className="ml-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Clock className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  // Handle return from payment
  useEffect(() => {
    const handlePaymentReturn = async () => {
      // Check if we're returning from a payment
      const urlParams = new URLSearchParams(window.location.search)
      const paymentStatus = urlParams.get('payment')
      const trackId = urlParams.get('trackId')
      
      if (paymentStatus === 'success' && trackId) {
        // Find the transaction with this trackId
        const transaction = transactions.find(t => t.trackId === trackId)
        
        if (transaction) {
          // Refresh the status of this specific transaction
          await handleRefreshPaymentStatus(transaction)
        } else {
          // If transaction not found in current page, refresh all
          refetchBalance()
          fetchTransactions(currentPage)
        }
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/dashboard/balance')
      }
      
      // Check if we have a stored transaction to return to
      const returnToTransactionId = sessionStorage.getItem('returnToTransaction')
      if (returnToTransactionId) {
        // Find the transaction
        const transaction = transactions.find(t => t.id === returnToTransactionId)
        
        if (transaction) {
          // Refresh the status of this specific transaction
          await handleRefreshPaymentStatus(transaction)
        }
        
        // Clean up
        sessionStorage.removeItem('returnToTransaction')
      }
    }
    
    handlePaymentReturn()
  }, [transactions])
  
  return (
    <div className="container max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Balance & Transactions</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              refetchBalance()
              fetchTransactions(currentPage)
              fetchWithdrawals()
            }}
            disabled={loading || transactionsLoading || withdrawalsLoading}
            className="h-8 sm:h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${(loading || transactionsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Balance Cards */}
      {renderBalanceCards()}
      
      {/* Transactions */}
      <Card className="mt-4 sm:mt-6 overflow-hidden">
        <Tabs 
          defaultValue="transactions" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <CardHeader className="pb-0 px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-base sm:text-lg">Transaction History</CardTitle>
              <TabsList className="grid grid-cols-2 w-full sm:w-auto">
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-3 sm:px-6">
            <TabsContent value="transactions" className="mt-0">
              {renderTransactionList()}
            </TabsContent>
            
            <TabsContent value="withdrawals" className="mt-0">
              {renderWithdrawalList()}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
} 