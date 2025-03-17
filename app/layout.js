"use client";

import "@fontsource/rubik/300.css"
import "@fontsource/rubik/400.css"
import "@fontsource/rubik/500.css"
import "@fontsource/rubik/600.css"
import "@fontsource/rubik/700.css"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "react-hot-toast"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  )
}
