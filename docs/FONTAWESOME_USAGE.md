# FontAwesome Usage in Collective Web

This document provides guidelines and best practices for using FontAwesome in the Collective web application.

## Implementation Overview

The Collective web app implements FontAwesome Pro icons in two ways:

1. **Font-based approach** - Using the actual font files
2. **SVG+JS approach** - Using the FontAwesome JavaScript library

### FontAwesome Files Location

- **Font files**: `/public/fonts/` directory
- **JS files**: `/public/fonts/js/` directory

## Component Types

We have several icon components, each with specific purposes:

### 1. FontAwesomeIcon

```tsx
import FontAwesomeIcon, { IconStyle } from '@/lib/components/icons/FontAwesomeIcon';

// Usage
<FontAwesomeIcon 
  icon="heart" 
  size={24} 
  style={IconStyle.CLASSIC}
  primaryColor="ff3b30" 
/>
```

- Uses the font-based approach
- Supported styles are `IconStyle.CLASSIC` (solid), `IconStyle.REGULAR`, and `IconStyle.DUOTONE`
- For duotone icons, add a `secondaryColor` prop

### 2. DirectFontAwesome

```tsx
import { DirectFontAwesome } from '@/lib/components/icons';

// Usage
<DirectFontAwesome 
  icon="heart"
  size={24}
  color="ff3b30"
/>
```

- A compatibility wrapper around FontAwesomeIcon
- Simplified props with just `icon`, `size`, and `color`
- Use this for basic icon needs

### 3. SVGIcon and DirectSVG

```tsx
import { DirectSVG } from '@/lib/components/icons';
import { SVGIconStyle } from '@/lib/components/icons/SVGIcon';

// Usage
<DirectSVG
  icon="heart"
  size={24}
  style={SVGIconStyle.SOLID}
  primaryColor="ff3b30"
/>
```

- Uses the SVG+JS approach (requires FontAwesome JS files)
- Supported styles are `SVGIconStyle.SOLID`, `SVGIconStyle.REGULAR`, `SVGIconStyle.DUOTONE`, and `SVGIconStyle.BRANDS`
- Better for icons that need to be interactive or animated

## Icon Styles

The different components have inconsistent style naming:

### FontAwesomeIcon Styles
```typescript
enum IconStyle {
  DUOTONE = 'duotone',
  CLASSIC = 'classic', // solid
  REGULAR = 'regular'
}
```

### SVGIcon Styles
```typescript
enum SVGIconStyle {
  SOLID = 'solid',
  REGULAR = 'regular',
  DUOTONE = 'duotone',
  BRANDS = 'brands'
}
```

⚠️ **Important**: Note that `CLASSIC` in FontAwesomeIcon equals `SOLID` in SVGIcon!

## Best Practices

1. **Direct Use**: For simple icons, use `DirectFontAwesome` or `DirectSVG`

2. **Type Safety**: 
   - Always import the correct style enum for the component you're using
   - When using `FontAwesomeIcon`, use `IconStyle` from the same file
   - When using `SVGIcon`, use `SVGIconStyle` from that file

3. **Color Format**:
   - For color props, use hex strings WITHOUT the leading `#` (e.g., `ff3b30` not `#ff3b30`)
   - For duotone icons, provide both `primaryColor` and `secondaryColor`

4. **Duotone Icons**:
   - Use `IconStyle.DUOTONE` with `FontAwesomeIcon`
   - Use `SVGIconStyle.DUOTONE` with `SVGIcon`

5. **Brand Icons**:
   - Only available with `SVGIcon` using `SVGIconStyle.BRANDS`
   - FontAwesomeIcon doesn't support brand icons

## Troubleshooting

If icons aren't displaying correctly:

1. **Missing Files**: Verify the font and JS files exist in `/public/fonts/` and `/public/fonts/js/`

2. **CSS Issues**: Make sure the FontAwesome CSS is properly loaded in `_app.tsx`

3. **Diagnostic Page**: Visit `/font-test` to diagnose icon loading issues

4. **Server-Side Rendering**: Icons that depend on the JS library will only render on the client side

## Examples

### Regular Icon (Solid style)
```tsx
// Using FontAwesomeIcon
<FontAwesomeIcon 
  icon="heart" 
  size={24} 
  style={IconStyle.CLASSIC}  // CLASSIC = solid
  primaryColor="ff3b30" 
/>

// Using DirectFontAwesome
<DirectFontAwesome 
  icon="heart"
  size={24}
  color="ff3b30"
/>

// Using DirectSVG
<DirectSVG
  icon="heart"
  size={24}
  style={SVGIconStyle.SOLID}
  primaryColor="ff3b30"
/>
```

### Duotone Icon
```tsx
// Using FontAwesomeIcon
<FontAwesomeIcon 
  icon="star" 
  size={32} 
  style={IconStyle.DUOTONE}
  primaryColor="ff9500"
  secondaryColor="ffcc00"
/>

// Using DirectSVG
<DirectSVG
  icon="star"
  size={32}
  style={SVGIconStyle.DUOTONE}
  primaryColor="ff9500"
  secondaryColor="ffcc00"
/>
```

### Brand Icon
```tsx
// Using DirectSVG
<DirectSVG
  icon="github"
  size={24}
  style={SVGIconStyle.BRANDS}
  primaryColor="333333"
/>

// Using HTML directly (fallback)
<span className="text-gray-800 text-3xl">
  <i className="fa-brands fa-github"></i>
</span>
``` 