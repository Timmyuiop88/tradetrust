"use client"

import { 
  Users, 
  Mail, 
  Gift, 
  Gamepad2, 
  Shield, 
  Phone, 
  Tv, 
  Briefcase,
  Zap,
  Globe
} from "lucide-react";

export function CategoryIcon({ category, size = "md", className = "" }) {
  // Category name could be an object with a name property or just a string
  const categoryName = typeof category === 'object' ? category?.name : category;
  
  // Size values for different icon sizes
  const sizes = {
    sm: { icon: 16, wrapper: "h-4 w-4" },
    md: { icon: 20, wrapper: "h-5 w-5" },
    lg: { icon: 24, wrapper: "h-6 w-6" },
    xl: { icon: 32, wrapper: "h-8 w-8" },
    "2xl": { icon: 48, wrapper: "h-12 w-12" },
  };
  
  const iconSize = sizes[size] || sizes.md;
  
  // Handle category icon mapping
  if (!categoryName) {
    return <Globe className={`${iconSize.wrapper} ${className}`} />;
  }
  
  const nameLower = categoryName.toLowerCase();
  
  // Map category names to icons
  if (nameLower.includes('account')) {
    return <Users className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('email')) {
    return <Mail className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('giftcard') || nameLower.includes('gift')) {
    return <Gift className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('gaming') || nameLower.includes('game')) {
    return <Gamepad2 className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('vpn')) {
    return <Shield className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('phone')) {
    return <Phone className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('subscription')) {
    return <Tv className={`${iconSize.wrapper} ${className}`} />;
  } else if (nameLower.includes('business')) {
    return <Briefcase className={`${iconSize.wrapper} ${className}`} />;
  }
  
  // Default icon
  return <Zap className={`${iconSize.wrapper} ${className}`} />;
} 