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
  description: "Learn about TradeVero's mission, values, and the team behind the most secure social media account marketplace."
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
                Redefining Social Media <span className="text-primary">Account Trading</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                We're building the world's most secure platform for buying and selling social media accounts, protecting both buyers and sellers through our advanced escrow system.
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
                  TradeVero was founded in 2022 by a team of social media experts and security professionals who recognized a major problem in the creator economy: the lack of a safe, reliable way to buy and sell social media accounts.
                </p>
                <p className="text-muted-foreground mb-4">
                  We witnessed too many scams, fraud cases, and failed transfers in the growing market for social media accounts. Buyers were getting accounts that didn't match descriptions, and sellers were not receiving payment after transferring their accounts.
                </p>
                <p className="text-muted-foreground mb-6">
                  That's why we created TradeVero - a secure platform with advanced verification technology and an escrow system that protects both parties throughout the entire transaction process.
                </p>
                <AnimateStagger className="flex flex-wrap gap-4">
                  <StaggerItem className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-medium">Since 2022</span>
                  </StaggerItem>
                  <StaggerItem className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="font-medium">15,000+ Users</span>
                  </StaggerItem>
                  <StaggerItem className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <span className="font-medium">Global Service</span>
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
                  title: "Trust & Security",
                  description: "We believe trust is the foundation of any marketplace. Our platform uses advanced verification and escrow systems to ensure every transaction is secure and transparent.",
                  icon: Lock
                },
                {
                  title: "Innovation",
                  description: "We're constantly improving our platform with new technologies and features to make account trading faster, safer, and more accessible to everyone.",
                  icon: Zap
                },
                {
                  title: "Community First",
                  description: "We're building more than just a marketplace - we're creating a community where creators and buyers can connect, share knowledge, and grow together.",
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

        {/* Our Team */}
        {/*<section className="py-20">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-4">Meet Our Team</h2>
            <p className="text-center text-muted-foreground max-w-[600px] mx-auto mb-16">
              Our diverse team of experts is passionate about creating the safest platform for trading social media accounts
            </p>
            
            {/* Fixed container styling 
            <div className="flex justify-center w-full items-center">
              <AnimateStagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl">
                {[
                  {
                    name: "Alex Johnson",
                    role: "Founder & CEO",
                    image: "/team-placeholder.svg",
                    bio: "Former social media agency founder with 10+ years in the creator economy."
                  },
                  {
                    name: "Sarah Chen",
                    role: "CTO",
                    image: "/team-placeholder.svg",
                    bio: "Security expert with background in fintech and payment systems."
                  }
                ].map((member) => (
                  <StaggerItem key={member.name}>
                    <Card className="bg-background border-2 border-muted overflow-hidden h-full">
                      <div className="aspect-square relative bg-muted">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg">{member.name}</h3>
                        <p className="text-primary text-sm mb-2">{member.role}</p>
                        <p className="text-sm text-muted-foreground">{member.bio}</p>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                ))}
              </AnimateStagger>
            </div>
          </div>
        </section>*/}

        {/* Stats Section */}
        <AnimateOnScroll variants={fadeIn} className="py-20 bg-gradient-to-b from-muted to-background">
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

        {/* CTA Section */}
        <AnimateOnScroll variants={zoomIn} className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-[800px] mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Join the TradeVero Community</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Whether you're looking to buy or sell social media accounts, we're here to make the process safe and easy
              </p>
              <AnimateStagger className="flex flex-col sm:flex-row justify-center gap-4">
                <StaggerItem>
                  <Button size="lg" asChild>
                    <Link href="/signup">Create Account</Link>
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