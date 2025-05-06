import Image from "next/image"
import Link from "next/link"
import { Button } from "@/app/components/button"
import { Card, CardContent } from "@/app/components/card"
import { 
  ShieldCheck, 
  Award, 
  Zap, 
  Users, 
  ArrowRight, 
  Lock, 
  Globe 
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

export const metadata = {
  title: "About Us | TradeVero",
  description: "Learn about TradeVero's mission, values, and the team behind the most secure digital product marketplace."
}

export default function AboutPage() {
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
                About TradeVero
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
                Empowering Digital <span className="text-primary">Creators</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                We're building the world's most powerful platform for selling digital products, from ebooks and courses to design assets and event tickets.
              </p>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <AnimateOnScroll variants={fadeInLeft} className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-3xl -z-10" />
                <Image
                  src="/hero.svg"
                  alt="Our story"
                  width={600}
                  height={450}
                  className="rounded-xl"
                />
              </AnimateOnScroll>
              <AnimateOnScroll variants={fadeInRight}>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <p className="text-muted-foreground mb-4">
                  TradeVero was founded in 2022 by a team of digital creators and tech innovators who saw a gap in the market: the need for a comprehensive platform where creators could sell any type of digital product with powerful tools and complete security.
                </p>
                <p className="text-muted-foreground mb-4">
                  We noticed that creators were using multiple platforms to sell different types of content, dealing with complex payment systems, and struggling with content delivery. The market needed a unified solution.
                </p>
                <p className="text-muted-foreground mb-6">
                  That's why we created TradeVero - an all-in-one platform with advanced features for content protection, automated delivery, and flexible payment options that help creators focus on what they do best: creating.
                </p>
                <AnimateStagger className="flex flex-wrap gap-4">
                  <StaggerItem className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-medium">Since 2022</span>
                  </StaggerItem>
                  <StaggerItem className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">50,000+ Creators</span>
                  </StaggerItem>
                  <StaggerItem className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <span className="font-medium">Global Reach</span>
                  </StaggerItem>
                </AnimateStagger>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Our Mission & Values */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4 md:px-6">
            <AnimateOnScroll variants={fadeInUp} className="mb-16">
              <h2 className="text-3xl font-bold text-center">Our Mission & Values</h2>
            </AnimateOnScroll>
            <AnimateStagger className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Creator Success",
                  description: "We're dedicated to helping creators monetize their digital content effectively with powerful tools and insights for growth.",
                  icon: Lock
                },
                {
                  title: "Innovation",
                  description: "We continuously evolve our platform with cutting-edge features to support new content formats and creator needs.",
                  icon: Zap
                },
                {
                  title: "Community Growth",
                  description: "We're fostering a thriving ecosystem where creators can connect, collaborate, and scale their digital businesses.",
                  icon: Users
                }
              ].map((value, index) => (
                <StaggerItem key={value.title}>
                  <Card className="bg-background border-2 border-muted h-full">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </AnimateStagger>
          </div>
        </section>

        {/* Stats Section */}
        <AnimateOnScroll variants={fadeIn} className="py-20 bg-gradient-to-b from-muted to-background">
          <div className="container px-4 md:px-6">
            <AnimateStagger className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <StaggerItem className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold text-primary">50k+</h3>
                <p className="text-sm md:text-base text-muted-foreground">Active Creators</p>
              </StaggerItem>
              <StaggerItem className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold text-primary">$10M+</h3>
                <p className="text-sm md:text-base text-muted-foreground">Creator Earnings</p>
              </StaggerItem>
              <StaggerItem className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold text-primary">100k+</h3>
                <p className="text-sm md:text-base text-muted-foreground">Products Sold</p>
              </StaggerItem>
              <StaggerItem className="space-y-2">
                <h3 className="text-3xl md:text-4xl font-bold text-primary">99%</h3>
                <p className="text-sm md:text-base text-muted-foreground">Delivery Success</p>
              </StaggerItem>
            </AnimateStagger>
          </div>
        </AnimateOnScroll>

        {/* CTA Section */}
        <AnimateOnScroll variants={zoomIn} className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-[800px] mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Start Your Creator Journey</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of creators selling digital products and building successful online businesses
              </p>
              <AnimateStagger className="flex flex-col sm:flex-row justify-center gap-4">
                <StaggerItem>
                  <Button size="lg" asChild>
                    <Link href="/signup">Start Selling Digital</Link>
                  </Button>
                </StaggerItem>
                <StaggerItem>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/how-it-works">Learn How It Works</Link>
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