"use client"

import { useState } from "react"
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
import { CreditCard, Wallet, DollarSign, Loader2, Bitcoin } from "lucide-react"
import { toast } from "@/app/components/custom-toast"
import { useBalance, formatCurrency } from "@/app/hooks/useBalance"

export function AddBalanceSheet({ children }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [cryptoPaymentData, setCryptoPaymentData] = useState(null)
  const [paymentStep, setPaymentStep] = useState('input') // 'input', 'processing', 'crypto'
  
  const { useDepositFunds } = useBalance()
  const { mutate: depositFunds, isPending: isDepositing } = useDepositFunds()
  
  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    
    if (paymentMethod === 'crypto') {
      try {
        setPaymentStep('processing')
        
        // Create crypto payment
        const response = await fetch('/api/payments/crypto/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            currency: 'USDT'
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to create crypto payment')
        }
        
        const data = await response.json()
        setCryptoPaymentData(data)
        setPaymentStep('crypto')
      } catch (error) {
        toast.error(error.message || 'Failed to create crypto payment')
        setPaymentStep('input')
      }
    } else {
      // Regular card/bank deposit
      depositFunds(
        {
          amount: parseFloat(amount),
          paymentMethod
        }, 
        {
          onSuccess: () => {
            toast.success(`Successfully added ${formatCurrency(parseFloat(amount))} to your balance`)
            setOpen(false)
            setAmount('')
          }
        }
      )
    }
  }
  
  const handleAmountSelect = (value) => {
    setAmount(value)
  }
  
  const handleCheckPaymentStatus = async () => {
    if (!cryptoPaymentData?.paymentId) return
    
    try {
      const response = await fetch(`/api/payments/crypto/status/${cryptoPaymentData.paymentId}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to check payment status')
      }
      
      const data = await response.json()
      
      if (data.status === 'CONFIRMED' || data.status === 'COMPLETED') {
        toast.success(`Payment of ${formatCurrency(parseFloat(amount))} confirmed!`)
        setOpen(false)
        setAmount('')
        setCryptoPaymentData(null)
        setPaymentStep('input')
        // Refresh user balance
        window.location.reload()
      } else if (data.status === 'WAITING') {
        toast.info('Payment is still being processed. Please wait.')
      } else if (data.status === 'FAILED') {
        toast.error('Payment failed. Please try again.')
        setPaymentStep('input')
        setCryptoPaymentData(null)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to check payment status')
    }
  }
  
  const resetPayment = () => {
    setCryptoPaymentData(null)
    setPaymentStep('input')
  }
  
  const renderPaymentContent = () => {
    if (paymentStep === 'processing') {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-center">Creating payment...</p>
        </div>
      )
    }
    
    if (paymentStep === 'crypto') {
      return (
        <div className="py-6 space-y-4">
          <div className="text-center">
            <h3 className="font-medium text-lg">Pay with {cryptoPaymentData?.currency}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Send exactly {cryptoPaymentData?.amount} {cryptoPaymentData?.currency} to the address below
            </p>
            
            {cryptoPaymentData?.qrCode && (
              <div className="flex justify-center mb-4">
                <img 
                  src={cryptoPaymentData.qrCode} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 border rounded-lg"
                />
              </div>
            )}
            
            <div className="bg-muted p-3 rounded-md text-sm mb-4 break-all">
              {cryptoPaymentData?.address}
            </div>
            
            <div className="text-sm text-muted-foreground mb-6">
              <p>Amount: <span className="font-medium">{cryptoPaymentData?.amount} {cryptoPaymentData?.currency}</span></p>
              <p className="mt-1">Payment will expire in 60 minutes</p>
            </div>
            
            {cryptoPaymentData?.paymentUrl && (
              <Button 
                className="w-full mb-4"
                onClick={() => window.open(cryptoPaymentData.paymentUrl, '_blank')}
              >
                Open Payment Page
              </Button>
            )}
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={resetPayment}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleCheckPaymentStatus}
              >
                Check Status
              </Button>
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <div className="py-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="5"
              step="0.01"
              className="pl-9"
            />
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            {['50', '100', '200'].map((value) => (
              <Button
                key={value}
                type="button"
                variant={amount === value ? "default" : "outline"}
                onClick={() => handleAmountSelect(value)}
              >
                ${value}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <RadioGroup 
            value={paymentMethod} 
            onValueChange={setPaymentMethod}
            className="grid grid-cols-1 gap-2"
          >
            <div className={`flex items-center space-x-2 rounded-md border p-3 ${paymentMethod === 'card' ? 'border-primary' : ''}`}>
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                <CreditCard className="h-4 w-4" />
                <div>
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-xs text-muted-foreground">Instant deposit</p>
                </div>
              </Label>
            </div>
            
            <div className={`flex items-center space-x-2 rounded-md border p-3 ${paymentMethod === 'bank' ? 'border-primary' : ''}`}>
              <RadioGroupItem value="bank" id="bank" />
              <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                <Wallet className="h-4 w-4" />
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-xs text-muted-foreground">1-3 business days</p>
                </div>
              </Label>
            </div>
            
            <div className={`flex items-center space-x-2 rounded-md border p-3 ${paymentMethod === 'crypto' ? 'border-primary' : ''}`}>
              <RadioGroupItem value="crypto" id="crypto" />
              <Label htmlFor="crypto" className="flex items-center gap-2 cursor-pointer flex-1">
                <Bitcoin className="h-4 w-4" />
                <div>
                  <p className="font-medium">USDT (Tether)</p>
                  <p className="text-xs text-muted-foreground">Crypto payment</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    )
  }
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
        
        {paymentStep === 'input' && (
          <div className="mt-6">
            <Button 
              onClick={handleAddFunds} 
              disabled={!amount || parseFloat(amount) <= 0 || isDepositing}
              className="w-full"
            >
              {isDepositing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Add ${amount ? `$${parseFloat(amount).toFixed(2)}` : 'Funds'}`
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
} 