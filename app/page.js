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
} from "lucide-react"
import { Header } from "./components/header"
import { Footer } from "./components/footer"
import { FeaturedAccountCard } from "./components/featured-account-card"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted py-24 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-8 animate-fade-up">
                  <div className="inline-flex items-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <Zap className="mr-2 h-4 w-4" />
                    Start Trading in Minutes • 100% Free
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    Buy & Sell <span className="text-primary">Social Media</span> Accounts Safely
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl">
                    Turn your social media influence into cash. Buy verified accounts or sell yours through our secure escrow platform.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                    <Button size="lg" className="bg-primary hover:bg-primary-hover">
                      <Link href="/browse">Start Trading</Link>
                    </Button>
                    <Button size="lg" variant="outline">
                      <Link href="/how-it-works">See How It Works</Link>
                    </Button>
                  </div>
                  <div className="flex items-center space-x-8 pt-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-sm">Identity Verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Lock className="h-5 w-5 text-primary" />
                      <span className="text-sm">Secure Escrow</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <span className="text-sm">Instant Transfer</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-3xl" />
                <Image
                  src="/hero.svg"
                  alt="Social Media Trading Platform"
                  width={600}
                  height={400}
                  className="relative z-10 "
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-[800px] mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Top Trending Accounts</h2>
              <p className="text-muted-foreground text-lg">Premium verified accounts ready for instant transfer</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  platform: "Instagram",
                  followers: "1.2M",
                  engagement: "5.8%",
                  price: "4,999",
                  verified: true,
                  icon: Instagram
                },
                {
                  platform: "TikTok",
                  followers: "850K",
                  engagement: "7.2%",
                  price: "3,499",
                  verified: true,
                  icon: Video
                },
                {
                  platform: "Twitter",
                  followers: "500K",
                  engagement: "4.5%",
                  price: "2,999",
                  verified: true,
                  icon: Twitter
                }
              ].map((account) => (
                <FeaturedAccountCard key={account.platform} {...account} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-gradient-to-b from-muted to-background">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-[800px] mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
              <p className="text-muted-foreground text-lg">Industry-leading security and support for safe trading</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Instant Verification",
                  description: "Advanced AI system verifies accounts instantly",
                  icon: Zap
                },
                {
                  title: "Secure Escrow",
                  description: "Your money is protected until transfer is complete",
                  icon: Shield
                },
                {
                  title: "24/7 Support",
                  description: "Expert team ready to help anytime",
                  icon: HeadphonesIcon
                }
              ].map((feature) => (
                <Card key={feature.title} className="text-center p-6">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

