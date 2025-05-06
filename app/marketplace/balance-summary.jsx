"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card"
import { Button } from "@/app/components/button"
import { ArrowUpRight, ArrowDownRight, Wallet, Loader2 } from "lucide-react"
import { AddBalanceSheet } from "@/app/components/add-balance-sheet"
import { useBalance, formatCurrency } from "@/app/hooks/useBalance"

export function BalanceSummary() {
  const { useGetBalance } = useBalance()
  const { data: balanceData, isLoading, refetch } = useGetBalance()
  
  // Extract balance information
  const buyingBalance = balanceData?.balance?.buyingBalance || 0
  const sellingBalance = balanceData?.balance?.sellingBalance || 0
  const totalBalance = buyingBalance + sellingBalance
  
  // Get recent transactions
  const recentTransactions = balanceData?.recentTransactions || []
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Balance Summary</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <Loader2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Buying Balance:</span>
            </div>
            <p className="text-2xl font-semibold mt-1">
              {isLoading ? (
                <span className="h-7 w-28 bg-muted rounded animate-pulse block" />
              ) : (
                formatCurrency(buyingBalance)
              )}
            </p>
            <div className="mt-3">
              <AddBalanceSheet>
                <Button size="sm" className="w-full">
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Add Funds
                </Button>
              </AddBalanceSheet>
            </div>
          </div>
          
          <div className="p-4 rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Selling Balance:</span>
            </div>
            <p className="text-2xl font-semibold mt-1">
              {isLoading ? (
                <span className="h-7 w-28 bg-muted rounded animate-pulse block" />
              ) : (
                formatCurrency(sellingBalance)
              )}
            </p>
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.location.href = '/dashboard/balance'}
              >
                <ArrowDownRight className="h-4 w-4 mr-2" />
                Manage Balance
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-3">Recent Transactions</h3>
          
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {transaction.type === 'DEPOSIT' ? 'Funds Added' :
                       transaction.type === 'WITHDRAWAL' ? 'Withdrawal' : 
                       transaction.type === 'PURCHASE' ? 'Purchase' : 
                       transaction.type === 'SALE' ? 'Sale' : transaction.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <p className={`text-sm font-medium ${
                    transaction.type === 'DEPOSIT' || transaction.type === 'SALE' 
                      ? 'text-green-500' 
                      : transaction.type === 'WITHDRAWAL' || transaction.type === 'PURCHASE' 
                        ? 'text-red-500' 
                        : ''
                  }`}>
                    {transaction.type === 'DEPOSIT' || transaction.type === 'SALE' ? '+' : 
                     transaction.type === 'WITHDRAWAL' || transaction.type === 'PURCHASE' ? '-' : ''}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No recent transactions</p>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => window.location.href = '/dashboard/balance'}
            >
              View All Transactions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 