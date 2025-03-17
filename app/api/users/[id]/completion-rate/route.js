import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/app/lib/prisma";

export async function GET(request, context) {
  try {
    // Get the user ID from the URL params
    const { params } = context;
    const userId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get total orders where the user is the seller
    const totalOrders = await prisma.order.count({
      where: {
        sellerId: userId,
      },
    });

    // Get completed orders where the user is the seller
    const completedOrders = await prisma.order.count({
      where: {
        sellerId: userId,
        status: "COMPLETED",
      },
    });

    // Calculate completion rate
    const completionRate = totalOrders > 0 
      ? Math.round((completedOrders / totalOrders) * 100) 
      : 0;

    // Get additional stats
    const totalSales = await prisma.order.count({
      where: {
        sellerId: userId,
        status: "COMPLETED",
      },
    });

    const averageRating = await prisma.review.aggregate({
      where: {
        listing: {
          sellerId: userId,
        },
      },
      _avg: {
        rating: true,
      },
    });

    // Check if the user has any listings
    const totalListings = await prisma.listing.count({
      where: {
        sellerId: userId,
      },
    });

    return NextResponse.json({
      completionRate,
      totalOrders,
      completedOrders,
      totalSales,
      averageRating: averageRating._avg.rating || 0,
      totalListings,
    });
  } catch (error) {
    console.error("Error calculating completion rate:", error);
    return NextResponse.json(
      { error: "Failed to calculate completion rate" },
      { status: 500 }
    );
  }
} 