import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH to update listing status (soft delete)
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const body = await request.json();
    
    // Validate the status
    if (!body.status || !['AVAILABLE', 'INACTIVE'].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status provided" },
        { status: 400 }
      );
    }
    
    // Find the listing first to check ownership
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true, status: true }
    });
    
    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }
    
    // Check if the user is the owner of the listing
    if (existingListing.sellerId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this listing" },
        { status: 403 }
      );
    }
    
    // If trying to activate (set to AVAILABLE), check active listing limits
    if (body.status === 'AVAILABLE' && existingListing.status !== 'AVAILABLE') {
      // Get user's subscription plan
      const subscription = await prisma.subscription.findFirst({
        where: { userId: session.user.id, status: "ACTIVE" },
        include: { plan: true }
      });
      
      // Count current active listings
      const activeListingsCount = await prisma.listing.count({
        where: { 
          sellerId: session.user.id,
          status: { in: ["AVAILABLE", "PENDING"] }
        }
      });
      
      // Get max allowed active listings from plan
      const maxActiveListings = subscription?.plan?.maxListings || 4; // Default to FREE tier
      
      // Check if activating would exceed limit
      if (activeListingsCount >= maxActiveListings) {
        return NextResponse.json(
          { 
            error: `Cannot activate listing. You've reached your limit of ${maxActiveListings} active listings.`,
            activeListings: activeListingsCount,
            maxActiveListings
          },
          { status: 400 }
        );
      }
    }
    
    // Update the listing status
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: { status: body.status }
    });
    
    return NextResponse.json({
      ...updatedListing,
      message: body.status === 'AVAILABLE' 
        ? "Listing activated successfully" 
        : "Listing deactivated successfully"
    });
  } catch (error) {
    console.error("Error updating listing status:", error);
    return NextResponse.json(
      { error: "Failed to update listing status" },
      { status: 500 }
    );
  }
} 