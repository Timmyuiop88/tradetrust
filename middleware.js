import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Add cache control headers for chat API routes to prevent stale data
  if (pathname.startsWith('/api/chat/')) {
    const response = NextResponse.next();
    
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    // Add a custom header to track the request through Vercel's infrastructure
    response.headers.set('X-Chat-Request-ID', crypto.randomUUID());
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/chat/:path*',
  ],
}; 