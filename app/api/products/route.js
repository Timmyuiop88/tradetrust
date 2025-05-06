import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

const prisma = new PrismaClient()

// GET: List products with filtering, pagination
export async function GET(req) {
  try {
    const searchParams = req.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const sellerId = searchParams.get('sellerId')
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : undefined
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    // Build filter conditions
    const where = {
      isAvailable: true,
      ...(type && { type }),
      ...(category && { categoryId: parseInt(category) }),
      ...(sellerId && { sellerId }),
      ...(minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice })
        }
      }
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where })
    
    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { [sort]: order.toLowerCase() },
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        category: true,
        reviews: {
          select: {
            rating: true,
          }
        },
        settings: true,
        ticketTypes: true,
      }
    })

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
        : null

      // Format response - remove sensitive data
      const { seller, ...productData } = product
      return {
        ...productData,
        seller: {
          id: seller.id,
          name: `${seller.firstName} ${seller.lastName}`.trim(),
        },
        avgRating,
        reviewCount: product.reviews.length,
        // Don't return full content for listing
        contents: undefined
      }
    })

    return Response.json({
      products: productsWithRating,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST: Create a new product
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const productData = await req.json()
    const { media, content, settings: userSettings, ...restData } = productData

    // Create the product with media
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          ...restData,
          sellerId: session.user.id,
          media: {
            create: {
              thumbnail: media.thumbnail,
              coverPhoto: media.coverPhoto,
              gallery: media.gallery
            }
          },
          // ... rest of the creation logic
        },
        include: {
          media: true,
          settings: true,
          productContents: true
        }
      })

      return newProduct
    })

    return Response.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return Response.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

// PUT: Update an existing product
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const data = await request.json();
    
    // Validate the product exists and belongs to the user
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingProduct) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
      });
    }

    // Update the product including thumbnail and coverPhoto
    const updatedProduct = await prisma.product.update({
      where: {
        id: params.id,
      },
      data: {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,     // Add thumbnail update
        coverPhoto: data.coverPhoto,   // Add cover photo update
        price: data.price,
        type: data.type,
        content: data.content,
        settings: data.settings,
        // Add other fields based on product type
        ...(data.type === 'EVENT' && {
          eventDate: data.eventDate,
          eventLocation: data.eventLocation,
          maxAttendees: data.maxAttendees,
          tickets: {
            deleteMany: {},
            create: data.tickets,
          },
        }),
      },
    });

    return new Response(JSON.stringify(updatedProduct), {
      status: 200,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return new Response(JSON.stringify({ error: 'Failed to update product' }), {
      status: 500,
    });
  }
}
