"use client"

import { useSubscription } from '@/lib/hooks/useSubscription'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/app/components/button'
import { Check, Loader2, AlertCircle, Shield, ShoppingBag, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { Badge } from '@/app/components/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/app/components/dialog'
import { RadioGroup, RadioGroupItem } from '@/app/components/radio-group'
import { Label } from '@/app/components/label'

export function SubscriptionPlans() {
  const { data: subscription } = useSubscription()
  const queryClient = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('BUYING_BALANCE')
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  
  const { mutate: upgradePlan, isPending } = useMutation({
    mutationFn: async ({ planTier, paymentMethod }) => {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTier, paymentMethod })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      toast.success('Subscription upgraded successfully')
      setConfirmDialogOpen(false)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleUpgradeClick = (plan) => {
    setSelectedPlan(plan)
    setConfirmDialogOpen(true)
  }

  const confirmUpgrade = () => {
    if (selectedPlan) {
      upgradePlan({ 
        planTier: selectedPlan.tier, 
        paymentMethod 
      })
    }
  }

  const plans = [
    {
      name: 'Basic',
      tier: 'BASIC',
      price: 9.99,
      description: 'Perfect for occasional sellers',
      features: [
        'Up to 5 active listings',
        '8% commission fee',
        '1 featured listing per month',
        'Email support (24h response)',
        '$50 minimum withdrawal'
      ],
      recommended: false
    },
    {
      name: 'Pro',
      tier: 'PRO',
      price: 19.99,
      description: 'For serious sellers',
      features: [
        'Up to 15 active listings',
        '6% commission fee',
        '3 featured listings per month',
        'Priority support (12h response)',
        '$25 minimum withdrawal',
        'Verified seller badge'
      ],
      recommended: true
    },
    {
      name: 'Premium',
      tier: 'PREMIUM',
      price: 49.99,
      description: 'Ultimate selling power',
      features: [
        'Unlimited active listings',
        '4% commission fee',
        '10 featured listings per month',
        'Dedicated account manager',
        'No minimum withdrawal',
        'Premium seller badge',
        'Top search placement'
      ],
      recommended: false
    }
  ]

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = subscription?.plan?.tier === plan.tier
          const isUpgradeDisabled = isPending || isCurrentPlan || 
            (subscription?.plan?.tier === 'PREMIUM')

          return (
            <div 
              key={plan.tier}
              className={`rounded-lg border p-6 space-y-4 transition-all hover:shadow-md ${
                isCurrentPlan ? 'border-primary bg-primary/5' : ''
              } ${plan.recommended ? 'border-primary/50 shadow-sm' : ''}`}
            >
              <div className="space-y-2">
                {plan.recommended && (
                  <Badge className="mb-2 bg-primary text-primary-foreground">
                    Recommended
                  </Badge>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="flex items-end gap-2 pt-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground pb-1">/month</span>
                </div>
              </div>

              <ul className="space-y-2 py-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isUpgradeDisabled}
                  onClick={() => handleUpgradeClick(plan)}
                  size="lg"
                >
                  {isCurrentPlan ? 'Current Plan' : 'Upgrade to ' + plan.name}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Subscription Upgrade</DialogTitle>
            <DialogDescription>
              You are about to upgrade to the {selectedPlan?.name} plan for ${selectedPlan?.price}/month.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="BUYING_BALANCE" id="buying" />
                <Label htmlFor="buying" className="flex items-center gap-2 cursor-pointer">
                  <ShoppingBag className="h-4 w-4" />
                  Pay with Buying Balance
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-3">
                <RadioGroupItem value="SELLING_BALANCE" id="selling" />
                <Label htmlFor="selling" className="flex items-center gap-2 cursor-pointer">
                  <Wallet className="h-4 w-4" />
                  Pay with Selling Balance
                </Label>
              </div>
            </RadioGroup>
            
            <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Your subscription will renew automatically each month. You can cancel anytime from your account settings.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmUpgrade} 
              className="sm:w-auto w-full"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Confirm Upgrade
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// function ShoppingBag(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
//       <path d="M3 6h18" />
//       <path d="M16 10a4 4 0 0 1-8 0" />
//     </svg>
//   )
// }

// function Wallet(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
//       <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
//       <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
//     </svg>
//   )
// } 