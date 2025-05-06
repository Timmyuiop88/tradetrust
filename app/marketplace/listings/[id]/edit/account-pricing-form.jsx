"use client"

import { useState, useEffect } from "react"
import { Input } from "@/app/components/input"
import { Checkbox } from "@/app/components/checkbox"
import { Button } from "@/app/components/button"
import { DollarSign, Crown, Info } from "lucide-react"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Skeleton } from "@/app/components/skeleton"
import { Label } from "@/app/components/label"

export function AccountPricingForm({ formData, updateFormData, onComplete }) {
  const { data: subscription, isLoading } = useSubscription()
  const [commissionRate, setCommissionRate] = useState(0.1) // Default 10%
  
  useEffect(() => {
    if (subscription?.plan) {
      setCommissionRate(subscription.plan.commissionRate)
    }
  }, [subscription])
  
  const calculateFee = (price) => {
    if (!price) return 0
    return parseFloat(price) * commissionRate
  }
  
  const calculateNet = (price) => {
    if (!price) return 0
    return parseFloat(price) - calculateFee(price)
  }

  const handlePriceChange = (e) => {
    const value = e.target.value;
    updateFormData({ price: value === "" ? "" : parseFloat(value) });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Pricing Details</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          Update your price and decide if you're open to price negotiation.
        </p>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
          <Info className="h-3.5 w-3.5" />
          <span>Setting a competitive price helps your listing sell faster</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              Price (USD) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Crown className="h-3 w-3 text-primary" />
              <span>Your commission rate: {(commissionRate * 100).toFixed(0)}%</span>
            </div>
          </div>
          <Input 
            type="number"
            value={formData.price}
            onChange={handlePriceChange}
            placeholder="e.g. 499.99"
            min="0"
            step="0.01"
            className="text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Platform fee: {(commissionRate * 100).toFixed(0)}% ({formData.price ? `$${calculateFee(formData.price).toFixed(2)}` : '$0.00'})
          </p>
          <p className="text-xs text-gray-500">
            You'll receive: {formData.price ? `$${calculateNet(formData.price).toFixed(2)}` : '$0.00'}
          </p>
        </div>
      )}
      
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="negotiable" 
          checked={formData.negotiable}
          onCheckedChange={(checked) => updateFormData({ negotiable: checked })}
        />
        <Label 
          htmlFor="negotiable" 
          className="text-sm font-medium cursor-pointer"
        >
          I'm open to price negotiation
        </Label>
      </div>
      
      <div className="pt-4 text-right">
        <Button onClick={onComplete}>
          Continue to Media
        </Button>
      </div>
    </div>
  )
} 