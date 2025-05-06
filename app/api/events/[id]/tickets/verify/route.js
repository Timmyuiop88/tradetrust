import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { decrypt } from '@/lib/encryption'

const prisma = new PrismaClient()

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is event organizer or admin
    const { ticketCode } = await req.json()
    
    if (!ticketCode) {
      return Response.json({ error: 'Ticket code is required' }, { status: 400 })
    }

    // Find ticket
    const ticket = await prisma.eventTicket.findUnique({
      where: { ticketCode },
      include: {
        product: true,
        buyer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!ticket) {
      return Response.json({ error: 'Invalid ticket' }, { status: 404 })
    }

    // Verify seller is the one checking the ticket
    if (ticket.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Not authorized to verify this ticket' }, { status: 403 })
    }

    // Check if ticket is valid
    if (ticket.status !== 'VALID') {
      return Response.json({ 
        valid: false, 
        status: ticket.status,
        message: `Ticket has been ${ticket.status.toLowerCase()}`
      })
    }

    // Check if event date is valid
    const now = new Date()
    if (now > ticket.eventDate) {
      return Response.json({ 
        valid: false, 
        status: 'EXPIRED',
        message: 'Event has already passed'
      })
    }

    // Mark ticket as used if requested
    const { markAsUsed } = await req.json()
    if (markAsUsed) {
      await prisma.eventTicket.update({
        where: { id: ticket.id },
        data: { 
          status: 'USED',
          usedAt: new Date()
        }
      })
    }

    return Response.json({
      valid: true,
      ticket: {
        id: ticket.id,
        type: ticket.ticketType,
        eventName: ticket.product.title,
        eventDate: ticket.eventDate,
        eventLocation: ticket.eventLocation,
        buyer: ticket.buyer,
        status: markAsUsed ? 'USED' : ticket.status
      }
    })
  } catch (error) {
    console.error('Error verifying ticket:', error)
    return Response.json({ error: 'Failed to verify ticket' }, { status: 500 })
  }
}
