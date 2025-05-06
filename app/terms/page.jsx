"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TermsPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <div 
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to TradeVero. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>&quot;Platform&quot; refers to TradeVero&apos;s website and services</li>
              <li>&quot;Content&quot; refers to digital products, including but not limited to ebooks, courses, templates, and other digital assets</li>
              <li>&quot;User&quot; refers to any person who accesses or uses the Platform</li>
              <li>&quot;Seller&quot; refers to users who list and sell digital products</li>
              <li>&quot;Buyer&quot; refers to users who purchase digital products</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Account Terms</h2>
            <p className="mb-4">
              You must be at least 18 years old to use this Platform. You are responsible for maintaining the security of your account and password.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Seller Terms</h2>
            <p className="mb-4">
              As a seller, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Only sell digital products that you have the right to sell</li>
              <li>Provide accurate descriptions of your products</li>
              <li>Deliver products promptly after purchase</li>
              <li>Respond to buyer inquiries in a timely manner</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Buyer Terms</h2>
            <p className="mb-4">
              As a buyer, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate payment information</li>
              <li>Not redistribute or resell purchased digital products</li>
              <li>Respect intellectual property rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Fees and Payments</h2>
            <p className="mb-4">
              TradeVero charges a commission on each sale. Payment processing fees may apply. All fees are non-refundable unless otherwise stated.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="mb-4">
              Sellers retain ownership of their digital products. Buyers receive a license to use the purchased products as specified in the product listing.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
            <p className="mb-4">
              We reserve the right to terminate or suspend accounts that violate these terms or for any other reason at our discretion.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
} 