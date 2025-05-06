import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

// GET: Fetch tickets for a product
export async function GET(req, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const product = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true }
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Determine access level
    const isSeller = product.sellerId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    const isBuyer = !isSeller && !isAdmin

    // Build where clause
    let where = { productId: id }
    
    // If user is a buyer, only show their tickets
    if (isBuyer) {
      where.buyerId = session.user.id
    }

    const tickets = await prisma.eventTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // For security, if user is just a buyer, don't send full ticket details
    if (isBuyer) {
      return Response.json(
        tickets.map(ticket => ({
          id: ticket.id,
          ticketCode: ticket.ticketCode,
          ticketType: ticket.ticketType,
          status: ticket.status,
          eventDate: ticket.eventDate,
          eventLocation: ticket.eventLocation,
          createdAt: ticket.createdAt
        }))
      )
    }

    return Response.json(tickets)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return Response.json({ error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

// POST: Verify/scan a ticket
export async function POST(req, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const data = await req.json()
    const { ticketCode, action } = data

    // Find the product
    const product = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true }
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Only the product seller or an admin can verify tickets
    if (product.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Not authorized to verify tickets' }, { status: 403 })
    }

    // Find the ticket
    const ticket = await prisma.eventTicket.findFirst({
      where: { 
        productId: id,
        ticketCode 
      }
    })

    if (!ticket) {
      return Response.json({ error: 'Invalid ticket code' }, { status: 404 })
    }

    if (action === 'verify') {
      // Just check if the ticket is valid
      return Response.json({ 
        valid: ticket.status === 'VALID',
        ticket: {
          id: ticket.id,
          ticketType: ticket.ticketType,
          status: ticket.status,
          buyerId: ticket.buyerId,
          eventDate: ticket.eventDate,
          eventLocation: ticket.eventLocation
        }
      })
    } else if (action === 'scan') {
      // Mark the ticket as used
      if (ticket.status !== 'VALID') {
        return Response.json({ 
          error: `Ticket is ${ticket.status.toLowerCase()}`,
          ticket: {
            id: ticket.id,
            ticketType: ticket.ticketType,
            status: ticket.status,
            buyerId: ticket.buyerId,
            eventDate: ticket.eventDate,
            eventLocation: ticket.eventLocation,
            scanDate: ticket.scanDate,
            scannedBy: ticket.scannedBy
          }
        }, { status: 400 })
      }

      const updatedTicket = await prisma.eventTicket.update({
        where: { id: ticket.id },
        data: {
          status: 'USED',
          scanDate: new Date(),
          scannedBy: session.user.id
        }
      })

      return Response.json({ 
        success: true,
        ticket: {
          id: updatedTicket.id,
          ticketType: updatedTicket.ticketType,
          status: updatedTicket.status,
          buyerId: updatedTicket.buyerId,
          eventDate: updatedTicket.eventDate,
          eventLocation: updatedTicket.eventLocation,
          scanDate: updatedTicket.scanDate,
          scannedBy: updatedTicket.scannedBy
        }
      })
    } else {
      return Response.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error processing ticket:', error)
    return Response.json({ error: 'Failed to process ticket' }, { status: 500 })
  }
} 