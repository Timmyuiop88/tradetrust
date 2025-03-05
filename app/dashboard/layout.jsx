"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Home, ShoppingBag, PlusSquare, User2, Bell, ShieldCheck, Wallet } from "lucide-react"
import Link from "next/link"
import { Button } from "../components/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/sheet"
import { AddBalanceSheet } from "../components/add-balance-sheet"
import { NotificationsSheet } from "../components/notifications-sheet"

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
  { name: 'Sell', href: '/dashboard/sell', icon: PlusSquare },
  { name: 'Profile', href: '/dashboard/profile', icon: User2 },
]

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <div className="h-8 bg-muted/10 rounded animate-pulse" />
          <div className="h-96 bg-muted/10 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl truncate">TrustTrade</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-1 text-sm">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="font-medium">$2,458.00</span>
            </div>
            <AddBalanceSheet />
            <NotificationsSheet />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-20 px-4 md:px-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
        <div className="container flex h-16">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
} 