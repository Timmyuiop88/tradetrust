"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "./button"
import { Moon, Sun, ShieldCheck, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { MobileNav } from "./mobile-nav"
import { cn } from "@/app/lib/utils"
import { usePathname } from "next/navigation"
import Image from "next/image"
export function Header() {
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  
  // Track scroll position to add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Function to check if a link is active
  const isActive = (path) => {
    // For exact matches
    if (pathname === path) return true
    
    // For nested paths (e.g. /how-it-works/something should highlight the /how-it-works link)
    if (path !== '/' && pathname.startsWith(path)) return true
    
    return false
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200",
      scrolled && "shadow-sm"
    )}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
           <Image src="/images/logo.png" alt="TrustTrade" width={28} height={28} />
            <span className="font-bold text-lg sm:text-xl">TrustTrade</span>
          </Link>
        </div>
        
        {/* Desktop Navigation - centered for balance */}
        <nav className="hidden mx-4 lg:flex items-center justify-center space-x-1 flex-1">
          <Link 
            href="/dashboard" 
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors relative",
              isActive("/dashboard") 
                ? "bg-primary/10 text-primary font-semibold" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            Browse Accounts
            {isActive("/dashboard") && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary mx-3 rounded-full" />
            )}
          </Link>
          <Link 
            href="/about" 
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors relative",
              isActive("/about") 
                ? "bg-primary/10 text-primary font-semibold" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            About Us
            {isActive("/about") && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary mx-3 rounded-full" />
            )}
          </Link>
          <Link 
            href="/how-it-works" 
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors relative",
              isActive("/how-it-works") 
                ? "bg-primary/10 text-primary font-semibold" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            How it Works
            {isActive("/how-it-works") && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary mx-3 rounded-full" />
            )}
          </Link>
          <Link 
            href="/dashboard/sell" 
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md transition-colors relative",
              isActive("/dashboard/sell") 
                ? "bg-primary/10 text-primary font-semibold" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            Start Selling
            {isActive("/dashboard/sell") && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary mx-3 rounded-full" />
            )}
          </Link>
        </nav>
        
        {/* Right-side actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          {/* Auth Buttons - Hide on smaller screens */}
          <div className="hidden md:flex items-center space-x-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
          
          {/* Mobile Nav */}
          <div className="flex items-center lg:hidden">
      
        <div className="flex items-center space-x-4 ">
          
          <MobileNav />
          </div>
        </div>
      </div>
      </div>
    </header>
  )
}

