"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/app/components/card"
import { Button } from "@/app/components/button"
import { Badge } from "@/app/components/badge"
import { Separator } from "@/app/components/separator"
import { 
  Clock, Copy, MessageSquare, AlertTriangle, CheckCircle, 
  ShieldCheck, Info, ArrowLeft, Lock, X, Loader2
} from "lucide-react"
import { toast } from "sonner"
import { formatDistance, isPast } from "date-fns"
import { useCountdown } from "@/app/hooks/useCountdown"
import { Input } from "@/app/components/input"
import { Label } from "@/app/components/label"
import { Textarea } from "@/app/components/textarea"

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [releasing, setReleasing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    additionalInfo: ''
  })
  const [showCredentials, setShowCredentials] = useState(false)
  const initialLoadComplete = useRef(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeDescription, setDisputeDescription] = useState('')
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false)
  
  // Get the countdown timer for seller deadline
  const { minutes, seconds, isExpired: isSellerDeadlineExpired } = 
    useCountdown(order?.sellerDeadline)
  
  // Get the countdown timer for buyer deadline
  const { minutes: buyerMinutes, seconds: buyerSeconds, isExpired: isBuyerDeadlineExpired } = 
    useCountdown(order?.buyerDeadline)
  
  const fetchOrder = useCallback(async (showLoading = false) => {
    if (!params.id) return
    
    try {
      if (showLoading) setLoading(true)
      const response = await fetch(`/api/orders/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to load order')
        router.push('/dashboard/orders')
      }
    } catch (error) {
      console.error('Error fetching order:', error)
      if (initialLoadComplete.current) {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      if (showLoading) setLoading(false)
      initialLoadComplete.current = true
    }
  }, [params.id, router])
  
  useEffect(() => {
    fetchOrder(true)
    
    // Poll for updates every 15 seconds
    const interval = setInterval(() => fetchOrder(false), 15000)
    return () => clearInterval(interval)
  }, [fetchOrder])
  
  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id)
    toast.success('Order ID copied to clipboard')
  }
  
  const handleReleaseCredentials = async () => {
    if (!order) return
    
    try {
      setReleasing(true)
      const response = await fetch(`/api/orders/${order.id}/release-credentials`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Account credentials released')
        fetchOrder(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to release credentials')
      }
    } catch (error) {
      console.error('Error releasing credentials:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setReleasing(false)
    }
  }
  
  const handleConfirmReceived = async () => {
    if (!confirm('Are you sure you want to confirm receipt? This will release the payment to the seller and cannot be undone.')) {
      return
    }
    
    try {
      setConfirming(true)
      const response = await fetch(`/api/orders/${order.id}/confirm-received`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        toast.success('Receipt confirmed and payment released to seller')
        fetchOrder(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to confirm receipt')
      }
    } catch (error) {
      console.error('Error confirming receipt:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setConfirming(false)
    }
  }
  
  const handleContactSupport = () => {
    router.push('/support')
  }
  
  const handleOpenChat = () => {
    router.push(`/chat/${order.sellerId}`)
    toast.info('Chat feature coming soon')
  }
  
  const handleCredentialSubmit = async (e) => {
    e.preventDefault()
    
    if (!credentials.email || !credentials.password) {
      toast.error('Email and password are required')
      return
    }
    
    try {
      setReleasing(true)
      const response = await fetch(`/api/orders/${order.id}/release-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })
      
      if (response.ok) {
        toast.success('Account credentials released')
        fetchOrder(false)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to release credentials')
      }
    } catch (error) {
      console.error('Error releasing credentials:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setReleasing(false)
    }
  }
  
  const toggleCredentialVisibility = () => {
    setShowCredentials(prev => !prev)
  }
  
  const handleOpenDispute = async (e) => {
    e.preventDefault();
    
    if (!disputeReason || !disputeDescription.trim()) {
      return;
    }
    
    try {
      setIsSubmittingDispute(true);
      
      const response = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          reason: disputeReason,
          description: disputeDescription,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to open dispute');
      }
      
      // Close modal and refresh order data
      setShowDisputeModal(false);
      fetchOrder(true);
      
      // Show success message
      toast({
        title: "Dispute opened",
        description: "Your dispute has been successfully opened. A moderator will review it shortly.",
      });
      
      // Redirect to the dispute page
      const data = await response.json();
      router.push(`/disputes/${data.dispute.id}`);
    } catch (err) {
      console.error('Error opening dispute:', err);
      
      toast({
        variant: "destructive",
        title: "Failed to open dispute",
        description: err.message,
      });
    } finally {
      setIsSubmittingDispute(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container max-w-4xl p-0">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Loading Order...</h1>
        </div>
        
        <Card className="animate-pulse">
          <CardHeader className="pb-4">
            <div className="h-7 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex justify-between">
                  <div className="h-5 bg-muted rounded w-1/4"></div>
                  <div className="h-5 bg-muted rounded w-1/3"></div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="h-20 bg-muted rounded"></div>
          </CardContent>
          <CardFooter>
            <div className="h-10 bg-muted rounded w-full"></div>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  if (!order) {
    return (
      <div className="container max-w-4xl py-0">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Order Not Found</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Order Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => router.push('/dashboard/orders')}>
              View All Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const isBuyer = session?.user?.id === order.buyerId
  const isSeller = session?.user?.id === order.sellerId
  
  // Determine the current step based on order status
  const getOrderStep = () => {
    switch (order.status) {
      case 'WAITING_FOR_SELLER':
        return 1
      case 'WAITING_FOR_BUYER':
        return 2
      case 'COMPLETED':
        return 3
      case 'CANCELLED':
      case 'DISPUTED':
        return -1
      default:
        return 0
    }
  }
  
  const orderStep = getOrderStep()
  
  return (
    <div className="container max-w-4xl p-0">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">
          {isBuyer ? 'Purchase' : 'Sale'} Details
        </h1>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {order.listing.platform.name} Account {isBuyer ? 'Purchase' : 'Sale'}
              </CardTitle>
              <CardDescription>
                {order.listing.followers.toLocaleString()} followers • {order.listing.username}
              </CardDescription>
            </div>
            <Badge variant={getStatusVariant(order.status)}>
              {formatStatus(order.status)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Timer Section */}
          {(order.status === 'WAITING_FOR_SELLER' || order.status === 'WAITING_FOR_BUYER') && (
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-medium">
                    {order.status === 'WAITING_FOR_SELLER' 
                      ? 'Waiting for seller to provide account details' 
                      : 'Waiting for buyer to confirm receipt'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.status === 'WAITING_FOR_SELLER'
                      ? `Seller has ${isSellerDeadlineExpired ? 'expired' : `${minutes}:${seconds.toString().padStart(2, '0')}`} to provide account details`
                      : `Buyer has ${isBuyerDeadlineExpired ? 'expired' : `${buyerMinutes}:${buyerSeconds.toString().padStart(2, '0')}`} to confirm receipt`}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Order Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">${order.price.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Order No.</span>
              <div className="flex items-center">
                <span className="font-medium mr-2">{order.id.substring(0, 8)}...</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyOrderId}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Order Time</span>
              <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transfer Method</span>
              <span className="font-medium">{order.listing.transferMethod}</span>
            </div>
            
            {order.status === 'WAITING_FOR_BUYER' && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Account Details</span>
                <span className="font-medium">Provided by seller</span>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Action Section */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Transaction Progress</h3>
              <Button variant="outline" size="sm" onClick={handleOpenChat}>
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="text-xs font-medium">Contact {isBuyer ? 'Seller' : 'Buyer'}</span>
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />
              
              <div className="relative pl-8 pb-6">
                <div className={`absolute left-0 h-7 w-7 rounded-full flex items-center justify-center ${orderStep >= 1 ? 'bg-primary' : 'bg-muted-foreground/20'}`}>
                  <span className="text-xs text-white font-medium">1</span>
                </div>
                <h4 className="font-medium">Order Created</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}
                </p>
              </div>
              
              <div className="relative pl-8 pb-6">
                <div className={`absolute left-0 h-7 w-7 rounded-full flex items-center justify-center ${orderStep >= 2 ? 'bg-primary' : 'bg-muted-foreground/20'}`}>
                  <span className="text-xs text-white font-medium">2</span>
                </div>
                <h4 className="font-medium">Account Details Provided</h4>
                <p className="text-sm text-muted-foreground">
                  {order.status === 'WAITING_FOR_SELLER' 
                    ? 'Waiting for seller to provide account details'
                    : order.status === 'WAITING_FOR_BUYER'
                      ? 'Seller has provided account details'
                      : order.status === 'COMPLETED'
                        ? 'Account details were provided'
                        : 'Not completed'}
                </p>
              </div>
              
              <div className="relative pl-8">
                <div className={`absolute left-0 h-7 w-7 rounded-full flex items-center justify-center ${orderStep >= 3 ? 'bg-primary' : 'bg-muted-foreground/20'}`}>
                  <span className="text-xs text-white font-medium">3</span>
                </div>
                <h4 className="font-medium">Transaction Completed</h4>
                <p className="text-sm text-muted-foreground">
                  {order.status === 'COMPLETED'
                    ? 'Transaction successfully completed'
                    : 'Waiting for transaction completion'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Warning for seller */}
          {isSeller && order.status === 'WAITING_FOR_SELLER' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Important: Release Account Details</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    You must provide the account details within the time limit. 
                    Failure to do so may result in order cancellation and potential penalties.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Warning for buyer */}
          {isBuyer && order.status === 'WAITING_FOR_BUYER' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Important: Confirm Receipt</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Please verify the account details and confirm receipt within the time limit.
                    Only confirm if you've successfully accessed the account.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Security Notice */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Payment is secured in escrow until delivery is confirmed</span>
          </div>
          
          {/* Seller Credential Form */}
          {isSeller && order.status === 'WAITING_FOR_SELLER' && (
            <div className="mt-6 border border-border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-3">Release Account Credentials</h3>
              <form onSubmit={handleCredentialSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Account Email/Username</Label>
                  <Input 
                    id="email" 
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                    placeholder="Enter account email or username"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Account Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    placeholder="Enter account password"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                  <Textarea 
                    id="additionalInfo" 
                    value={credentials.additionalInfo}
                    onChange={(e) => setCredentials({...credentials, additionalInfo: e.target.value})}
                    placeholder="Any additional information the buyer needs to know"
                    rows={3}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={releasing}
                >
                  {releasing ? 'Releasing...' : 'Release Account Details'}
                </Button>
              </form>
            </div>
          )}
          
          {/* Buyer Credential View */}
          {isBuyer && order.status === 'WAITING_FOR_BUYER' && order.credentials && (
            <div className="mt-6 border border-border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-lg">Account Credentials</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleCredentialVisibility}
                >
                  {showCredentials ? 'Hide' : 'Show'} Credentials
                </Button>
              </div>
              
              {showCredentials ? (
                <div className="space-y-3">
                  <div>
                    <Label>Email/Username</Label>
                    <div className="flex items-center mt-1">
                      <div className="bg-muted p-2 rounded-md w-full font-mono text-sm">
                        {order.credentials.email}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2"
                        onClick={() => {
                          navigator.clipboard.writeText(order.credentials.email)
                          toast.success('Email copied to clipboard')
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Password</Label>
                    <div className="flex items-center mt-1">
                      <div className="bg-muted p-2 rounded-md w-full font-mono text-sm">
                        {order.credentials.password}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-2"
                        onClick={() => {
                          navigator.clipboard.writeText(order.credentials.password)
                          toast.success('Password copied to clipboard')
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {order.credentials.additionalInfo && (
                    <div>
                      <Label>Additional Information</Label>
                      <div className="bg-muted p-2 rounded-md w-full text-sm mt-1 whitespace-pre-wrap">
                        {order.credentials.additionalInfo}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-muted/50 p-4 rounded-md text-center">
                  <Lock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click "Show Credentials" to view the account details
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-3">
          {/* Seller Actions */}
          {isSeller && order.status === 'WAITING_FOR_SELLER' && (
            <Button 
              className="w-full" 
              onClick={handleReleaseCredentials}
              disabled={releasing}
            >
              {releasing ? (
                <>Loading...</>
              ) : (
                <>Release Account Details</>
              )}
            </Button>
          )}
          
          {/* Buyer Actions */}
          {isBuyer && order.status === 'WAITING_FOR_BUYER' && (
            <Button 
              className="w-full" 
              onClick={handleConfirmReceived}
              disabled={confirming}
            >
              {confirming ? (
                <>Processing...</>
              ) : (
                <>Confirm Receipt & Release Payment</>
              )}
            </Button>
          )}
          
          {/* Completed State */}
          {order.status === 'COMPLETED' && (
            <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-green-800">Transaction Completed Successfully</h3>
              <p className="text-sm text-green-700 mt-1">
                This transaction has been completed and the payment has been released to the seller.
              </p>
            </div>
          )}
          
          {/* Dispute Button */}
          {order.status !== 'DISPUTED' && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <div className="mt-4">
              <button
                onClick={() => setShowDisputeModal(true)}
                className="flex items-center px-4 py-2 w-full justify-center bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Open Dispute
              </button>
            </div>
          )}
        </CardFooter>
      </Card>
      
      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowDisputeModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-semibold mb-4">Open a Dispute</h2>
            
            <form onSubmit={handleOpenDispute}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Reason for Dispute
                </label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                  required
                >
                  <option value="">Select a reason...</option>
                  <option value="ITEM_NOT_RECEIVED">Item Not Received</option>
                  <option value="ITEM_NOT_AS_DESCRIBED">Item Not As Described</option>
                  <option value="PAYMENT_ISSUE">Payment Issue</option>
                  <option value="COMMUNICATION_ISSUE">Communication Issue</option>
                  <option value="ACCOUNT_ACCESS_ISSUE">Account Access Issue</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Please provide details about your issue..."
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm min-h-[120px]"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 border border-input rounded-md text-sm font-medium bg-background hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmittingDispute}
                >
                  {isSubmittingDispute ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </span>
                  ) : (
                    'Open Dispute'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions
function getStatusVariant(status) {
  switch (status) {
    case 'COMPLETED':
      return 'success'
    case 'WAITING_FOR_SELLER':
    case 'WAITING_FOR_BUYER':
      return 'warning'
    case 'CANCELLED':
      return 'destructive'
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