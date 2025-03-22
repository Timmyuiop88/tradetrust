"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEdgeStore } from "@/app/lib/edgeStore"
import { useKycSubmit } from "@/app/hooks/useKyc"
import { Button } from "@/app/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../../components/card"
import { Camera, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { cn } from "@/app/lib/utils"
import { toast } from "react-hot-toast"
import { useSession } from "next-auth/react"

export default function FaceVerificationPage() {
  const [capturedImage, setCapturedImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const photoRef = useRef(null)
  const [hasPhoto, setHasPhoto] = useState(false)
  const [streamActive, setStreamActive] = useState(false)
  const router = useRouter()
  const { edgestore } = useEdgeStore()
  const { mutate: submitKyc, isLoading: isSubmitting } = useKycSubmit()
  const { data: session } = useSession()
  
  // Combined loading state to disable buttons
  const isProcessing = uploading || isSubmitting

  const getVideo = async () => {
    try {
      // First, stop any existing stream
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
        videoRef.current.srcObject = null
      }

      const stream = await navigator.mediaDevices?.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      })

      let video = videoRef.current
      if (video) {
        video.srcObject = stream
        
        // Use event listener for play instead of direct call
        video.onloadedmetadata = () => {
          video.play()
            .then(() => {
              setStreamActive(true)
              setError(null)
            })
            .catch(err => {
              console.error("Play error:", err)
              setError("Could not start video: " + err.message)
            })
        }
      }
    } catch (err) {
      console.error("Camera access error:", err)
      if (err.name === 'NotAllowedError') {
        setError("Camera access denied. Please check your browser permissions.")
      } else if (err.name === 'NotFoundError') {
        setError("No camera found. Please connect a camera.")
      } else {
        setError(`Camera error: ${err.message}`)
      }
    }
  }

  const takePhoto = () => {
    const video = videoRef.current
    const photo = photoRef.current

    if (!video || !photo) return

    // Get dimensions with a 1:1 aspect ratio for a perfect circle
    const size = Math.min(video.videoWidth, video.videoHeight)
    const offsetX = (video.videoWidth - size) / 2
    const offsetY = (video.videoHeight - size) / 2
    
    // Set canvas to be square
    photo.width = size
    photo.height = size

    const ctx = photo.getContext('2d')
    
    // First, draw the cropped square portion of the video
    ctx.drawImage(
      video, 
      offsetX, offsetY, size, size, // Source rectangle
      0, 0, size, size // Destination rectangle
    )
    
    // Then create a clipping mask for circular shape
    ctx.globalCompositeOperation = 'destination-in'
    ctx.beginPath()
    // Create a perfect circle centered in the canvas
    const radius = size / 2
    ctx.arc(radius, radius, radius, 0, Math.PI * 2)
    ctx.fill()
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over'
    
    // Add a subtle border around the circle
    ctx.strokeStyle = '#3b82f6' // primary blue color
    ctx.lineWidth = 3
    ctx.stroke()
    
    setHasPhoto(true)

    // Convert canvas to blob
    photo.toBlob((blob) => {
      setCapturedImage(blob)
    }, 'image/jpeg', 0.95)

    // Stop the camera stream
    if (video.srcObject) {
      const stream = video.srcObject
      const tracks = stream.getTracks()
      tracks.forEach(track => track.stop())
      video.srcObject = null
      setStreamActive(false)
    }
  }

  const closePhoto = () => {
    if (isProcessing) return; // Prevent retaking if already uploading or submitting
    
    const photo = photoRef.current
    if (photo) {
      const ctx = photo.getContext('2d')
      ctx.clearRect(0, 0, photo.width, photo.height)
      setHasPhoto(false)
      setCapturedImage(null)
      // Use setTimeout to avoid rapid start/stop of camera
      setTimeout(() => {
        getVideo()
      }, 300)
    }
  }

  const handleSubmit = async () => {
    if (!capturedImage) {
      setError("Please capture your photo first")
      return
    }

    // Prevent double submission
    if (isProcessing) return;

    setUploading(true)
    setError(null)

    try {
      const file = new File([capturedImage], "face-verification.jpg", { 
        type: "image/jpeg" 
      })
      
      // First upload the image to EdgeStore
      let uploadResult;
      try {
        uploadResult = await edgestore.publicFiles.upload({
          file,
          onProgressChange: (progress) => {
            setUploadProgress(progress)
          },
        })
      } catch (uploadErr) {
        console.error("File upload error:", uploadErr);
        setError("Failed to upload photo. Please try again.");
        toast.error("Image upload failed");
        setUploading(false);
        return;
      }

      // Prepare KYC data with required fields - but only fields that exist in the KYC model
      const kycData = {
        // Face verification specific data
        faceImageUrl: uploadResult.url,
        idType: "face_photo",
        
        // Include user's full name from session but NOT email (email is not in KYC model)
        fullName: session?.user?.name || ''
      }

      // Log the data being submitted (for debugging)
      console.log('Submitting KYC data:', {
        ...kycData,
        userId: session?.user?.id,
      })

      // Submit to the KYC API
      submitKyc(kycData, {
        onSuccess: (data) => {
          toast.success("Face verification submitted successfully")
          router.push('/dashboard/sell')
        },
        onError: (err) => {
          console.error("KYC submission error:", err)
          setError(err.message || "Failed to update verification status")
          toast.error(err.message || "Failed to update verification status")
        },
        onSettled: () => {
          // Always reset uploading state regardless of success/failure
          setUploading(false)
        }
      })
    } catch (err) {
      console.error("Unexpected error during submission:", err)
      setError("An unexpected error occurred. Please try again.")
      toast.error("Verification failed")
      setUploading(false)
    }
  }

  // Alternative method using file input if camera fails
  const handleFileUpload = (e) => {
    if (isProcessing) return; // Prevent file upload during submission
    
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = photoRef.current
          if (canvas) {
            // Make canvas square for perfect circle
            const size = Math.min(img.width, img.height)
            const offsetX = (img.width - size) / 2
            const offsetY = (img.height - size) / 2
            
            canvas.width = size
            canvas.height = size
            
            const ctx = canvas.getContext('2d')
            
            // Draw the square portion of the image
            ctx.drawImage(
              img, 
              offsetX, offsetY, size, size, // Source rectangle
              0, 0, size, size // Destination rectangle
            )
            
            // Create circular clipping mask
            ctx.globalCompositeOperation = 'destination-in'
            ctx.beginPath()
            const radius = size / 2
            ctx.arc(radius, radius, radius, 0, Math.PI * 2)
            ctx.fill()
            
            // Reset composite operation
            ctx.globalCompositeOperation = 'source-over'
            
            // Add a subtle border
            ctx.strokeStyle = '#3b82f6' // primary blue color
            ctx.lineWidth = 3
            ctx.stroke()
            
            canvas.toBlob((blob) => {
              setCapturedImage(blob)
              setHasPhoto(true)
            }, 'image/jpeg', 0.95)
          }
        }
        img.src = event.target?.result || ''
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGoBack = () => {
    if (isProcessing) return; // Prevent navigation during submission
    router.back()
  }

  useEffect(() => {
    // Delay camera initialization to ensure component is fully mounted
    const timer = setTimeout(() => {
      getVideo()
    }, 500)
    
    return () => {
      clearTimeout(timer)
      // Cleanup: stop the camera stream when component unmounts
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Face Verification</CardTitle>
          <CardDescription>
            Please center your face in the frame and take a clear photo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className={`camera ${hasPhoto ? 'hidden' : ''} relative`}>
              {/* Video preview with overlayed circular guide */}
              <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover rounded-lg"
                ></video>
                {/* Overlay a guide circle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[85%] h-[85%] rounded-full border-2 border-primary border-dashed opacity-70"></div>
                </div>
              </div>
              
              {streamActive && (
                <Button 
                  onClick={takePhoto}
                  className="mt-4 w-full"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Photo
                </Button>
              )}
              
              {!streamActive && !hasPhoto && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    If camera doesn't start automatically, you can upload a photo instead:
                  </p>
                  <input 
                    type="file" 
                    accept="image/*"
                    capture
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-white
                      file:disabled:bg-gray-400
                      hover:file:bg-primary/90"
                  />
                </div>
              )}
            </div>
          </div>

          <div className={cn("photo flex justify-center", !hasPhoto ? 'hidden' : '')}>
            <div className="w-[320px] sm:w-[380px]">
              <div className="canvas-container flex justify-center">
                <canvas ref={photoRef} className="max-w-full"></canvas>
              </div>
              <div className="flex gap-4 mt-4 justify-between">
                <Button 
                  variant="outline" 
                  onClick={closePhoto}
                  disabled={isProcessing}
                >
                  Retake
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="min-w-[120px]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploading ? `${uploadProgress}%` : "Processing..."}
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm flex items-center gap-2 p-3 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={handleGoBack}
            disabled={isProcessing}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Step 3 of 3
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 