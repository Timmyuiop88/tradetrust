"use client"

import { Button } from "./button"
import { Input } from "./input"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "./sheet"
import { Plus } from "lucide-react"

export function AddBalanceSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Plus className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="max-w-md mx-auto">
        <SheetHeader>
          <SheetTitle>Add Balance</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input type="number" placeholder="Enter amount" />
          </div>
          <Button className="w-full">Add Funds</Button>
          <p className="text-xs text-muted-foreground text-center">
            Secure payment processing • Instant deposit
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
} 