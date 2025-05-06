"use client"

import { CheckCircle, AlertCircle, Calendar, Hash, User, Clock, BarChart, Globe, Link as LinkIcon } from "lucide-react"
import { usePlatforms } from "@/app/hooks/usePlatforms"
import { useCategories } from "@/app/hooks/useCategories"
import { countries } from "@/app/lib/data/countries"

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

export function AccountReviewForm({ formData, isEdit = false }) {
  const { data: platforms } = usePlatforms()
  const { data: categories } = useCategories()
  
  // Find platform and category details
  const platform = platforms?.find(p => p.id === formData.platformId) || { name: "Unknown Platform", icon: null }
  const category = categories?.find(c => c.id === formData.categoryId) || { name: "Unknown Category" }
  
  // Find country name if available
  const country = formData.accountCountry ? 
    countries.find(c => c.value === formData.accountCountry)?.label || formData.accountCountry : null
  
  // Check if all required fields are filled
  const isComplete = 
    formData.platformId && 
    formData.categoryId && 
    formData.description && 
    formData.mediaProof?.length > 0 && 
    formData.price && 
    (category.name !== "Account" || (formData.followers && formData.engagement))
  
  // Format price with commas
  const formattedPrice = formData.price 
    ? parseFloat(formData.price).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      })
    : '$0.00'

  // Check if this is an account category listing
  const isAccountCategory = category.name === "Account";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Review Your Listing</h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
          Please review your listing details before {isEdit ? "updating" : "creating"} it.
        </p>
      </div>
      
      {!isComplete && (
        <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Some information is missing</p>
            <p className="text-xs sm:text-sm mt-0.5 sm:mt-1">Please go back and complete all required fields.</p>
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Platform & Category */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Listing Type</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Platform</p>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                {platform.icon ? (
                  <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden">
                    <img 
                      src={platform.icon} 
                      alt={`${platform.name} icon`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                <p className="text-sm sm:text-base font-medium capitalize">{platform.name || "Not specified"}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Category</p>
              <p className="text-sm sm:text-base font-medium mt-0.5 sm:mt-1">{category.name || "Not specified"}</p>
            </div>
          </div>
        </div>
        
        {/* Links & External Info */}
        {(formData.previewLink || country) && (
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Additional Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {formData.previewLink && (
                <div className="bg-white dark:bg-gray-900 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 text-blue-500">
                    <LinkIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <p className="text-[10px] sm:text-xs font-semibold uppercase">Preview Link</p>
                  </div>
                  <a 
                    href={formData.previewLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base text-blue-500 hover:underline break-all"
                  >
                    {formData.previewLink}
                  </a>
                </div>
              )}
              
              {country && (
                <div className="bg-white dark:bg-gray-900 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 text-violet-500">
                    <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <p className="text-[10px] sm:text-xs font-semibold uppercase">Account Country</p>
                  </div>
                  <p className="font-medium text-sm sm:text-base">{country}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Description */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Description</h4>
          <div className="bg-white dark:bg-gray-900 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs sm:text-sm whitespace-pre-line">{formData.description || "No description provided"}</p>
          </div>
        </div>
        
        {/* Account Details */}
        {isAccountCategory && (
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Account Metrics</h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="bg-white dark:bg-gray-900 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 text-primary">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <p className="text-[10px] sm:text-xs font-semibold uppercase">Followers</p>
                </div>
                <p className="font-medium text-sm sm:text-lg">{formatFollowers(formData.followers)}</p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 text-emerald-500">
                  <BarChart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <p className="text-[10px] sm:text-xs font-semibold uppercase">Engagement</p>
                </div>
                <p className="font-medium text-sm sm:text-lg">{formatEngagement(formData.engagement)}</p>
              </div>
              
              {formData.accountAge && (
                <div className="bg-white dark:bg-gray-900 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 text-amber-500">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <p className="text-[10px] sm:text-xs font-semibold uppercase">Account Age</p>
                  </div>
                  <p className="font-medium text-sm sm:text-lg">
                    {formData.accountAge} <span className="text-xs sm:text-base">mo</span>
                  </p>
                </div>
              )}
              
              {formData.posts && (
                <div className="bg-white dark:bg-gray-900 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 text-blue-500">
                    <Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <p className="text-[10px] sm:text-xs font-semibold uppercase">Posts</p>
                  </div>
                  <p className="font-medium text-sm sm:text-lg">{formData.posts?.toLocaleString() || "0"}</p>
                </div>
              )}
            </div>
            
            {formData.username && (
              <div className="mt-3 sm:mt-4">
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Username</p>
                <p className="text-xs sm:text-sm font-medium mt-0.5 sm:mt-1">{formData.username}</p>
              </div>
            )}
          </div>
        )}
        
        {/* Media */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Media & Proof</h4>
          {formData.mediaProof?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {formData.mediaProof.slice(0, 4).map((url, index) => (
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
              {formData.mediaProof.length > 4 && (
                <div className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-medium">+{formData.mediaProof.length - 4} more</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-red-500">No media uploaded</p>
          )}
        </div>
        
        {/* Pricing */}
        <div>
          <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Pricing</h4>
          <div className="bg-white dark:bg-gray-900 p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Listing Price</p>
            <p className="font-medium text-base sm:text-lg text-primary">{formattedPrice}</p>
            {formData.negotiable && (
              <div className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                Price is negotiable
              </div>
            )}
          </div>
        </div>
        
        {/* Credentials Summary - Only show if they exist */}
        {(formData.credentials?.email || formData.credentials?.username || formData.credentials?.serialKey || formData.credentials?.transferInstructions) && (
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 sm:mb-3">Credentials & Transfer</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              {formData.credentials?.email && (
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-xs sm:text-sm break-all">
                    <span className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                      {formData.credentials.email}
                    </span>
                  </p>
                </div>
              )}
              
              {formData.credentials?.username && (
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Username</p>
                  <p className="text-xs sm:text-sm break-all">
                    <span className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                      {formData.credentials.username}
                    </span>
                  </p>
                </div>
              )}
              
              {formData.credentials?.serialKey && (
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Key/Serial Number</p>
                  <p className="text-xs sm:text-sm break-all">
                    <span className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                      {formData.credentials.serialKey}
                    </span>
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Password</p>
                <p className="text-xs sm:text-sm">
                  {formData.credentials?.password ? (
                    <span className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                      ••••••••••
                    </span>
                  ) : "Not provided"}
                </p>
              </div>

              {formData.credentials?.transferInstructions && (
                <div className="col-span-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Transfer Instructions</p>
                  <p className="text-xs sm:text-sm mt-0.5 sm:mt-1">{formData.credentials.transferInstructions}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {isComplete ? (
        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg flex items-start gap-2">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Your listing is ready to update</p>
            <p className="text-xs sm:text-sm mt-0.5 sm:mt-1">Click "Update Listing" to save your changes.</p>
          </div>
        </div>
      ) : (
        <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Please complete all required fields</p>
            <p className="text-xs sm:text-sm mt-0.5 sm:mt-1">Go back to the previous steps to fill in missing information.</p>
          </div>
        </div>
      )}
    </div>
  )
} 