"use client"

import { useState } from "react"
import { Input } from "@/app/components/input"
import { Button } from "@/app/components/button"
import { Textarea } from "@/app/components/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select"
import { Label } from "@/app/components/label"
import { Eye, EyeOff, Info, Key, Mail, User, RefreshCw, Upload } from "lucide-react"
import { useEdgeStore } from "@/app/lib/edgeStore"

export function AccountCredentialsForm({ formData, updateFormData, onComplete }) {
  const [showPassword, setShowPassword] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { edgestore } = useEdgeStore()
  
  const credentials = formData.credentials || {}
  
  const handleShowPassword = () => {
    setShowPassword(!showPassword)
  }
  
  const handleUpdate = (field, value) => {
    const updatedCredentials = {
      ...credentials,
      [field]: value
    }
    
    updateFormData({ credentials: updatedCredentials })
  }
  
  const handleCredentialImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    setUploading(true)
    
    try {
      const uploadPromises = files.map(async (file) => {
        const res = await edgestore.publicFiles.upload({
          file,
        })
        return res.url
      })
      
      const uploadedUrls = await Promise.all(uploadPromises)
      const loginProofImages = [...(credentials.loginProofImages || []), ...uploadedUrls]
      
      handleUpdate('loginProofImages', loginProofImages)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }
  
  const handleRecoveryImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    setUploading(true)
    
    try {
      const uploadPromises = files.map(async (file) => {
        const res = await edgestore.publicFiles.upload({
          file,
        })
        return res.url
      })
      
      const uploadedUrls = await Promise.all(uploadPromises)
      const recoveryProofImages = [...(credentials.recoveryProofImages || []), ...uploadedUrls]
      
      handleUpdate('recoveryProofImages', recoveryProofImages)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }
  
  const removeLoginImage = (index) => {
    const loginProofImages = [...(credentials.loginProofImages || [])]
    loginProofImages.splice(index, 1)
    
    handleUpdate('loginProofImages', loginProofImages)
  }
  
  const removeRecoveryImage = (index) => {
    const recoveryProofImages = [...(credentials.recoveryProofImages || [])]
    recoveryProofImages.splice(index, 1)
    
    handleUpdate('recoveryProofImages', recoveryProofImages)
  }
  
  const resetCredentials = () => {
    updateFormData({ 
      credentials: {}
    })
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Account Credentials</h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
          Update the credentials for transferring the account to a buyer.
        </p>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-4">
          <Info className="h-3.5 w-3.5" />
          <span>These credentials will be securely stored and only revealed to the buyer after purchase</span>
        </div>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
        <h4 className="text-sm font-medium">Transfer Method</h4>
        <Select
          value={formData.transferMethod || "credentials"}
          onValueChange={(value) => updateFormData({ transferMethod: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select transfer method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credentials">Full Credentials Transfer</SelectItem>
            <SelectItem value="manual">Manual Transfer (with instructions)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Choose how you'll transfer ownership to the buyer
        </p>
      </div>
      
      {formData.transferMethod === "credentials" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="credential-email" className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-primary" />
                Login Email <span className="text-xs text-gray-500">(Optional)</span>
              </Label>
              <Input
                id="credential-email"
                value={credentials.email || ""}
                onChange={(e) => handleUpdate("email", e.target.value)}
                type="email"
                placeholder="account@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="credential-username" className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-blue-500" />
                Login Username <span className="text-xs text-gray-500">(Optional)</span>
              </Label>
              <Input
                id="credential-username"
                value={credentials.username || ""}
                onChange={(e) => handleUpdate("username", e.target.value)}
                placeholder="username123"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="credential-password" className="flex items-center gap-1.5">
                <Key className="h-4 w-4 text-amber-500" />
                Password <span className="text-xs text-gray-500">(Optional)</span>
              </Label>
              <div className="relative">
                <Input
                  id="credential-password"
                  value={credentials.password || ""}
                  onChange={(e) => handleUpdate("password", e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={handleShowPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="credential-serial" className="flex items-center gap-1.5">
                <Key className="h-4 w-4 text-violet-500" />
                Key/Serial Number <span className="text-xs text-gray-500">(Optional)</span>
              </Label>
              <Input
                id="credential-serial"
                value={credentials.serialKey || ""}
                onChange={(e) => handleUpdate("serialKey", e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="credential-instructions" className="flex items-center gap-1.5">
              <Info className="h-4 w-4 text-green-500" />
              Additional Transfer Instructions <span className="text-xs text-gray-500">(Optional)</span>
            </Label>
            <Textarea
              id="credential-instructions"
              value={credentials.transferInstructions || ""}
              onChange={(e) => handleUpdate("transferInstructions", e.target.value)}
              placeholder="Any additional instructions for the buyer to successfully transfer ownership..."
              rows={3}
            />
          </div>
        </div>
      )}
      
      {formData.transferMethod === "manual" && (
        <div className="space-y-2">
          <Label htmlFor="manual-instructions" className="text-sm font-medium">
            Manual Transfer Instructions <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="manual-instructions"
            value={credentials.transferInstructions || ""}
            onChange={(e) => handleUpdate("transferInstructions", e.target.value)}
            placeholder="Explain in detail how you will transfer ownership to the buyer after purchase..."
            rows={4}
          />
          <p className="text-xs text-gray-500">
            Be specific about the transfer process, what the buyer needs to do, and expected timeline
          </p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between pt-4 gap-2 sm:gap-0">
        <Button variant="outline" onClick={resetCredentials} type="button">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Credentials
        </Button>
        <Button onClick={onComplete}>
          Continue to Review
        </Button>
      </div>
    </div>
  )
} 