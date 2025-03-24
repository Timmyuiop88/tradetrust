"use client"

import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Globe, 
  Zap, 
  Shield,
  Mail,
  Gift,
  Gamepad2,
  ShoppingCart,
  Laptop,
  Phone
} from "lucide-react";
import Image from "next/image";

export function PlatformIcon({ platform, size = "md", className = "" }) {
  // Platform name could be an object with a name property or just a string
  const platformName = typeof platform === 'object' ? platform?.name : platform;
  
  // Size values for different icon sizes
  const sizes = {
    sm: { icon: 16, wrapper: "h-4 w-4" },
    md: { icon: 20, wrapper: "h-5 w-5" },
    lg: { icon: 24, wrapper: "h-6 w-6" },
    xl: { icon: 32, wrapper: "h-8 w-8" },
    "2xl": { icon: 48, wrapper: "h-12 w-12" },
  };
  
  const iconSize = sizes[size] || sizes.md;
  
  // Handle platform icon mapping
  if (!platformName) {
    return <Globe className={`${iconSize.wrapper} ${className}`} />;
  }
  
  const nameLower = platformName.toLowerCase();
  
  // Map platform names to icons
  if (nameLower.includes('instagram')) {
    return <Instagram className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('twitter')) {
    return <Twitter className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('facebook')) {
    return <Facebook className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('vpn')) {
    return <Shield className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('express')) {
    return <Zap className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('email')) {
    return <Mail className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('amazon')) {
    return <ShoppingCart className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('gaming') || nameLower.includes('game')) {
    return <Gamepad2 className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('giftcard') || nameLower.includes('gift')) {
    return <Gift className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('tech') || nameLower.includes('subscription')) {
    return <Laptop className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('phone')) {
    return <Phone className={`${iconSize.wrapper} ${className}`} />;
  }
  
  // Default icon
  return <Globe className={`${iconSize.wrapper} ${className}`} />;
} 