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
  ShieldCheck, Info, ArrowLeft, Lock, X, Loader2, Shield,
  RefreshCw, Eye, EyeOff
} from "lucide-react"
import { toast } from "sonner"
import { formatDistance, isPast } from "date-fns"
import { useCountdown } from "@/app/hooks/useCountdown"
import { Input } from "@/app/components/input"
import { Label } from "@/app/components/label"
import { Textarea } from "@/app/components/textarea"
import { ReviewForm } from "@/app/components/review-form"
import prisma from "@/lib/prisma"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/dialog"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/tabs"
import { FileUploader } from "@/app/components/file-uploader"
import { Trash } from "lucide-react"

// Fetch function for the order
const fetchOrder = async (orderId) => {
  const response = await fetch(`/api/orders/${orderId}`, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch order');
  }
  return response.json();
};

// Helper function to determine if we should poll based on order status
const shouldPoll = (status) => {
  // Only poll if the order is in an active state
  return ![
    'COMPLETED',
    'CANCELLED',
    'DISPUTED'
  ].includes(status);
};

// API functions
const releaseCredentials = async ({ orderId, credentials }) => {
  const response = await fetch(`/api/orders/${orderId}/release-credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    throw new Error('Failed to release credentials');
  }
  return response.json();
};

const confirmReceipt = async (orderId) => {
  const response = await fetch(`/api/orders/${orderId}/confirm-received`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to confirm receipt');
  }
  return response.json();
};

const declineOrder = async (orderId) => {
  const response = await fetch(`/api/orders/${orderId}/decline`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to decline order');
  }
  return response.json();
};

// Add dispute API function
const openDispute = async ({ orderId, reason, description }) => {
  const response = await fetch('/api/disputes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId, reason, description }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to open dispute');
  }
  return response.json();
};

// Add dispute details fetch function
const fetchDisputeDetails = async (orderId) => {
  const response = await fetch(`/api/orders/${orderId}/dispute`);
  if (!response.ok) {
    throw new Error('Failed to fetch dispute details');
  }
  return response.json();
};

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(true)
  const [releasing, setReleasing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    additionalInfo: '',
    loginImages: [],
    recoveryEmail: '',
    recoveryPassword: '',
    recoveryPhone: '',
    securityQuestions: '',
    recoveryImages: [],
    transferInstructions: ''
  })
  const [showCredentials, setShowCredentials] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeDescription, setDisputeDescription] = useState('')
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [showDeclineConfirmation, setShowDeclineConfirmation] = useState(false)
  const [statusChangeLoading, setStatusChangeLoading] = useState(false)
  const [lastAction, setLastAction] = useState(null)
  const [isPolling, setIsPolling] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const pollingTimeoutRef = useRef(null)
  const [etag, setEtag] = useState(null)
  const [showPassword, setShowPassword] = useState({
    password: false,
    recoveryPassword: false
  })
  
  // Main order query with proper configuration
  const { 
    data: order,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['order', params.id],
    queryFn: () => fetchOrder(params.id),
    refetchInterval: (data) => {
      if (!data) return false;
      return shouldPoll(data.status) ? 5000 : false;
    },
    refetchOnWindowFocus: true,
    staleTime: 1000,
    retry: 3,
    retryDelay: 1000,
  })
  
  // Fetch dispute details if order is disputed
  const { data: disputeData } = useQuery({
    queryKey: ['dispute', params.id],
    queryFn: () => fetchDisputeDetails(params.id),
    enabled: order?.status === 'DISPUTED',
    staleTime: 30000,
  })
  
  // Get the countdown timer for seller deadline
  const { minutes, seconds, isExpired: isSellerDeadlineExpired } = 
    useCountdown(order?.sellerDeadline)
  
  // Get the countdown timer for buyer deadline
  const { minutes: buyerMinutes, seconds: buyerSeconds, isExpired: isBuyerDeadlineExpired } = 
    useCountdown(order?.buyerDeadline)
  
  // Mutations
  const releaseMutation = useMutation({
    mutationFn: releaseCredentials,
    onSuccess: () => {
      queryClient.invalidateQueries(['order', params.id]);
      toast.success('Account credentials released');
      setCredentials({
        email: '',
        password: '',
        additionalInfo: '',
        loginImages: [],
        recoveryEmail: '',
        recoveryPassword: '',
        recoveryPhone: '',
        securityQuestions: '',
        recoveryImages: [],
        transferInstructions: ''
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to release credentials');
    }
  });

  const confirmMutation = useMutation({
    mutationFn: confirmReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries(['order', params.id]);
      toast.success('Receipt confirmed and payment released to seller');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to confirm receipt');
    }
  });

  const declineMutation = useMutation({
    mutationFn: declineOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['order', params.id]);
      toast.success('Order declined successfully');
      setShowDeclineConfirmation(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to decline order');
    }
  });
  
  // Add dispute mutation
  const disputeMutation = useMutation({
    mutationFn: openDispute,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['order', params.id]);
      toast.success('Dispute opened successfully');
      setShowDisputeModal(false);
      router.push(`/disputes/${data.dispute.id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to open dispute');
    }
  });

  // Track if this is a manual refresh
  const [isManualRefresh, setIsManualRefresh] = useState(false);

  // Handle manual refresh
  const handleManualRefresh = useCallback(async () => {
    setIsManualRefresh(true);
    await refetch();
    setIsManualRefresh(false);
  }, [refetch]);

  // Show loading state only during initial load or manual refresh
  const showLoading = isLoading || (isFetching && isManualRefresh);
  
  // Update review check to use React Query
  const { data: reviewData } = useQuery({
    queryKey: ['review', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/reviews?userId=${order?.listing?.sellerId}`);
      if (!response.ok) throw new Error('Failed to fetch review data');
      return response.json();
    },
    enabled: !!order && order.status === 'COMPLETED' && session?.user?.id === order.buyerId,
    onSuccess: (data) => {
      const hasReviewed = data.reviews.some(review => 
        review.listing.id === order.listingId && review.reviewer.id === session.user.id
      );
      setHasReviewed(hasReviewed);
      setShowReviewForm(!hasReviewed);
    }
  });
  
  const handleCopyOrderId = useCallback(() => {
    navigator.clipboard.writeText(params.id);
    toast.success('Order ID copied to clipboard');
  }, [params.id]);
  
  const handleReleaseCredentials = async (e) => {
    e.preventDefault();
    setReleasing(true);
    
    try {
      const response = await fetch(`/api/orders/${order.id}/release-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to release credentials');
      }
      
      // Success
      toast.success('Credentials released successfully');
      setTimeout(() => router.reload(), 1000);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setReleasing(false);
    }
  };
  
  const handleConfirmReceived = useCallback(async () => {
    if (!confirm('Are you sure you want to confirm receipt? This will release the payment to the seller and cannot be undone.')) {
      return;
    }
    confirmMutation.mutate(params.id);
  }, [params.id, confirmMutation]);
  
  const handleDeclineOrder = useCallback(async () => {
    declineMutation.mutate(params.id);
  }, [params.id, declineMutation]);
  
  // Add CSS classes for status change animation
  const getStatusChangeClass = () => {
    if (statusChangeLoading) {
      return 'animate-pulse transition-opacity duration-500'
    }
    return 'transition-all duration-300'
  }
  
  // Add a loading indicator component
  const LoadingIndicator = () => {
    // Only show loading indicator during manual refresh
    if (!isManualRefresh) return null;
    
    return (
      <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-3 py-2 rounded-md shadow-md flex items-center gap-2 z-50 animate-in fade-in duration-300">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Updating...</span>
      </div>
    )
  }
  
  // Add dispute handler
  const handleOpenDispute = useCallback(async (e) => {
    e.preventDefault();
    
    if (!disputeReason || !disputeDescription.trim()) {
      toast.error('Please provide both a reason and description for the dispute');
      return;
    }
    
    disputeMutation.mutate({
      orderId: params.id,
          reason: disputeReason,
      description: disputeDescription.trim()
    });
  }, [params.id, disputeReason, disputeDescription, disputeMutation]);

  // Add handleOpenChat function
  const handleOpenChat = useCallback(() => {
    // Navigate to the chat page with the order ID
    router.push(`/chat/${params.id}`);
  }, [router, params.id]);
  
  // Add the missing function
  const toggleCredentialVisibility = () => {
    setShowCredentials(prev => !prev);
  }
  
  // Update your useEffect for loading credentials from listing
  useEffect(() => {
    if (order?.listing?.credentials) {
      try {
        // Parse credentials if they're stored as a JSON string
        const listingCreds = typeof order.listing.credentials === 'string' 
          ? JSON.parse(order.listing.credentials) 
          : order.listing.credentials;
          
        setCredentials(prevCreds => ({
          ...prevCreds,
          email: listingCreds.email || prevCreds.email,
          password: listingCreds.password || prevCreds.password,
          serialKey: listingCreds.serialKey || prevCreds.serialKey,
          loginImages: listingCreds.loginImages || prevCreds.loginImages,
          recoveryAccountType: listingCreds.recoveryAccountType || prevCreds.recoveryAccountType,
          recoveryEmail: listingCreds.recoveryEmail || prevCreds.recoveryEmail,
          recoveryPassword: listingCreds.recoveryPassword || prevCreds.recoveryPassword,
          recoveryImages: listingCreds.recoveryImages || prevCreds.recoveryImages,
          transferInstructions: listingCreds.transferInstructions || prevCreds.transferInstructions
        }));
      } catch (error) {
        console.error("Error parsing credentials:", error);
      }
    }
  }, [order]);
  
  if (showLoading) {
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
  
  if (isError) {
    return (
      <div className="container max-w-4xl py-0">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Error Loading Order</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Error Loading Order</h3>
            <p className="text-muted-foreground mb-4">
              {error.message}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
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
      {/* Loading indicator */}
      <LoadingIndicator />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold ml-2">
          {isBuyer ? 'Purchase' : 'Sale'} Details
        </h1>
      </div>
      
        {/* Add refresh button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleManualRefresh}
          disabled={isFetching && isManualRefresh}
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            (isFetching && isManualRefresh) && "animate-spin"
          )} />
        </Button>
      </div>
      
      <Card className={cn(
        "transition-all duration-300",
        (isFetching && isManualRefresh) && "opacity-50"
      )}>
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
            <div className="bg-muted/50 rounded-lg p-4 transition-all duration-300 ease-in-out">
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
                <span className="tabtext font-medium">Contact {isBuyer ? 'Seller' : 'Buyer'}</span>
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-muted-foreground/20" />
              
              <div className="relative pl-8 pb-6">
                <div className={`absolute left-0 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-500 ${orderStep >= 1 ? 'bg-primary' : 'bg-muted-foreground/20'}`}>
                  <span className="text-xs text-white font-medium">1</span>
                </div>
                <h4 className="font-medium">Order Created</h4>
                <p className="text-sm text-muted-foreground">
                  {formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}
                </p>
              </div>
              
              <div className="relative pl-8 pb-6">
                <div className={`absolute left-0 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-500 ${orderStep >= 2 ? 'bg-primary' : 'bg-muted-foreground/20'} ${lastAction === 'release_credentials' && statusChangeLoading ? 'animate-pulse' : ''}`}>
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
                <div className={`absolute left-0 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-500 ${orderStep >= 3 ? 'bg-primary' : 'bg-muted-foreground/20'} ${lastAction === 'confirm_received' && statusChangeLoading ? 'animate-pulse' : ''}`}>
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
            <div id="credential-form" className="mt-6 border border-border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-3">Release Account Credentials</h3>
              
              <div className="bg-muted/30 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4 flex gap-2 items-start mb-4">
                <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">Security Note</p>
                  <p className="text-yellow-600/90 dark:text-yellow-400/80">
                    These credentials are encrypted and will only be revealed to the buyer after you confirm the order.
                    Never share this information outside the platform.
                  </p>
                </div>
              </div>
              
              {order.listing?.credentials && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg p-4 mb-4 flex gap-2 items-start">
                  <div className="h-5 w-5 mt-0.5">✓</div>
                  <div className="text-sm">
                    <p className="font-medium">Credentials Already Available</p>
                    <p>You provided credentials when creating this listing. You can review and edit them below.</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleReleaseCredentials} className="space-y-4">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="login">Login Details</TabsTrigger>
                    <TabsTrigger value="recovery">Recovery Info</TabsTrigger>
                    <TabsTrigger value="additional">Additional Info</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email / Username</Label>
                        <Input 
                          id="email" 
                          value={credentials.email || ''}
                          onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                          placeholder="Account email or username"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input 
                            id="password" 
                            type={showPassword.password ? "text" : "password"}
                            value={credentials.password || ''}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                            placeholder="Account password"
                            required
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            onClick={() => setShowPassword({...showPassword, password: !showPassword.password})}
                          >
                            {showPassword.password ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="serialKey">Key or Serial Number (Optional)</Label>
                        <Input
                          id="serialKey"
                          value={credentials.serialKey || ''}
                          onChange={(e) => setCredentials({...credentials, serialKey: e.target.value})}
                          placeholder="Enter license key or serial number"
                        />
                        <p className="text-xs text-muted-foreground">Add product key, license key, or serial number if applicable</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="loginImages">Credential Images (Optional)</Label>
                        <p className="text-xs text-muted-foreground">Upload screenshots of login credentials if needed</p>
                        
                        <FileUploader
                          onFilesSelected={(files) => {
                            const promises = Array.from(files).map(file => {
                              return new Promise((resolve) => {
                                const reader = new FileReader()
                                reader.onloadend = () => resolve(reader.result)
                                reader.readAsDataURL(file)
                              })
                            })
                            
                            Promise.all(promises).then(dataUrls => {
                              setCredentials({
                                ...credentials,
                                loginImages: [...(credentials.loginImages || []), ...dataUrls]
                              })
                            })
                          }}
                          maxFiles={3}
                          maxSizeInMB={5}
                          acceptedFileTypes={["image/jpeg", "image/png", "image/gif"]}
                          label="Drag & drop credential images or click to browse"
                        />
                        
                        {credentials.loginImages && credentials.loginImages.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {credentials.loginImages.map((image, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={image} 
                                  alt={`Credential image ${index + 1}`} 
                                  className="w-full h-24 object-cover rounded-lg border"
                                />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    const updatedImages = [...(credentials.loginImages || [])]
                                    updatedImages.splice(index, 1)
                                    setCredentials({
                                      ...credentials,
                                      loginImages: updatedImages
                                    })
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="recovery" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-md font-medium mb-2">Recovery Account Details</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          If this account uses a separate email (e.g., Gmail for a Facebook login), provide those credentials here.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="recoveryAccountType">Recovery Account Type</Label>
                          <Input 
                            id="recoveryAccountType" 
                            value={credentials.recoveryAccountType || ''}
                            onChange={(e) => setCredentials({...credentials, recoveryAccountType: e.target.value})}
                            placeholder="e.g., Gmail, Email provider, iCloud"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="recoveryEmail">Recovery Email</Label>
                          <Input 
                            id="recoveryEmail" 
                            value={credentials.recoveryEmail || ''}
                            onChange={(e) => setCredentials({...credentials, recoveryEmail: e.target.value})}
                            placeholder="Recovery email address"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="recoveryPassword">Recovery Password</Label>
                          <div className="relative">
                            <Input 
                              id="recoveryPassword" 
                              type={showPassword.recoveryPassword ? "text" : "password"}
                              value={credentials.recoveryPassword || ''}
                              onChange={(e) => setCredentials({...credentials, recoveryPassword: e.target.value})}
                              placeholder="Recovery account password"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                              onClick={() => setShowPassword({...showPassword, recoveryPassword: !showPassword.recoveryPassword})}
                            >
                              {showPassword.recoveryPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recoveryImages">Recovery Images (Optional)</Label>
                        <p className="text-xs text-muted-foreground">Upload screenshots of recovery information</p>
                        
                        <FileUploader
                          onFilesSelected={(files) => {
                            const promises = Array.from(files).map(file => {
                              return new Promise((resolve) => {
                                const reader = new FileReader()
                                reader.onloadend = () => resolve(reader.result)
                                reader.readAsDataURL(file)
                              })
                            })
                            
                            Promise.all(promises).then(dataUrls => {
                              setCredentials({
                                ...credentials,
                                recoveryImages: [...(credentials.recoveryImages || []), ...dataUrls]
                              })
                            })
                          }}
                          maxFiles={3}
                          maxSizeInMB={5}
                          acceptedFileTypes={["image/jpeg", "image/png", "image/gif"]}
                          label="Drag & drop recovery images or click to browse"
                        />
                        
                        {credentials.recoveryImages && credentials.recoveryImages.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {credentials.recoveryImages.map((image, index) => (
                              <div key={index} className="relative group">
                                <img 
                                  src={image} 
                                  alt={`Recovery image ${index + 1}`} 
                                  className="w-full h-24 object-cover rounded-lg border"
                                />
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    const updatedImages = [...(credentials.recoveryImages || [])]
                                    updatedImages.splice(index, 1)
                                    setCredentials({
                                      ...credentials,
                                      recoveryImages: updatedImages
                                    })
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="additional" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="transferInstructions">Transfer Instructions</Label>
                      <Textarea 
                        id="transferInstructions" 
                        value={credentials.transferInstructions || ''}
                        onChange={(e) => setCredentials({...credentials, transferInstructions: e.target.value})}
                        placeholder="Detailed instructions for how to transfer this account"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="additionalInfo">Additional Information</Label>
                      <Textarea 
                        id="additionalInfo" 
                        value={credentials.additionalInfo || ''}
                        onChange={(e) => setCredentials({...credentials, additionalInfo: e.target.value})}
                        placeholder="Any additional information the buyer needs to know"
                        rows={3}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <Button 
                  type="submit" 
                  className="w-full mt-4"
                  disabled={releasing || statusChangeLoading}
                >
                  {releasing ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Releasing Credentials...
                    </span>
                  ) : (
                    'Release Account Credentials'
                  )}
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
            <div className="flex flex-col gap-3 w-full">
              <div className="flex gap-3">
            <Button 
                  className="flex-1" 
                  onClick={() => setShowDeclineConfirmation(true)}
                  variant="outline"
                  disabled={declineMutation.isPending}
                >
                  {declineMutation.isPending ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </span>
                  ) : (
                    'Decline Order'
              )}
            </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => document.getElementById('credential-form').scrollIntoView({ behavior: 'smooth' })}
                  disabled={releaseMutation.isPending}
                >
                  Release Credentials
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Declining the order will refund the buyer and make your listing available again.
              </p>
            </div>
          )}
          
          {/* Buyer Actions */}
          {isBuyer && order.status === 'WAITING_FOR_BUYER' && (
            <Button 
              className="w-full" 
              onClick={handleConfirmReceived}
              disabled={confirmMutation.isPending}
            >
              {confirmMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </span>
              ) : (
                'Confirm Receipt & Release Payment'
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
          
          {/* Cancelled State */}
          {order.status === 'CANCELLED' && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <X className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <h3 className="font-medium text-red-800">Order Cancelled</h3>
              <p className="text-sm text-red-700 mt-1">
                {order.cancelledReason === 'SELLER_DECLINED' 
                  ? 'This order was declined by the seller. Your payment has been refunded.'
                  : 'This order has been cancelled.'}
              </p>
            </div>
          )}
          
          {/* Disputed State - View Dispute Button */}
          {order.status === 'DISPUTED' && (
            <div className="space-y-4">
              <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-800">Dispute In Progress</h3>
                    <p className="text-sm text-red-700 mt-1">
                      This order is currently under dispute. Please check the dispute details for more information.
                    </p>
                    {disputeData?.dispute && (
                      <p className="text-xs text-red-700 mt-2">
                        Reason: {formatDisputeReason(disputeData.dispute.reason)} • 
                        Opened: {new Date(disputeData.dispute.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full flex items-center justify-center" 
                onClick={() => {
                  if (disputeData?.dispute) {
                    router.push(`/disputes/${disputeData.dispute.id}`);
                  }
                }}
              >
                <Shield className="h-4 w-4 mr-2" />
                View Dispute Details
              </Button>
            </div>
          )}
          
          {/* Dispute Button - Only show for active orders that aren't already disputed */}
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
        <Dialog open={showDisputeModal} onOpenChange={setShowDisputeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Open Dispute</DialogTitle>
              <DialogDescription>
                Please provide details about your issue. A moderator will review your case.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleOpenDispute} className="space-y-4">
              <div>
                <Label htmlFor="disputeReason">Reason</Label>
                <select
                  id="disputeReason"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
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
              
              <div>
                <Label htmlFor="disputeDescription">Description</Label>
                <Textarea
                  id="disputeDescription"
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Please provide details about your issue..."
                  required
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDisputeModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={disputeMutation.isPending}
                >
                  {disputeMutation.isPending ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Opening Dispute...
                    </span>
                  ) : (
                    'Open Dispute'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Review Form Dialog */}
      {showReviewForm && order && (
        <ReviewForm 
          order={order} 
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            setShowReviewForm(false);
            setHasReviewed(true);
          }}
        />
      )}
      
      {/* Add a button to leave a review if the order is completed and the user is the buyer */}
      {order && order.status === 'COMPLETED' && session?.user?.id === order.buyerId && hasReviewed && (
        <div className="mt-6 text-center">
          <p className="text-green-600 mb-2">Thank you for your review!</p>
          </div>
      )}
      
      {order && order.status === 'COMPLETED' && session?.user?.id === order.buyerId && !showReviewForm && !hasReviewed && (
        <div className="mt-6 text-center">
          <Button onClick={() => setShowReviewForm(true)}>
            Leave a Review
          </Button>
        </div>
      )}
      
      {/* Decline Confirmation Dialog */}
      {showDeclineConfirmation && (
        <Dialog open={showDeclineConfirmation} onOpenChange={setShowDeclineConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Decline Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to decline this order? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                <li>The buyer will be refunded</li>
                <li>Your listing will be available again</li>
                <li>This order will be cancelled permanently</li>
              </ul>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeclineConfirmation(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeclineOrder}
                  disabled={declineMutation.isPending}
                >
                  {declineMutation.isPending ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Declining...
                    </span>
                  ) : (
                    'Decline Order'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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

function formatDisputeReason(reason) {
  switch (reason) {
    case 'ITEM_NOT_RECEIVED':
      return 'Item Not Received';
    case 'ITEM_NOT_AS_DESCRIBED':
      return 'Item Not As Described';
    case 'PAYMENT_ISSUE':
      return 'Payment Issue';
    case 'COMMUNICATION_ISSUE':
      return 'Communication Issue';
    case 'ACCOUNT_ACCESS_ISSUE':
      return 'Account Access Issue';
    case 'OTHER':
      return 'Other';
    default:
      return reason.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
  }
} 