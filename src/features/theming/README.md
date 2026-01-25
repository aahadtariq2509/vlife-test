# Color Palette System

This directory contains a comprehensive color palette system for the VLW frontend application. The system provides consistent colors across the application with support for multiple color categories and shades.

## Files Overview

- `colors.js` - Main color palette with all color definitions and utility functions
- `colors.d.ts` - TypeScript declarations for type safety
- `color-variables.css` - CSS custom properties for all colors (located in `src/styles/`)
- `color-examples.jsx` - Usage examples and demonstrations
- `ThemeProvider.jsx` - Theme context provider
- `ThemeToggle.jsx` - Theme toggle component

## Color Categories

### Primary Colors
- **Primary Blue**: `#4289E6` (main primary color)
- **Blue Shades**: Including `#559EFE` and other blue variations

### Purple/Violet Colors
- **Purple**: `#7847FF`, `#561FE8`, `#9747FF` (your specified colors)
- Multiple shades from 50 (lightest) to 950 (darkest)

### Additional Categories
- **Gray**: Complete gray scale from white to black
- **Green**: Success and nature-themed colors
- **Red**: Error and danger-themed colors
- **Yellow**: Warning and attention colors
- **Orange**: Warm and energetic colors
- **Pink**: Soft and vibrant colors
- **Indigo**: Deep blue-purple colors
- **Teal**: Blue-green colors
- **Cyan**: Bright blue colors

### Semantic Colors
- **Success**: Green-based colors for success states
- **Warning**: Yellow-based colors for warnings
- **Error**: Red-based colors for errors
- **Info**: Blue-based colors for information

## Usage

### 1. JavaScript/React Usage

```javascript
import { colors, colorUtils } from '@/features/theming';

// Direct color access
const primaryColor = colors.primary[500]; // #4289E6
const purpleShade = colors.purple[600];   // #7847FF

// Using color utilities
const primaryWithOpacity = colorUtils.withOpacity(colors.primary[500], 0.5);
const randomColor = colorUtils.getRandomColor('purple');
```

### 2. Tailwind CSS Usage

```jsx
// Using Tailwind classes (automatically available)
<div className="bg-primary-500 text-white p-4 rounded-lg">
  Primary background
</div>

<div className="bg-purple-600 text-white p-4 rounded-lg">
  Purple background
</div>
```

### 3. CSS Custom Properties

```css
/* Using CSS custom properties */
.my-element {
  background-color: var(--color-primary-500);
  color: var(--color-white);
  border: 1px solid var(--color-gray-200);
}
```

### 4. Inline Styles

```jsx
<div
  style={{
    backgroundColor: colors.primary[500],
    color: colors.white,
    padding: '1rem',
  }}
>
  Styled element
</div>
```

## Color Shade System

Each color category follows a consistent shade system:

- **50**: Lightest shade (almost white)
- **100**: Very light
- **200**: Light
- **300**: Medium light
- **400**: Medium
- **500**: Base color (most commonly used)
- **600**: Medium dark
- **700**: Dark
- **800**: Very dark
- **900**: Darkest
- **950**: Almost black

## Utility Functions

### `colorUtils.withOpacity(color, opacity)`
Adds opacity to a color value.

```javascript
const semiTransparent = colorUtils.withOpacity(colors.primary[500], 0.5);
// Returns: rgba(66, 137, 230, 0.5)
```

### `colorUtils.getRandomColor(category)`
Gets a random color from a specific category.

```javascript
const randomBlue = colorUtils.getRandomColor('blue');
const randomPurple = colorUtils.getRandomColor('purple');
```

### `colorUtils.getColorShades(category)`
Gets all shades of a specific color category.

```javascript
const allPurpleShades = colorUtils.getColorShades('purple');
// Returns: { 50: '#faf5ff', 100: '#f3e8ff', ... }
```

## Your Specified Colors

The following colors you specified are included in the palette:

- **Primary Blue**: `#4289E6` (primary[500])
- **Blue Shade**: `#559EFE` (blue[500])
- **Purple**: `#7847FF` (purple[600])
- **Purple Shade 1**: `#561FE8` (purple[700])
- **Purple Shade 2**: `#9747FF` (purple[800])

## Best Practices

1. **Consistency**: Use the same color shade across similar UI elements
2. **Accessibility**: Ensure sufficient contrast between text and background colors
3. **Semantic Usage**: Use semantic colors (success, warning, error, info) for their intended purposes
4. **Dark Mode**: Consider how colors will look in both light and dark themes
5. **Brand Colors**: Use primary colors for brand elements and CTAs

## Examples

See `color-examples.jsx` for comprehensive usage examples including:
- Inline styles
- Tailwind classes
- Color utilities
- CSS custom properties
- Color showcase
- Semantic colors
- Gradients
- Dark mode considerations

## Integration

The color palette is automatically integrated with:
- Tailwind CSS (via `tailwind.config.js`)
- CSS custom properties (via `src/styles/color-variables.css`)
- TypeScript (via `colors.d.ts`)
- React components (via the theming system)
