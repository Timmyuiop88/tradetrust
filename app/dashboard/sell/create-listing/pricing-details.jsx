"use client"

import { useState, useEffect } from "react"
import { Input } from "../../../components/input"
import { Select } from "../../../components/select"
import { Textarea } from "../../../components/textarea"
import { DollarSign, CreditCard, ArrowRightLeft, Crown } from "lucide-react"
import { useSubscription } from "@/lib/hooks/useSubscription"
import { Skeleton } from "@/app/components/skeleton"

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
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Pricing & Transfer</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Set your price and specify how you'll transfer the account to the buyer.
        </p>
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
              Price (USD)
            </label>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
            className="text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Platform fee: {(commissionRate * 100).toFixed(0)}% ({data.price ? `$${calculateFee(data.price).toFixed(2)}` : '$0.00'})
          </p>
          <p className="text-xs text-gray-500">
            You'll receive: {data.price ? `$${calculateNet(data.price).toFixed(2)}` : '$0.00'}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1">
          <ArrowRightLeft className="h-4 w-4 text-gray-500" />
          Transfer Method
        </label>
        <Select
          value={data.transferMethod}
          onChange={(value) => onUpdate({ transferMethod: value })}
          options={[
            { value: "email_password", label: "Email & Password Change" },
            { value: "full_account", label: "Full Account Takeover" },
            { value: "api_transfer", label: "API-Based Transfer" },
          ]}
        />
      </div>
      
     
    </div>
  )
} 