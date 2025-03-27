"use client"

import { useState, useEffect } from "react"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger
} from "@/app/components/sheet"
import { Button } from "@/app/components/button"
import { Input } from "@/app/components/input"
import { Label } from "@/app/components/label"
import { RadioGroup, RadioGroupItem } from "@/app/components/radio-group"
import { CreditCard, Wallet, DollarSign, Loader2, Bitcoin, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "@/app/components/custom-toast"
import { useBalance, formatCurrency } from "@/app/hooks/useBalance"
import { useRouter } from "next/navigation"

export function AddBalanceSheet({ children }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cryptoPaymentData, setCryptoPaymentData] = useState(null)
  const [oxaPaymentData, setOxaPaymentData] = useState(null)
  const [paymentStep, setPaymentStep] = useState('input') // 'input', 'processing', 'crypto', 'oxapay'
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  
  const { useDepositFunds } = useBalance()
  const { mutate: depositFunds, isPending: isDepositing } = useDepositFunds()
  
  const handleAddFunds = async (e) => {
    e.preventDefault()
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    
    if (paymentMethod === 'oxapay') {
      try {
        setPaymentStep('processing')
        
        // Create Oxapay payment
        const response = await fetch('/api/payments/oxapay/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            currency: 'USDT'
          }),
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.success) {
            // Store the payment info for when we return
            sessionStorage.setItem('pendingPaymentId', data.paymentId)
            sessionStorage.setItem('pendingTransactionId', data.transactionId)
            
            // Use the returnUrl if provided, otherwise use the paymentUrl
            const paymentUrl = data.returnUrl || data.paymentUrl
            
            // Navigate to the payment URL
            window.location.href = paymentUrl
            
            setOxaPaymentData(data)
            setPaymentStep('oxapay')
          } else {
            throw new Error(data.message || 'Failed to create payment')
          }
        } else {
          throw new Error('Failed to create payment')
        }
      } catch (error) {
        console.error('Error creating Oxapay payment:', error)
        toast.error(error.message || 'Failed to create payment')
        setPaymentStep('input')
      }
    } else {
      // Handle other payment methods (e.g., card)
      try {
        setPaymentStep('processing')
        
        const response = await fetch('/api/user/balance/deposit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            paymentMethod,
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to add funds')
        }
        
        setPaymentStep('success')
        
        // Close the sheet after a delay
        setTimeout(() => {
          setOpen(false)
          setPaymentStep('input')
          setAmount('')
          
          // Redirect to balance page
          router.push('/dashboard/balance')
        }, 2000)
      } catch (error) {
        console.error('Error adding funds:', error)
        toast.error(error.message || 'Failed to add funds')
        setPaymentStep('input')
      }
    }
  }
  
  const handleAmountSelect = (value) => {
    setAmount(value)
  }
  
  const handleCheckPaymentStatus = async (paymentId, provider) => {
    try {
      setIsCheckingStatus(true);
      const endpoint = provider === 'oxapay' 
        ? `/api/payments/oxapay/status/${paymentId}`
        : `/api/payments/crypto/status/${paymentId}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check payment status');
      }
      
      const data = await response.json();
      
      if (data.status === 'COMPLETED') {
        toast.success('Payment completed successfully!');
        setOpen(false);
        // Refresh balance if needed
        window.location.reload();
      } else if (data.status === 'CONFIRMED') {
        toast.info('Payment is being confirmed. Please wait a moment.');
      } else if (data.status === 'FAILED') {
        toast.error('Payment failed. Please try again.');
        setPaymentStep('input');
      } else {
        toast.info('Payment is still pending. Please complete the payment.');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error(error.message || 'Failed to check payment status');
    } finally {
      setIsCheckingStatus(false);
    }
  }
  
  const resetPayment = () => {
    setCryptoPaymentData(null)
    setOxaPaymentData(null)
    setPaymentStep('input')
  }
  
  const handleOpenChange = (isOpen) => {
    setOpen(isOpen)
    if (!isOpen) {
      setPaymentStep('input')
      setAmount('')
    }
  }
  
  const renderPaymentContent = () => {
    if (paymentStep === 'processing') {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">
            Processing your payment...
          </p>
        </div>
      )
    }
    
    if (paymentStep === 'success') {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-center mb-2">
            Payment Successful!
          </h3>
          <p className="text-center text-muted-foreground mb-4">
            Your funds have been added to your account.
          </p>
        </div>
      )
    }
    
    return (
      <form onSubmit={handleAddFunds} className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              className="pl-8"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Credit Card</div>
                  <div className="text-sm text-muted-foreground">
                    Pay with Visa, Mastercard, etc.
                  </div>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oxapay" id="oxapay" />
              <Label htmlFor="oxapay" className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <Bitcoin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Oxapay</div>
                  <div className="text-sm text-muted-foreground">
                    Pay with cryptocurrency via Oxapay
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <Button type="submit" className="w-full">
          Add Funds
        </Button>
      </form>
    )
  }
  
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Funds</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Add money to your buying balance to purchase accounts
          </p>
        </SheetHeader>
        
        {renderPaymentContent()}
      </SheetContent>
    </Sheet>
  )
} 