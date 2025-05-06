import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET: Fetch a specific product
export async function GET(req, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: session?.user?.id === undefined
          }
        },
        category: true,
        settings: true,
        productContents: {
          orderBy: {
            sortOrder: 'asc'
          }
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if paywalled content should be hidden
    let contents = product.productContents
    if (product.settings?.settings?.paywallContent) {
      const isOwner = session?.user?.id === product.sellerId
      const hasPurchased = false // You would check order history here
      
      if (!isOwner && !hasPurchased) {
        // Filter content to show only non-sensitive preview content
        contents = product.productContents
          .filter(content => content.data.preview === true)
          .slice(0, 2) // Only show first two preview blocks
      }
    }

    // Calculate average rating
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
      : null

    // Format response
    const { seller, ...productData } = product
    const formattedProduct = {
      ...productData,
      seller: {
        id: seller.id,
        name: `${seller.firstName} ${seller.lastName}`.trim(),
        email: seller.email
      },
      avgRating,
      reviewCount: product.reviews.length,
      contents: contents.map(content => content.data)
    }

    return Response.json(formattedProduct)
  } catch (error) {
    console.error('Error fetching product:', error)
    return Response.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT: Update a product
export async function PUT(req, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the product to check ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true }
    })

    if (!existingProduct) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user is the seller or an admin
    if (existingProduct.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Not authorized to update this product' }, { status: 403 })
    }

    const data = await req.json()
    const { 
      title, 
      description, 
      price, 
      categoryId, 
      isAvailable,
      downloadLink,
      streamingUrl,
      settings
    } = data

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price && { price }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(downloadLink && { downloadLink }),
        ...(streamingUrl && { streamingUrl }),
        ...(categoryId && { categoryId: parseInt(categoryId) })
      }
    })

    // Update settings if provided
    if (settings) {
      await prisma.productSettings.upsert({
        where: { productId: id },
        update: { settings },
        create: {
          productId: id,
          settings
        }
      })
    }

    return Response.json({ success: true, product })
  } catch (error) {
    console.error('Error updating product:', error)
    return Response.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE: Remove a product
export async function DELETE(req, { params }) {
  try {
    const { id } = params
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the product to check ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true }
    })

    if (!existingProduct) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user is the seller or an admin
    if (existingProduct.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Not authorized to delete this product' }, { status: 403 })
    }

    // Check if product has associated orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: id }
    })

    if (orderCount > 0) {
      // Soft delete by marking as unavailable instead of actual deletion
      await prisma.product.update({
        where: { id },
        data: { isAvailable: false }
      })
      
      return Response.json({ 
        success: true, 
        message: 'Product has existing orders and has been archived instead of deleted' 
      })
    }

    // If no orders, proceed with actual deletion
    await prisma.product.delete({
      where: { id }
    })

    return Response.json({ success: true, message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return Response.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
