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
      title: "Buyer Protection",
      description: "Your payment is held securely until you verify the account meets all expectations and you have full access. If anything goes wrong, your money is protected.",
      icon: CreditCard
    },
    {
      title: "Secure Transfers",
      description: "Our step-by-step transfer process ensures accounts change hands safely with minimal risk to account stability or algorithm performance.",
      icon: Lock
    },
    {
      title: "Seller Assurance",
      description: "Sellers know payment is guaranteed once transfer is complete. No risk of chargebacks or payment disputes after account access is provided.",
      icon: DollarSign
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
                Safe & Secure <span className="text-primary">Account Trading</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Our platform makes buying and selling social media accounts simple and secure through our advanced escrow system and verification technology.
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
                    <h2 className="text-3xl font-bold mb-4">How to Buy Accounts</h2>
                    <p className="text-lg text-muted-foreground">
                      Find and purchase verified social media accounts in a few simple steps
                    </p>
                  </div>
                  
                  {/* Step 1 */}
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <AnimateOnScroll variants={fadeInLeft} className="order-2 md:order-1">
                      <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                        Step 1
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Create an Account & Verify</h3>
                      <p className="text-muted-foreground mb-6">
                        Sign up for TradeVero and complete the verification process. This helps us maintain a secure marketplace and protect all users.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Quick registration with email or social accounts</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Simple identity verification for your security</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Create a profile to manage your purchases</span>
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
                      <h3 className="text-2xl font-bold mb-4">Browse & Select Accounts</h3>
                      <p className="text-muted-foreground mb-6">
                        Explore our marketplace of verified social media accounts across platforms. Filter by followers, engagement rate, niche, and more.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Advanced filters to find exactly what you need</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Verified metrics and engagement data</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Detailed account history and analytics</span>
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
                      <h3 className="text-2xl font-bold mb-4">Secure Payment & Escrow</h3>
                      <p className="text-muted-foreground mb-6">
                        Complete your purchase through our secure payment system. Your payment is held in escrow until the account transfer is verified and complete.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Multiple secure payment options</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Funds held securely in escrow</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>No payment released until transfer is verified</span>
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
                      <h3 className="text-2xl font-bold mb-4">Secure Account Transfer</h3>
                      <p className="text-muted-foreground mb-6">
                        Work with the seller through our secure transfer process. Our team monitors the transfer to ensure everything goes smoothly.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Step-by-step guided transfer process</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Secure communication with the seller</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Full access verification before completion</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Buyer FAQ */}
                  <div className="rounded-xl border-2 border-muted p-8 bg-muted/10">
                    <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions for Buyers</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2">How do I know the account metrics are real?</h4>
                        <p className="text-muted-foreground">
                          All accounts on TradeVero go through our verification process where we validate followers, engagement, and other key metrics. We provide detailed analytics and transparent account history.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">What happens if the account isn't as described?</h4>
                        <p className="text-muted-foreground">
                          Your money is protected in our escrow system. If the account doesn't match the description or metrics, you can dispute the transaction and our team will investigate.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Is buying social media accounts against platform terms?</h4>
                        <p className="text-muted-foreground">
                          We recommend reviewing each platform's terms of service. TradeVero ensures the transfer process follows best practices to maintain account stability during ownership changes.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Seller Content */}
                <TabsContent value="seller" className="space-y-20">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">How to Sell Your Account</h2>
                    <p className="text-lg text-muted-foreground">
                      Turn your social media asset into cash safely and quickly
                    </p>
                  </div>
                  
                  {/* Step 1 */}
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                      <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                        Step 1
                      </div>
                      <h3 className="text-2xl font-bold mb-4">Create an Account & Verify</h3>
                      <p className="text-muted-foreground mb-6">
                        Sign up for TradeVero and complete the seller verification process. This builds trust with potential buyers and verifies your ownership.
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
                          <span>Account ownership verification process</span>
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
                      <h3 className="text-2xl font-bold mb-4">List Your Account</h3>
                      <p className="text-muted-foreground mb-6">
                        Create a detailed listing for your social media account, including all relevant metrics, engagement data, and content information.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Automated metrics collection for accuracy</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Set your price or get valuation assistance</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Add detailed description and account highlights</span>
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
                      <h3 className="text-2xl font-bold mb-4">Connect with Buyers</h3>
                      <p className="text-muted-foreground mb-6">
                        Interested buyers will contact you through our secure messaging system. Respond to inquiries and negotiate the final sale price.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Secure in-platform communication</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Receive offers and negotiate price</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Answer questions about your account</span>
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
                      <h3 className="text-2xl font-bold mb-4">Safe Transfer & Payment</h3>
                      <p className="text-muted-foreground mb-6">
                        Once a buyer purchases your account, follow our secure transfer process. After the transfer is verified, you'll receive your payment.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Guided transfer process for account security</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Fast payment processing once transfer is complete</span>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>Multiple payout options available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Seller FAQ */}
                  <div className="rounded-xl border-2 border-muted p-8 bg-muted/10">
                    <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions for Sellers</h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2">How is my account valued?</h4>
                        <p className="text-muted-foreground">
                          TradeVero provides valuation guidance based on follower count, engagement rate, niche, account age, and recent sales of similar accounts. You always have the final say on your listing price.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">When do I get paid after selling my account?</h4>
                        <p className="text-muted-foreground">
                          Once the buyer confirms they have full access to the account and all transfer steps are complete, your payment is processed immediately. Most sellers receive funds within 1-3 business days.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">What fees does TradeVero charge?</h4>
                        <p className="text-muted-foreground">
                          TradeVero charges a small commission on successful sales. The fee is based on the final sale price and covers our escrow service, transfer assistance, and platform maintenance.
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
                The safest way to buy and sell social media accounts
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
                Join thousands of users buying and selling social media accounts on the safest platform
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" asChild>
                  <Link href="/signup">Create Account</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">Browse Accounts</Link>
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