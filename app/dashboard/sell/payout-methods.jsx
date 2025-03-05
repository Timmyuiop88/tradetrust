"use client"

import { useState } from "react"
import { PAYMENT_METHODS } from "../../lib/seeds/payment-methods"
import { Input } from "../../components/input"
import { Button } from "../../components/button"
import { Wallet, Plus } from "lucide-react"

export function PayoutMethods() {
  const [payoutMethods, setPayoutMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Payout Methods</h2>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Method
        </Button>
      </div>

      {payoutMethods.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No payout methods</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a payout method to receive payments for your sales
          </p>
          <Button className="mt-4">
            Add Your First Method
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* List of added payout methods */}
        </div>
      )}
    </div>
  )
} 