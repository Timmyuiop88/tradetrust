"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useEdgeStore } from "@/lib/edgestore"
import { useKycSubmit } from "@/app/hooks/useKyc"
import { Button } from "@/app/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/card"
import { Camera, Check, AlertCircle } from "lucide-react"

export default function FaceVerificationPage() {
  const [capturedImage, setCapturedImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [streamActive, setStreamActive] = useState(false)
  const router = useRouter()
  const { edgestore } = useEdgeStore()
  const { mutate: submitKyc, isLoading: isSubmitting } = useKycSubmit()

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStreamActive(true)
        setError(null)
      }
    } catch (err) {
      setError("Could not access camera. Please ensure camera permissions are enabled.")
      console.error(err)
    }
  }

  const captureImage = () => {
    if (!streamActive) return
    
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (canvas && video) {
      const context = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      canvas.toBlob((blob) => {
        setCapturedImage(blob)
        
        // Stop the camera stream
        const stream = video.srcObject
        const tracks = stream.getTracks()
        tracks.forEach(track => track.stop())
        setStreamActive(false)
      }, 'image/jpeg', 0.8)
    }
  }

  const handleSubmit = async () => {
    if (!capturedImage) {
      setError("Please capture your photo first")
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Create a File object from the Blob
      const file = new File([capturedImage], "face-verification.jpg", { type: "image/jpeg" })
      
      // Upload to EdgeStore
      const res = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          setUploadProgress(progress)
        },
      })

      // Submit to KYC API
      submitKyc({ 
        faceImageUrl: res.url,
        verified: true // Mark as verified after all steps are complete
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
      setError("Failed to upload verification photo")
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
            <Camera className="h-5 w-5 text-primary" />
            <span>Face Verification</span>
          </CardTitle>
          <CardDescription>
            Take a selfie to verify your identity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            {!capturedImage ? (
              <div className="aspect-video bg-muted flex items-center justify-center">
                {streamActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-8">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click the button below to start your camera
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-muted flex items-center justify-center">
                <img 
                  src={URL.createObjectURL(capturedImage)} 
                  alt="Captured" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
          
          {!capturedImage ? (
            <div className="flex justify-center">
              {streamActive ? (
                <Button onClick={captureImage}>
                  Capture Photo
                </Button>
              ) : (
                <Button onClick={startCamera}>
                  Start Camera
                </Button>
              )}
            </div>
          ) : (
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setCapturedImage(null)
                  startCamera()
                }}
              >
                Retake
              </Button>
              <Button onClick={handleSubmit} disabled={uploading || isSubmitting}>
                {uploading ? `Uploading ${uploadProgress}%` : isSubmitting ? "Verifying..." : "Submit"}
              </Button>
            </div>
          )}
          
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
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/sell')}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 