import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { nanoid } from 'nanoid'


const prisma = new PrismaClient()

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ticketTypeId, quantity } = await req.json()
    const eventId = params.id

    // Get the event product with ticket type
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
    
    // Find the ticket type
    const ticketType = await prisma.ticketType.findUnique({
      where: {
        id: ticketTypeId,
        productId: eventId
      }
    })
    
    if (!ticketType) {
      return Response.json({ error: 'Invalid ticket type' }, { status: 400 })
    }
    
    // Check if enough tickets are available
    if (ticketType.available < quantity) {
      return Response.json({ error: 'Not enough tickets available' }, { status: 400 })
    }
    
    // Check if buyer is under the per-buyer limit
    if (ticketType.limitPerBuyer) {
      const existingTickets = await prisma.eventTicket.count({
        where: {
          productId: eventId,
          ticketTypeId: ticketTypeId,
          buyerId: session.user.id
        }
      })
      
      if (existingTickets + quantity > ticketType.maxPerBuyer) {
        return Response.json({ 
          error: `Maximum ${ticketType.maxPerBuyer} tickets of this type per buyer`,
          currentlyOwned: existingTickets
        }, { status: 400 })
      }
    }

    // Calculate total price
    const totalPrice = ticketType.price * quantity

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
            price: ticketType.price
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
