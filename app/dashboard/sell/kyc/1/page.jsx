"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEdgeStore } from "@/lib/edgestore"
import { useKycSubmit } from "@/app/hooks/useKyc"
import { Button } from "@/app/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/card"
import { Upload, Check, AlertCircle } from "lucide-react"

export default function IdentityVerificationPage() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { edgestore } = useEdgeStore()
  const { mutate: submitKyc, isLoading: isSubmitting } = useKycSubmit()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Upload to EdgeStore
      const res = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          setUploadProgress(progress)
        },
      })

      // Submit to KYC API
      submitKyc({ 
        idDocUrl: res.url,
        idType: "government_id"
      }, {
        onSuccess: () => {
          router.push('/dashboard/sell')
        },
        onError: (err) => {
          setError("Failed to update KYC status")
          console.error(err)
        }
      })
    } catch (err) {
      setError("Failed to upload document")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-primary" />
            <span>Identity Verification</span>
          </CardTitle>
          <CardDescription>
            Upload a valid government-issued ID document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              id="id-document"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            <label 
              htmlFor="id-document"
              className="block cursor-pointer"
            >
              {file ? (
                <div className="text-sm text-green-600 flex items-center justify-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Click to select a file or drag and drop
                </div>
              )}
            </label>
          </div>
          
          {uploading && (
            <div className="w-full bg-muted rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-500 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/sell')}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading || isSubmitting}
          >
            {uploading ? `Uploading ${uploadProgress}%` : isSubmitting ? "Saving..." : "Upload ID"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 