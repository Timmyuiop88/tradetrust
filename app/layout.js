import "@fontsource/rubik/300.css"
import "@fontsource/rubik/400.css"
import "@fontsource/rubik/500.css"
import "@fontsource/rubik/600.css"
import "@fontsource/rubik/700.css"
import "./globals.css"
import { Providers } from "./providers"
import { ThemeProvider } from "@/app/components/theme-provider"
import { CookieConsent } from "./components/cookie-consent"

export const metadata = {
  title: "TradeVero - Safe Social Media Account Trading",
  description: "Buy and sell social media accounts safely with TradeVero's secure escrow platform",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="cryptomus" content="0dc950d5" />
        <meta name="theme-color" content="#10B981" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/images/icon-192x192.png" />
        
        <style>
          {`
            @media (max-width: 767px) {
              input, textarea, select, button {
                font-size: 16px !important;
              }
            }
          `}
        </style>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased overflow-x-hidden">
        <Providers>
          {children}
          <CookieConsent />
        </Providers>
      </body>
    </html>
  )
}
