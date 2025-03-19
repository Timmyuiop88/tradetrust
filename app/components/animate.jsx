"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView } from "framer-motion"

// Animation variants for different animation styles
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
}

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
}

export const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
}

export const zoomIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
}

export const staggerChildren = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const listItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
}

// Main animation component to wrap sections
export function AnimateOnScroll({
  children,
  variants = fadeInUp,
  className = "",
  threshold = 0.15,
  viewportOnce = true,
  delay = 0,
  duration,
  ...props
}) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: viewportOnce,
    amount: threshold
  })
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])
  
  // If duration is specified, override the default duration in the variants
  const variantsWithCustomDuration = duration
    ? {
        ...variants,
        visible: {
          ...variants.visible,
          transition: {
            ...variants.visible?.transition,
            duration: duration,
            delay: delay
          }
        }
      }
    : {
        ...variants,
        visible: {
          ...variants.visible,
          transition: {
            ...variants.visible?.transition,
            delay: delay
          }
        }
      }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variantsWithCustomDuration}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// For staggered animations (like lists or grids of items)
export function AnimateStagger({
  children,
  className = "",
  threshold = 0.15,
  viewportOnce = true,
  staggerDelay = 0.1,
  ...props
}) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: viewportOnce,
    amount: threshold
  })
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])
  
  const staggerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={staggerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// For individual items within a staggered animation
export function StaggerItem({
  children,
  className = "",
  variants = listItem,
  ...props
}) {
  return (
    <motion.div
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
} 