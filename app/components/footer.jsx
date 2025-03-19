"use client"

import Link from "next/link"
import { Instagram, Twitter, Send } from "lucide-react"
import { ShieldCheck } from "lucide-react"
import { CookieSettings } from "./cookie-settings"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">TrustTrade</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-[300px]">
              Secure P2P platform for social media account trading.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Browse Accounts
              </Link>
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                How it Works
              </Link>
              <Link href="/dashboard/sell" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Start Selling
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Connect</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Send className="h-5 w-5" />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">help@trusttrade.com</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            © {currentYear} TrustTrade. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/legal" className="text-sm text-muted-foreground hover:text-primary">
              Privacy
            </Link>
            <Link href="/legal" className="text-sm text-muted-foreground hover:text-primary">
              Terms
            </Link>
            <CookieSettings />
          </div>
        </div>
      </div>
    </footer>
  )
} 