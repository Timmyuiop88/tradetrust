import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '../../../lib/prisma';

// Use a completely different approach to handle the route
export async function GET(req, { params }) {
    // Extract orderId directly from params without destructuring first
    const orderId = await params?.orderId;
    
    if (!orderId) {
        return new NextResponse(
            JSON.stringify({ error: 'Order ID is required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }
    
    try {
        // Get the current user from the session
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user) {
            return new NextResponse(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Verify the order exists and the current user is a participant
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                buyer: true,
                chatMessages: true,
                listing: true,
            },
        });
        
        if (!order) {
            return new NextResponse(
                JSON.stringify({ error: 'Order not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Check if the current user is the buyer
        const currentUserId = session.user.id;
        if (order.buyerId !== currentUserId) {
            // If not the buyer, check if they're the seller of the listing
            const listing = order.listing;
            if (!listing || listing.sellerId !== currentUserId) {
                return new NextResponse(
                    JSON.stringify({ error: 'You do not have permission to access this chat' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }
        
        // Determine the other user in the conversation
        let otherUser;
        if (order.buyerId === currentUserId) {
            // Current user is buyer, get seller from listing
            const listing = order.listing;
            if (listing) {
                // Fetch seller details
                otherUser = await prisma.user.findUnique({
                    where: { id: listing.sellerId },
                    select: {
                        id: true,
                        email: true,
                        updatedAt: true, // Use updatedAt as lastSeen
                    }
                });
            }
        } else {
            // Current user is seller, get buyer
            otherUser = order.buyer;
        }
        
        if (!otherUser) {
            otherUser = {
                id: 'unknown',
                email: 'Unknown User',
                updatedAt: new Date(),
            };
        }
        
        // Fetch messages for this order
        const messages = await prisma.chatMessage.findMany({
            where: {
                orderId: orderId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        
        // Return the response with explicit headers
        return new NextResponse(
            JSON.stringify({
                messages,
                otherUser: {
                    id: otherUser.id,
                    email: otherUser.email,
                    lastSeen: otherUser.updatedAt,
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to fetch messages: ' + error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
} 