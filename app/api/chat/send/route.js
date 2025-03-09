import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

export async function POST(request) {
    try {
        // Get the current user from the session
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        // Get request body
        const body = await request.json();
        const { orderId, content } = body;
        
        if (!orderId || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        
        // Verify the order exists and the current user is a participant
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                listing: true,
            }
        });
        
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }
        
        // Check if the current user is the buyer or seller
        const currentUserId = session.user.id;
        const isBuyer = order.buyerId === currentUserId;
        const isSeller = order.listing && order.listing.sellerId === currentUserId;
        
        if (!isBuyer && !isSeller) {
            return NextResponse.json(
                { error: 'You do not have permission to send messages in this chat' },
                { status: 403 }
            );
        }
        
        // Create the message using chatMessage model
        const message = await prisma.chatMessage.create({
            data: {
                content,
                senderId: currentUserId,
                orderId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
        
        // Update the user's updatedAt timestamp instead of lastSeen
        await prisma.user.update({
            where: {
                id: currentUserId,
            },
            data: {
                updatedAt: new Date(),
            },
        });
        
        return NextResponse.json({ message });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json(
            { error: 'Failed to send message: ' + error.message },
            { status: 500 }
        );
    }
} 