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

/**
 * Converts a HEX color string to HSL values.
 * Source: https://css-tricks.com/converting-color-spaces-in-javascript/
 */
const hexToHSL = (H: string): { h: number; s: number; l: number } | null => {
  // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  if (H.length == 4) {
    r = parseInt("0x" + H[1] + H[1]);
    g = parseInt("0x" + H[2] + H[2]);
    b = parseInt("0x" + H[3] + H[3]);
  } else if (H.length == 7) {
    r = parseInt("0x" + H[1] + H[2]);
    g = parseInt("0x" + H[3] + H[4]);
    b = parseInt("0x" + H[5] + H[6]);
  } else {
      return null; // Invalid hex length
  }
  // Then convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
}

/**
 * Interface representing a theme object with at least a primary color.
 */
interface ThemeWithPrimaryColor {
    id: string; // Or some identifier
    primary_color?: string; // Assuming Firestore field name
    // ... other theme properties
}

/**
 * Sorts an array of theme objects based on the hue of their primary_color 
 * in a ROYGBIV-like order (Red, Orange, Yellow, Green, Blue, Indigo, Violet).
 * Themes without a valid primary_color are placed at the end.
 */
export const sortByROYGBIV = <T extends ThemeWithPrimaryColor>(themes: T[]): T[] => {
  return themes.sort((a, b) => {
    const colorA = a.primary_color ? `#${a.primary_color}` : null;
    const colorB = b.primary_color ? `#${b.primary_color}` : null;
    
    const hslA = colorA ? hexToHSL(colorA) : null;
    const hslB = colorB ? hexToHSL(colorB) : null;
    
    // Handle cases where colors or HSL conversion failed
    if (!hslA && !hslB) return 0; // Both invalid, keep order
    if (!hslA) return 1; // A is invalid, put it after B
    if (!hslB) return -1; // B is invalid, put it after A
    
    // Compare hues for ROYGBIV order
    // Adjusting hue ranges slightly for better grouping if needed
    // Example: Violet might wrap around, so treat low hues (reds) as higher than high hues (violets)
    const hueA = hslA.h;
    const hueB = hslB.h;
    
    // Basic hue comparison - can be refined for specific ROYGBIV grouping
    return hueA - hueB;
  });
}; 