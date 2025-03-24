import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/app/lib/prisma";

export async function GET(request) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the seller ID from the URL query params
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");
    
    // Add pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "2", 10);
    
    // Calculate skip
    const skip = (page - 1) * limit;
    
    // Validate seller ID
    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }
    
    // Only allow users to fetch their own listings (for security)
    if (sellerId !== session.user.id) {
      return NextResponse.json({ error: "You can only view your own listings" }, { status: 403 });
    }
    
    // Fetch total count for pagination
    const totalCount = await prisma.listing.count({
      where: {
        sellerId: sellerId,
      },
    });
    
    // Fetch paginated listings for the seller
    const listings = await prisma.listing.findMany({
      where: {
        sellerId: sellerId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        // Include any related data you need
        category: true,
      },
      skip,
      take: limit,
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;
    const hasPrevious = page > 1;
    
    return NextResponse.json({ 
      listings,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasMore,
        hasPrevious
      } 
    });
  } catch (error) {
    console.error("Error fetching seller listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
} 