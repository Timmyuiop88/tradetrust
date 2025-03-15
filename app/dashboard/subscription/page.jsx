"use client"

import { Suspense } from 'react'
import { SubscriptionPlans } from './subscription-plans'
import { CurrentPlanIndicator } from '../../components/CurrentPlanIndicator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { Card, CardContent } from "@/app/components/card"
import { Wallet, ShoppingBag } from 'lucide-react'



export default function SubscriptionPage() {
  return (
    <div className="container max-w-6xl py-6 space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
        <p className="text-muted-foreground max-w-3xl">
          Choose the plan that best fits your needs. Upgrade anytime to unlock more features and increase your selling potential.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="sticky top-24 space-y-6">
            <CurrentPlanIndicator />
            
           
          </div>
        </div>
        
        <div className="lg:col-span-3 order-1 lg:order-2">
          <Suspense fallback={<PlansSkeleton />}>
            <SubscriptionPlans />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function PlansSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg border p-6 space-y-4">
          <div className="h-8 bg-muted rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          <div className="space-y-2">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 