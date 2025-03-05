"use client"

import { Button } from "@/app/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/components/card"
import { Plus, ListPlus } from "lucide-react"
import { useRouter } from "next/navigation"

export function SellingInterface() {
  const router = useRouter()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ListPlus className="h-5 w-5 text-primary" />
            <span>Start Selling</span>
          </CardTitle>
          <CardDescription>
            Create a new listing or manage your existing ones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full flex items-center justify-center space-x-2"
            onClick={() => router.push('/dashboard/sell/create-listing')}
          >
            <Plus className="h-4 w-4" />
            <span>Create New Listing</span>
          </Button>
        </CardContent>
      </Card>

      {/* Active Listings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Active Listings</CardTitle>
          <CardDescription>
            Manage and monitor your listed accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* We'll implement the listings grid later */}
          <div className="text-center text-muted-foreground py-8">
            No active listings yet
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 