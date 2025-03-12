import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { recipientId, content, orderId } = body;

        if (!recipientId || !content) {
            return NextResponse.json({ error: 'Recipient ID and content are required' }, { status: 400 });
        }

        // Find an order between these users
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    {
                        buyerId: session.user.id,
                        sellerId: recipientId
                    },
                    {
                        buyerId: recipientId,
                        sellerId: session.user.id
                    }
                ]
            },
            select: { id: true }
        });
        
        if (!order && !orderId) {
            return NextResponse.json({ error: 'No order found between these users' }, { status: 404 });
        }
        
        const senderId = session.user.id;
        
        // Create the message with sender and order
        const message = await prisma.chatMessage.create({
            data: {
                senderId,
                content,
                orderId: orderId || order.id,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });
        
        return NextResponse.json({ 
            success: true,
            message 
        });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ 
            error: 'Failed to send message',
            details: error.message
        }, { status: 500 });
    }
} 