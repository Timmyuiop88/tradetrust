"use client"

import { Input } from "@/app/components/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select"
import { Textarea } from "@/app/components/textarea"
import { usePlatforms } from "@/app/hooks/usePlatforms"
import { useCategories } from "@/app/hooks/useCategories"
import { Loader, HelpCircle, Info, Globe, Link as LinkIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/app/components/button"
import { countries } from "@/app/lib/data/countries"

export function AccountDetailsForm({ formData, updateFormData, onComplete }) {
  const { data: platforms, isLoading: platformsLoading } = usePlatforms()
  const { data: categories, isLoading: categoriesLoading } = useCategories()
  
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

  const platformOptions = platforms?.map(platform => ({
    value: platform.id,
    label: platform.name,
    icon: platform.icon || null
  })) || []

  const categoryOptions = categories?.map(category => ({
    value: category.id,
    label: category.name
  })) || []

  // Get the selected category name
  const selectedCategory = categories?.find(c => c.id === formData.categoryId);
  const isAccountCategory = selectedCategory?.name === "Account";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Account Details</h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
          Update the basic information about the account you're selling.
        </p>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
          <Info className="h-3.5 w-3.5" />
          <span>Fields marked with <span className="text-red-500">*</span> are required</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Platform <span className="text-red-500">*</span>
        </label>
        {platformsLoading ? (
          <div className="flex items-center space-x-2 h-10 px-3 border border-gray-300 dark:border-gray-700 rounded-md">
            <Loader className="h-4 w-4 animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">Loading platforms...</span>
          </div>
        ) : (
          <Select
            value={formData.platformId}
            onValueChange={(value) => updateFormData({ platformId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a platform">
                {formData.platformId ? (
                  <div className="flex items-center gap-2">
                    {platformOptions.find(p => p.value === formData.platformId)?.icon ? (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden">
                        <img 
                          src={platformOptions.find(p => p.value === formData.platformId)?.icon} 
                          alt={`${platformOptions.find(p => p.value === formData.platformId)?.label} icon`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <span>{platformOptions.find(p => p.value === formData.platformId)?.label}</span>
                  </div>
                ) : "Select a platform"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {platformOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon ? (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden">
                        <img 
                          src={option.icon} 
                          alt={`${option.label} icon`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Category <span className="text-red-500">*</span>
        </label>
        {categoriesLoading ? (
          <div className="flex items-center space-x-2 h-10 px-3 border border-gray-300 dark:border-gray-700 rounded-md">
            <Loader className="h-4 w-4 animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">Loading categories...</span>
          </div>
        ) : (
          <Select
            value={formData.categoryId}
            onValueChange={(value) => updateFormData({ categoryId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <label className={`text-sm font-medium ${!isAccountCategory ? 'text-gray-400 dark:text-gray-600' : ''}`}>
            Followers / Friends {isAccountCategory && <span className="text-red-500">*</span>}
          </label>
          <Input 
            type="text"
            value={formData.followers ? formData.followers.toLocaleString() : ""}
            onChange={handleFollowersChange}
            placeholder={isAccountCategory ? "e.g. 100000" : "Only for Account category"}
            inputMode="numeric"
            disabled={!isAccountCategory}
            className={!isAccountCategory ? "opacity-50 cursor-not-allowed" : ""}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the exact number (e.g., 100000)
          </p>
        </div>
        <div className="space-y-2">
          <label className={`text-sm font-medium ${!isAccountCategory ? 'text-gray-400 dark:text-gray-600' : ''}`}>
            Engagement Rate (%) {isAccountCategory && <span className="text-red-500">*</span>}
          </label>
          <Input 
            type="text"
            value={formData.engagement || ""}
            onChange={handleEngagementChange}
            placeholder={isAccountCategory ? "e.g. 4.5" : "Only for Account category"}
            inputMode="decimal"
            disabled={!isAccountCategory}
            className={!isAccountCategory ? "opacity-50 cursor-not-allowed" : ""}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter as a number (e.g., 4.5)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Description <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe your account, its niche, content type, audience demographics, and any unique selling points..."
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          Be detailed but concise. Highlight what makes this account valuable to potential buyers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <label className={`text-sm font-medium flex items-center gap-1 ${!isAccountCategory ? 'text-gray-400 dark:text-gray-600' : ''}`}>
            Username <span className="text-xs text-gray-500 ml-1">(Optional)</span>
          </label>
          <Input 
            type="text"
            value={formData.username || ""}
            onChange={(e) => updateFormData({ username: e.target.value })}
            placeholder={isAccountCategory ? "e.g. fashionista123" : "Only for Account category"}
            disabled={!isAccountCategory}
            className={!isAccountCategory ? "opacity-50 cursor-not-allowed" : ""}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            Account Age <span className="text-xs text-gray-500 ml-1">(Optional)</span>
          </label>
          <Input 
            type="number"
            value={formData.accountAge || ""}
            onChange={(e) => updateFormData({ accountAge: parseInt(e.target.value) })}
            placeholder="e.g. 24 months"
            min="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1">
          Number of Posts <span className="text-xs text-gray-500 ml-1">(Optional)</span>
        </label>
        <Input 
          type="number"
          value={formData.posts || ""}
          onChange={(e) => updateFormData({ posts: parseInt(e.target.value) })}
          placeholder="e.g. 150"
          min="0"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <LinkIcon className="h-4 w-4 mr-1" />
            Preview Link <span className="text-xs text-gray-500 ml-1">(Optional)</span>
          </label>
          <Input 
            type="url"
            value={formData.previewLink || ""}
            onChange={(e) => updateFormData({ previewLink: e.target.value })}
            placeholder="https://example.com/profile"
          />
          <p className="text-xs text-gray-500 mt-1">
            Link where buyers can see the account/product
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Globe className="h-4 w-4 mr-1" />
            Account Country <span className="text-xs text-gray-500 ml-1">(Optional)</span>
          </label>
          <Select
            value={formData.accountCountry || ""}
            onValueChange={(value) => updateFormData({ accountCountry: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {countries.map(country => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Country where the account was created
          </p>
        </div>
      </div>

      <div className="pt-4 text-right">
        <Button onClick={onComplete}>
          Continue to Media & Proof
        </Button>
      </div>
    </div>
  )
} 