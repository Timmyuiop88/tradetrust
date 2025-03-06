"use client"

import { Input } from "../../../components/input"
import { Select } from "../../../components/select"
import { Textarea } from "../../../components/textarea"
import { usePlatforms } from "../../../hooks/usePlatforms"
import { useCategories } from "../../../hooks/useCategories"
import { Loader } from "lucide-react"
import { useState, useEffect } from "react"

// Helper function to convert human-readable numbers to integers
const parseFollowers = (value) => {
  if (!value) return "";
  
  // Remove all non-numeric characters
  const parsed = value.replace(/[^\d]/g, "");
  return parsed ? parseInt(parsed) : "";
};

// Helper function to convert human-readable percentages to floats
const parseEngagement = (value) => {
  if (!value) return "";
  
  // Remove all non-numeric characters except decimal point
  const parsed = value.replace(/[^\d.]/g, "");
  return parsed ? parseFloat(parsed) : "";
};

// Format numbers for display
const formatFollowers = (value) => {
  if (!value) return "";
  const num = parseInt(value);
  if (isNaN(num)) return "";
  
  return num.toLocaleString();
};

// Format percentages for display
const formatEngagement = (value) => {
  if (!value) return "";
  const num = parseFloat(value);
  return isNaN(num) ? "" : num.toFixed(1);
};

export function AccountDetails({ data, onUpdate }) {
  const { data: platforms, isLoading: platformsLoading } = usePlatforms()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  
  // Handle followers input change
  const handleFollowersChange = (e) => {
    const rawValue = e.target.value;
    // Only allow digits
    const numericValue = rawValue.replace(/[^\d]/g, "");
    
    if (numericValue) {
      // Store the raw number in the form data
      onUpdate({ followers: parseInt(numericValue) });
    } else {
      onUpdate({ followers: "" });
    }
  };
  
  // Handle engagement input change
  const handleEngagementChange = (e) => {
    const rawValue = e.target.value;
    // Only allow digits and one decimal point
    const numericValue = rawValue.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
    
    if (numericValue) {
      // Store the raw number in the form data
      onUpdate({ engagement: parseFloat(numericValue) });
    } else {
      onUpdate({ engagement: "" });
    }
  };

  const platformOptions = platforms?.map(platform => ({
    value: platform.id,
    label: platform.name
  })) || []

  const categoryOptions = categories?.map(category => ({
    value: category.id,
    label: category.name
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Account Details</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Provide basic information about the account you're selling.
        </p>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Platform</label>
        {platformsLoading ? (
          <div className="flex items-center space-x-2 h-10 px-3 border border-gray-300 dark:border-gray-700 rounded-md">
            <Loader className="h-4 w-4 animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">Loading platforms...</span>
          </div>
        ) : (
          <Select
            value={data.platform}
            onChange={(value) => onUpdate({ platform: value })}
            options={platformOptions}
            placeholder="Select a platform"
          />
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        {categoriesLoading ? (
          <div className="flex items-center space-x-2 h-10 px-3 border border-gray-300 dark:border-gray-700 rounded-md">
            <Loader className="h-4 w-4 animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">Loading categories...</span>
          </div>
        ) : (
          <Select
            value={data.category}
            onChange={(value) => onUpdate({ category: value })}
            options={categoryOptions}
            placeholder="Select a category"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Followers</label>
          <Input 
            type="text"
            value={data.followers ? data.followers.toLocaleString() : ""}
            onChange={handleFollowersChange}
            placeholder="e.g. 100000"
            inputMode="numeric"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the exact number (e.g., 100000)
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Engagement Rate (%)</label>
          <Input 
            type="text"
            value={data.engagement || ""}
            onChange={handleEngagementChange}
            placeholder="e.g. 4.5"
            inputMode="decimal"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter as a number (e.g., 4.5)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Describe your account, its niche, content type, audience demographics, and any unique selling points..."
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          Be detailed but concise. Highlight what makes this account valuable to potential buyers.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Username</label>
          <Input 
            type="text"
            value={data.username || ""}
            onChange={(e) => onUpdate({ username: e.target.value })}
            placeholder="e.g. fashionista123"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Account Age (months)</label>
          <Input 
            type="number"
            value={data.accountAge || ""}
            onChange={(e) => onUpdate({ accountAge: parseInt(e.target.value) })}
            placeholder="e.g. 24"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <label className="text-sm font-medium">Number of Posts</label>
        <Input 
          type="number"
          value={data.posts || ""}
          onChange={(e) => onUpdate({ posts: parseInt(e.target.value) })}
          placeholder="e.g. 150"
          min="0"
        />
      </div>
    </div>
  )
} 