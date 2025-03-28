import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addMinutes } from 'date-fns'
import { encrypt } from '@/lib/encryption'
import { PushNotificationService } from '@/lib/services/pushNotificationService'

async function validateSession(session) {
  if (!session?.user?.id) {
    throw { status: 401, message: 'Unauthorized' }
  }
}

async function getOrderById(orderId) {
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
    throw { status: 404, message: 'Order not found' }
  }
  
  return order;
}

async function validateSeller(order, session) {
  if (order.sellerId !== session.user.id) {
    throw { status: 403, message: 'Only the seller can release credentials' }
  }
}

async function validateOrderState(order) {
  if (order.status !== 'WAITING_FOR_SELLER') {
    throw { status: 400, message: 'Cannot release credentials in the current order state' }
  }
}

async function validateRequestBody(request) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    throw { status: 400, message: 'Invalid request body. Please provide valid JSON data.' }
  }
  return body;
}

function encryptCredentials(body) {
  return {
    email: encrypt(body.email || ''),
    password: encrypt(body.password || ''),
    serialKey: body.serialKey ? encrypt(body.serialKey) : null,
    loginImages: body.loginImages || [],
    recoveryAccountType: body.recoveryAccountType ? encrypt(body.recoveryAccountType) : null,
    recoveryEmail: body.recoveryEmail ? encrypt(body.recoveryEmail) : null,
    recoveryPassword: body.recoveryPassword ? encrypt(body.recoveryPassword) : null,
    recoveryPhone: body.recoveryPhone ? encrypt(body.recoveryPhone) : null,
    securityQuestions: body.securityQuestions ? encrypt(body.securityQuestions) : null,
    recoveryImages: body.recoveryImages || [],
    transferInstructions: body.transferInstructions ? encrypt(body.transferInstructions) : null,
    additionalInfo: body.additionalInfo ? encrypt(body.additionalInfo) : null,
    additionalImages: body.additionalImages || []
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    await validateSession(session)
    
    const orderId = params.id
    if (!orderId) {
      throw { status: 400, message: 'Order ID is required' }
    }

    const order = await getOrderById(orderId)
    await validateSeller(order, session)
    await validateOrderState(order)

    const body = await validateRequestBody(request)

    const encryptedCredentials = encryptCredentials(body)

    // Set buyer deadline (20 minutes from now)
    const buyerDeadline = addMinutes(new Date(), 20)

    // Update order status and store credentials
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'WAITING_FOR_BUYER',
        buyerDeadline,
      }
    })

    const updatedCredentials = await prisma.listing.update({
      where: { id: order.listingId },
      data: {
        credentials: encryptedCredentials
      }
    })

    // Send push notification to buyer
    await PushNotificationService.notifyOrderUpdate(
      order,
      'SELLER_PROVIDED_DETAILS'
    )

    return NextResponse.json({
      success: true,
      message: 'Account credentials released. Waiting for buyer confirmation.'
    })
    
  } catch (error) {
    const statusCode = error.status || 500
    const message = error.message || 'Failed to release credentials'
    console.error(`Error releasing credentials: ${message}`, error)

    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
