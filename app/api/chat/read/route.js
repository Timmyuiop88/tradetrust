import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

export async function POST(req) {
    try {
        // Get the current user from the session
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user) {
            return new NextResponse(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Get request body
        const body = await req.json();
        const { orderId, messageIds } = body;
        
        if (!orderId || !messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return new NextResponse(
                JSON.stringify({ error: 'Invalid request data' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Verify the order exists and the current user is a participant
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            include: {
                listing: true,
            },
        });
        
        if (!order) {
            return new NextResponse(
                JSON.stringify({ error: 'Order not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Check if the current user is the buyer or seller
        const currentUserId = session.user.id;
        const isBuyer = order.buyerId === currentUserId;
        const isSeller = order.listing && order.listing.sellerId === currentUserId;
        
        if (!isBuyer && !isSeller) {
            return new NextResponse(
                JSON.stringify({ error: 'You do not have permission to access this chat' }),
                { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // Get the schema for chatMessage to check available fields
        const messageSchema = await prisma.chatMessage.findFirst({
            where: {
                id: messageIds[0]
            },
            select: {
                id: true
            }
        });
        
        console.log('Message schema check:', messageSchema);
        
        // Instead of updating directly, mark each message as read individually
        // This allows us to handle potential schema differences
        const updatedMessages = [];
        
        for (const messageId of messageIds) {
            try {
                // Fetch the message first to check if it exists and belongs to the other user
                const message = await prisma.chatMessage.findFirst({
                    where: {
                        id: messageId,
                        orderId: orderId,
                        senderId: { not: currentUserId }
                    }
                });
                
                if (message) {
                    // Only add [READ] marker if it doesn't already exist
                    if (!message.content.includes('[READ]')) {
                        // Update a metadata field to indicate the message was read
                        const updatedMessage = await prisma.chatMessage.update({
                            where: {
                                id: messageId
                            },
                            data: {
                                // Add a comment to the content to mark as read
                                content: message.content + " [READ]"
                            }
                        });
                        
                        updatedMessages.push(updatedMessage);
                    } else {
                        // Message is already marked as read, just add it to the response
                        updatedMessages.push(message);
                    }
                }
            } catch (err) {
                console.error(`Error updating message ${messageId}:`, err);
            }
        }
        
        return new NextResponse(
            JSON.stringify({ 
                success: true,
                updatedCount: updatedMessages.length,
                messages: updatedMessages
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error marking messages as read:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to mark messages as read: ' + error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
} 