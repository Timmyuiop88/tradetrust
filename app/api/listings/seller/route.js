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
    
    // Validate seller ID
    if (!sellerId) {
      return NextResponse.json({ error: "Seller ID is required" }, { status: 400 });
    }
    
    // Only allow users to fetch their own listings (for security)
    if (sellerId !== session.user.id) {
      return NextResponse.json({ error: "You can only view your own listings" }, { status: 403 });
    }
    
    // Fetch listings for the seller
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
    });
    
    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Error fetching seller listings:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
} 