"use client"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./sheet"
import { Button } from "./button"
import { Menu, Moon, Sun, Home, ShoppingBag, Settings, HelpCircle, LogOut, User2, Bell, Wallet } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export function MobileNav() {
  const { theme, setTheme } = useTheme()
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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 mt-6">
          {session ? (
            <>
              {accountNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
              <hr className="my-2" />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-lg font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              {mainNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className="flex items-center gap-2 text-lg font-medium hover:text-primary transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
              <hr className="my-2" />
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            </>
          )}
          <hr className="my-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Toggle theme</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 