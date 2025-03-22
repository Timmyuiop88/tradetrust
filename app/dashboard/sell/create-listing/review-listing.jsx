"use client"

import { CheckCircle, AlertCircle, Calendar, Hash, User, Clock, BarChart, Globe, Link as LinkIcon } from "lucide-react"
import { usePlatforms } from "../../../hooks/usePlatforms"
import { useCategories } from "../../../hooks/useCategories"
import { countries } from "../../../lib/data/countries"

// Helper function to determine if a URL is an image
const isImageUrl = (url) => {
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
  return extensions.some(ext => url.toLowerCase().endsWith(ext))
}

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
  
  // Find platform and category details
  const platform = platforms?.find(p => p.id === data.platform) || { name: data.platform, icon: null }
  const category = categories?.find(c => c.id === data.category) || { name: data.category }
  
  // Find country name if available
  const country = data.accountCountry ? 
    countries.find(c => c.value === data.accountCountry)?.label || data.accountCountry : null
  
  // Check if all required fields are filled
  const isComplete = 
    data.platform && 
    data.category && 
    data.description && 
    data.media.length > 0 && 
    data.price && 
    (category.name !== "Account" || (data.followers && data.engagement))
  
  // Format price with commas
  const formattedPrice = data.price 
    ? parseFloat(data.price).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })
    : '$0.00'

  // Check if this is an account category listing
  const isAccountCategory = category.name === "Account";

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
        {/* Platform & Category */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Listing Type</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Platform</p>
              <div className="flex items-center gap-2 mt-1">
                {platform.icon ? (
                  <div className="relative w-6 h-6 rounded-full overflow-hidden">
                    <img 
                      src={platform.icon} 
                      alt={`${platform.name} icon`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                <p className="font-medium capitalize">{platform.name || "Not specified"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
              <p className="font-medium mt-1">{category.name || "Not specified"}</p>
            </div>
          </div>
        </div>
        
        {/* Links & External Info */}
        {(data.previewLink || country) && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Additional Information</h4>
            <div className="grid grid-cols-2 gap-4">
              {data.previewLink && (
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1 text-blue-500">
                    <LinkIcon className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase">Preview Link</p>
                  </div>
                  <a 
                    href={data.previewLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline break-all"
                  >
                    {data.previewLink}
                  </a>
                </div>
              )}
              
              {country && (
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1 text-violet-500">
                    <Globe className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase">Account Country</p>
                  </div>
                  <p className="font-medium">{country}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Description */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Description</h4>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm whitespace-pre-line">{data.description || "No description provided"}</p>
          </div>
        </div>
        
        {/* Account Details */}
        {isAccountCategory && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Account Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1 text-primary">
                  <User className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase">Followers</p>
                </div>
                <p className="font-medium text-lg">{formatFollowers(data.followers)}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1 text-emerald-500">
                  <BarChart className="h-4 w-4" />
                  <p className="text-xs font-semibold uppercase">Engagement</p>
                </div>
                <p className="font-medium text-lg">{formatEngagement(data.engagement)}</p>
              </div>
              
              {data.accountAge && (
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1 text-amber-500">
                    <Clock className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase">Account Age</p>
                  </div>
                  <p className="font-medium text-lg">{data.accountAge} months</p>
                </div>
              )}
              
              {data.posts && (
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-1 text-blue-500">
                    <Hash className="h-4 w-4" />
                    <p className="text-xs font-semibold uppercase">Posts</p>
                  </div>
                  <p className="font-medium text-lg">{data.posts?.toLocaleString() || "0"}</p>
                </div>
              )}
            </div>
            
            {data.username && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
                <p className="text-sm font-medium mt-1">{data.username}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Media */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Media & Proof</h4>
          {data.media.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {data.media.slice(0, 4).map((url, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {isImageUrl(url) ? (
                    <img 
                      src={url} 
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={url}
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
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Pricing</h4>
          <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Listing Price</p>
            <p className="font-medium text-lg text-primary">{formattedPrice}</p>
            {data.negotiable && (
              <div className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                Price is negotiable
              </div>
            )}
          </div>
        </div>
        
        {/* Credentials Summary - Only show if they exist */}
        {(data.credentials?.email || data.credentials?.username || data.credentials?.serialKey || data.credentials?.transferInstructions) && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Credentials & Transfer</h4>
            <div className="grid grid-cols-2 gap-4 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              {data.credentials?.email && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm break-all">
                    <span className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                      {data.credentials.email}
                    </span>
                  </p>
                </div>
              )}
              
              {data.credentials?.username && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
                  <p className="text-sm break-all">
                    <span className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                      {data.credentials.username}
                    </span>
                  </p>
                </div>
              )}
              
              {data.credentials?.serialKey && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Key/Serial Number</p>
                  <p className="text-sm break-all">
                    <span className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                      {data.credentials.serialKey}
                    </span>
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Password</p>
                <p className="text-sm">
                  {data.credentials?.password ? (
                    <span className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                      ••••••••••
                    </span>
                  ) : "Not provided"}
                </p>
              </div>

              {data.credentials?.transferInstructions && (
                <div className="col-span-2 mt-2 pt-2 border-t">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Transfer Instructions</p>
                  <p className="text-sm mt-1">{data.credentials.transferInstructions}</p>
                </div>
              )}
            </div>
          </div>
        )}
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