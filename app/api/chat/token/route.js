import * as Ably from 'ably';
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Create an Ably REST client with your API key
    const client = new Ably.Rest(process.env.ABLY_API_KEY);
    
    // Set clientId to the user's ID
    const tokenParams = {
      clientId: session.user.id,
      capability: {
        // Allow operations on all channels with the 'chat:' prefix
        "chat:*": ["publish", "subscribe", "presence"],
        // Or for order-specific channels
        "order-*": ["publish", "subscribe", "presence", "history"],
      },
      // Token validity period (optional, default is 1 hour)
      ttl: 3600 * 1000, // 1 hour in milliseconds
    };
    
    // Generate a token request
    const tokenRequest = await client.auth.createTokenRequest(tokenParams);
    
    // Return the token request to the client
    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error('Error creating Ably token:', error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
