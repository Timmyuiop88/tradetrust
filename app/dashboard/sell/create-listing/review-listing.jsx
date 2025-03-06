"use client"

import { CheckCircle, AlertCircle } from "lucide-react"
import { usePlatforms } from "../../../hooks/usePlatforms"
import { useCategories } from "../../../hooks/useCategories"

// Format numbers for display
const formatFollowers = (value) => {
  if (!value) return "Not specified";
  const num = parseInt(value);
  if (isNaN(num)) return value;
  
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toLocaleString();
};

// Format percentages for display
const formatEngagement = (value) => {
  if (!value) return "Not specified";
  const num = parseFloat(value);
  return isNaN(num) ? value : num.toFixed(1) + "%";
};

export function ReviewListing({ data }) {
  const { data: platforms } = usePlatforms()
  const { data: categories } = useCategories()
  
  // Find platform and category names
  const platformName = platforms?.find(p => p.id === data.platform)?.name || data.platform
  const categoryName = categories?.find(c => c.id === data.category)?.name || data.category
  
  // Check if all required fields are filled
  const isComplete = 
    data.platform && 
    data.category && 
    data.followers && 
    data.description && 
    data.media.length > 0 && 
    data.price && 
    data.transferMethod
  
  // Format price with commas
  const formattedPrice = data.price 
    ? parseFloat(data.price).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })
    : '$0.00'

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Review Your Listing</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Please review your listing details before creating it.
        </p>
      </div>
      
      {!isComplete && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Some information is missing</p>
            <p className="text-sm mt-1">Please go back and complete all required fields.</p>
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-6">
        {/* Account Details */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Account Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Platform</p>
              <p className="font-medium capitalize">{platformName || "Not specified"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
              <p className="font-medium">{categoryName || "Not specified"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
              <p className="font-medium">{formatFollowers(data.followers)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Engagement</p>
              <p className="font-medium">{formatEngagement(data.engagement)}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
            <p className="text-sm mt-1">{data.description || "No description provided"}</p>
          </div>
        </div>
        
        {/* Media */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Media</h4>
          {data.media.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {data.media.slice(0, 4).map((item, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ))}
              {data.media.length > 4 && (
                <div className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium">+{data.media.length - 4} more</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-500">No media uploaded</p>
          )}
        </div>
        
        {/* Pricing */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Pricing & Transfer</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
              <p className="font-medium text-lg text-primary">{formattedPrice}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Transfer Method</p>
              <p className="font-medium">
                {data.transferMethod === "email_password" ? "Email & Password Change" :
                 data.transferMethod === "full_account" ? "Full Account Takeover" :
                 data.transferMethod === "api_transfer" ? "API-Based Transfer" :
                 "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {isComplete && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg flex items-start gap-2">
          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Your listing is ready to publish</p>
            <p className="text-sm mt-1">Click "Create Listing" to make it live on the marketplace.</p>
          </div>
        </div>
      )}
    </div>
  )
} 