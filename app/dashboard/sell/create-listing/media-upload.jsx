"use client"

import { useState } from "react"
import { useEdgeStore } from "@/app/lib/edgeStore"
import { Button } from "../../../components/button"
import { Upload, X, Image, Check, AlertCircle } from "lucide-react"

export function MediaUpload({ data, onUpdate }) {
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
        return {
          url: res.url,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name
        }
      })
      
      const uploadedFiles = await Promise.all(uploadPromises)
      onUpdate({ media: [...data.media, ...uploadedFiles] })
    } catch (err) {
      setError("Failed to upload media")
      console.error(err)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }
  
  const removeMedia = (index) => {
    const updatedMedia = [...data.media]
    updatedMedia.splice(index, 1)
    onUpdate({ media: updatedMedia })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Account Media</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Upload screenshots of your account to showcase its value to potential buyers.
          Include follower count, engagement metrics, and content examples.
        </p>
      </div>
      
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
        <div className="text-sm text-red-500 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Media preview */}
      {data.media.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Uploaded Media ({data.media.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {data.media.map((item, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
    </div>
  )
} 