"use client"

import { useState } from "react"
import { Button } from "@/app/components/button"
import { Checkbox } from "@/app/components/checkbox"
import { Label } from "@/app/components/label"
import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react"

export function LegalComplianceSection() {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = () => {
    if (acceptedTerms && acceptedPrivacy) {
      // Just show success message since this is static
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-start gap-2">
          <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>Legal compliance updated successfully</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={setAcceptedTerms}
            />
            <div className="space-y-1">
              <Label 
                htmlFor="terms" 
                className="font-medium cursor-pointer"
              >
                Terms of Service
              </Label>
              <p className="text-sm text-muted-foreground">
                I have read and agree to the Terms of Service that govern my use of this platform.
              </p>
              <Button 
                variant="link" 
                className="h-auto p-0 text-sm flex items-center gap-1"
                onClick={() => window.open('/terms', '_blank')}
              >
                Read Terms of Service <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg">
          <div className="flex items-start space-x-3">
            <Checkbox 
              id="privacy" 
              checked={acceptedPrivacy}
              onCheckedChange={setAcceptedPrivacy}
            />
            <div className="space-y-1">
              <Label 
                htmlFor="privacy" 
                className="font-medium cursor-pointer"
              >
                Privacy Policy
              </Label>
              <p className="text-sm text-muted-foreground">
                I have read and agree to the Privacy Policy regarding how my personal data is collected and processed.
              </p>
              <Button 
                variant="link" 
                className="h-auto p-0 text-sm flex items-center gap-1"
                onClick={() => window.open('/privacy', '_blank')}
              >
                Read Privacy Policy <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="p-4 border rounded-lg bg-muted/30">
          <h3 className="font-medium mb-2">Tax Information</h3>
          <p className="text-sm text-muted-foreground mb-4">
            As a marketplace participant, you may be required to report income earned through this platform to your local tax authorities.
          </p>
          <Button 
            variant="outline" 
            className="text-sm text-[10px] sm:text-xs md:text-sm"
            onClick={() => window.open('/tax-info', '_blank')}
          >
            Learn More About Tax Obligations
          </Button>
        </div>
      </div>
      
      <Button 
        onClick={handleSubmit} 
        disabled={!acceptedTerms || !acceptedPrivacy}
      >
        Save Preferences
      </Button>
    </div>
  )
} 