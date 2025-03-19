

import "@fontsource/rubik/300.css"
import "@fontsource/rubik/400.css"
import "@fontsource/rubik/500.css"
import "@fontsource/rubik/600.css"
import "@fontsource/rubik/700.css"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "react-hot-toast"
import { ThemeProvider } from "@/app/components/theme-provider"
import { CookieConsent } from "./components/cookie-consent"

export const metadata = {
  title: "TrustTrade - Safe Social Media Account Trading",
  description: "Buy and sell social media accounts safely with TrustTrade's secure escrow platform",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#10B981" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/icon-192x192.png" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        
   
        
          <Providers>
            {children}
            <Toaster position="bottom-right" />
            <CookieConsent />
          </Providers>
        
      </body>
    </html>
  )
}
