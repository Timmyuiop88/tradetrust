import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { nanoid } from 'nanoid'

import { encrypt } from '@/lib/encryption'

const prisma = new PrismaClient()

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ticketType, quantity } = await req.json()
    const eventId = params.id

    // Get the event product
    const event = await prisma.product.findUnique({
      where: { 
        id: eventId,
        type: 'EVENT',
        isAvailable: true
      },
      include: {
        seller: true
      }
    })

    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 })
    }

    // Find the ticket type in the event data
    let selectedTicket
    try {
      const eventData = event.contents
      const tickets = eventData.tickets || []
      selectedTicket = tickets.find(t => t.name === ticketType)
      
      if (!selectedTicket) {
        return Response.json({ error: 'Invalid ticket type' }, { status: 400 })
      }
      
      if (selectedTicket.available < quantity) {
        return Response.json({ error: 'Not enough tickets available' }, { status: 400 })
      }
    } catch (error) {
      return Response.json({ error: 'Invalid event data' }, { status: 400 })
    }

    // Calculate total price
    const totalPrice = selectedTicket.price * quantity

    // Create order
    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        sellerId: event.sellerId,
        price: totalPrice,
        escrowAmount: totalPrice,
        status: 'PENDING',
        items: {
          create: {
            productId: event.id,
            quantity: quantity,
            price: selectedTicket.price
          }
        }
      }
    })

    // Create payment intent with Stripe
    const paymentIntent = true

    return Response.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order.id
    })
  } catch (error) {
    console.error('Error purchasing tickets:', error)
    return Response.json({ error: 'Failed to process ticket purchase' }, { status: 500 })
  }
}
