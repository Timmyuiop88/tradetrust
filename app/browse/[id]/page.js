import { Button } from "../../components/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/card"
import { 
  Instagram, 
  Twitter, 
  Video,
  CheckCircle,
  Users,
  BarChart,
  Calendar,
  MessageSquare,
  Shield,
} from "lucide-react"

const DEMO_ACCOUNT = {
  id: 1,
  platform: "Instagram",
  followers: "1.2M",
  engagement: "5.8%",
  price: "4,999",
  verified: true,
  icon: Instagram,
  category: "Entertainment",
  age: "4 years",
  posts: "2.4K",
  description: "Entertainment niche account with high engagement rate. Perfect for influencer marketing and brand collaborations.",
  stats: {
    avgLikes: "45K",
    avgComments: "1.2K",
    followersGrowth: "+5K/month",
    reachRate: "32%"
  },
  features: [
    "Verified Account",
    "Original Email",
    "No Copyright Strikes",
    "Clean Account History",
    "Instant Transfer"
  ]
}

export default function AccountDetailsPage() {
  return (
    <div className="container py-8">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Instagram className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Instagram Account</CardTitle>
                    <p className="text-muted-foreground">Entertainment Niche</p>
                  </div>
                </div>
                {DEMO_ACCOUNT.verified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verified Account
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Followers</span>
                  <p className="text-2xl font-bold">{DEMO_ACCOUNT.followers}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Engagement</span>
                  <p className="text-2xl font-bold">{DEMO_ACCOUNT.engagement}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Account Age</span>
                  <p className="text-2xl font-bold">{DEMO_ACCOUNT.age}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Total Posts</span>
                  <p className="text-2xl font-bold">{DEMO_ACCOUNT.posts}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Description</h3>
                <p className="text-muted-foreground">{DEMO_ACCOUNT.description}</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Account Features</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNT.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-4xl font-bold">${DEMO_ACCOUNT.price}</p>
                <Button className="w-full">Purchase Now</Button>
                <p className="text-sm text-muted-foreground">
                  Protected by TradeVero Escrow
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Verified Seller</p>
                  <p className="text-sm text-muted-foreground">Member since 2022</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">Contact Seller</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 