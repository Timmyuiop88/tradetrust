/** @type {import('next').NextConfig} */
const nextConfig = {
    // ... other config options ...
    images: {
        domains: ['files.edgestore.dev'],
    },
    headers: async () => {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Permissions-Policy',
              value: 'camera=self' // Allow camera access
            }
          ]
        }
      ]
    }
  }

export default nextConfig;
