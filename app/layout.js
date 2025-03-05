import "@fontsource/rubik/300.css"
import "@fontsource/rubik/400.css"
import "@fontsource/rubik/500.css"
import "@fontsource/rubik/600.css"
import "@fontsource/rubik/700.css"
import "./globals.css"
import { Providers } from "./providers"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-rubik antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
