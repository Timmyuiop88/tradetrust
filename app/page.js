import Image from "next/image"
import Link from "next/link"
import { Button } from "./components/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/card"
import { 
  ArrowRight, 
  Lock, 
  Zap, 
  Shield, 
  CheckCircle, 
  ShieldCheck,
  Instagram,
  Twitter,
  Video,
  HeadphonesIcon,
  Users,
  Award,
  Banknote,
  ExternalLink,
  ArrowUpRight
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

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted py-24 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16 xl:grid-cols-[1fr_600px]">
              <AnimateOnScroll variants={fadeInLeft} className="flex flex-col justify-center space-y-8">
                <div className="space-y-8">
                  <AnimateOnScroll variants={fadeInUp} delay={0.2} className="inline-flex items-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <Zap className="mr-2 h-4 w-4" />
                    Start Trading in Minutes • 100% Free
                  </AnimateOnScroll>
                  <AnimateOnScroll variants={fadeInUp} delay={0.3}>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    Buy & Sell <span className="text-primary">Social Media</span> Accounts Safely
                  </h1>
                  </AnimateOnScroll>
                  <AnimateOnScroll variants={fadeInUp} delay={0.4}>
                  <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                    Turn your social media influence into cash. Buy verified accounts or sell yours through our secure escrow platform.
                  </p>
                  </AnimateOnScroll>
                  <AnimateOnScroll variants={fadeInUp} delay={0.5}>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <Button size="lg" className="bg-primary hover:bg-primary/90">
                        <Link href="/dashboard">Start Trading</Link>
                    </Button>
                    <Button size="lg" variant="outline">
                      <Link href="/how-it-works">See How It Works</Link>
                    </Button>
                  </div>
                  </AnimateOnScroll>
                  <AnimateStagger className="flex flex-wrap items-center gap-y-4 gap-x-8 pt-4">
                    <StaggerItem className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm">Identity Verified</span>
                    </StaggerItem>
                    <StaggerItem className="flex items-center space-x-2">
                      <Lock className="h-5 w-5 text-primary" />
                      <span className="text-sm">Secure Escrow</span>
                    </StaggerItem>
                    <StaggerItem className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="text-sm">Instant Transfer</span>
                    </StaggerItem>
                  </AnimateStagger>
                </div>
              </AnimateOnScroll>
              <AnimateOnScroll variants={fadeInRight} delay={0.4} className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-3xl" />
                <Image
                  src="/hero.svg"
                  alt="Social Media Trading Platform"
                  width={600}
                  height={400}
                  className="relative z-10"
                  priority
                />
              </AnimateOnScroll>
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

        {/* How It Works Section */}
        <section className="py-24 bg-gradient-to-b from-muted to-background">
          <div className="container px-4 md:px-6">
            <AnimateOnScroll variants={fadeInUp} className="text-center max-w-[800px] mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">How TrustTrade Works</h2>
              <p className="text-muted-foreground text-lg">Our escrow platform makes trading social media accounts simple and secure</p>
            </AnimateOnScroll>
            <AnimateStagger className="grid md:grid-cols-3 gap-8">
              <StaggerItem>
                <Card className="relative overflow-hidden border-2 border-muted h-full">
                  <span className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">Step 1</span>
                  <CardHeader className="pt-8">
                    <Users className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>Register & Verify</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Create an account and complete our quick verification process to start buying or selling accounts.</p>
                  </CardContent>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="relative overflow-hidden border-2 border-muted h-full">
                  <span className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">Step 2</span>
                  <CardHeader className="pt-8">
                    <Lock className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>Secure Escrow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Buyer funds are held securely in escrow until the account transfer is verified and complete.</p>
                  </CardContent>
                </Card>
              </StaggerItem>
              <StaggerItem>
                <Card className="relative overflow-hidden border-2 border-muted h-full">
                  <span className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">Step 3</span>
                  <CardHeader className="pt-8">
                    <Banknote className="h-12 w-12 text-primary mb-4" />
                    <CardTitle>Safe Transfer</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Once the transfer is confirmed, the seller receives payment and buyer gets full account access.</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            </AnimateStagger>
            <AnimateOnScroll variants={fadeInUp} delay={0.4} className="text-center mt-12">
              <Button asChild>
                <Link href="/how-it-works" className="inline-flex items-center">
                  Learn More 
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24">
          <div className="container px-4 md:px-6">
            <AnimateOnScroll variants={fadeInUp} className="text-center max-w-[800px] mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose TrustTrade</h2>
              <p className="text-muted-foreground text-lg">Industry-leading security and support for safe trading</p>
            </AnimateOnScroll>
            <AnimateStagger className="grid md:grid-cols-3 gap-8">
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
              ].map((feature, index) => (
                <StaggerItem key={feature.title}>
                  <Card className="text-center p-6 h-full">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
                </StaggerItem>
              ))}
            </AnimateStagger>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <AnimateOnScroll variants={fadeInUp} className="text-center max-w-[800px] mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
              <p className="text-muted-foreground text-lg">Join thousands of satisfied users trading on our platform</p>
            </AnimateOnScroll>
            <AnimateStagger className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Sold my Instagram account in just 3 days. The escrow system made me feel completely safe throughout the process.",
                  name: "John D.",
                  role: "Seller",
                  initials: "JD"
                },
                {
                  quote: "Bought a Twitter account with 500K followers. The verification process ensured I got exactly what was advertised.",
                  name: "Sarah M.",
                  role: "Buyer",
                  initials: "SM"
                },
                {
                  quote: "The support team helped me through every step of selling my TikTok account. Best decision I've made this year!",
                  name: "Alex R.",
                  role: "Seller",
                  initials: "AR"
                }
              ].map((testimonial, index) => (
                <StaggerItem key={index}>
                  <Card className="bg-background border-2 border-muted h-full">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-4 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <p className="mb-4 italic text-muted-foreground">{`"${testimonial.quote}"`}</p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                          {testimonial.initials}
                        </div>
                        <div className="ml-3">
                          <h4 className="font-semibold">{testimonial.name}</h4>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
            </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </AnimateStagger>
          </div>
        </section>

        {/* CTA Section */}
        <AnimateOnScroll variants={zoomIn} className="py-24 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-[800px] mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
              <p className="text-lg text-muted-foreground mb-8">Join thousands of users buying and selling social media accounts safely on our platform</p>
              <AnimateStagger className="flex flex-col sm:flex-row justify-center gap-4">
                <StaggerItem>
                  <Button size="lg" asChild>
                    <Link href="/signup">Create Account</Link>
                  </Button>
                </StaggerItem>
                <StaggerItem>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/dashboard">Browse Accounts</Link>
                  </Button>
                </StaggerItem>
              </AnimateStagger>
            </div>
          </div>
        </AnimateOnScroll>
      </main>
      <Footer />
    </div>
  )
}

