"use client"

import { Input } from "@/app/components/input"
import { Button } from "@/app/components/button"
import { Info, BarChart, Users, Hash, Clock } from "lucide-react"
import { useState } from "react"

export function AccountMetricsForm({ formData, updateFormData, onComplete }) {
  // Format followers for display
  const formatFollowers = (value) => {
    if (!value) return "";
    const num = parseInt(value);
    if (isNaN(num)) return "";
    
    return num.toLocaleString();
  };
  
  // Format engagement rate for display
  const formatEngagement = (value) => {
    if (!value) return "";
    const num = parseFloat(value);
    return isNaN(num) ? "" : num.toFixed(1);
  };
  
  // Handle followers input change
  const handleFollowersChange = (e) => {
    const rawValue = e.target.value;
    // Only allow digits
    const numericValue = rawValue.replace(/[^\d]/g, "");
    
    if (numericValue) {
      // Store the raw number in the form data
      updateFormData({ followers: parseInt(numericValue) });
    } else {
      updateFormData({ followers: "" });
    }
  };
  
  // Handle engagement input change
  const handleEngagementChange = (e) => {
    const rawValue = e.target.value;
    // Only allow digits and one decimal point
    const numericValue = rawValue.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
    
    if (numericValue) {
      // Store the raw number in the form data
      updateFormData({ engagement: parseFloat(numericValue) });
    } else {
      updateFormData({ engagement: "" });
    }
  };
  
  // Handle other numeric inputs
  const handleNumericChange = (field, e) => {
    const value = e.target.value;
    if (value === "") {
      updateFormData({ [field]: "" });
    } else {
      updateFormData({ [field]: parseInt(value) });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Account Metrics</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Update the numeric metrics that represent your account's performance and value.
        </p>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
          <Info className="h-3.5 w-3.5" />
          <span>Accurate metrics help your listing stand out to potential buyers</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Users className="h-4 w-4 text-primary" />
            Followers / Friends <span className="text-red-500">*</span>
          </label>
          <Input 
            type="text"
            value={formatFollowers(formData.followers)}
            onChange={handleFollowersChange}
            placeholder="e.g. 100000"
            inputMode="numeric"
            className="text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the exact number without commas or periods
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <BarChart className="h-4 w-4 text-emerald-500" />
            Engagement Rate (%) <span className="text-red-500">*</span>
          </label>
          <Input 
            type="text"
            value={formatEngagement(formData.engagement)}
            onChange={handleEngagementChange}
            placeholder="e.g. 4.5"
            inputMode="decimal"
            className="text-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Average percentage of followers who engage with content
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Hash className="h-4 w-4 text-blue-500" />
            Number of Posts <span className="text-xs text-gray-500 ml-1">(Optional)</span>
          </label>
          <Input 
            type="number"
            value={formData.posts || ""}
            onChange={(e) => handleNumericChange('posts', e)}
            placeholder="e.g. 150"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Total number of posts/content pieces on the account
          </p>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Clock className="h-4 w-4 text-amber-500" />
            Account Age (months) <span className="text-xs text-gray-500 ml-1">(Optional)</span>
          </label>
          <Input 
            type="number"
            value={formData.accountAge || ""}
            onChange={(e) => handleNumericChange('accountAge', e)}
            placeholder="e.g. 24"
            min="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            How long the account has been active in months
          </p>
        </div>
      </div>
      
      <div className="pt-4 text-right">
        <Button onClick={onComplete}>
          Continue to Pricing
        </Button>
      </div>
    </div>
  )
} 