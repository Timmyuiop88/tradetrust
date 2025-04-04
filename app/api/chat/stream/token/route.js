import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { StreamChat } from "stream-chat";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(
  process.env.GETSTREAM_API_KEY,
  process.env.GETSTREAM_API_SECRET
);

export async function GET() {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - User not authenticated" },
        { status: 401 }
      );
    }
    
    if (!session.user.id) {
      return NextResponse.json(
        { error: "Invalid user ID in session" },
        { status: 400 }
      );
    }
    
    const userId = session.user.id;
    
    // Set the token to expire in 24 hours (86400 seconds)
    // Calculate expiration timestamp (current time + 24 hours in seconds)
    const expirationTime = Math.floor(Date.now() / 1000) + 86400;
    
    // Generate a Stream Chat token for this user with expiration
    const token = serverClient.createToken(userId, expirationTime);
    
    return NextResponse.json({
      token,
      apiKey: process.env.GETSTREAM_API_KEY,
      userId,
      expiresAt: expirationTime
    });
  } catch (error) {
    console.error("Error generating stream token:", error);
    return NextResponse.json(
      { error: "Failed to generate chat token: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
} 