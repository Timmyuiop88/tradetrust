"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "./button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./sheet"
import { Menu, X, User, ShieldCheck, Sun, Moon, LayoutGrid, Info, HelpCircle, ShoppingBag, Home, Settings, LogOut, User2, Bell, Wallet } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/app/lib/utils"
import { usePathname } from "next/navigation"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  
  // Function to check if a link is active
  const isActive = (path) => {
    // For exact matches
    if (pathname === path) return true
    
    // For nested paths (e.g. /how-it-works/something should highlight the /how-it-works link)
    if (path !== '/' && pathname.startsWith(path)) return true
    
    return false
  }
  

  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const mainNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Browse', href: '/browse', icon: ShoppingBag },
    { name: 'How it Works', href: '/how-it-works', icon: HelpCircle },
  ]

  const accountNavItems = [
    { name: 'Explore', href: '/dashboard', icon: Home },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    
    { name: 'Profile', href: '/dashboard/profile', icon: User2 },
  
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b py-4 px-6">
            <div className="flex items-center justify-between">
              <Link 
                href="/" 
                className="flex items-center space-x-2" 
                onClick={() => setOpen(false)}
              >
                <ShieldCheck className="h-6 w-6 text-primary" />
                <span className="font-bold">TrustTrade</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Nav Links */}
          <nav className="flex-1 overflow-auto py-4">
            <div className="space-y-1 px-2">
              <NavLink 
                href="/dashboard" 
                icon={LayoutGrid} 
                onClick={() => setOpen(false)}
                isActive={isActive("/dashboard")}
              >
                Browse Accounts
              </NavLink>
              <NavLink 
                href="/about" 
                icon={Info} 
                onClick={() => setOpen(false)}
                isActive={isActive("/about")}
              >
                About Us
              </NavLink>
              <NavLink 
                href="/how-it-works" 
                icon={HelpCircle} 
                onClick={() => setOpen(false)}
                isActive={isActive("/how-it-works")}
              >
                How it Works
              </NavLink>
              <NavLink 
                href="/become-merchant" 
                icon={ShoppingBag} 
                onClick={() => setOpen(false)}
                isActive={isActive("/become-merchant")}
              >
                Start Selling
              </NavLink>
            </div>
            
            <div className="mt-6 px-3">
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="justify-start w-full">
                  <Link href="/login" className="flex items-center" onClick={() => setOpen(false)}>
                    <User className="mr-2 h-4 w-4" /> Sign In
                  </Link>
                </Button>
                <Button asChild className="justify-start w-full">
                  <Link href="/signup" className="flex items-center" onClick={() => setOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </nav>
          
          {/* Footer */}
          <div className="border-t p-4">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark")
              }}
            >
              <span>Switch to {theme === "dark" ? "Light" : "Dark"} Mode</span>
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Helper component for navigation links
function NavLink({ href, children, icon: Icon, onClick, isActive }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center py-2 px-3 text-sm rounded-md transition-colors relative",
        isActive 
          ? "bg-primary/10 text-primary font-semibold" 
          : "hover:bg-accent"
      )}
      onClick={onClick}
    >
      {Icon && <Icon className={cn("mr-2 h-4 w-4", isActive && "text-primary")} />}
      {children}
      {isActive && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </Link>
  )
} 