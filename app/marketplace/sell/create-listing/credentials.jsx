"use client"

import { useState } from "react"
import { Button } from "../../../components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Shield, EyeIcon, EyeOffIcon, RefreshCw, Plus, Trash } from "lucide-react"
import { FileUploader } from "../../../components/file-uploader"

export function CredentialsInput({ data, onUpdate }) {
  const [showPassword, setShowPassword] = useState({
    password: false,
    recoveryPassword: false
  })
  
  const handleShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }
  
  const handleUpdate = (field, value) => {
    onUpdate({
      credentials: {
        ...data.credentials,
        [field]: value
      }
    })
  }

  const handleCredentialImageUpload = (files) => {
    // Convert files to data URLs for storage
    const promises = Array.from(files).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
    })
    
    Promise.all(promises).then(dataUrls => {
      onUpdate({
        credentials: {
          ...data.credentials,
          loginImages: [...(data.credentials?.loginImages || []), ...dataUrls]
        }
      })
    })
  }

  const handleRecoveryImageUpload = (files) => {
    // Convert files to data URLs for storage
    const promises = Array.from(files).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
    })
    
    Promise.all(promises).then(dataUrls => {
      onUpdate({
        credentials: {
          ...data.credentials,
          recoveryImages: [...(data.credentials?.recoveryImages || []), ...dataUrls]
        }
      })
    })
  }
  
  const removeLoginImage = (index) => {
    const updatedImages = [...(data.credentials?.loginImages || [])]
    updatedImages.splice(index, 1)
    onUpdate({
      credentials: {
        ...data.credentials,
        loginImages: updatedImages
      }
    })
  }

  const removeRecoveryImage = (index) => {
    const updatedImages = [...(data.credentials?.recoveryImages || [])]
    updatedImages.splice(index, 1)
    onUpdate({
      credentials: {
        ...data.credentials,
        recoveryImages: updatedImages
      }
    })
  }
  
  const resetCredentials = () => {
    onUpdate({
      credentials: {}
    })
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-2">
        <h2 className="text-base sm:text-xl font-semibold">Account Credentials</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Enter the account credentials that will be securely transferred.
        </p>
        
        <div className="bg-muted/30 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-3 sm:p-4 flex gap-2 items-start">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-medium text-yellow-700 dark:text-yellow-400">Security Note</p>
            <p className="text-yellow-600/90 dark:text-yellow-400/80">
              These credentials are encrypted and will only be revealed to the buyer.
            </p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-9 sm:h-10 text-xs sm:text-sm">
          <TabsTrigger value="login" className="tabtext">Login Details</TabsTrigger>
          <TabsTrigger value="recovery" className="tabtext">Recovery Info</TabsTrigger>
          <TabsTrigger value="additional" className="tabtext">Additional Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Email / Username</label>
            <input
              type="text"
              placeholder="Account email or username"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm h-8 sm:h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60"
              value={data.credentials?.email || ""}
              onChange={(e) => handleUpdate("email", e.target.value)}
            />
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword.password ? "text" : "password"}
                placeholder="Account password"
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm h-8 sm:h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60"
                value={data.credentials?.password || ""}
                onChange={(e) => handleUpdate("password", e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => handleShowPassword("password")}
              >
                {showPassword.password ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Key or Serial Number (Optional)</label>
            <input
              type="text"
              placeholder="Enter license key or serial number"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm h-8 sm:h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60"
              value={data.credentials?.serialKey || ""}
              onChange={(e) => handleUpdate("serialKey", e.target.value)}
            />
            <p className="text-xs sm:text-sm text-muted-foreground">Add product key, license key, or serial number if applicable</p>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Credential Images (Optional)</label>
            <p className="text-xs sm:text-sm text-muted-foreground">Upload screenshots of login credentials if needed</p>
            
            <FileUploader
              onFilesSelected={handleCredentialImageUpload}
              maxFiles={3}
              maxSizeInMB={5}
              acceptedFileTypes={["image/jpeg", "image/png", "image/gif"]}
              label="Drag & drop credential images or click to browse"
            />
            
            {/* Image Previews */}
            {data.credentials?.loginImages && data.credentials.loginImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {data.credentials.loginImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Credential image ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeLoginImage(index)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="recovery" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <div className="space-y-1.5 sm:space-y-2">
            <h3 className="text-xs sm:text-sm font-medium mb-2">Recovery Account Details</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              If this account uses a separate email (e.g., Gmail for a Facebook login), provide those credentials here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">Recovery Account Type</label>
              <input
                type="text"
                placeholder="e.g., Gmail, Email provider, iCloud"
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm h-8 sm:h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60"
                value={data.credentials?.recoveryAccountType || ""}
                onChange={(e) => handleUpdate("recoveryAccountType", e.target.value)}
              />
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">Recovery Email</label>
              <input
                type="email"
                placeholder="Recovery email address"
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm h-8 sm:h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60"
                value={data.credentials?.recoveryEmail || ""}
                onChange={(e) => handleUpdate("recoveryEmail", e.target.value)}
              />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">Recovery Password</label>
              <div className="relative">
                <input
                  type={showPassword.recoveryPassword ? "text" : "password"}
                  placeholder="Recovery account password"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm h-8 sm:h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60"
                  value={data.credentials?.recoveryPassword || ""}
                  onChange={(e) => handleUpdate("recoveryPassword", e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => handleShowPassword("recoveryPassword")}
                >
                  {showPassword.recoveryPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">Recovery Phone</label>
              <input
                type="text"
                placeholder="Phone number for recovery"
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm h-8 sm:h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60"
                value={data.credentials?.recoveryPhone || ""}
                onChange={(e) => handleUpdate("recoveryPhone", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Security Questions & Answers</label>
            <textarea
              placeholder="List any security questions and their answers"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm h-8 sm:h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 min-h-[100px]"
              value={data.credentials?.securityQuestions || ""}
              onChange={(e) => handleUpdate("securityQuestions", e.target.value)}
            />
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Recovery Images</label>
            <p className="text-xs sm:text-sm text-muted-foreground">Upload recovery QR codes, backup codes, or screenshots (max 5MB each)</p>
            
            <FileUploader
              onFilesSelected={handleRecoveryImageUpload}
              maxFiles={5}
              maxSizeInMB={5}
              acceptedFileTypes={["image/jpeg", "image/png", "image/gif", "application/pdf"]}
              label="Drag & drop recovery images or click to browse"
            />
            
            {/* Image Previews */}
            {data.credentials?.recoveryImages && data.credentials.recoveryImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {data.credentials.recoveryImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Recovery image ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeRecoveryImage(index)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="additional" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Transfer Instructions</label>
            <p className="text-xs sm:text-sm text-muted-foreground">Explain how you'll transfer the account or product to the buyer</p>
            <textarea
              placeholder="Describe the transfer process, e.g., 'I will change the email to the buyer's preferred email address and provide all necessary login details...'"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm h-8 sm:h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 min-h-[100px]"
              value={data.credentials?.transferInstructions || ""}
              onChange={(e) => handleUpdate("transferInstructions", e.target.value)}
            />
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Additional Information</label>
            <p className="text-xs sm:text-sm text-muted-foreground">Provide any additional information that might be helpful for the account transfer</p>
            <textarea
              placeholder="Additional access information, transfer details, or instructions for the buyer..."
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm h-8 sm:h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 min-h-[150px]"
              value={data.credentials?.additionalInfo || ""}
              onChange={(e) => handleUpdate("additionalInfo", e.target.value)}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-2"
          onClick={resetCredentials}
        >
          <RefreshCw className="h-4 w-4" />
          Reset Credentials
        </Button>
      </div>
    </div>
  )
} 