"use client"
import { Sheet, SheetContent, SheetTrigger } from "./sheet"
import { Button } from "./button"
import { Menu } from "lucide-react"
import Link from "next/link"

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4">
          <Link href="/about" className="text-lg font-medium hover:text-primary transition-colors">
            About Us
          </Link>
          <Link href="/features" className="text-lg font-medium hover:text-primary transition-colors">
            Security Features
          </Link>
          <Link href="/how-it-works" className="text-lg font-medium hover:text-primary transition-colors">
            How it Works
          </Link>
          <Link href="/become-merchant" className="text-lg font-medium hover:text-primary transition-colors">
            Start Selling
          </Link>
          <div className="flex flex-col gap-2 mt-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
} 