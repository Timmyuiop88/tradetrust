import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const prisma = new PrismaClient()

export async function GET(req, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)
    
    // Get the event product
    const event = await prisma.product.findUnique({
      where: { 
        id,
        type: 'EVENT',
        isAvailable: true
      },
      include: {
        ticketTypes: true
      }
    })

    if (!event) {
      return Response.json({ error: 'Event not found' }, { status: 404 })
    }

    // For security, get buyer limits if logged in
    let buyerLimits = {}
    if (session) {
      // Get number of tickets already purchased by this user
      const existingTickets = await prisma.eventTicket.groupBy({
        by: ['ticketTypeId'],
        where: {
          productId: id,
          buyerId: session.user.id
        },
        _count: {
          ticketTypeId: true
        }
      })
      
      buyerLimits = existingTickets.reduce((acc, count) => {
        acc[count.ticketTypeId] = count._count.ticketTypeId
        return acc
      }, {})
    }

    // Format ticket types for the frontend
    const availableTickets = event.ticketTypes.map(ticket => ({
      id: ticket.id,
      name: ticket.name, 
      price: ticket.price,
      available: ticket.available,
      transferable: ticket.transferable,
      limitPerBuyer: ticket.limitPerBuyer,
      maxPerBuyer: ticket.limitPerBuyer ? 
        Math.max(0, ticket.maxPerBuyer - (buyerLimits[ticket.id] || 0)) : 
        null,
      description: ticket.description || null
    }))
    
    return Response.json({
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.eventDate,
      eventLocation: event.eventLocation,
      tickets: availableTickets
    })
  } catch (error) {
    console.error('Error fetching available tickets:', error)
    return Response.json({ error: 'Failed to fetch available tickets' }, { status: 500 })
  }
}
