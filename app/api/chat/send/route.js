import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/lib/prisma';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user) {
            return new NextResponse(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const body = await req.json();
        const { recipientId, content } = body;

        if (!recipientId || !content) {
            return new NextResponse(
                JSON.stringify({ error: 'Recipient ID and content are required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Verify recipient exists
        const recipient = await prisma.user.findUnique({
            where: { id: recipientId },
            select: { id: true }
        });

        if (!recipient) {
            return new NextResponse(
                JSON.stringify({ error: 'Recipient not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Find an existing order between these users
        const existingOrder = await prisma.order.findFirst({
            where: {
                OR: [
                    {
                        AND: [
                            { buyerId: session.user.id },
                            { listing: { sellerId: recipientId } }
                        ]
                    },
                    {
                        AND: [
                            { buyerId: recipientId },
                            { sellerId: session.user.id }
                        ]
                    }
                ]
            }
        });

        let orderId;

        if (existingOrder) {
            // Use existing order
            orderId = existingOrder.id;
            console.log("Using existing order:", orderId);
        } else {
            console.log("No existing order found, creating a new one");
            
            // First, try to find a listing from the recipient (who is a seller)
            const recipientListing = await prisma.listing.findFirst({
                where: {
                    sellerId: recipientId
                    // Removed status filter to find any listing
                }
            });

            if (recipientListing) {
                console.log("Found recipient listing:", recipientListing.id);
                
                // Create a new order with the sender as buyer
                const newOrder = await prisma.order.create({
                    data: {
                        listing: {
                            connect: { id: recipientListing.id }
                        },
                        buyer: {
                            connect: { id: session.user.id }
                        },
                        sellerId: recipientId,
                        price: recipientListing.price,
                        escrowAmount: recipientListing.price,
                        status: 'PENDING'
                    }
                });

                orderId = newOrder.id;
                console.log("Created new order with recipient as seller:", orderId);
            } else {
                // If no recipient listing, try to find a listing from the sender
                const senderListing = await prisma.listing.findFirst({
                    where: {
                        sellerId: session.user.id
                        // Removed status filter to find any listing
                    }
                });

                if (senderListing) {
                    console.log("Found sender listing:", senderListing.id);
                    
                    // Create a new order with the recipient as buyer
                    const newOrder = await prisma.order.create({
                        data: {
                            listing: {
                                connect: { id: senderListing.id }
                            },
                            buyer: {
                                connect: { id: recipientId }
                            },
                            sellerId: session.user.id,
                            price: senderListing.price,
                            escrowAmount: senderListing.price,
                            status: 'PENDING'
                        }
                    });

                    orderId = newOrder.id;
                    console.log("Created new order with sender as seller:", orderId);
                } else {
                    // If still no listing found, create a dummy listing for chat purposes
                    console.log("No listings found, creating a dummy listing");
                    
                    const dummyListing = await prisma.listing.create({
                        data: {
                            seller: {
                                connect: { id: recipientId }
                            },
                            platform: {
                                // Find the first platform or create one if none exists
                                connectOrCreate: {
                                    where: { name: "Chat Platform" },
                                    create: {
                                        name: "Chat Platform",
                                        isActive: true
                                    }
                                }
                            },
                            category: {
                                // Find the first category or create one if none exists
                                connectOrCreate: {
                                    where: { name: "Chat Category" },
                                    create: {
                                        name: "Chat Category",
                                        isActive: true
                                    }
                                }
                            },
                            username: "chat_user",
                            price: 0,
                            followers: 0,
                            engagement: 0,
                            description: "Chat listing",
                            accountAge: 0,
                            posts: 0,
                            transferMethod: "Direct",
                            status: "AVAILABLE"
                        }
                    });
                    
                    // Create a new order with the sender as buyer
                    const newOrder = await prisma.order.create({
                        data: {
                            listing: {
                                connect: { id: dummyListing.id }
                            },
                            buyer: {
                                connect: { id: session.user.id }
                            },
                            sellerId: recipientId,
                            price: 0,
                            escrowAmount: 0,
                            status: 'PENDING'
                        }
                    });

                    orderId = newOrder.id;
                    console.log("Created new order with dummy listing:", orderId);
                }
            }
        }

        // Create the message
        const message = await prisma.chatMessage.create({
            data: {
                content: content,
                sender: {
                    connect: { id: session.user.id }
                },
                order: {
                    connect: { id: orderId }
                }
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

        return new NextResponse(
            JSON.stringify({ 
                success: true,
                message,
                orderId
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
        
    } catch (error) {
        console.error('Error sending message:', error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to send message: ' + error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
} 