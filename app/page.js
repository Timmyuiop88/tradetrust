"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "./components/button"
import { Card, CardContent } from "./components/card"
import {
  ArrowRight,
  Download,
  Zap,
  Shield,
  CheckCircle,
  Book,
  CreditCard,
  Lock,
  Users,
  Globe,
  Sparkles,
  Palette,
  Package,
  Film,
  PenTool,
  Ticket,
  ChevronRight,
  Star,
  ArrowUpRight,
  Layers,
  Hexagon,
  Circle,
  Triangle,
} from "lucide-react"
import { Header } from "./components/header"
import { Footer } from "./components/footer"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [activeFeature, setActiveFeature] = useState(0)
  const router = useRouter()
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      title: "Instant Delivery",
      description: "Automated delivery system for instant downloads after purchase",
      icon: Download,
    },
    {
      title: "Flexible Payments",
      description: "Multi-currency pricing with crypto and traditional payment methods",
      icon: CreditCard,
    },
    {
      title: "Subscription Models",
      description: "One-time or recurring payment options for your digital products",
      icon: Users,
    },
    {
      title: "Content Protection",
      description: "Built-in DRM and secure content delivery for your valuable assets",
      icon: Lock,
    },
  ]

  const testimonials = [
    {
      quote:
        "My design template business grew 300% since joining TradeVero. The platform handles everything while I create.",
      name: "Emma Chen",
      role: "UI Designer",
      revenue: "$50K+ Monthly",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      quote: "Selling my programming courses here was the best decision. The course hosting features are incredible.",
      name: "David Kumar",
      role: "Tech Educator",
      revenue: "$75K+ Monthly",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      quote: "From ebooks to resource bundles, I've built a 6-figure business on TradeVero in just 8 months.",
      name: "Sarah Miller",
      role: "Content Creator",
      revenue: "$100K+ Monthly",
      avatar: "/placeholder.svg?height=80&width=80",
    },
  ]

  const categories = [
    {
      title: "Ebooks & Guides",
      description: "Digital books, PDFs, and reading materials",
      icon: Book,
      href: "/marketplace/sell/ebooks",
    },
    {
      title: "Design Assets",
      description: "Templates, graphics, and UI kits",
      icon: Palette,
      href: "/marketplace/sell/design",
    },
    {
      title: "Video Courses",
      description: "Educational content and tutorials",
      icon: Film,
      href: "/marketplace/sell/courses",
    },
    {
      title: "Digital Bundles",
      description: "Packaged resources and collections",
      icon: Package,
      href: "/marketplace/sell/bundles",
    },
    {
      title: "Event Tickets",
      description: "Digital tickets for virtual/physical events",
      icon: Ticket,
      href: "/marketplace/sell/tickets",
    },
  ]

  const steps = [
    {
      title: "Sign Up",
      description: "Create your account in seconds and set up your profile",
      icon: Users,
    },
    {
      title: "Upload Products",
      description: "List your digital products with our simple creator tools",
      icon: PenTool,
    },
    {
      title: "Get Paid",
      description: "Receive payments directly to your wallet or bank account",
      icon: CreditCard,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-40">
        {/* Background SVG Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

          {/* Decorative SVG shapes */}
          <div className="absolute top-20 right-[10%] text-primary/20 opacity-30">
            <Hexagon size={80} />
          </div>
          <div className="absolute bottom-20 left-[5%] text-primary/20 opacity-30 rotate-12">
            <Triangle size={60} />
          </div>
          <div className="absolute top-[40%] left-[15%] text-primary/20 opacity-30">
            <Circle size={40} />
          </div>
        </div>

        <div className="container px-4 md:px-6 relative">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col space-y-6">
                <div className="inline-flex items-center self-start rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  <span>Buy & Sell Digital Products</span>
                </div>

                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  The Future of <span className="text-primary">Digital Commerce</span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-[600px]">
                  Trade digital products instantly with secure payments. Your marketplace for courses, ebooks, design
                  assets, and more.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                    <Link href="/marketplace/sell" className="flex items-center">
                      Start Trading Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-2">
                    <Link href="/marketplace">Explore Marketplace</Link>
                  </Button>
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Secure Escrow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Instant Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Global Trading</span>
                  </div>
                </div>
              </div>

              <div className="relative mt-8 lg:mt-0 flex justify-center">
                <div className="relative z-10 bg-gradient-to-br from-background to-muted p-4 sm:p-6 rounded-2xl border border-muted shadow-xl w-full max-w-xs sm:max-w-md lg:max-w-lg">
                  <div className="absolute -top-6 -right-6 bg-primary/10 w-16 h-16 sm:w-24 sm:h-24 rounded-full blur-2xl" />
                  <div className="absolute -bottom-6 -left-6 bg-primary/10 w-16 h-16 sm:w-24 sm:h-24 rounded-full blur-2xl" />

                  <div className="relative z-20">
                    <div className="flex justify-between items-center mb-4 sm:mb-6">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500" />
                        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-500" />
                        <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500" />
                      </div>
                      <div className="text-xs text-muted-foreground">Digital Storefront</div>
                    </div>

                    <div className="space-y-4">
                      {/* Product Card Preview */}
                      <div className="bg-background rounded-lg border border-border p-3 sm:p-4 hover:border-primary/50 transition-colors">
                        <div className="aspect-video bg-muted rounded-md mb-2 sm:mb-3 overflow-hidden relative">
                          <Image
                            src="/hero-products.svg"
                            alt="Product preview"
                            width={400}
                            height={200}
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <div className="absolute bottom-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                            Course
                          </div>
                        </div>
                        <h3 className="font-medium text-base sm:text-lg">Design System Mastery</h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-primary font-bold">$79.00</span>
                          <div className="flex items-center text-yellow-500 text-xs">
                            <Star className="fill-yellow-500 h-3 w-3 mr-1" />
                            <span>4.9</span>
                          </div>
                        </div>
                      </div>

                      {/* Mini Product Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div className="bg-background rounded-lg border border-border p-2 sm:p-3 hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <Book className="h-4 w-4 text-primary" />
                            <span className="text-xs font-medium">Ebook</span>
                          </div>
                          <div className="text-xs text-muted-foreground">UX Research Guide</div>
                          <div className="text-sm font-medium mt-1">$29.00</div>
                        </div>
                        <div className="bg-background rounded-lg border border-border p-2 sm:p-3 hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-2 mb-1 sm:mb-2">
                            <Palette className="h-4 w-4 text-primary" />
                            <span className="text-xs font-medium">Template</span>
                          </div>
                          <div className="text-xs text-muted-foreground">UI Component Kit</div>
                          <div className="text-sm font-medium mt-1">$49.00</div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button onClick={() => router.push("/marketplace")} className="w-full bg-primary/10 hover:bg-primary/20 text-primary font-medium py-2 rounded-lg text-sm transition-colors">
                        View All Products
                      </button>
                    </div>
                  </div>
                </div>

                {/* Floating Elements - only show on md+ to avoid overlap on mobile */}
                <div className="hidden md:block absolute -top-4 -left-4 bg-background rounded-lg border border-border p-2 shadow-lg z-20 animate-float">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">Instant Delivery</span>
                  </div>
                </div>
                <div className="hidden md:block absolute -bottom-4 -right-4 bg-background rounded-lg border border-border p-2 shadow-lg z-20 animate-float-slow">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">Secure Payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="currentColor"
              fillOpacity="0.05"
              d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-12 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-lg font-medium text-muted-foreground">Trusted by creators worldwide</h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[
              "logoipsum-338.svg",
              "logoipsum-339.svg",
              "logoipsum-363.svg",
              "logoipsum-365.svg",
              "logoipsum-371.svg",
            ].map((filename, i) => (
              <div
                key={filename}
                
              >
                <Image
                  src={`/logoipsium/${filename}`}
                  alt={`Creator logo ${i + 1}`}
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container px-4 md:px-6 relative">
          <div className="text-center max-w-[800px] mx-auto mb-16">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              <Package className="mr-1 h-3.5 w-3.5" />
              <span>Digital Products</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Trade Digital Assets Securely</h2>
            <p className="text-xl text-muted-foreground">
              Buy and sell with confidence using crypto or traditional payments
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <Link key={category.title} href={category.href} className="group">
                <Card className="h-full overflow-hidden border-2 border-muted hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <category.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                    <div className="mt-4 flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">Explore</span>
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold text-primary">10k+</h3>
              <p className="text-sm md:text-base text-muted-foreground">Verified Accounts</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold text-primary">$5M+</h3>
              <p className="text-sm md:text-base text-muted-foreground">Transaction Volume</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold text-primary">15k+</h3>
              <p className="text-sm md:text-base text-muted-foreground">Happy Users</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl md:text-4xl font-bold text-primary">99%</h3>
              <p className="text-sm md:text-base text-muted-foreground">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

          {/* Decorative SVG shapes */}
          <div className="absolute top-[30%] right-[5%] text-primary/20 opacity-30 rotate-45">
            <Hexagon size={60} />
          </div>
          <div className="absolute bottom-[20%] left-[10%] text-primary/20 opacity-30 -rotate-12">
            <Circle size={40} />
          </div>
        </div>

        <div className="container px-4 md:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                <Zap className="mr-1 h-3.5 w-3.5" />
                <span>Powerful Features</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Everything You Need to Succeed</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Our platform provides all the tools you need to create, sell, and deliver digital products with ease.
              </p>

              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div
                    key={feature.title}
                    className={`p-4 rounded-xl transition-colors cursor-pointer ${activeFeature === index ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted/50"}`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`shrink-0 p-2 rounded-full ${activeFeature === index ? "bg-primary text-white" : "bg-muted text-primary"}`}
                      >
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="relative z-10 bg-gradient-to-br from-background to-muted p-6 rounded-2xl border border-muted shadow-xl">
                <div className="absolute -top-6 -right-6 bg-primary/10 w-24 h-24 rounded-full blur-2xl" />
                <div className="absolute -bottom-6 -left-6 bg-primary/10 w-24 h-24 rounded-full blur-2xl" />

                <div className="relative z-20">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <div className="text-xs text-muted-foreground">Feature Preview</div>
                  </div>

                  <div className="space-y-4">
                    {/* Feature Preview Content - Changes based on selected feature */}
                    {activeFeature === 0 && (
                      <div className="space-y-4">
                        <div className="bg-background rounded-lg border border-border p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Download className="h-4 w-4 text-primary" />
                              <span className="font-medium">Instant Delivery</span>
                            </div>
                            <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                              Active
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 bg-muted rounded-full w-full" />
                            <div className="h-2 bg-primary rounded-full w-3/4" />
                            <div className="flex justify-between text-xs mt-1">
                              <span className="text-muted-foreground">Processing</span>
                              <span className="font-medium">75%</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-background rounded-lg border border-border p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-xs font-medium">Payment Verified</span>
                            </div>
                          </div>
                          <div className="bg-background rounded-lg border border-border p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-xs font-medium">Files Prepared</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-background rounded-lg border border-primary/50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Download className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">Download Ready</div>
                              <div className="text-xs text-muted-foreground">Your files are ready for download</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeFeature === 1 && (
                      <div className="space-y-4">
                        <div className="bg-background rounded-lg border border-border p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-primary" />
                              <span className="font-medium">Payment Methods</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <span className="text-xs font-bold text-blue-500">₿</span>
                                </div>
                                <span className="text-sm">Bitcoin</span>
                              </div>
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                                  <span className="text-xs font-bold text-purple-500">Ξ</span>
                                </div>
                                <span className="text-sm">Ethereum</span>
                              </div>
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                  <span className="text-xs font-bold text-green-500">$</span>
                                </div>
                                <span className="text-sm">USD</span>
                              </div>
                              <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeFeature === 2 && (
                      <div className="space-y-4">
                        <div className="bg-background rounded-lg border border-border p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="font-medium">Subscription Models</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="p-3 border border-muted rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Enterprise Plan</span>
                                <span className="text-primary font-bold">$99/mo</span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs">Everything in Pro +</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs">Priority support</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs">Lower fees</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 border border-primary/50 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Pro Plan</span>
                                <span className="text-primary font-bold">$29/mo</span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs">Unlimited downloads</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs">Priority support</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs">Early access</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 border border-muted rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Basic Plan</span>
                                <span className="text-primary font-bold">$9/mo</span>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs">10 downloads/month</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-xs">Standard support</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeFeature === 3 && (
                      <div className="space-y-4">
                        <div className="bg-background rounded-lg border border-border p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4 text-primary" />
                              <span className="font-medium">Content Protection</span>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">DRM Protection</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Your content is protected with industry-standard DRM technology
                              </p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Access Control</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Manage who can access your content and for how long
                              </p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Globe className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">Geo-Restrictions</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Limit content access by geographic location
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 bg-background rounded-lg border border-border p-2 shadow-lg z-20 animate-float">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">Fast Setup</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-background rounded-lg border border-border p-2 shadow-lg z-20 animate-float-slow">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">Secure Platform</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

          {/* Decorative SVG shapes */}
          <div className="absolute top-[20%] left-[5%] text-primary/20 opacity-30 rotate-12">
            <Hexagon size={50} />
          </div>
          <div className="absolute bottom-[10%] right-[10%] text-primary/20 opacity-30 -rotate-12">
            <Triangle size={40} />
          </div>
        </div>

        <div className="container px-4 md:px-6 relative">
          <div className="text-center max-w-[800px] mx-auto mb-16">
            <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              <Layers className="mr-1 h-3.5 w-3.5" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">How TradeVero Works</h2>
            <p className="text-xl text-muted-foreground">Get started in minutes with our simple three-step process</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[calc(50%+2rem)] right-0 h-0.5 bg-muted">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary" />
                  </div>
                )}

                <div className="bg-background rounded-xl border-2 border-muted p-6 hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary relative">
                    <step.icon className="h-8 w-8" />
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground mb-6">{step.description}</p>
                  <div className="mt-auto">
                    <Link href="#" className="inline-flex items-center text-primary font-medium hover:underline">
                      Learn more
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button asChild>
              <Link href="/how-it-works">View Detailed Guide</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container px-4 md:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
                <Users className="mr-1 h-3.5 w-3.5" />
                <span>Success Stories</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Join Our Community of <span className="text-primary">Successful Creators</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Discover how creators like you are building thriving businesses on TradeVero. Our platform has helped
                thousands of digital creators earn more while doing what they love.
              </p>
              <div className="grid grid-cols-3 gap-8 py-8">
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-primary">50K+</h3>
                  <p className="text-sm text-muted-foreground">Active Creators</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-primary">$2M+</h3>
                  <p className="text-sm text-muted-foreground">Monthly Payouts</p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-primary">95%</h3>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative h-[400px]">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={testimonial.name}
                    className={`absolute inset-0 transition-all duration-500 transform ${index === activeTestimonial
                        ? "opacity-100 translate-x-0 scale-100"
                        : "opacity-0 translate-x-8 scale-95"
                      }`}
                    style={{
                      zIndex: index === activeTestimonial ? 10 : 0,
                    }}
                  >
                    <Card className="h-full bg-background border-2 border-muted hover:border-primary/50 transition-all duration-300">
                      <CardContent className="p-8 h-full flex flex-col">
                        <div className="flex items-center text-yellow-500 mb-6">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-yellow-500" />
                          ))}
                        </div>

                        <p className="text-lg italic text-muted-foreground mb-8 flex-grow">"{testimonial.quote}"</p>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-4">
                            <div>
                              <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{testimonial.revenue}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-6 gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`transition-all duration-300 ${index === activeTestimonial
                        ? "w-8 h-2 bg-primary rounded-full"
                        : "w-2 h-2 bg-primary/20 rounded-full hover:bg-primary/40"
                      }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

          {/* Decorative SVG shapes */}
          <div className="absolute top-[30%] left-[10%] text-primary/20 opacity-30 rotate-45">
            <Circle size={60} />
          </div>
          <div className="absolute bottom-[20%] right-[10%] text-primary/20 opacity-30 -rotate-12">
            <Hexagon size={50} />
          </div>
        </div>

        <div className="container px-4 md:px-6 relative">
          <div className="max-w-[900px] mx-auto bg-background rounded-2xl p-8 md:p-12 border-2 border-muted shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                  Ready to Share Your Digital Creations?
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Join thousands of successful creators who trust TradeVero to sell their digital products.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>No technical skills required</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Set up your store in minutes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Secure payment processing</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                    <Link href="/signup" className="flex items-center">
                      Start Selling Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline">
                    <Link href="/pricing">View Pricing</Link>
                  </Button>
                </div>
              </div>

              <div className="relative hidden md:block">
                <div className="relative aspect-square">
                  <Image
                    src="/creator-dashboard.svg"
                    alt="Creator dashboard preview"
                    width={400}
                    height={400}
                    className="object-contain"
                  />

                  {/* Floating elements */}
                  <div className="absolute top-1/4 right-0 bg-background rounded-lg border border-border p-3 shadow-lg animate-float">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Sales Up 24%</span>
                    </div>
                  </div>
                  <div className="absolute bottom-1/4 left-0 bg-background rounded-lg border border-border p-3 shadow-lg animate-float-slow">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">New Customers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
