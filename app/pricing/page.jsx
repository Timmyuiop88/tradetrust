"use client"

import { Card, CardContent } from "@/app/components/card"
import { Button } from "@/app/components/button"
import { Check } from "lucide-react"
import Link from "next/link"

export default function SubscriptionPage() {
  const plans = [
    {
      name: 'Basic',
      price: 9.99,
      description: 'Perfect for getting started',
      features: [
        'Up to 10 digital products',
        'Basic analytics',
        '2% transaction fee',
        'Email support',
        'Standard delivery options',
        'Basic product customization'
      ],
      recommended: false
    },
    {
      name: 'Pro',
      price: 29.99,
      description: 'For growing creators',
      features: [
        'Unlimited digital products',
        'Advanced analytics',
        '1% transaction fee',
        'Priority support',
        'Custom delivery options',
        'Advanced customization',
        'Custom domain',
        'API access'
      ],
      recommended: true
    },
    {
      name: 'Enterprise',
      price: 99.99,
      description: 'For established businesses',
      features: [
        'Everything in Pro',
        'No transaction fees',
        'Dedicated account manager',
        'Custom integrations',
        'White-label solution',
        'Advanced security features',
        'SLA guarantees',
        'Custom contracts'
      ],
      recommended: false
    }
  ]

  return (
    <div className="container max-w-6xl py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your digital business. All plans include core features like secure delivery, content protection, and instant payouts.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 pt-8">
        {plans.map((plan) => (
          <Card 
            key={plan.name}
            className={`relative overflow-hidden ${
              plan.recommended ? 'border-primary shadow-lg' : 'border-2'
            }`}
          >
            {plan.recommended && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm">
                Most Popular
              </div>
            )}
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={plan.recommended ? 'default' : 'outline'}
              >
                <Link href="/signup">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center pt-12 space-y-4">
        <h2 className="text-2xl font-bold">Enterprise Solutions</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Need a custom solution? Contact us for tailored pricing and features for your specific needs.
        </p>
        <Button variant="outline" asChild>
          <Link href="/contact">Contact Sales</Link>
        </Button>
      </div>
    </div>
  )
} 