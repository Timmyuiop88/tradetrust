'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "./components/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/card"
import { 
  ArrowRight, 
  Download,
  Zap, 
  Shield, 
  CheckCircle, 
  Book,
  Video,
  FileText,
  CreditCard,
  Lock,
  Users,
  Globe,
  ArrowUpRight,
  Banknote,
  HeadphonesIcon,
  Palette,
  FileCode,
  Package,
  Film,
  Sparkles,
  PenTool,
  Ticket,
  ArrowLeft,
} from "lucide-react"
import { Header } from "./components/header"
import { Footer } from "./components/footer"
import { FeaturedAccountCard } from "./components/featured-account-card"
import {
  AnimateOnScroll,
  AnimateStagger,
  StaggerItem,
  fadeIn,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  zoomIn
} from "./components/animate"
import { useState } from "react"

const howItWorksSteps = [
  {
    title: "Sign Up & Set Up",
    icon: Users,
    image: "/how-it-works/signup.svg",
    description: "Get started in minutes by creating your free TradeVero account. Set up your secure profile, connect your digital wallet, and customize your seller or buyer preferences. Our onboarding process is simple, fast, and designed to help you hit the ground running—no technical skills required.",
  },
  {
    title: "List or Discover Products",
    icon: Package,
    image: "/how-it-works/list.svg",
    description: "Sellers can easily upload and showcase a wide range of digital products—ebooks, courses, templates, tickets, memberships, and more. Buyers can explore a global marketplace, filter by category, and discover high-quality digital goods and services from trusted creators around the world.",
  },
  {
    title: "Secure Payments",
    icon: CreditCard,
    image: "/how-it-works/payment.svg",
    description: "TradeVero supports instant payments with cryptocurrencies and fast local payment methods. Our advanced escrow system protects both buyers and sellers, ensuring funds are only released when everyone is satisfied. Enjoy peace of mind with every transaction, no matter where you are.",
  },
  {
    title: "Instant Delivery",
    icon: Download,
    image: "/how-it-works/delivery.svg",
    description: "Once payment is confirmed, buyers receive immediate access to their digital products or services—no waiting, no hassle. Sellers are instantly notified and can track delivery status in real time. Our automated system guarantees a seamless, frictionless experience for both parties.",
  },
  {
    title: "Earn & Grow",
    icon: Banknote,
    image: "/how-it-works/earn.svg",
    description: "Sellers can monitor sales, manage orders, and withdraw earnings at any time, with transparent analytics and reporting. Buyers can leave ratings and reviews, helping the best creators rise to the top. Whether you're a first-time seller or a seasoned entrepreneur, TradeVero helps you grow your digital business.",
  },
  {
    title: "24/7 Support",
    icon: HeadphonesIcon,
    image: "/how-it-works/support.svg",
    description: "Our dedicated support team is available around the clock to assist with any questions, disputes, or technical issues. We're committed to providing a safe, reliable, and friendly environment for all users—so you can focus on what matters most: creating, selling, and buying with confidence.",
  },
]

export default function LandingPage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted py-24 md:py-32">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-12 lg:grid-cols-[1fr_480px] lg:gap-16 xl:grid-cols-[1fr_600px]">
              <AnimateOnScroll variants={fadeInLeft} className="flex flex-col justify-center space-y-8">
                <div className="space-y-8">
                  <AnimateOnScroll variants={fadeInUp} delay={0.2} className="inline-flex items-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Buy & Sell Digital Products with Crypto
                  </AnimateOnScroll>
                  <AnimateOnScroll variants={fadeInUp} delay={0.3}>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                      The Future of <span className="text-primary">Digital Commerce</span> is Here
                  </h1>
                  </AnimateOnScroll>
                  <AnimateOnScroll variants={fadeInUp} delay={0.4}>
                  <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                      Trade digital products instantly with crypto payments. Your secure marketplace for courses, ebooks, design assets, and more—powered by blockchain technology.
                  </p>
                  </AnimateOnScroll>
                  <AnimateOnScroll variants={fadeInUp} delay={0.5}>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <Button size="lg" className="bg-primary hover:bg-primary/90">
                        <Link href="/dashboard/sell">Start Trading Now</Link>
                    </Button>
                    <Button size="lg" variant="outline">
                        <Link href="/browse">Explore Marketplace</Link>
                    </Button>
                  </div>
                  </AnimateOnScroll>
                  <AnimateOnScroll variants={fadeInUp} delay={0.6}>
                    <div className="flex items-center gap-8 pt-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="text-sm">Secure Escrow</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <span className="text-sm">Instant Delivery</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        <span className="text-sm">Global Trading</span>
                      </div>
                    </div>
                  </AnimateOnScroll>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll variants={fadeInRight} delay={0.4} className="relative hidden lg:flex items-center justify-center">
                {/* Animated, blurred background blob */}
                <div className="absolute -top-20 -right-20 w-[480px] h-[480px] bg-primary/20 rounded-full blur-3xl z-0 animate-pulse" />
                {/* Floating digital product cards */}
                <div className="relative z-10 flex flex-col items-center gap-10 scale-110">
                  {/* Top floating card */}
                  <div className="relative bg-background border-2 border-green-500 shadow-xl rounded-xl px-4 py-2 h-10 flex items-center gap-4 animate-float-slow">
                    <Book className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-xl text-primary">Ebook</span>
                  </div>
                  {/* Center main card */}
                  <div className="relative bg-background border-4 border-green-500 shadow-2xl rounded-3xl px-16 py-12 flex flex-col items-center gap-6 scale-110">
                    <Image
                      src="/hero-products.svg"
                      alt="Digital products"
                      width={180}
                      height={180}
                      className="mb-4"
                    />
                    <span className="font-bold text-2xl text-primary">Your Digital Storefront</span>
                    <span className="text-muted-foreground text-lg text-center max-w-[260px]">Showcase, sell, and deliver any digital product instantly.</span>
                  </div>
                  {/* Bottom floating cards */}
                  <div className="flex gap-4">
                    <div className="relative bg-background border-2 border-green-500 shadow-lg rounded-xl px-2 py-1 h-10 flex items-center gap-3 animate-float">
                      <Film className="h-6 w-6 text-primary" />
                      <span className="font-medium text-lg text-primary">Course</span>
                    </div>
                    <div className="relative bg-background border-2 border-green-500 shadow-lg rounded-xl px-2 py-1 flex items-center gap-3 animate-float-reverse">
                      <Ticket className="h-6 w-6 text-primary" />
                      <span className="font-medium text-lg text-primary">Ticket</span>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Product Categories Grid */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <AnimateOnScroll variants={fadeInUp} className="text-center max-w-[800px] mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Trade Digital Assets Securely</h2>
              <p className="text-lg text-muted-foreground">Buy and sell with confidence using crypto or traditional payments</p>
            </AnimateOnScroll>
            <AnimateStagger className="grid md:grid-cols-5 gap-6">
              {[
                {
                  title: "Ebooks & Guides",
                  description: "Digital books, PDFs, and reading materials",
                  icon: Book,
                  href: "/dashboard/sell/ebooks"
                },
                {
                  title: "Design Assets",
                  description: "Templates, graphics, and UI kits",
                  icon: Palette,
                  href: "/dashboard/sell/design"
                },
                {
                  title: "Video Courses",
                  description: "Educational content and tutorials",
                  icon: Film,
                  href: "/dashboard/sell/courses"
                },
                {
                  title: "Digital Bundles",
                  description: "Packaged resources and collections",
                  icon: Package,
                  href: "/dashboard/sell/bundles"
                },
                {
                  title: "Event Tickets",
                  description: "Digital tickets for virtual/physical events and webinars",
                  icon: Ticket,
                  href: "/dashboard/sell/tickets"
                }
              ].map((category) => (
                <StaggerItem key={category.title}>
                  <Link href={category.href}>
                    <Card className="group relative overflow-hidden border-2 border-muted h-full transition-all hover:border-primary/50 hover:shadow-lg">
                      <CardContent className="p-6">
                        <category.icon className="h-12 w-12 text-primary mb-4" />
                        <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                        <ArrowRight className="h-5 w-5 text-primary absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </CardContent>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </AnimateStagger>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <AnimateOnScroll variants={fadeInUp} className="text-center max-w-[800px] mx-auto mb-12">
              <h2 className="text-3xl font-bold mb-4">Trade with Confidence</h2>
              <p className="text-lg text-muted-foreground">Advanced features for secure digital commerce</p>
            </AnimateOnScroll>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Image - Now on the left */}
              <AnimateOnScroll variants={fadeInLeft} className="relative">
                <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center">
                  <Image
                    src="/trade.svg"
                    alt="Features illustration"
                    className="object-cover"
                    priority
                    width={498}
                    height={418}
                  />
                  {/* Optional overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent" />
                </div>
              </AnimateOnScroll>

              {/* Cards Grid - Now on the right */}
              <AnimateStagger className="grid sm:grid-cols-2 gap-6">
                {[
                  {
                    title: "Instant Delivery",
                    description: "Automated delivery system for instant downloads",
                    icon: Download
                  },
                  {
                    title: "Flexible Payments",
                    description: "Multi-currency pricing & various payment methods",
                    icon: CreditCard
                  },
                  {
                    title: "Subscription Models",
                    description: "One-time or recurring payment options",
                    icon: Users
                  },
                  {
                    title: "Content Protection",
                    description: "Built-in DRM and secure content delivery",
                    icon: Lock
                  }
                ].map((feature) => (
                  <StaggerItem key={feature.title}>
                    <Card className="border-2 border-muted h-full hover:border-primary/50 transition-colors">
                      <CardContent className="p-6">
                        <feature.icon className="h-8 w-8 text-primary mb-4" />
                        <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </AnimateStagger>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <AnimateOnScroll variants={fadeIn} className="py-12 bg-muted/50">
          <div className="container px-4 md:px-6">
            <AnimateStagger className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <StaggerItem className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold text-primary">10k+</h3>
                <p className="text-sm md:text-base text-muted-foreground">Verified Accounts</p>
              </StaggerItem>
              <StaggerItem className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold text-primary">$5M+</h3>
                <p className="text-sm md:text-base text-muted-foreground">Transaction Volume</p>
              </StaggerItem>
              <StaggerItem className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold text-primary">15k+</h3>
                <p className="text-sm md:text-base text-muted-foreground">Happy Users</p>
              </StaggerItem>
              <StaggerItem className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold text-primary">99%</h3>
                <p className="text-sm md:text-base text-muted-foreground">Success Rate</p>
              </StaggerItem>
            </AnimateStagger>
          </div>
        </AnimateOnScroll>

        {/* How TradeVero Works - Stepper Style */}
        <AnimateOnScroll variants={fadeInUp} className="py-24 bg-gradient-to-b from-muted to-background">
          <section className="py-24 bg-gradient-to-b from-muted to-background">
            <div className="container px-4 md:px-6">
              <div className="text-center max-w-[800px] mx-auto mb-12">
                <h2 className="text-3xl font-bold mb-4">How TradeVero Works</h2>
                <p className="text-muted-foreground text-lg">
                  TradeVero is your global marketplace for digital products and services. Buy or sell instantly with crypto and fast payments—secure, seamless, and built for creators and entrepreneurs.
                </p>
              </div>

              {/* Stepper */}
              <div className="flex flex-col items-center">
                <div
                  className="
                  w-full
                  flex
                  flex-row
                  justify-start
                  md:justify-center
                  gap-2 md:gap-4
                  overflow-x-auto
                  pb-4
                  snap-x snap-mandatory
                  scrollbar-thin scrollbar-thumb-transparent
                "
                  style={{
                    WebkitOverflowScrolling: "touch",
                    msOverflowStyle: "none",
                    scrollbarWidth: "none"
                  }}
                >
                  {howItWorksSteps.map((step, idx) => (
                    <button
                      key={step.title}
                      onClick={() => setActiveStep(idx)}
                      className={`
                      flex flex-col items-center
                      px-3 py-4 md:px-4 md:py-6
                      rounded-lg min-w-[100px] md:min-w-[120px]
                      transition border-2
                      ${activeStep === idx
                          ? "bg-primary/10 border-primary text-primary shadow-lg"
                          : "bg-muted border-transparent text-muted-foreground hover:bg-primary/5"}
                      focus:outline-none
                      snap-center
                    `}
                      style={{ position: "relative" }}
                    >
                      <step.icon className={`h-7 w-7 md:h-8 md:w-8 mb-1 md:mb-2 ${activeStep === idx ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium text-xs md:text-sm text-center leading-tight">{step.title}</span>
                      {activeStep === idx && (
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 md:w-3 md:h-3 bg-primary rounded-full shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* On mobile, image on top, text below */}
                <div className="order-1 md:order-2 flex justify-center">
                  <div className="w-full max-w-[220px] sm:max-w-xs md:max-w-md aspect-square bg-muted/50 rounded-2xl flex items-center justify-center shadow-lg">
                    <Image
                      src={howItWorksSteps[activeStep].image}
                      alt={howItWorksSteps[activeStep].title}
                      width={400}
                      height={400}
                      className="object-contain p-4 sm:p-6"
                      priority
                    />
                  </div>
                </div>
                <div className="order-2 md:order-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{howItWorksSteps[activeStep].title}</h3>
                  <p className="mb-6 text-muted-foreground text-sm md:text-base">{howItWorksSteps[activeStep].description}</p>
                  <Button asChild>
                    <Link href="/how-it-works">Learn More</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </AnimateOnScroll>

        {/* Why Choose Us Section - Updated with background illustration */}
        <section className="relative py-24 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 w-full h-full">
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
              <Image
                src="/playstore.svg"
                alt="Security pattern"
                width={400}
                height={800}
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-1/3 h-full opacity-10">
              <Image
                src="/ads.svg"
                alt="Technology pattern"
                width={200}
                height={400}
                className="object-cover"
              />
            </div>
          </div>

          <div className="container px-4 md:px-6 relative">
            <AnimateOnScroll variants={fadeInUp} className="text-center max-w-[800px] mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose TradeVero</h2>
              <p className="text-muted-foreground text-lg">Industry-leading security and support for safe trading</p>
            </AnimateOnScroll>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              {/* Left side - Feature Image */}
              <AnimateOnScroll variants={fadeInLeft} className="relative hidden lg:block">
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src="/megaphone.svg"
                    alt="Security features illustration"
                    fill
                    className="object-contain p-8"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
            </div>
              </AnimateOnScroll>

              {/* Right side - Features Grid */}
              <AnimateStagger className="grid gap-6">
              {[
                {
                  title: "Instant Verification",
                    description: "Advanced AI system verifies accounts instantly for quality and authenticity",
                  icon: Zap
                },
                {
                  title: "Secure Escrow",
                    description: "Your money is protected until transfer is complete with our bulletproof escrow system",
                  icon: Shield
                },
                {
                  title: "24/7 Support",
                    description: "Expert team ready to help anytime with account transfers and verification",
                  icon: HeadphonesIcon
                }
              ].map((feature) => (
                  <StaggerItem key={feature.title}>
                    <Card className="border-2 border-muted hover:border-primary/50 transition-all">
                      <CardContent className="p-6 flex items-start gap-4">
                        <div className="shrink-0">
                          <feature.icon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </AnimateStagger>
            </div>
          </div>
        </section>

        {/* Enhanced Creator Success Stories Section */}
        <section className="py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Compelling Copy */}
              <AnimateOnScroll variants={fadeInLeft} className="space-y-8">
                <div className="inline-flex items-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  <Users className="mr-2 h-4 w-4" />
                  Success Stories
                </div>
                <h2 className="text-4xl font-bold tracking-tight">
                  Join Our Community of{" "}
                  <span className="text-primary">Successful Creators</span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Discover how creators like you are building thriving businesses on TradeVero.
                  Our platform has helped thousands of digital creators earn more while doing what they love.
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
              </AnimateOnScroll>

              {/* Right side - Testimonial Carousel - Updated Structure */}
              <div className="relative">
                <AnimateStagger className="relative">
                  {/* Testimonial Cards Container */}
                  <div className="relative h-[450px] mb-6"> {/* Reduced margin bottom */}
                    {[
                      {
                        quote: "My design template business grew 300% since joining TradeVero. The platform handles everything while I create.",
                        name: "Emma Chen",
                        role: "UI Designer",
                        revenue: "$50K+ Monthly",
                        initials: "EC"
                      },
                      {
                        quote: "Selling my programming courses here was the best decision. The course hosting features are incredible.",
                        name: "David Kumar",
                        role: "Tech Educator",
                        revenue: "$75K+ Monthly",
                        initials: "DK"
                      },
                      {
                        quote: "From ebooks to resource bundles, I've built a 6-figure business on TradeVero in just 8 months.",
                        name: "Sarah Miller",
                        role: "Content Creator",
                        revenue: "$100K+ Monthly",
                        initials: "SM"
                      }
                    ].map((testimonial, index) => (
                      <div
                        key={testimonial.name}
                        className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-all duration-500 transform ${index === activeIndex ? 'opacity-100 translate-x-0' :
                          index < activeIndex ? 'opacity-0 -translate-x-full' :
                            'opacity-0 translate-x-full'
                          }`}
                        style={{
                          pointerEvents: index === activeIndex ? 'auto' : 'none',
                          zIndex: index === activeIndex ? 1 : 0
                        }}
                      >
                        <Card className="bg-background border-2 border-muted hover:border-primary/50 transition-all duration-300">
                          <CardContent className="p-8">
                            {/* Rating Stars */}
                            <div className="flex items-center mb-6 text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                              ))}
                            </div>

                            {/* Quote */}
                            <p className="text-lg mb-8 italic text-muted-foreground leading-relaxed">
                              "{testimonial.quote}"
                            </p>

                            {/* Author Info */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                  {testimonial.initials}
                                </div>
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

                  {/* Navigation Controls - Repositioned */}
                  <div className="flex flex-col items-center gap-4"> {/* Changed to column layout */}
                    {/* Pagination Dots */}
                    <div className="flex gap-2 justify-center mb-4">
                      {[0, 1, 2].map((index) => (
                        <button
                          key={index}
                          onClick={() => setActiveIndex(index)}
                          className={`transition-all duration-300 ${index === activeIndex
                            ? 'w-8 h-2 bg-primary rounded-full'
                            : 'w-2 h-2 bg-primary/20 rounded-full hover:bg-primary/40'
                            }`}
                          aria-label={`Go to testimonial ${index + 1}`}
                        />
                      ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setActiveIndex((prev) => (prev > 0 ? prev - 1 : 2));
                        }}
                        className="h-9 w-9 rounded-full hover:bg-primary/10"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setActiveIndex((prev) => (prev < 2 ? prev + 1 : 0));
                        }}
                        className="h-9 w-9 rounded-full hover:bg-primary/10"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AnimateStagger>
              </div>
            </div>
          </div>
        </section>

        {/* Updated CTA Section with split design */}
        <section className="relative py-24 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />

          <div className="container px-4 md:px-6 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Content */}
              <AnimateOnScroll variants={fadeInLeft} className="relative">
                <div className="max-w-[540px]">
                  <h2 className="text-4xl font-bold mb-6">Ready to Share Your Digital Creations?</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Join thousands of successful creators who trust TradeVero to sell their digital products. Start your journey today.
                  </p>
                  <div className="space-y-4">
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
                  <div className="mt-10 flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      <Link href="/signup">Start Selling Digital</Link>
                    </Button>
                    <Button size="lg" variant="outline">
                      <Link href="/pricing">View Pricing</Link>
                    </Button>
                  </div>
                </div>
              </AnimateOnScroll>

              {/* Right side - Feature Image */}
              <AnimateOnScroll variants={fadeInRight} className="relative hidden lg:block">
                <div className="relative aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src="/creator-dashboard.svg"
                    alt="Creator dashboard preview"
                    fill
                    className="object-contain p-4"
                  />
                  {/* Floating elements for visual interest */}
                  <div className="absolute top-1/4 right-1/4 bg-primary/10 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Growing Sales</span>
                    </div>
                  </div>
                  <div className="absolute bottom-1/4 left-1/4 bg-background/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Happy Customers</span>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

