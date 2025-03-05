"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useEdgeStore } from "@/app/lib/edgeStore"
import { useKycSubmit } from "@/app/hooks/useKyc"
import { Button } from "@/app/components/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../../components/card"
import { Camera, AlertCircle } from "lucide-react"

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

    const width = 1280
    const height = video.videoHeight / (video.videoWidth / width)

    photo.width = width
    photo.height = height

    const ctx = photo.getContext('2d')
    ctx.drawImage(video, 0, 0, width, height)
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

    setUploading(true)
    setError(null)

    try {
      const file = new File([capturedImage], "face-verification.jpg", { 
        type: "image/jpeg" 
      })
      
      const res = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          setUploadProgress(progress)
        },
      })

      submitKyc({ 
        faceImageUrl: res.url
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

  // Alternative method using file input if camera fails
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = photoRef.current
          if (canvas) {
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0)
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
            Please take a clear photo of your face
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`camera ${hasPhoto ? 'hidden' : ''}`}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full aspect-video object-cover rounded-lg"
            ></video>
            {streamActive && (
              <Button 
                onClick={takePhoto}
                className="mt-4"
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
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary file:text-white
                    hover:file:bg-primary/90"
                />
              </div>
            )}
          </div>

          <div className={`photo ${!hasPhoto ? 'hidden' : ''}`}>
            <canvas ref={photoRef} className="w-full rounded-lg"></canvas>
            <div className="flex gap-4 mt-4">
              <Button variant="outline" onClick={closePhoto}>
                Retake
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={uploading || isSubmitting}
              >
                {uploading ? `Uploading ${uploadProgress}%` : "Submit"}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 