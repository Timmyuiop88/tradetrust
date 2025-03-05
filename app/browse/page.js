import { Card, CardContent, CardHeader, CardTitle } from "../components/card"
import { Button } from "../components/button"
import { 
  Instagram, 
  Twitter, 
  Video, 
  CheckCircle,
  Filter,
  Search,
} from "lucide-react"
import { FeaturedAccountCard } from "../components/featured-account-card"

const DEMO_ACCOUNTS = [
  {
    id: 1,
    platform: "Instagram",
    followers: "1.2M",
    engagement: "5.8%",
    price: "4,999",
    verified: true,
    icon: Instagram,
    category: "Entertainment",
    age: "4 years",
    posts: "2.4K"
  },
  {
    id: 2,
    platform: "TikTok",
    followers: "850K",
    engagement: "7.2%",
    price: "3,499",
    verified: true,
    icon: Video,
    category: "Fashion",
    age: "2 years",
    posts: "500"
  },
  {
    id: 3,
    platform: "Twitter",
    followers: "500K",
    engagement: "4.5%",
    price: "2,999",
    verified: true,
    icon: Twitter,
    category: "Tech",
    age: "5 years",
    posts: "15K"
  },
  // Add more demo accounts...
]

export default function BrowsePage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Browse Accounts</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search accounts..."
              className="pl-10 pr-4 py-2 rounded-md border bg-background"
            />
          </div>
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_ACCOUNTS.map((account) => (
          <FeaturedAccountCard key={account.id} {...account} />
        ))}
      </div>
    </div>
  )
} 