"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/components/sheet"
import { Button } from "@/app/components/button"
import { Input } from "@/app/components/input"
import { Label } from "@/app/components/label"
import { RadioGroup, RadioGroupItem } from "@/app/components/radio-group"
import { toast } from "sonner"
import { Loader2, AlertCircle, Plane } from "lucide-react"

export function WithdrawSheet({ children, balance = 0, onSuccess }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [payoutSettings, setPayoutSettings] = useState([])
  const [selectedPayoutId, setSelectedPayoutId] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingSettings, setFetchingSettings] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  useEffect(() => {
    if (open) {
      fetchPayoutSettings()
    }
  }, [open])
  
  const fetchPayoutSettings = async () => {
    try {
      setFetchingSettings(true)
      const response = await fetch('/api/users/payout-settings')
      if (response.ok) {
        const data = await response.json()
        setPayoutSettings(data)
        
        // Set default payout method if available
        const defaultSetting = data.find(setting => setting.isDefault)
        if (defaultSetting) {
          setSelectedPayoutId(defaultSetting.id)
        } else if (data.length > 0) {
          setSelectedPayoutId(data[0].id)
        }
      } else {
        setError("Failed to load payout methods")
      }
    } catch (error) {
      console.error('Error fetching payout settings:', error)
      setError("Failed to load payout methods")
    } finally {
      setFetchingSettings(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    // Validate inputs
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }
    
    if (parseFloat(amount) > balance) {
      setError("Insufficient balance")
      return
    }
    
    if (!selectedPayoutId) {
      setError("Please select a payout method")
      return
    }
    
    try {
      setLoading(true)
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          payoutSettingId: selectedPayoutId
        }),
      })
      
      if (response.ok) {
        setSuccess(true)
        setAmount("")
        toast.success("Withdrawal request submitted successfully")
        
        // Call the onSuccess callback if provided
        if (typeof onSuccess === 'function') {
          onSuccess()
        }
        
        // Close the sheet after a delay
        setTimeout(() => {
          setOpen(false)
          setSuccess(false)
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to submit withdrawal request")
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }
  
  const handleClose = () => {
    if (!loading) {
      setOpen(false)
      setError(null)
      setSuccess(false)
    }
  }
  
  const formatPayoutMethodLabel = (method, details) => {
    const methodLabels = {
      BTC: "Bitcoin",
      ETH: "Ethereum",
      USDT_TRC20: "USDT (TRC20)",
      BANK_TRANSFER: "Bank Transfer"
    }
    
    const label = methodLabels[method] || method
    
    if (method === 'BTC' || method === 'ETH' || method === 'USDT_TRC20') {
      return `${label} - ${details.address.substring(0, 6)}...${details.address.substring(details.address.length - 4)}`
    } else if (method === 'BANK_TRANSFER') {
      return `${label} - ${details.bankName} (${details.accountNumber.substring(details.accountNumber.length - 4)})`
    }
    
    return label
  }
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Withdraw Funds</SheetTitle>
        </SheetHeader>
        
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Plane className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-2">Withdrawal Request Submitted!</h3>
            <p className="text-muted-foreground mb-6">
              Your withdrawal request is on its way to processing. You can track its status in the withdrawals tab.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Withdraw</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8"
                  step="0.01"
                  min="0"
                  max={balance}
                  disabled={loading || fetchingSettings}
                />
              </div>
              {balance <= 0 && (
                <p className="text-sm text-amber-600 flex items-center mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  You don't have any funds available to withdraw
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              {fetchingSettings ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : payoutSettings.length > 0 ? (
                <RadioGroup value={selectedPayoutId} onValueChange={setSelectedPayoutId}>
                  <div className="space-y-2">
                    {payoutSettings.map((setting) => (
                      <div key={setting.id} className="flex items-center space-x-2 border p-3 rounded-md">
                        <RadioGroupItem value={setting.id} id={setting.id} disabled={loading} />
                        <Label htmlFor={setting.id} className="flex-1 cursor-pointer">
                          {formatPayoutMethodLabel(setting.method, setting.details)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <div className="text-center py-4 border rounded-md bg-muted/20">
                  <p className="text-sm text-muted-foreground mb-2">No payment methods found</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/dashboard/settings/payment">Add Payment Method</a>
                  </Button>
                </div>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
              <p className="font-medium mb-1">Withdrawal Information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>A 2% processing fee will be applied to your withdrawal</li>
                <li>Withdrawals are typically processed within 1-3 business days</li>
                <li>Minimum withdrawal amount is $10</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={loading || fetchingSettings || balance <= 0 || !selectedPayoutId}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {loading ? "Processing..." : "Withdraw Funds"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
} 