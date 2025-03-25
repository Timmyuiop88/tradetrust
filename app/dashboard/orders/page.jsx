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
  
  // Replace the loading spinner with a skeleton loader
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="p-4 border-b border-border">
                <div className="h-6 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
              </div>
              <div className="p-4">
                <div className="h-4 bg-muted-foreground/20 rounded w-full mb-3"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-5/6 mb-3"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-4/6 mb-4"></div>
                <div className="flex justify-between items-center mt-4">
                  <div className="h-8 bg-muted-foreground/20 rounded w-1/3"></div>
                  <div className="h-8 bg-muted-foreground/20 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container p-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all" className="tabtext">All Orders</TabsTrigger>
          <TabsTrigger value="active" className="tabtext">Active</TabsTrigger>
          <TabsTrigger value="completed" className="tabtext">Completed</TabsTrigger>
          <TabsTrigger value="disputed" className="tabtext">Disputed</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <Card key={order.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatusBgColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <h3 className="font-medium">{order.listing?.platform?.name || 'Account'} Purchase</h3>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id.substring(0, 8)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(order.status)}>
                        {formatStatus(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {order.createdAt && (
                          <span>Created {formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-medium">${order.price}</div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Orders Found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'all' 
                    ? "You haven't made any orders yet." 
                    : activeTab === 'active'
                      ? "You don't have any active orders."
                      : "You don't have any completed orders."}
                </p>
                <Button onClick={() => router.push('/dashboard/marketplace')}>
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