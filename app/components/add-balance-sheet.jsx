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
import { CreditCard, Wallet, DollarSign, Loader2 } from "lucide-react"
import { toast } from "@/app/components/custom-toast"
import { useBalance, formatCurrency } from "@/app/hooks/useBalance"

export function AddBalanceSheet({ children }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  
  const { useDepositFunds } = useBalance()
  const { mutate: depositFunds, isPending: isDepositing } = useDepositFunds()
  
  const handleAddFunds = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    
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
  
  const handleAmountSelect = (value) => {
    setAmount(value)
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
            </RadioGroup>
          </div>
        </div>
        
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
      </SheetContent>
    </Sheet>
  )
} 