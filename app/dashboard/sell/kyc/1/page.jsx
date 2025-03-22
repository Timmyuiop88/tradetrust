"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEdgeStore } from "@/app/lib/edgeStore"
import { useKycSubmit } from "@/app/hooks/useKyc"
import { Button } from "@/app/components/button"
import { Input } from "@/app/components/input"
import { Label } from "@/app/components/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../../components/card"
import { Upload, Check, AlertCircle, X } from "lucide-react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"

export default function IdentityVerificationPage() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [initialFirstName, setInitialFirstName] = useState("")
  const [initialLastName, setInitialLastName] = useState("")
  const [namesChanged, setNamesChanged] = useState(false)
  
  const router = useRouter()
  const { edgestore } = useEdgeStore()
  const { mutate: submitKyc, isLoading: isSubmitting } = useKycSubmit()
  const { data: session, status, update: updateSession } = useSession()

  // Load user data when session is available
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Parse the full name into first and last name
      if (session.user.name) {
        const nameParts = session.user.name.split(' ');
        const userFirstName = nameParts[0] || "";
        // Join all other parts as last name (handles multiple last names)
        const userLastName = nameParts.slice(1).join(' ') || "";
        
        setFirstName(userFirstName);
        setLastName(userLastName);
        setInitialFirstName(userFirstName);
        setInitialLastName(userLastName);
      }
    }
  }, [status, session]);

  // Check if names have been changed
  useEffect(() => {
    if (initialFirstName && initialLastName) {
      setNamesChanged(
        firstName !== initialFirstName || lastName !== initialLastName
      )
    }
  }, [firstName, lastName, initialFirstName, initialLastName])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      
      // Create preview URL
      const fileReader = new FileReader()
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result)
      }
      fileReader.readAsDataURL(selectedFile)
    }
  }

  const handleClearFile = () => {
    setFile(null)
    setPreviewUrl(null)
  }

  // Function to update user names in user model
  const updateUserNames = async () => {
    try {
      // Only update if names have changed
      if (!namesChanged) return true;
      
      // Prepare the payload with firstName and lastName fields
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim()
      }
      
      const response = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update session with new name data
        await updateSession({
          ...session,
          user: {
            ...session.user,
            name: result.user.name, // Use the name returned from the API
            firstName: result.user.firstName,
            lastName: result.user.lastName
          }
        });
        
        // Update initial values to prevent duplicate updates
        setInitialFirstName(firstName);
        setInitialLastName(lastName);
        setNamesChanged(false);
        
        toast.success("Your name has been updated successfully.");
        
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Could not update your profile information.");
      console.error("Error updating user names:", err);
      return false;
    }
  }

  const handleUpload = async () => {
    // Validate all required fields
    if (!file) {
      setError("Please select a file")
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required")
      return
    }

    if (!idNumber.trim()) {
      setError("ID number is required")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // First update user profile if names changed
      if (namesChanged) {
        const updated = await updateUserNames()
        if (!updated) {
          setError("Failed to update your profile information")
          setUploading(false)
          return
        }
      }

      // Upload to EdgeStore
      const res = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          setUploadProgress(progress)
        },
      })

      // Submit to KYC API - include idType to properly categorize the document
      submitKyc({ 
        idDocUrl: res.url,
        idType: "government_id",  // Explicitly set the document type
        idNumber: idNumber,
      }, {
        onSuccess: () => {
          toast.success("Your ID verification has been submitted successfully.");
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

  // Determine if the form is in any loading state
  const isLoading = uploading || isSubmitting;
  
  // Determine the button text based on the current loading state
  const getButtonText = () => {
    if (uploading) {
      return `Uploading ${uploadProgress}%`;
    } else if (isSubmitting) {
      return "Processing submission...";
    } else {
      return "Submit Verification";
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-primary" />
            <span>Identity Verification</span>
          </CardTitle>
          <CardDescription>
            Verify your identity information and upload a valid government-issued ID document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your first name"
                required
                disabled={isLoading}
              />
              {firstName !== initialFirstName && (
                <p className="text-xs text-amber-600">
                  Your first name will be updated in your profile
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Your last name"
                required
                disabled={isLoading}
              />
              {lastName !== initialLastName && (
                <p className="text-xs text-amber-600">
                  Your last name will be updated in your profile
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter your ID number"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter the identification number shown on your government ID
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="id-document">Government ID Document</Label>
            {previewUrl ? (
              <div className="relative border rounded-lg overflow-hidden">
                <div className="absolute top-2 right-2 z-10">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8 rounded-full" 
                    onClick={handleClearFile}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative aspect-[16/9] max-h-[300px] w-full flex items-center justify-center bg-muted">
                  <Image
                    src={previewUrl}
                    alt="ID Preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="p-2 text-sm text-green-600 flex items-center space-x-2 bg-green-50 dark:bg-green-900/20">
                  <Check className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              </div>
            ) : (
              <div className={`border-2 border-dashed rounded-lg p-8 text-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                <input
                  type="file"
                  id="id-document"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                <label 
                  htmlFor="id-document"
                  className={`block ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="mb-2 text-sm font-medium">
                    Click to upload your ID document
                  </div>
                  <div className="text-xs text-muted-foreground">
                    JPG, PNG or PDF files accepted
                  </div>
                </label>
              </div>
            )}
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
            <div className="text-sm text-red-500 flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/sell')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || isLoading}
            className={isLoading ? "relative" : ""}
          >
            {isLoading && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
            <span className={isLoading ? "opacity-0" : ""}>
              {getButtonText()}
            </span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 