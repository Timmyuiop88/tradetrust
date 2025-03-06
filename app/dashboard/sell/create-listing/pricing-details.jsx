"use client"

import { Input } from "../../../components/input"
import { Select } from "../../../components/select"
import { Textarea } from "../../../components/textarea"
import { DollarSign, CreditCard, ArrowRightLeft } from "lucide-react"

export function PricingDetails({ data, onUpdate }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Pricing & Transfer</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Set your price and specify how you'll transfer the account to the buyer.
        </p>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-gray-500" />
          Price (USD)
        </label>
        <Input 
          type="number"
          value={data.price}
          onChange={(e) => onUpdate({ price: e.target.value })}
          placeholder="e.g. 499.99"
          min="0"
          step="0.01"
          className="text-lg"
        />
        <p className="text-xs text-gray-500 mt-1">
          Platform fee: 10% ({data.price ? `$${(parseFloat(data.price) * 0.1).toFixed(2)}` : '$0.00'})
        </p>
        <p className="text-xs text-gray-500">
          You'll receive: {data.price ? `$${(parseFloat(data.price) * 0.9).toFixed(2)}` : '$0.00'}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1">
          <ArrowRightLeft className="h-4 w-4 text-gray-500" />
          Transfer Method
        </label>
        <Select
          value={data.transferMethod}
          onChange={(value) => onUpdate({ transferMethod: value })}
          options={[
            { value: "email_password", label: "Email & Password Change" },
            { value: "full_account", label: "Full Account Takeover" },
            { value: "api_transfer", label: "API-Based Transfer" },
          ]}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1">
          <CreditCard className="h-4 w-4 text-gray-500" />
          Payment Method
        </label>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <p className="text-sm">
            Buyers will pay through our secure payment system. You'll receive funds once the buyer confirms the account transfer is complete.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <img src="/images/payment/visa.svg" alt="Visa" className="h-6" />
            <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-6" />
            <img src="/images/payment/paypal.svg" alt="PayPal" className="h-6" />
            <img src="/images/payment/crypto.svg" alt="Crypto" className="h-6" />
          </div>
        </div>
      </div>
    </div>
  )
} 