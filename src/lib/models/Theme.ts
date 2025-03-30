import { DocumentSnapshot, QueryDocumentSnapshot, Timestamp } from 'firebase/firestore';

export enum ThemeCategory {
  BRIGHT = 'bright',
  SUBTLE = 'subtle',
  LIGHT = 'light',
  NEUTRAL = 'neutral'
}

export interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  category: ThemeCategory;
  gradientColors: string[];
  createdAt: Date;
  palette: string[];
  accentColor?: string;
  textOnPrimaryColor?: string;
  textOnDarkColor?: string;
  contrastRatio?: number;
}

export const themeFromFirestore = (doc: DocumentSnapshot | QueryDocumentSnapshot): Theme | null => {
  const data = doc.data();
  if (!data) return null;
  
  // Required fields
  const name = data.name as string;
  const primaryColor = data.primary_color as string;
  const secondaryColor = data.secondary_color as string;
  const categoryRaw = data.category as string;
  const gradientColors = data.gradient_colors as string[];
  const timestamp = data.created_at as Timestamp;
  
  if (!name || !primaryColor || !secondaryColor || !categoryRaw || !gradientColors || !timestamp) {
    console.error('Missing required theme fields');
    return null;
  }
  
  const category = categoryRaw as ThemeCategory;
  
  return {
    id: doc.id,
    name,
    primaryColor,
    secondaryColor,
    category,
    gradientColors,
    createdAt: timestamp.toDate(),
    palette: data.palette as string[] || [],
    accentColor: data.accent_color as string,
    textOnPrimaryColor: data.text_on_primary as string,
    textOnDarkColor: data.text_on_dark as string,
    contrastRatio: data.contrast_ratio as number
  };
};

// Helper functions for color calculations
export const isColorDark = (hex: string): boolean => {
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    
    // Calculate perceived brightness
    const brightness = (r * 0.299) + (g * 0.587) + (b * 0.114);
    
    // A brightness below 0.5 is considered "dark"
    return brightness < 0.5;
  }
  
  return true; // Default to dark if we can't parse
};

export const isColorLight = (hex: string): boolean => {
  return !isColorDark(hex);
};

export const calculateContrastRatio = (foreground: string, background: string): number => {
  // Calculate relative luminance for both colors
  const getLuminance = (hex: string): number => {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    
    let r, g, b: number;
    if (cleanHex.length === 3) { // RGB format
      r = parseInt(cleanHex.charAt(0) + cleanHex.charAt(0), 16) / 255;
      g = parseInt(cleanHex.charAt(1) + cleanHex.charAt(1), 16) / 255;
      b = parseInt(cleanHex.charAt(2) + cleanHex.charAt(2), 16) / 255;
    } else { // RRGGBB format
      r = parseInt(cleanHex.substring(0, 2), 16) / 255;
      g = parseInt(cleanHex.substring(2, 4), 16) / 255;
      b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    }
    
    // Convert RGB to linear values
    const toLinear = (value: number): number => {
      if (value <= 0.03928) {
        return value / 12.92;
      } else {
        return Math.pow((value + 0.055) / 1.055, 2.4);
      }
    };
    
    r = toLinear(r);
    g = toLinear(g);
    b = toLinear(b);
    
    // Calculate luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  
  // Calculate contrast ratio
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}; 