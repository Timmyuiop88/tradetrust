"use client"
import Link from "next/link"
import { Button } from "./button"
import { Moon, Sun, ShieldCheck } from "lucide-react"
import { useTheme } from "next-themes"
import { MobileNav } from "./mobile-nav"
import Image from "next/image"
export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
         <Image src="/images/logo.png" alt="TrustTrade" width={28} height={28} />
          <span className="font-bold text-xl">TrustTrade</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/browse" className="text-sm font-medium hover:text-primary transition-colors">
            Browse Accounts
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About Us
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How it Works
          </Link>
          <Link href="/become-merchant" className="text-sm font-medium hover:text-primary transition-colors">
            Start Selling
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </nav>
        <div className="flex items-center space-x-4 ">
          
          <MobileNav />
        </div>
      </div>
    </header>
  )
}

