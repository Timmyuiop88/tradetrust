import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Fetch reviews for a user
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const rating = searchParams.get('rating'); // 'positive' (4-5), 'negative' (1-3), or null for all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Build the where clause for filtering
    let whereClause = {
      listing: {
        sellerId: userId
      }
    };

    // Filter by rating if specified
    if (rating === 'positive') {
      whereClause.rating = { gte: 4 };
    } else if (rating === 'negative') {
      whereClause.rating = { lte: 3 };
    }

    // Get total count for pagination
    const totalCount = await prisma.review.count({
      where: whereClause
    });

    // Fetch reviews with pagination
    const reviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        reviewer: {
          select: {
            id: true,
          }
        },
        listing: {
          select: {
            id: true,
            seller: {
              select: {
                id: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
    
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews: ' + error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new review
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, rating, comment, orderId } = body;

    if (!listingId || !rating || !comment || !orderId) {
      return NextResponse.json(
        { error: 'Listing ID, order ID, rating, and comment are required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if the order exists and is completed
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'You can only review completed orders' },
        { status: 400 }
      );
    }

    // Check if the user is the buyer of the order
    if (order.buyerId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only review orders you purchased' },
        { status: 403 }
      );
    }

    // Check if a review already exists for this order
    const existingReview = await prisma.review.findFirst({
      where: {
        listingId: listingId,
        reviewerId: session.user.id,
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this listing' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        listing: {
          connect: { id: listingId }
        },
        reviewer: {
          connect: { id: session.user.id }
        },
        rating,
        comment
      },
      include: {
        reviewer: {
          select: {
            id: true,
          }
        },
        listing: {
          select: {
            id: true,
            seller: {
              select: {
                id: true,
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ review }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review: ' + error.message },
      { status: 500 }
    );
  }
} 