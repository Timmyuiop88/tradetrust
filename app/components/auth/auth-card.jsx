"use client"

import { Card } from "../card"
import { ShieldCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

export function AuthCard({ children, title, description }) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center space-x-2 mb-8">
            {mounted && (
              theme === "dark" ? (
                <Image
                  src="/images/logovero-dark.webp"
                  alt="TradeVero"
                  width={200}
                  height={200}
                  priority
                />
              ) : (
                <Image
                  src="/images/logovero-light.webp"
                  alt="TradeVero"
                  width={200}
                  height={200}
                  priority
                />
              )
            )}
          </Link>
      <Card className="w-full max-w-[450px] p-8 shadow-xl border-primary/10">
        <div className="flex flex-col space-y-3 text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
      </Card>
    </div>
  )
} 