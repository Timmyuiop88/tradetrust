import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET: Fetch product content
export async function GET(req, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true
          }
        },
        settings: true,
        productContents: {
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if content should be paywalled
    let contents = product.productContents
    if (product.settings?.settings?.paywallContent) {
      const isOwner = session?.user?.id === product.seller.id
      
      // Check if user has purchased this product
      const hasPurchased = session?.user?.id ? await prisma.orderItem.findFirst({
        where: {
          productId: id,
          order: {
            buyerId: session.user.id,
            status: 'COMPLETED'
          }
        }
      }) : false

      if (!isOwner && !hasPurchased) {
        // Filter content to show only preview content
        contents = product.productContents
          .filter(content => content.data.preview === true)
          .slice(0, 2) // Only show limited preview
      }
    }

    return Response.json({
      contents: contents.map(content => ({
        id: content.id,
        title: content.title,
        sortOrder: content.sortOrder,
        data: content.data
      }))
    })
  } catch (error) {
    console.error('Error fetching product content:', error)
    return Response.json({ error: 'Failed to fetch product content' }, { status: 500 })
  }
}

// POST: Add new content block
export async function POST(req, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the product to check ownership
    const product = await prisma.product.findUnique({
      where: { id },
      select: { 
        sellerId: true,
        productContents: {
          select: { sortOrder: true },
          orderBy: { sortOrder: 'desc' },
          take: 1
        }
      }
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user is the seller or an admin
    if (product.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Not authorized to update this product' }, { status: 403 })
    }

    const data = await req.json()
    const { title, blockData } = data

    // Determine next sort order
    const nextSortOrder = product.productContents.length > 0 
      ? (product.productContents[0].sortOrder + 1) 
      : 0

    // Create content block
    const contentBlock = await prisma.productContent.create({
      data: {
        productId: id,
        title: title || `Section ${nextSortOrder + 1}`,
        data: blockData,
        sortOrder: nextSortOrder
      }
    })

    return Response.json({ 
      success: true, 
      contentBlock
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding product content:', error)
    return Response.json({ error: 'Failed to add product content' }, { status: 500 })
  }
}

// PUT: Update content blocks (reorder, edit, delete)
export async function PUT(req, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the product to check ownership
    const product = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true }
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user is the seller or an admin
    if (product.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Not authorized to update this product' }, { status: 403 })
    }

    const data = await req.json()
    const { updatedBlocks, deletedBlockIds } = data

    // Start a transaction to ensure all updates succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update blocks
      if (updatedBlocks && updatedBlocks.length > 0) {
        for (const block of updatedBlocks) {
          if (block.id) {
            // Update existing block
            await tx.productContent.update({
              where: { id: block.id },
              data: {
                title: block.title,
                data: block.data,
                sortOrder: block.sortOrder
              }
            })
          } else {
            // Create new block
            await tx.productContent.create({
              data: {
                productId: id,
                title: block.title || `Section ${block.sortOrder + 1}`,
                data: block.data,
                sortOrder: block.sortOrder
              }
            })
          }
        }
      }

      // Delete blocks
      if (deletedBlockIds && deletedBlockIds.length > 0) {
        await tx.productContent.deleteMany({
          where: {
            id: { in: deletedBlockIds },
            productId: id
          }
        })
      }

      // Get updated content
      return await tx.productContent.findMany({
        where: { productId: id },
        orderBy: { sortOrder: 'asc' }
      })
    })

    return Response.json({ 
      success: true, 
      contents: result
    })
  } catch (error) {
    console.error('Error updating product content:', error)
    return Response.json({ error: 'Failed to update product content' }, { status: 500 })
  }
}
