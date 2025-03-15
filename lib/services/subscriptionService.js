import { prisma } from '@/lib/prisma'

class SubscriptionService {
  static async getUserSubscription(userId) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    })

    if (!subscription) {
      // Get the FREE plan from database
      const freePlan = await prisma.plan.findFirst({
        where: { tier: 'FREE' }
      })
      return { plan: freePlan }
    }

    return subscription
  }

  static async canCreateListing(userId) {
    const subscription = await this.getUserSubscription(userId)
    
    const activeListings = await prisma.listing.count({
      where: {
        sellerId: userId,
        status: 'AVAILABLE'
      }
    })

    return activeListings < subscription.plan.maxListings
  }

  static async getCommissionRate(userId) {
    const subscription = await this.getUserSubscription(userId)
    return subscription.plan.commissionRate
  }

  static async canWithdraw(userId, amount) {
    const subscription = await this.getUserSubscription(userId)
    return amount >= subscription.plan.minimumWithdrawal
  }

  static async getRemainingFeaturedListings(userId) {
    const subscription = await this.getUserSubscription(userId)
    
    const usedFeaturedListings = await prisma.featuredListing.count({
      where: {
        userId,
        startDate: {
          gte: subscription.currentPeriodStart || new Date()
        },
        endDate: {
          lte: subscription.currentPeriodEnd || new Date()
        }
      }
    })

    return Math.max(0, subscription.plan.featuredListings - usedFeaturedListings)
  }
}

export { SubscriptionService } 