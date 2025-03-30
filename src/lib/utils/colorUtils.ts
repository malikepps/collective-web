/**
 * Utility functions for color operations and calculations
 */

/**
 * Determines if a color is considered "dark" based on its brightness
 * @param hex - Hex color code (with or without # prefix)
 * @returns boolean - true if the color is dark, false otherwise
 */
export const isColorDark = (hex: string): boolean => {
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    
    // Calculate perceived brightness (Based on YIQ formula)
    const brightness = (r * 0.299) + (g * 0.587) + (b * 0.114);
    
    // A brightness below 0.5 is considered "dark"
    return brightness < 0.5;
  }
  
  return true; // Default to dark if we can't parse
};

/**
 * Determines if a color is considered "light" based on its brightness
 * @param hex - Hex color code (with or without # prefix)
 * @returns boolean - true if the color is light, false otherwise
 */
export const isColorLight = (hex: string): boolean => {
  return !isColorDark(hex);
};

/**
 * Calculates the contrast ratio between two colors
 * @param foreground - Hex color code for foreground (with or without # prefix)
 * @param background - Hex color code for background (with or without # prefix)
 * @returns number - The contrast ratio (higher is better contrast)
 */
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
    
    // Calculate luminance using the formula from WCAG 2.0
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  
  // Calculate contrast ratio according to WCAG 2.0 formula
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}; 