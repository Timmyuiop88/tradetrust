import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addMinutes } from 'date-fns'
import { encrypt } from '@/lib/encryption'
import { PushNotificationService } from '@/lib/services/pushNotificationService'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const orderId = params.id
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }
    
    // Get the order with listing and platform details for notification
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: {
          include: {
            platform: true
          }
        }
      }
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Check if user is the seller
    if (order.sellerId !== session.user.id) {
      return NextResponse.json({ error: 'Only the seller can release credentials' }, { status: 403 })
    }
    
    // Check if order is in the correct state
    if (order.status !== 'WAITING_FOR_SELLER') {
      return NextResponse.json({ 
        error: 'Cannot release credentials in the current order state' 
      }, { status: 400 })
    }
    
    // Get credentials from request body with error handling
    let email, password, additionalInfo;
    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
      additionalInfo = body.additionalInfo;
    } catch (error) {
      return NextResponse.json({ 
        error: 'Invalid request body. Please provide valid JSON data.' 
      }, { status: 400 })
    }
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    // Encrypt sensitive data
    const encryptedCredentials = {
      email: encrypt(email),
      password: encrypt(password),
      additionalInfo: additionalInfo ? encrypt(additionalInfo) : null
    }
    
    // Set buyer deadline (20 minutes from now)
    const buyerDeadline = addMinutes(new Date(), 20)
    
    // Update order status and store credentials
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'WAITING_FOR_BUYER',
        buyerDeadline,
        credentials: encryptedCredentials
      }
    })
    
    // Send push notification to buyer
    await PushNotificationService.notifyOrderUpdate(
      order, // Pass the order with included listing and platform
      'SELLER_PROVIDED_DETAILS'
    )
    
    return NextResponse.json({
      success: true,
      message: 'Account credentials released. Waiting for buyer confirmation.'
    })
  } catch (error) {
    console.error('Error releasing credentials:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to release credentials' },
      { status: 500 }
    )
  }
} 