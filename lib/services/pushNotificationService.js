import { prisma } from '@/lib/prisma'
import webpush from 'web-push'

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:info@tradetrust.com', // Your contact email
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

class PushNotificationService {
  static async sendNotification(userId, title, body, data = {}) {
    try {
      // Get all push subscriptions for this user
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId }
      })
      
      if (!subscriptions.length) return false
      
      // Send notification to all user's devices
      const payload = JSON.stringify({
        title,
        body,
        data,
        timestamp: Date.now()
      })
      
      // Send to all subscriptions in parallel
      const results = await Promise.allSettled(
        subscriptions.map(sub => {
          const subscription = JSON.parse(sub.subscription)
          return webpush.sendNotification(subscription, payload)
        })
      )
      
      // Check if any notifications were sent successfully
      return results.some(result => result.status === 'fulfilled')
    } catch (error) {
      console.error('Error sending push notification:', error)
      return false
    }
  }
  
  static async notifyOrderUpdate(order, updateType) {
    // Prepare notification content based on update type
    let buyerTitle, buyerBody, sellerTitle, sellerBody
    
    switch (updateType) {
      case 'ORDER_CREATED':
        sellerTitle = 'New Order Received!'
        sellerBody = `You have a new order for your ${order.listing.platform.name} account.`
        break
        
      case 'SELLER_PROVIDED_DETAILS':
        buyerTitle = 'Account Details Ready'
        buyerBody = `The seller has provided the account details for your ${order.listing.platform.name} purchase.`
        break
        
      case 'BUYER_CONFIRMED':
        sellerTitle = 'Order Completed!'
        sellerBody = 'The buyer has confirmed receipt. Payment has been released to your account.'
        buyerTitle = 'Order Completed'
        buyerBody = 'Thank you for confirming receipt. The order is now complete.'
        break
        
      default:
        return false
    }
    
    // Send notifications to relevant parties
    const promises = []
    
    if (buyerTitle && order.buyerId) {
      promises.push(this.sendNotification(
        order.buyerId,
        buyerTitle,
        buyerBody,
        { orderId: order.id, type: 'order_update' }
      ))
    }
    
    if (sellerTitle && order.sellerId) {
      promises.push(this.sendNotification(
        order.sellerId,
        sellerTitle,
        sellerBody,
        { orderId: order.id, type: 'order_update' }
      ))
    }
    
    await Promise.all(promises)
    return true
  }
}

export { PushNotificationService } 