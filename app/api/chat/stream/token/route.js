import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { StreamChat } from "stream-chat";
import { authOptions } from "@/lib/auth";
// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(
  process.env.GETSTREAM_API_KEY,
  process.env.GETSTREAM_API_SECRET
);

export async function GET(req) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Generate user token based on user ID
    const token = serverClient.createToken(session.user.id);

    // Return both API key and token
    return NextResponse.json({
      apiKey: process.env.GETSTREAM_API_KEY,
      token
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Generate system user token for system messages
export async function POST(req) {
  try {
    // Get user session to verify it's an authenticated request
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Initialize Stream client
    const serverClient = StreamChat.getInstance(
      process.env.GETSTREAM_API_KEY,
      process.env.GETSTREAM_API_SECRET
    );

    // Generate system token - this is a special case where we create
    // a token for the 'system' user to send system messages
    const systemToken = serverClient.createToken('system');

    return NextResponse.json({
      token: systemToken
    });
  } catch (error) {
    console.error('Error generating system token:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 