import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

export async function GET(request) {
  try {
    // Get the current user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the user ID from the query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user is trying to chat with themselves
    if (userId === session.user.id) {
      return new NextResponse(
        JSON.stringify({ error: 'You cannot chat with yourself' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if there's an existing order between the users
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          {
            AND: [
              { buyerId: session.user.id },
              { listing: { sellerId: userId } }
            ]
          },
          {
            AND: [
              { buyerId: userId },
              { sellerId: session.user.id }
            ]
          }
        ]
      }
    });

    // If there's an existing order, allow the chat
    if (existingOrder) {
      return new NextResponse(
        JSON.stringify({ user }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if either user has an available listing
    const availableListing = await prisma.listing.findFirst({
      where: {
        OR: [
          { sellerId: userId, status: 'AVAILABLE' },
          { sellerId: session.user.id, status: 'AVAILABLE' }
        ]
      }
    });

    if (!availableListing) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'No available listings found. You can only message users with available listings or if you have an available listing yourself.' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new NextResponse(
      JSON.stringify({ user }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error checking user:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to check user: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 