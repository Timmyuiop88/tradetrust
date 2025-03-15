import { NextResponse } from 'next/server'
import { SubscriptionService } from '@/lib/services/subscriptionService'

export async function subscriptionMiddleware(request) {
  const subscription = await SubscriptionService.getUserSubscription(request.user.id)
  
  // Check if subscription is past due
  if (subscription.status === 'PAST_DUE') {
    return NextResponse.json({ 
      error: 'Subscription payment required',
      code: 'SUBSCRIPTION_REQUIRED'
    }, { status: 402 })
  }

  // Add subscription info to request
  request.subscription = subscription
  return NextResponse.next()
} 