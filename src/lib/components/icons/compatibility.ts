/**
 * FontAwesome Icons Compatibility File
 * 
 * This file contains compatibility exports to ensure existing code
 * continues to work with the new icon system that uses SVG+JS.
 */

// Import from the new main index
import {
  FontBasedIcon,
  SVGBasedIcon,
  DirectFAIcon,
  DirectSVGIcon,
  DebugFontIcon,
  FontAwesomeIconStyle,
  SVGIconStyle,
  FAIcon
} from './index';

// Re-export with old names for backward compatibility
export const DirectFontAwesome = DirectFAIcon;
export const DirectSVG = DirectSVGIcon;
export const DebugIcon = DebugFontIcon;
export const DebugFontAwesome = DebugFontIcon;
export const ProperFontAwesome = SVGBasedIcon;
export const ProperIconStyle = SVGIconStyle;
export const IconStyle = FontAwesomeIconStyle;
export const FontIconStyle = FontAwesomeIconStyle;
export const FontAwesomeIcon = FAIcon; 