"use client"

import { useSubscription } from '@/lib/hooks/useSubscription'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Crown, Loader2, Check, ArrowRight, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

export function CurrentPlanIndicator() {
  const { data: subscription, isLoading } = useSubscription()
  const router = useRouter()

  if (isLoading) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const plan = subscription?.plan
  const nextRenewal = subscription?.currentPeriodEnd 
    ? format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')
    : 'N/A'

  const getBadgeVariant = (tier) => {
    switch(tier) {
      case 'PREMIUM': return 'premium'
      case 'PRO': return 'pro'
      case 'BASIC': return 'basic'
      default: return 'outline'
    }
  }

  return (
    <Card className="overflow-hidden border-2">
      <div className={`h-2 w-full ${
        plan?.tier === 'PREMIUM' ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
        plan?.tier === 'PRO' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
        plan?.tier === 'BASIC' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
        'bg-gradient-to-r from-gray-300 to-gray-400'
      }`} />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className={`h-5 w-5 ${
              plan?.tier === 'PREMIUM' ? 'text-amber-500' :
              plan?.tier === 'PRO' ? 'text-blue-500' :
              plan?.tier === 'BASIC' ? 'text-emerald-500' :
              'text-gray-500'
            }`} />
            Current Plan
          </CardTitle>
          <Badge variant={getBadgeVariant(plan?.tier)}>
            {plan?.tier}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{plan?.name}</h3>
            <p className="text-sm text-muted-foreground">{plan?.description}</p>
            
            {subscription?.currentPeriodEnd && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Renews on {nextRenewal}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/40 p-2 rounded-md">
              <p className="text-muted-foreground text-xs">Max Listings</p>
              <p className="font-medium">{plan?.maxListings === 999999 ? 'Unlimited' : plan?.maxListings}</p>
            </div>
            <div className="bg-muted/40 p-2 rounded-md">
              <p className="text-muted-foreground text-xs">Commission</p>
              <p className="font-medium">{(plan?.commissionRate * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-muted/40 p-2 rounded-md">
              <p className="text-muted-foreground text-xs">Featured Listings</p>
              <p className="font-medium">{plan?.featuredListings}/mo</p>
            </div>
            <div className="bg-muted/40 p-2 rounded-md">
              <p className="text-muted-foreground text-xs">Min. Withdrawal</p>
              <p className="font-medium">${plan?.minimumWithdrawal}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">PLAN BENEFITS</h4>
            <ul className="space-y-1">
              <li className="flex items-start gap-2 text-xs">
                <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span>{plan?.tier === 'FREE' ? 'Basic support' : 'Priority support'}</span>
              </li>
              {plan?.tier !== 'FREE' && (
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>Faster withdrawals ({plan?.withdrawalSpeed}h)</span>
                </li>
              )}
              {(plan?.tier === 'PRO' || plan?.tier === 'PREMIUM') && (
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>Verified seller badge</span>
                </li>
              )}
              {plan?.tier === 'PREMIUM' && (
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>Top search placement</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 pb-4">
        <Button 
          className="w-full group"
          variant={plan?.tier === 'FREE' ? 'default' : 'outline'}
          onClick={() => router.push('/dashboard/subscription')}
        >
          {plan?.tier === 'FREE' ? 'Upgrade Plan' : 'Manage Plan'}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  )
} 