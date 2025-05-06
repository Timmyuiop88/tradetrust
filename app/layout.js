import "@fontsource/rubik/300.css"
import "@fontsource/rubik/400.css"
import "@fontsource/rubik/500.css"
import "@fontsource/rubik/600.css"
import "@fontsource/rubik/700.css"
import "./globals.css"
import { Providers } from "./providers"
import { ThemeProvider } from "@/app/components/theme-provider"
import { CookieConsent } from "./components/cookie-consent"
import Script from "next/script"

export const metadata = {
  title: "TradeVero - Safe Digital Trading",
  description: "Safe and Secure digital asset trading platform",
  icons: {
    icon: [
      { url: '/images/icon-192x192.png', sizes: 'any' },
      { url: '/images/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/images/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: { url: '/images/icon-192x192.png' },
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes"/>
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
        
        {/* Contentsquare (Hotjar) Tracking Script */}
        <Script id="contentsquare-script" strategy="afterInteractive">
          {`
            (function (c, s, q, u, a, r, e) {
              c.hj=c.hj||function(){(c.hj.q=c.hj.q||[]).push(arguments)};
              c._hjSettings = { hjid: 5354912 };
              r = s.getElementsByTagName('head')[0];
              e = s.createElement('script');
              e.async = true;
              e.src = q + c._hjSettings.hjid + u;
              r.appendChild(e);
            })(window, document, 'https://static.hj.contentsquare.net/c/csq-', '.js');
          `}
        </Script>
      </body>
    </html>
  )
}
