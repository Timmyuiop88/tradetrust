import NextAuth from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Force this route to be dynamically rendered and use Node.js runtime
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Re-export authOptions for backward compatibility
export { authOptions };

// Create the handler with NextAuth
const handler = NextAuth(authOptions);

// Export GET and POST functions
export { handler as GET, handler as POST };