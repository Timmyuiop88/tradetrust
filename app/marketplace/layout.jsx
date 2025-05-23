"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Home, ShoppingBag, PlusSquare, User2, Bell, ShieldCheck, Wallet, LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "../components/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/sheet"
import { AddBalanceSheet } from "../components/add-balance-sheet"
import { NotificationsSheet } from "../components/notifications-sheet"
import { BalanceDisplay } from "@/app/components/balance-display"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

const navigation = [
  { name: 'Home', href: '/marketplace', icon: Home },
  { name: 'Orders', href: '/marketplace/orders', icon: ShoppingBag },
  { name: 'Sell', href: '/marketplace/sell', icon: PlusSquare },
  { name: 'Profile', href: '/marketplace/profile', icon: User2 },
]

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

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
          <Link href="/marketplace" className="flex items-center space-x-2">
            <Image src="/images/logo.png" alt="TradeVero Logo" width={20} height={20} className="sm:h-15 w-15" />
            <span className="font-bold text-lg truncate">TradeVero</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className=" sm:flex items-center space-x-1 text-sm">
              <BalanceDisplay />
            </div>
            <AddBalanceSheet />
            {/* <NotificationsSheet /> */}
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
            const isActive = item.href === '/marketplace' 
              ? pathname === '/marketplace'  // Exact match for home
              : pathname.startsWith(`${item.href}/`) || pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center space-y-1 relative",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground",
                  "transition-colors"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
                {isActive && (
                  <span className="absolute bottom-0 h-0.5 w-12 bg-primary rounded-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
} 