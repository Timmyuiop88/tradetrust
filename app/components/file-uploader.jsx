"use client"

import { useState, useRef } from "react"
import { Upload, X, File, Image as ImageIcon } from "lucide-react"
import { Button } from "./button"

export function FileUploader({
  onFilesSelected,
  acceptedFileTypes = ["image/*"],
  maxFiles = 5,
  maxSizeInMB = 5, // 5MB default max size
  label = "Upload files"
}) {
  const [dragActive, setDragActive] = useState(false)
  const [fileError, setFileError] = useState("")
  const fileInputRef = useRef(null)
  
  // Convert MB to bytes
  const maxSize = maxSizeInMB * 1024 * 1024

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFiles = (files) => {
    if (files.length > maxFiles) {
      setFileError(`You can only upload up to ${maxFiles} files at once`)
      return false
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Check file size
      if (file.size > maxSize) {
        setFileError(`File "${file.name}" exceeds the maximum size of ${maxSizeInMB}MB`)
        return false
      }
      
      // Check file type
      const fileType = file.type
      let isAcceptedType = false
      
      for (const type of acceptedFileTypes) {
        if (type.endsWith('/*') && fileType.startsWith(type.replace('/*', ''))) {
          isAcceptedType = true
          break
        } else if (type === fileType) {
          isAcceptedType = true
          break
        }
      }
      
      if (!isAcceptedType) {
        setFileError(`File "${file.name}" is not an accepted file type`)
        return false
      }
    }
    
    setFileError("")
    return true
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      if (validateFiles(files)) {
        onFilesSelected(files)
      }
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      if (validateFiles(files)) {
        onFilesSelected(files)
      }
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current.click()
  }

  const isImageUploader = acceptedFileTypes.some(type => 
    type === "image/*" || type.startsWith("image/")
  )

  return (
    <div className="w-full">
      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${dragActive ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          onChange={handleChange}
          accept={acceptedFileTypes.join(",")}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          {isImageUploader ? (
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          ) : (
            <File className="h-10 w-10 text-muted-foreground" />
          )}
          
          <div className="space-y-1">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">
              Drag and drop files here or click to browse
            </p>
          </div>
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleButtonClick}
            className="mt-2"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </div>
      
      {fileError && (
        <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <X className="h-4 w-4" />
          {fileError}
        </div>
      )}
      
      <p className="mt-2 text-xs text-muted-foreground">
        Accepted file types: {acceptedFileTypes.join(", ")}.
        Max size: {maxSizeInMB}MB.
        {maxFiles > 1 && ` Up to ${maxFiles} files.`}
      </p>
    </div>
  )
} 