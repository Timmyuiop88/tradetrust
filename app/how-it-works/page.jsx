"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/app/components/button"
import { Card, CardContent } from "@/app/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/tabs"
import { 
  ShieldCheck, 
  Check, 
  Upload, 
  CreditCard, 
  UserCheck, 
  ArrowRight, 
  Search, 
  MessageSquare, 
  Lock, 
  Clock, 
  DollarSign,
  Send
} from "lucide-react"
import { Header } from "@/app/components/header"
import { Footer } from "@/app/components/footer"
import { 
  AnimateOnScroll, 
  AnimateStagger, 
  StaggerItem,
  fadeIn,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  zoomIn
} from "@/app/components/animate"
import { motion } from "framer-motion"

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState("buyer")

  const features = 
  [
    {
      title: "Crypto-Powered Security",
      description: "All payments are processed securely using cryptocurrencies and other fast payment methods. Your funds are protected until you confirm the product or service is delivered as promised.",
      icon: CreditCard
    },
    {
      title: "Fast & Flexible Payments",
      description: "TradeVero supports a variety of payment options, including major cryptocurrencies and instant payment methods, ensuring quick and hassle-free transactions.",
      icon: DollarSign
    },
    {
      title: "Seller & Buyer Protection",
      description: "Both buyers and sellers are protected by our escrow system. Sellers are guaranteed payment after successful delivery, and buyers can shop with confidence.",
      icon: ShieldCheck
    }
  ]
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <AnimateOnScroll variants={fadeInUp} className="max-w-[800px] mx-auto text-center">
              <div className="inline-flex items-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
                <ShieldCheck className="mr-2 h-4 w-4" />
                How TradeVero Works
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
                Buy & Sell <span className="text-primary">Digital Products & Services</span> Securely
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                TradeVero is a marketplace for digital goods and services, powered by crypto and fast payments. Our escrow system ensures every transaction is safe for both buyers and sellers.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Process Overview */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="max-w-[1000px] mx-auto">
              <Tabs defaultValue="buyer" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-12">
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="buyer">For Buyers</TabsTrigger>
                    <TabsTrigger value="seller">For Sellers</TabsTrigger>
                  </TabsList>
                </div>
                
                {/* Buyer Content */}
                <TabsContent value="buyer" className="space-y-20">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">How to Buy Digital Products & Services</h2>
                    <p className="text-lg text-muted-foreground">
                      Discover, purchase, and receive digital goods or services in just a few steps.
                    </p>
                  </div>
                  
                  {/* Step 1 */}
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <AnimateOnScroll variants={fadeInLeft} className="order-2 md:order-1">
                      <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                        Step 1
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Sign Up & Verify</h3>
                      <p className="text-muted-foreground mb-6">
                        Create your TradeVero account and complete a quick verification. This keeps our marketplace safe and trustworthy for everyone.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Easy registration with email or social login</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Simple identity verification for secure trading</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Personal dashboard to manage your purchases</span>
                        </div>
                      </div>
                    </AnimateOnScroll>
                    <AnimateOnScroll variants={fadeInRight} className="order-1 md:order-2 flex justify-center">
                      <div className="relative w-full max-w-sm aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-3xl" />
                        <Image
                          src="/user.png"
                          alt="Account verification"
                          fill
                          className="object-contain p-6 relative z-10"
                        />
                      </div>
                    </AnimateOnScroll>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-sm aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-3xl" />
                        <Image
                          src="/usephone.png"
                          alt="Browse accounts"
                          fill
                          className="object-contain p-6 relative z-10"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                        Step 2
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Browse & Choose</h3>
                      <p className="text-muted-foreground mb-6">
                        Explore a wide range of digital products and services. Use filters to find exactly what you need, from software and eBooks to design services and more.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Advanced search and filtering</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Verified seller ratings and reviews</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Detailed product/service descriptions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                      <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                        Step 3
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Pay Securely with Crypto</h3>
                      <p className="text-muted-foreground mb-6">
                        Complete your purchase using your preferred cryptocurrency or fast payment method. Your payment is held in escrow until you confirm delivery.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Supports major cryptocurrencies</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Funds held securely in escrow</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Release payment only after you receive your order</span>
                        </div>
                      </div>
                    </div>
                    <div className="order-1 md:order-2 flex justify-center">
                      <div className="relative w-full max-w-sm aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-3xl" />
                        <Image
                          src="/usephone2.png"
                          alt="Secure payment"
                          fill
                          className="object-contain p-6 relative z-10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-sm aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-3xl" />
                        <Image
                          src="/hero.svg"
                          alt="Account transfer"
                          fill
                          className="object-contain p-6 relative z-10"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                        Step 4
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Receive & Confirm Delivery</h3>
                      <p className="text-muted-foreground mb-6">
                        Get instant access to your digital product or service. Confirm delivery, and only then is the payment released to the seller.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Instant digital delivery or service fulfillment</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Easy dispute process if anything goes wrong</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Leave feedback for the seller</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Buyer FAQ */}
                  <div className="rounded-xl border-2 border-muted p-8 bg-muted/10">
                    <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions for Buyers</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2">How do I know the product or service is genuine?</h4>
                        <p className="text-muted-foreground">
                          All sellers on TradeVero are verified, and products/services are reviewed. Buyer ratings and escrow protection ensure you get what you pay for.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">What if I don't receive my digital product or service?</h4>
                        <p className="text-muted-foreground">
                          Your payment is held in escrow until you confirm delivery. If there's an issue, you can open a dispute and our team will help resolve it.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Which cryptocurrencies can I use?</h4>
                        <p className="text-muted-foreground">
                          TradeVero supports major cryptocurrencies like Bitcoin, Ethereum, and more. Additional fast payment methods are also available.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Seller Content */}
                <TabsContent value="seller" className="space-y-20">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">How to Sell Digital Products & Services</h2>
                    <p className="text-lg text-muted-foreground">
                      Monetize your digital skills or assets quickly and securely with TradeVero.
                    </p>
                  </div>
                  
                  {/* Step 1 */}
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                      <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                        Step 1
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Register & Verify</h3>
                      <p className="text-muted-foreground mb-6">
                        Sign up as a seller and complete verification. This helps build trust with buyers and keeps the marketplace secure.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Quick registration and profile setup</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Identity verification for seller protection</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Showcase your digital products or services</span>
                        </div>
                      </div>
                    </div>
                    <div className="order-1 md:order-2 flex justify-center">
                      <div className="relative w-full max-w-sm aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-3xl" />
                        <Image
                          src="/hero.svg"
                          alt="Seller verification"
                          fill
                          className="object-contain p-6 relative z-10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-sm aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-3xl" />
                        <Image
                          src="/usephone.png"
                          alt="List your account"
                          fill
                          className="object-contain p-6 relative z-10"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                        Step 2
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Create a Listing</h3>
                      <p className="text-muted-foreground mb-6">
                        List your digital product or service with a detailed description, pricing, and delivery details. Attract buyers with clear information and competitive pricing.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Easy-to-use listing tools</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Set your own price</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Highlight your unique value</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                      <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                        Step 3
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Connect & Deliver</h3>
                      <p className="text-muted-foreground mb-6">
                        Communicate with buyers through our secure messaging system. Deliver your digital product or service promptly after purchase.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>In-platform messaging for secure communication</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Deliver files or services directly</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Get notified instantly when you make a sale</span>
                        </div>
                      </div>
                    </div>
                    <div className="order-1 md:order-2 flex justify-center">
                      <div className="relative w-full max-w-sm aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-3xl" />
                        <Image
                          src="/user.png"
                          alt="Buyer communication"
                          fill
                          className="object-contain p-6 relative z-10"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-sm aspect-square">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-3xl" />
                        <Image
                          src="/usephone2.png"
                          alt="Get paid"
                          fill
                          className="object-contain p-6 relative z-10"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                        Step 4
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Get Paid Instantly</h3>
                      <p className="text-muted-foreground mb-6">
                        Once the buyer confirms delivery, your payment is released instantly in your chosen cryptocurrency or fast payment method.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Instant payouts after confirmation</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Multiple payout options</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Low fees and transparent process</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Seller FAQ */}
                  <div className="rounded-xl border-2 border-muted p-8 bg-muted/10">
                    <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions for Sellers</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2">How do I get paid?</h4>
                        <p className="text-muted-foreground">
                          After the buyer confirms delivery, your payment is released instantly in your chosen cryptocurrency or fast payment method.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">What can I sell on TradeVero?</h4>
                        <p className="text-muted-foreground">
                          You can sell any digital product or service, including software, eBooks, design, development, consulting, and more.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Are there any fees?</h4>
                        <p className="text-muted-foreground">
                          TradeVero charges a small commission on successful sales, which covers escrow, support, and platform maintenance. All fees are transparently displayed before you list.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Escrow Explanation */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <AnimateOnScroll variants={fadeInUp} className="text-center max-w-[800px] mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Secure Escrow System</h2>
              <p className="text-lg text-muted-foreground">
                The safest way to buy and sell digital products and services with crypto and fast payments.
              </p>
            </AnimateOnScroll>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={`feature-${index}`}>
                  <Card className="bg-background border-2 border-muted h-full">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <AnimateOnScroll variants={zoomIn} className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-[800px] mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of users buying and selling digital products and services on TradeVero, the safest crypto-powered marketplace.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Create Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">Browse Marketplace</Link>
                </Button>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </main>
      <Footer />
    </div>
  )
} 