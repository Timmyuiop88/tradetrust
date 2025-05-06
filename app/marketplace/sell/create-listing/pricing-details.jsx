"use client"

import { useState, useEffect } from "react"
import { Input } from "../../../components/input"
import { Checkbox } from "@/app/components/checkbox"
import { DollarSign, Crown } from "lucide-react"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Skeleton } from "@/app/components/skeleton"
import { Label } from "@/app/components/label"

export function PricingDetails({ data, onUpdate }) {
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-bold mb-2">Pricing Details</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          Set your price and decide if you're open to price negotiation.
        </p>
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 sm:h-5 w-32" />
          <Skeleton className="h-8 sm:h-10 w-full" />
          <Skeleton className="h-3 sm:h-4 w-48" />
          <Skeleton className="h-3 sm:h-4 w-40" />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
            <label className="text-xs sm:text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
              Price (USD)
            </label>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
              <Crown className="h-3 w-3 text-primary" />
              <span>Your commission rate: {(commissionRate * 100).toFixed(0)}%</span>
            </div>
          </div>
          <Input 
            type="number"
            value={data.price}
            onChange={(e) => onUpdate({ price: e.target.value })}
            placeholder="e.g. 499.99"
            min="0"
            step="0.01"
            className="text-base sm:text-lg h-8 sm:h-10"
          />
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
            Platform fee: {(commissionRate * 100).toFixed(0)}% ({data.price ? `$${calculateFee(data.price).toFixed(2)}` : '$0.00'})
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500">
            You'll receive: {data.price ? `$${calculateNet(data.price).toFixed(2)}` : '$0.00'}
          </p>
        </div>
      )}
      
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="negotiable" 
          checked={data.negotiable}
          onCheckedChange={(checked) => onUpdate({ negotiable: checked })}
          className="h-4 w-4 sm:h-5 sm:w-5"
        />
        <Label 
          htmlFor="negotiable" 
          className="text-xs sm:text-sm font-medium cursor-pointer"
        >
          I'm open to price negotiation
        </Label>
      </div>
    </div>
  )
} 