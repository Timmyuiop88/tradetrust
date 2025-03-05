"use client"

import { Input } from "../../../components/input"
import { Select } from "../../../components/select"
import { Textarea } from "../../../components/textarea"
import { ACCOUNT_CATEGORIES } from "../../../lib/seeds/account-categories"

export function AccountDetails({ data, onUpdate }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Platform</label>
        <Select
          value={data.platform}
          onChange={(value) => onUpdate({ platform: value })}
          options={[
            { value: "instagram", label: "Instagram" },
            { value: "tiktok", label: "TikTok" },
            { value: "twitter", label: "Twitter" },
          ]}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          value={data.category}
          onChange={(value) => onUpdate({ category: value })}
          options={ACCOUNT_CATEGORIES.map(cat => ({
            value: cat.id,
            label: cat.name
          }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Followers</label>
          <Input 
            type="text"
            value={data.followers}
            onChange={(e) => onUpdate({ followers: e.target.value })}
            placeholder="e.g. 100K"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Engagement Rate</label>
          <Input 
            type="text"
            value={data.engagement}
            onChange={(e) => onUpdate({ engagement: e.target.value })}
            placeholder="e.g. 5.8%"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Describe your account..."
          rows={4}
        />
      </div>
    </div>
  )
} 