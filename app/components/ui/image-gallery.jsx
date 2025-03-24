"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent } from '@/app/components/ui/dialog'
import { Button } from '@/app/components/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export default function ImageGallery({ images = [], initialIndex = 0 }) {
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(initialIndex)
  
  if (!images || images.length === 0) {
    return null
  }
  
  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }
  
  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }
  
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }
  
  return (
    <>
      <div className="grid grid-cols-4 gap-2 cursor-pointer">
        {images.slice(0, 4).map((src, idx) => (
          <div 
            key={idx}
            className="relative aspect-square overflow-hidden rounded-md"
            onClick={() => {
              setSelectedIndex(idx)
              setOpen(true)
            }}
          >
            <Image
              src={src}
              alt={`Gallery image ${idx + 1}`}
              fill
              className="object-cover hover:scale-110 transition-transform duration-300"
            />
            {idx === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-medium">
                +{images.length - 4} more
              </div>
            )}
          </div>
        ))}
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent 
          className="sm:max-w-3xl max-h-screen overflow-hidden p-0 bg-black"
          onKeyDown={handleKeyDown}
        >
          <div className="relative h-[80vh] w-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/40 hover:bg-black/60 text-white"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="relative h-full w-full flex items-center justify-center">
              <Image
                src={images[selectedIndex]}
                alt={`Image ${selectedIndex + 1}`}
                fill
                className="object-contain"
              />
              
              <Button
                variant="ghost"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white h-10 w-10 rounded-full"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white h-10 w-10 rounded-full"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === selectedIndex 
                      ? 'w-6 bg-white' 
                      : 'w-1.5 bg-white/40'
                  }`}
                  onClick={() => setSelectedIndex(idx)}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 