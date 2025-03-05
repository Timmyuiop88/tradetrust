"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEdgeStore } from "@/app/lib/edgeStore"
import { useKycSubmit } from "@/app/hooks/useKyc"
import { Button } from "@/app/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../../components/card"
import { MapPin, Check, AlertCircle } from "lucide-react"

export default function AddressVerificationPage() {
  const [file, setFile] = useState(null)
  const [address, setAddress] = useState("")
  const [country, setCountry] = useState("")
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

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file")
      return
    }

    if (!address || !country) {
      setError("Please fill in all fields")
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
        address,
        country,
        addressDocUrl: res.url
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
            <MapPin className="h-5 w-5 text-primary" />
            <span>Address Verification</span>
          </CardTitle>
          <CardDescription>
            Provide your address details and upload proof of address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter your full address"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter your country"
              />
            </div>
          </div>
          
          <div className="border-2 border-dashed rounded-lg p-6 text-center mt-4">
            <input
              type="file"
              id="address-document"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            <label 
              htmlFor="address-document"
              className="block cursor-pointer"
            >
              {file ? (
                <div className="text-sm text-green-600 flex items-center justify-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Upload proof of address (utility bill, bank statement)
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
            onClick={handleSubmit} 
            disabled={!file || !address || !country || uploading || isSubmitting}
          >
            {uploading ? `Uploading ${uploadProgress}%` : isSubmitting ? "Saving..." : "Submit"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 