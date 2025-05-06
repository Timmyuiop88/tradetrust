import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET: Fetch question responses for a product
export async function GET(req, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const contentId = searchParams.get('contentId')

    const product = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true }
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Only product owner can see all responses
    const isSeller = product.sellerId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    // Build where clause
    let where = { productId: id }
    
    if (contentId) {
      where.contentId = contentId
    }
    
    // If not seller or admin, show only public responses or own responses
    if (!isSeller && !isAdmin) {
      where.OR = [
        { userId: session.user.id },
        { isPublic: true }
      ]
    }

    const responses = await prisma.questionResponse.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return Response.json(responses)
  } catch (error) {
    console.error('Error fetching question responses:', error)
    return Response.json({ error: 'Failed to fetch question responses' }, { status: 500 })
  }
}

// POST: Submit a question response
export async function POST(req, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const data = await req.json()
    const { contentId, questionType, response, metadata } = data

    // Validate required fields
    if (!contentId || !questionType || !response) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Create response
    const questionResponse = await prisma.questionResponse.create({
      data: {
        productId: id,
        contentId,
        userId: session.user.id,
        questionType,
        response,
        metadata
      }
    })

    return Response.json({ success: true, questionResponse })
  } catch (error) {
    console.error('Error submitting question response:', error)
    return Response.json({ error: 'Failed to submit question response' }, { status: 500 })
  }
} 