"use client"

import { useState } from "react"
import { useEdgeStore } from "@/app/lib/edgeStore"
import { Button } from "@/app/components/button"
import { Textarea } from "@/app/components/textarea"
import { Upload, X, Image, AlertCircle, Info } from "lucide-react"

// Helper function to determine if a URL is an image
const isImageUrl = (url) => {
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
  return extensions.some(ext => url.toLowerCase().endsWith(ext))
}

export function AccountMediaForm({ formData, updateFormData, onComplete, isEdit = false }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const { edgestore } = useEdgeStore()
  
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    setUploading(true)
    setError(null)
    
    try {
      const uploadPromises = files.map(async (file) => {
        const res = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            setUploadProgress(progress)
          },
        })
        // Return only the URL
        return res.url
      })
      
      const uploadedUrls = await Promise.all(uploadPromises)
      // Update mediaProof with the new URLs
      updateFormData({ 
        mediaProof: [...(formData.mediaProof || []), ...uploadedUrls]
      })
    } catch (err) {
      setError("Failed to upload media")
      console.error(err)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }
  
  const removeMedia = (index) => {
    const updatedMediaProof = [...(formData.mediaProof || [])]
    updatedMediaProof.splice(index, 1)
    
    updateFormData({ mediaProof: updatedMediaProof })
  }

  const handleDescriptionChange = (e) => {
    updateFormData({ description: e.target.value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Media & Description</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Update screenshots and description of your account to showcase its value to potential buyers.
        </p>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
          <Info className="h-3.5 w-3.5" />
          <span>High-quality screenshots of metrics and content examples help buyers make decisions</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Description <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={formData.description || ""}
          onChange={handleDescriptionChange}
          placeholder="Describe your account, its niche, content type, audience demographics, and any unique selling points..."
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          Be detailed but concise. Highlight what makes this account valuable to potential buyers.
        </p>
      </div>
      
      <div>
        <label className="text-sm font-medium block mb-2">
          Media Proof <span className="text-red-500">*</span>
        </label>
        
        {/* Upload area */}
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
          <input
            type="file"
            id="media-upload"
            className="hidden"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label 
            htmlFor="media-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm font-medium mb-1">Drag and drop or click to upload</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supports images and videos up to 10MB
            </p>
            
            {uploading && (
              <div className="w-full mt-4">
                <div className="text-xs text-gray-500 mb-1">Uploading... {uploadProgress}%</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </label>
        </div>
        
        {error && (
          <div className="text-sm text-red-500 flex items-center space-x-2 mt-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
      
      {/* Media preview */}
      {formData.mediaProof && formData.mediaProof.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Uploaded Media ({formData.mediaProof.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {formData.mediaProof.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
                      controls
                    />
                  )}
                </div>
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="pt-4 text-right">
        <Button 
          onClick={onComplete}
          disabled={!formData.description || !formData.mediaProof || formData.mediaProof.length === 0}
        >
          Continue to Credentials
        </Button>
      </div>
    </div>
  )
} 