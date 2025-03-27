"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/app/components/card"
import { Button } from "@/app/components/button"
import { Badge } from "@/app/components/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { 
  Clock, Package, CheckCircle, AlertTriangle, ArrowRight
} from "lucide-react"
import { formatDistance } from "date-fns"
import { useQuery } from '@tanstack/react-query';

export default function OrdersPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("all")
  
  // Replace the useEffect with React Query
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') {
      return ['WAITING_FOR_SELLER', 'WAITING_FOR_BUYER'].includes(order.status)
    }
    if (activeTab === 'completed') return order.status === 'COMPLETED'
    if (activeTab === 'disputed') return order.status === 'DISPUTED'
    return false
  })
  
  // Update the loading skeleton to be more responsive
  if (isLoading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">My Orders</h1>
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="p-3 sm:p-4 border-b border-border">
                <div className="h-5 sm:h-6 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 sm:h-4 bg-muted-foreground/20 rounded w-1/2"></div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="h-3 sm:h-4 bg-muted-foreground/20 rounded w-full mb-3"></div>
                <div className="h-3 sm:h-4 bg-muted-foreground/20 rounded w-5/6 mb-3"></div>
                <div className="h-3 sm:h-4 bg-muted-foreground/20 rounded w-4/6 mb-4"></div>
                <div className="flex justify-between items-center mt-4">
                  <div className="h-6 sm:h-8 bg-muted-foreground/20 rounded w-1/3"></div>
                  <div className="h-6 sm:h-8 bg-muted-foreground/20 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container p-0 px-2 sm:px-4">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">My Orders</h1>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 sm:mb-6 w-full overflow-x-auto flex-nowrap scrollbar-none">
          <TabsTrigger value="all" className="tabtext whitespace-nowrap min-w-[80px]">All Orders</TabsTrigger>
          <TabsTrigger value="active" className="tabtext whitespace-nowrap min-w-[60px]">Active</TabsTrigger>
          <TabsTrigger value="completed" className="tabtext whitespace-nowrap min-w-[80px]">Completed</TabsTrigger>
          <TabsTrigger value="disputed" className="tabtext whitespace-nowrap min-w-[70px]">Disputed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredOrders.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {filteredOrders.map(order => (
                <Card key={order.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center ${getStatusBgColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm sm:text-base">{order.listing?.platform?.name || 'Account'} Purchase</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Order #{order.id.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                      <p className={`text-xs sm:text-sm text-muted-foreground `} style={{color: getStatusBgColor(order.status)}}>
                        {formatStatus(order.status)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                        {order.createdAt && (
                          <span>Created {formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 order-1 sm:order-2">
                        <div className="font-medium text-sm sm:text-base">${order.price}</div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9"
                          onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                        >
                          <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-muted flex items-center justify-center mb-3 sm:mb-4">
                  <Package className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-2">No Orders Found</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  {activeTab === 'all' 
                    ? "You haven't made any orders yet." 
                    : activeTab === 'active'
                      ? "You don't have any active orders."
                      : "You don't have any completed orders."}
                </p>
                <Button 
                  onClick={() => router.push('/dashboard/marketplace')}
                  className="text-xs sm:text-sm"
                >
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper functions
function getStatusIcon(status) {
  switch (status) {
    case 'WAITING_FOR_SELLER':
    case 'WAITING_FOR_BUYER':
      return <Clock className="h-5 w-5 text-amber-600" />
    case 'COMPLETED':
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case 'CANCELLED':
    case 'DISPUTED':
      return <AlertTriangle className="h-5 w-5 text-red-600" />
    default:
      return <Package className="h-5 w-5 text-blue-600" />
  }
}

function getStatusBgColor(status) {
  switch (status) {
    case 'WAITING_FOR_SELLER':
    case 'WAITING_FOR_BUYER':
      return 'bg-amber-100'
    case 'COMPLETED':
      return 'bg-green-100'
    case 'CANCELLED':
    case 'DISPUTED':
      return 'bg-red-100'
    default:
      return 'bg-blue-100'
  }
}

function getStatusVariant(status) {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'WAITING_FOR_SELLER':
    case 'WAITING_FOR_BUYER':
      return 'warning'
    case 'CANCELLED':
    case 'DISPUTED':
      return 'destructive'
    default:
      return 'secondary'
  }
}

function formatStatus(status) {
  switch (status) {
    case 'WAITING_FOR_SELLER':
      return 'Waiting for Seller'
    case 'WAITING_FOR_BUYER':
      return 'Waiting for Buyer'
    case 'COMPLETED':
      return 'Completed'
    case 'CANCELLED':
      return 'Cancelled'
    case 'DISPUTED':
      return 'Disputed'
    default:
      return status.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
  }
} 