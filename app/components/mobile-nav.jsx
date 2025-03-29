"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "./button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./sheet"
import { 
  Menu, Home, ShoppingBag, PlusSquare, User2, 
  Info, HelpCircle, LogOut, Sun, Moon 
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/app/lib/utils"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const { data: session } = useSession()
  const router = useRouter()

  // Function to check if a link is active
  const isActive = (path) => {
    if (pathname === path) return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  // Public navigation items - when not logged in
  const publicNavItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About Us', href: '/about', icon: Info },
    { name: 'How it Works', href: '/how-it-works', icon: HelpCircle },
  ]

  // Protected navigation items - when logged in
  const protectedNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { name: 'Sell', href: '/dashboard/sell', icon: PlusSquare },
    { name: 'Profile', href: '/dashboard/profile', icon: User2 },
  ]

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
    setOpen(false)
  }

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
                href={session ? "/dashboard" : "/"}
                className="flex items-center space-x-2"
                onClick={() => setOpen(false)}
              >
                <Image src="/images/logo.png" alt="TradeVero" width={20} height={20} />
                <span className="font-bold">TradeVero</span>
              </Link>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-auto py-4">
            <div className="space-y-1 px-2">
              {(session ? protectedNavItems : publicNavItems).map((item, index) => (
                <NavLink
                  key={index}
                  href={item.href}
                  icon={item.icon}
                  onClick={() => setOpen(false)}
                  isActive={isActive(item.href)}
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="mt-6 px-3">
              {session ? (
                <Button 
                  className="w-full justify-start" 
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="justify-start w-full" 
                    onClick={() => {
                      router.push('/login')
                      setOpen(false)
                    }}
                  >
                    <User2 className="mr-2 h-4 w-4" /> 
                    Sign In
                  </Button>
                  <Button 
                    className="justify-start w-full" 
                    onClick={() => {
                      router.push('/signup')
                      setOpen(false)
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </nav>

          {/* Theme Toggle */}
          <div className="border-t p-4">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
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

// NavLink component remains the same
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