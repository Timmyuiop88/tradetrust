"use client"

import { useSubscription } from '@/lib/hooks/useSubscription'
import { Card, CardContent } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Crown, Loader2, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CompactPlanIndicator() {
  const { data: subscription, isLoading } = useSubscription()
  const router = useRouter()

  if (isLoading) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="py-3">
          <div className="flex items-center justify-center h-6">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const plan = subscription?.plan

  const getBadgeColor = (tier) => {
    switch(tier) {
      case 'PREMIUM': return 'bg-gradient-to-r from-amber-500 to-yellow-500'
      case 'PRO': return 'bg-gradient-to-r from-blue-500 to-indigo-500'
      case 'BASIC': return 'bg-gradient-to-r from-emerald-500 to-teal-500'
      default: return ''
    }
  }

  return (
    <Card className="border">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className={`h-4 w-4 ${
              plan?.tier === 'PREMIUM' ? 'text-amber-500' :
              plan?.tier === 'PRO' ? 'text-blue-500' :
              plan?.tier === 'BASIC' ? 'text-emerald-500' :
              'text-gray-500'
            }`} />
            <span className="text-sm font-medium">Current Plan:</span>
            <Badge 
              variant={plan?.tier === 'FREE' ? 'outline' : 'default'}
              className={`text-xs `}
            >
              {plan?.tier}
            </Badge>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs gap-1 hover:bg-transparent hover:text-primary"
            onClick={() => router.push('/dashboard/subscription')}
          >
            Manage
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 