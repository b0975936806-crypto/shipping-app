# Shipping App - Design System

## Overview
Shipping/logistics order management mobile-first application.

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #2563EB | Headers, primary buttons, links |
| Secondary | #3B82F6 | Secondary elements, hover states |
| CTA | #F97316 | Action buttons (新增, 查詢) |
| Success | #22C55E | Success states |
| Danger | #EF4444 | Delete, error states |
| Background | #F8FAFC | Page background |
| Card BG | #FFFFFF | Card backgrounds |
| Text Primary | #0F172A | Main text |
| Text Secondary | #64748B | Secondary text |
| Border | #E2E8F0 | Borders, dividers |

## Typography

- **Font Family**: Fira Sans (Google Fonts)
- **Fallback**: system-ui, -apple-system, sans-serif
- **Headings**: Fira Sans 600-700
- **Body**: Fira Sans 400-500

## Spacing System

- Base unit: 4px
- Common spacing: 8px, 12px, 16px, 20px, 24px
- Card padding: 16px
- Modal padding: 20px

## Border Radius

- Small: 6px (buttons, inputs)
- Medium: 8px (cards)
- Large: 12px (modals)

## Shadows

- Card: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
- Modal: `0 25px 50px -12px rgba(0,0,0,0.25)`
- Button hover: `0 4px 6px rgba(0,0,0,0.1)`

## Transitions

- Duration: 150-200ms
- Easing: ease-in-out
- Properties: background-color, border-color, box-shadow, transform

## Components

### Stats Cards
- 4-column horizontal grid
- Background: primary (#2563EB)
- Text: white
- Rounded: 8px
- Padding: 12px 8px

### Query Form
- 3-column grid for first row (開始日, 截止日, 新增)
- 2-column grid for second row (客戶 span 2, 查詢)
- Labels: 14px, secondary color
- Inputs: 100% width, 10px padding, 6px radius

### Order Card
- Border: 1px solid #E2E8F0
- Border radius: 8px
- Header: primary background, white text
- Content: 2-column grid layout
- Hover: subtle shadow elevation

### Modal
- Overlay: rgba(0,0,0,0.5)
- Modal: white, 12px radius, 20px padding
- Header: primary background
- Buttons: 6px radius, full width in grid

### Image Thumbnails
- Size: 80x80px
- Object fit: cover
- Border radius: 6px
- Delete button: 20px circle, red, top-right corner

## Anti-Patterns to Avoid

- ❌ No emojis as icons
- ❌ No layout shift on hover
- ❌ No insufficient contrast
- ❌ No instant state changes

## Implementation Notes

- Use cursor-pointer on all clickable elements
- Use smooth transitions (150-200ms)
- Use proper shadow elevations
- Test at 375px (mobile) width
