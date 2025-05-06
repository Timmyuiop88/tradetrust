"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEdgeStore } from "@/app/lib/edgeStore"
import { useKycSubmit } from "@/app/hooks/useKyc"
import { Button } from "@/app/components/button"
import { Input } from "@/app/components/input"
import { Label } from "@/app/components/label"
import { Select } from "@/app/components/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../../components/card"
import { Upload, Check, AlertCircle, X, MapPin, Search } from "lucide-react"
import { useSession } from "next-auth/react"
import countryList from 'react-select-country-list'
import ReactCountryFlag from "react-country-flag"
import { toast } from "sonner"

export default function AddressVerificationPage() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [country, setCountry] = useState("")
  const [address, setAddress] = useState("")
  const [countrySearchTerm, setCountrySearchTerm] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const { edgestore } = useEdgeStore()
  const { mutate: submitKyc, isLoading: isKycSubmitting } = useKycSubmit()
  const { data: session } = useSession()
  
  // Get countries list for dropdown
  const countries = useMemo(() => {
    return countryList().getData().map(country => ({
      value: country.value,
      label: country.label,
    }))
  }, [])

  // Filtered countries based on search term
  const filteredCountries = useMemo(() => {
    if (!countrySearchTerm) return countries;
    
    return countries.filter(country => 
      country.label.toLowerCase().includes(countrySearchTerm.toLowerCase())
    );
  }, [countries, countrySearchTerm]);

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

  const handleUpload = async () => {
    // Prevent multiple submissions
    if (isSubmitting || uploading || isKycSubmitting) return;
    
    // Validate all required fields
    if (!file) {
      setError("Please select a file")
      return
    }

    if (!country) {
      setError("Country is required")
      return
    }

    if (!address) {
      setError("Address is required")
      return
    }

    setUploading(true)
    setIsSubmitting(true)
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
        addressDocUrl: res.url,
        idType: "address_proof",
        country,
        address,
      }, {
        onSuccess: () => {
          toast.success("Your address verification has been submitted successfully.");
          router.push('/dashboard/sell')
        },
        onError: (err) => {
          setError("Failed to update KYC status")
          console.error(err)
        },
        onSettled: () => {
          setIsSubmitting(false)
        }
      })
    } catch (err) {
      setError("Failed to upload document")
      console.error(err)
      setIsSubmitting(false)
    } finally {
      setUploading(false)
    }
  }

  // Determine if the form is in any loading state
  const isLoading = uploading || isKycSubmitting || isSubmitting;
  
  // Determine the button text based on the current loading state
  const getButtonText = () => {
    if (uploading) {
      return `Uploading ${uploadProgress}%`;
    } else if (isKycSubmitting) {
      return "Processing submission...";
    } else if (isSubmitting) {
      return "Please wait...";
    } else {
      return "Submit Verification";
    }
  };

  // Custom dropdown component with flags and search
  const CountryDropdown = () => (
    <div className="space-y-2">
      <Label htmlFor="country">Country</Label>
      <Select
        id="country"
        value={country}
        onValueChange={setCountry}
        disabled={isLoading}
      >
        <Select.Trigger className="w-full">
          <Select.Value placeholder="Select your country">
            {country && (
              <div className="flex items-center gap-2">
                <ReactCountryFlag 
                  countryCode={country} 
                  svg 
                  style={{
                    width: '1em',
                    height: '1em',
                  }}
                  title={countries.find(c => c.value === country)?.label || country}
                />
                <span>{countries.find(c => c.value === country)?.label || country}</span>
              </div>
            )}
          </Select.Value>
        </Select.Trigger>
        <Select.Content className="max-h-[400px]">
          <Select.ScrollUpButton />
          <div className="p-2 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center border rounded-md px-3 py-1">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <input
                className="flex-1 bg-transparent border-0 outline-none text-sm"
                placeholder="Search countries..."
                value={countrySearchTerm}
                onChange={(e) => setCountrySearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {countrySearchTerm && (
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCountrySearchTerm("");
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
            <Select.Group>
              <Select.Label>Countries ({filteredCountries.length})</Select.Label>
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <Select.Item key={country.value} value={country.value}>
                    <div className="flex items-center gap-2">
                      <ReactCountryFlag 
                        countryCode={country.value} 
                        svg 
                        style={{
                          width: '1em',
                          height: '1em',
                        }}
                        title={country.label}
                      />
                      <span>{country.label}</span>
                    </div>
                  </Select.Item>
                ))
              ) : (
                <div className="py-2 px-2 text-sm text-muted-foreground text-center">
                  No countries found
                </div>
              )}
            </Select.Group>
          
          <Select.ScrollDownButton />
        </Select.Content>
      </Select>
      <p className="text-xs text-muted-foreground">
        Select the country where your address is located
      </p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Address Verification</span>
          </CardTitle>
          <CardDescription>
            Verify your address by uploading a proof of address document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CountryDropdown />
          
          <div className="space-y-2">
            <Label htmlFor="address">Full Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Include street, building number, city, and postal code
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address-document">Proof of Address Document</Label>
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
                    alt="Address Document Preview"
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
                  id="address-document"
                  className="hidden"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                <label 
                  htmlFor="address-document"
                  className={`block ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="mb-2 text-sm font-medium">
                    Click to upload your proof of address
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Utility bill, bank statement, or rental agreement
                  </div>
                </label>
              </div>
            )}
          </div>
          
          {uploading && (
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
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
            disabled={!file || !country || !address || isLoading}
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