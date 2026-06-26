---
name: ProfilED Nature-Digital System
colors:
  surface: '#fefbdb'
  surface-dim: '#dedbbd'
  surface-bright: '#fefbdb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f5d6'
  surface-container: '#f2efd0'
  surface-container-high: '#ece9cb'
  surface-container-highest: '#e7e4c5'
  on-surface: '#1d1c0a'
  on-surface-variant: '#414844'
  inverse-surface: '#32311d'
  inverse-on-surface: '#f5f2d3'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#406653'
  primary: '#001d11'
  on-primary: '#ffffff'
  primary-container: '#0a3323'
  on-primary-container: '#749d87'
  inverse-primary: '#a6d0b9'
  secondary: '#51652a'
  on-secondary: '#ffffff'
  secondary-container: '#d3eca2'
  on-secondary-container: '#576b30'
  tertiary: '#2f0d08'
  on-tertiary: '#ffffff'
  tertiary-container: '#49211b'
  on-tertiary-container: '#c0857c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c2ecd4'
  primary-fixed-dim: '#a6d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#284e3c'
  secondary-fixed: '#d3eca2'
  secondary-fixed-dim: '#b8cf88'
  on-secondary-fixed: '#141f00'
  on-secondary-fixed-variant: '#3a4d15'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#f8b7ac'
  on-tertiary-fixed: '#34100b'
  on-tertiary-fixed-variant: '#683a33'
  background: '#fefbdb'
  on-background: '#1d1c0a'
  surface-variant: '#e7e4c5'
  midnight-green: '#105666'
  cloud-white: '#FFFFFF'
  deep-forest: '#061F15'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 80px
  stack-gap: 12px
---

## Brand & Style

The design system is built on a philosophy of "Organic Professionalism." It bridges the gap between high-end productivity tools and the approachable, optimistic energy of Gen Z. The brand personality is scholarly yet adventurous—like a prestigious university campus integrated into a serene forest.

The visual style is a blend of **Minimalism** and **Glassmorphism**, leaning heavily on Apple-inspired spatial depth. It uses generous whitespace to create a sense of calm focus, ensuring the AI-driven discovery process feels like a guided journey rather than a mechanical search. Elements should feel "light" and "aerodynamic," as if floating within a breezy, cloud-filled environment.

## Colors

The palette rejects traditional "Tech Blue" in favor of a grounding, nature-inspired collection. 

- **Primary Background (#F7F4D5):** This warm beige acts as a soft paper-like canvas, reducing eye strain and feeling more premium than pure white.
- **Primary Green (#0A3323):** Used for high-authority elements—typography, primary actions, and navigation. It provides the necessary "LinkedIn-level" seriousness.
- **Moss & Rosy Brown:** These function as the "magical" accents. Moss Green is reserved for growth metrics and progress, while Rosy Brown provides a human, soft touch for notifications and interactive hover states.
- **Midnight Green (#105666):** Specifically designated for dashboard containers and card backgrounds to create a sophisticated "dark-mode-in-light-mode" contrast for data-heavy areas.

## Typography

The typography is centered around **Plus Jakarta Sans** for its friendly yet precise geometric construction. 

- **Headlines:** Use tight letter-spacing and heavy weights to create a "bold-type" editorial feel. Headlines should always use the Primary Green color.
- **Body Text:** Maintains generous line height to ensure readability within the airy layout.
- **Labels:** **Outfit** is utilized for metadata and UI labels to provide a slight technical distinction from the more expressive body text, maintaining the "Apple" aesthetic of clean, readable functional text.

## Layout & Spacing

This design system employs a **Fixed Grid** for content-heavy pages and a **Fluid, Centered** model for discovery feeds.

- **Desktop:** A 12-column grid with a generous 1280px max-width. Margins are intentionally wide (64px) to create the "floating" feeling of the center content.
- **Rhythm:** An 8px linear scale is used, but for "afterboard-style" layouts, vertical spacing between sections is increased to 80px+ to let the "cloud" backgrounds breathe.
- **Mobile:** Transitions to a single-column layout with 20px margins. Floating cards should lose their external shadows on mobile to maximize horizontal screen estate, switching to subtle hairlines.

## Elevation & Depth

Depth is the cornerstone of this system. We use three tiers of elevation:

1.  **The Canvas (Level 0):** The Beige background (#F7F4D5), often layered with large, soft-focus organic shapes (clouds or leaves) in slightly lighter/darker tints.
2.  **Floating Containers (Level 1):** Cards use a primary white background (#FFFFFF) with a "Long Shadow"—a very low-opacity (4-6%), high-blur (40px+) shadow tinted with Primary Green to avoid a "dirty" gray look.
3.  **Glass Hero Elements (Level 2):** Critical AI-powered features or navigation bars use a semi-transparent blur (Backdrop Filter: blur(20px)). This gives the impression of frosted glass hovering above the canvas.

## Shapes

The shape language is ultra-soft and approachable. 
- **Standard Cards:** Use 24px corner radius.
- **Large Hero Containers:** Can go up to 32px to emphasize the "friendly" nature.
- **Interactive Elements:** Buttons and tags use a fully rounded (pill) style to contrast against the rectangular (but soft) cards. This distinction helps users quickly identify "actionable" vs "informational" elements.

## Components

### Buttons
- **Primary:** Solid #0A3323 with white text. Pill-shaped. On hover, it undergoes a subtle 2px lift with an increased shadow spread.
- **Secondary:** Transparent with a 1.5px border of #0A3323.
- **Ghost:** Rosy Brown text with no background, used for low-priority actions or "Cancel."

### Floating Cards
Containers for student profiles or "Discovery" results. They must feature a 24px corner radius and the "Deep Forest" tinted shadow. Within these cards, use "Midnight Green" (#105666) for internal data sections to create focus.

### Input Fields
Large, pill-shaped inputs with #F7F4D5 backgrounds (slightly darker than the page background) and 16px horizontal padding. The focus state uses a 2px Moss Green border.

### Chips & Tags
Small pill-shaped elements using #839958 at 15% opacity with #0A3323 text. These are essential for "Gen Z" style interest tags (e.g., "Web3", "Climate Tech").

### Glass Navigation
The top navigation bar should be a "floating dock" (not edge-to-edge). It uses a glassmorphic background with a 1px white border to define its edges against the beige background.
