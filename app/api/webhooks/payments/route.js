import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

import { encrypt } from '@/lib/encryption'

const prisma = new PrismaClient()

export async function POST(req) {

  
  let event
  try {
 
  } catch (err) {
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    
    try {
      const { orderId, eventId, ticketType, quantity, buyerId } = paymentIntent.metadata
      
      // Get the order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true
        }
      })
      
      if (!order) {
        throw new Error(`Order ${orderId} not found`)
      }
      
      // Get the event product
      const event = await prisma.product.findUnique({
        where: { id: eventId },
        include: {
          seller: true
        }
      })
      
      if (!event) {
        throw new Error(`Event ${eventId} not found`)
      }
      
      // Parse event data to get ticket info
      const eventData = event.contents
      const ticketInfo = eventData.tickets.find(t => t.name === ticketType)
      
      // Generate tickets
      const ticketsToCreate = []
      for (let i = 0; i < parseInt(quantity); i++) {
        const ticketCode = nanoid(12).toUpperCase()
        
        ticketsToCreate.push({
          orderId: order.id,
          productId: event.id,
          ticketType: ticketType,
          ticketPrice: ticketInfo.price,
          buyerId: buyerId,
          sellerId: event.sellerId,
          status: 'VALID',
          paymentReference: paymentIntent.id,
          ticketCode: ticketCode,
          eventDate: new Date(eventData.eventDate),
          eventLocation: eventData.eventLocation,
          metadata: { 
            paymentId: paymentIntent.id,
            purchasedAt: new Date().toISOString()
          }
        })
      }
      
      // Create the tickets
      await prisma.eventTicket.createMany({
        data: ticketsToCreate
      })
      
      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })
      
      // Update available tickets
      const updatedTickets = eventData.tickets.map(t => {
        if (t.name === ticketType) {
          return { ...t, available: t.available - parseInt(quantity) }
        }
        return t
      })
      
      await prisma.product.update({
        where: { id: eventId },
        data: {
          contents: {
            ...eventData,
            tickets: updatedTickets
          }
        }
      })
      
      // Create a transaction record
      await prisma.transaction.create({
        data: {
          amount: order.price,
          type: 'PURCHASE',
          status: 'COMPLETED',
          userId: buyerId,
          orderId: order.id,
          description: `Purchase of ${quantity} ${ticketType} tickets for ${event.title}`,
          completedAt: new Date()
        }
      })
      
    } catch (error) {
      console.error('Error processing payment success:', error)
      return Response.json({ error: 'Failed to process payment success' }, { status: 500 })
    }
  }
  
  return Response.json({ received: true })
}
