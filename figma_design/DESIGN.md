---
name: UTravel Horizon
colors:
  surface: "#f7f9fb"
  surface-dim: "#d8dadc"
  surface-bright: "#f7f9fb"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f2f4f6"
  surface-container: "#eceef0"
  surface-container-high: "#e6e8ea"
  surface-container-highest: "#e0e3e5"
  on-surface: "#191c1e"
  on-surface-variant: "#424753"
  inverse-surface: "#2d3133"
  inverse-on-surface: "#eff1f3"
  outline: "#727785"
  outline-variant: "#c2c6d5"
  surface-tint: "#005bc0"
  primary: "#004da4"
  on-primary: "#ffffff"
  primary-container: "#0064d2"
  on-primary-container: "#dfe7ff"
  inverse-primary: "#adc6ff"
  secondary: "#006d3d"
  on-secondary: "#ffffff"
  secondary-container: "#7cfbad"
  on-secondary-container: "#007441"
  tertiary: "#714600"
  on-tertiary: "#ffffff"
  tertiary-container: "#925c00"
  on-tertiary-container: "#ffe3c6"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#d8e2ff"
  primary-fixed-dim: "#adc6ff"
  on-primary-fixed: "#001a41"
  on-primary-fixed-variant: "#004493"
  secondary-fixed: "#7cfbad"
  secondary-fixed-dim: "#5ede93"
  on-secondary-fixed: "#00210f"
  on-secondary-fixed-variant: "#00522d"
  tertiary-fixed: "#ffddb8"
  tertiary-fixed-dim: "#ffb95f"
  on-tertiary-fixed: "#2a1700"
  on-tertiary-fixed-variant: "#653e00"
  background: "#f7f9fb"
  on-background: "#191c1e"
  surface-variant: "#e0e3e5"
  midnight-slate: "#0F172A"
  ocean-slate: "#475569"
  shore-white: "#FFFFFF"
  border-hairline: "#E2E8F0"
  deal-orange: "#FF5E1F"
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: "800"
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 24px
    letterSpacing: "0"
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
    letterSpacing: "0"
  body-bold:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "600"
    lineHeight: 24px
    letterSpacing: "0"
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "700"
    lineHeight: 16px
    letterSpacing: 0.05em
  stat-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: "700"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: "800"
    lineHeight: 40px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1200px
  form-max: 800px
---

## Brand & Style

The design system for this online room booking platform is anchored in the **Corporate / Modern** aesthetic, intentionally softened with organic touches to evoke the spirit of travel. The brand personality is **Reliable, Inspiring, and Modern**, aiming to transform the often-stressful booking process into a seamless, professional, and welcoming journey.

The visual language balances the "Trust" of a financial institution with the "Wonder" of a travel agency. We utilize a **layered card-based architecture** to organize complex travel data into digestible, high-contrast modules. The overall feel is airy and structured, emphasizing high legibility and a mobile-first philosophy that prioritizes quick interactions and clear mental models for both travelers and vendors.

## Colors

The palette is a strategic blend of reliability and vitality:

- **Primary (Trust Marine Blue):** Used for primary CTAs, active states, and navigation anchors to reinforce security and professionalism.
- **Secondary (Nature Forest Green):** Reserved for "success" states, availability indicators, and eco-friendly travel badges.
- **Tertiary (Sandy Coast Gold):** Applied to ratings, loyalty tiers, and high-value highlights to provide warmth.
- **Neutral (Pebble Gray):** Used exclusively for the page background to reduce glare and allow white surfaces to pop.

**Surface Strategy:** All content lives on `shore-white` surfaces. We use `midnight-slate` for high-contrast headlines and `ocean-slate` for descriptive metadata to ensure WCAG AA compliance at all times.

## Typography

This design system uses **Inter** exclusively to ensure a systematic and utilitarian feel across the platform's data-rich interfaces.

- **Vertical Rhythm:** A strict 4px baseline grid is maintained.
- **Headlines:** Use `display-lg` for hero sections and `headline-md` for page titles. Bold weights (700-800) are used to anchor the user's eye.
- **Micro-copy:** `label-caps` is the workhorse for metadata, categories, and badges, utilizing increased letter spacing for readability at small sizes.
- **Mobile Scaling:** Headlines above 32px must scale down to their `-mobile` equivalents to prevent excessive line-breaking on small viewports.

## Layout & Spacing

This design system employs a **Fluid-to-Fixed Grid** hybrid:

- **The Core Layout:** A 12-column responsive grid. On desktop, content is centered within a `container-max` (1200px) limit. For focused workflows like checkout, we constrain the container to `form-max` (800px) to maintain a comfortable line length.
- **Search Results:** A specialized 3:9 split layout on desktop (3 columns for filters, 9 for results). On mobile, the filter bar becomes a horizontal scroll or a floating action button (FAB).
- **Rhythm:** We use an 8px-based spacing scale. Margins and paddings must always be multiples of 8 (e.g., 16px, 24px, 32px) to ensure visual harmony.
- **Mobile-First:** All components default to a single-column stack on screens smaller than 600px.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**:

- **Layer 0 (Background):** `Pebble Gray` (#F8FAFC) acts as the foundation.
- **Layer 1 (Cards/Surfaces):** `Shore White` (#FFFFFF) panels with a 1px `border-hairline` (#E2E8F0).
- **Layer 2 (Interaction):** On hover, cards transition from a flat hairline border to a `shadow-lg` (soft, diffused indigo-tinted shadow: `0 10px 15px -3px rgba(0, 56, 132, 0.1)`) to indicate clickability.
- **Elevated UI:** Modals and dropdowns use high-elevation shadows with a blur radius of 24px and 0.15 opacity to separate from the content below.

## Shapes

The shape language is **Rounded**, reflecting the friendly and approachable nature of the brand.

- **Standard Radius:** 0.5rem (8px) is applied to all buttons, inputs, and card containers.
- **Large Radius:** 1rem (16px) is used for "inspirational" elements like hero images and main category banners.
- **Full Radius:** Used only for status badges (chips) and floating action buttons to distinguish them from structural elements.

## Components

### Buttons

- **Primary:** Solid `primary-color` with white text. Height 44px (mobile) / 52px (desktop).
- **Secondary:** Outlined with 1.5px `primary-color` stroke.
- **Action:** For "Book Now," use the `Dusk Gradient` (Indigo to Green) to differentiate commercial conversion from utility navigation.

### Travel Cards

- Must include a `Card.Section` for full-bleed images (16:10 ratio).
- Top-right corner reserved for `Sandy Coast Gold` rating badges.
- Bottom-right reserved for bold pricing in `Midnight Slate`.

### Form Fields

- Inputs feature `shore-white` fills and `border-hairline` strokes.
- Focus state: Border color changes to `primary-color` with a 2px outer glow.
- Labels: Always positioned above the field in `body-bold`.

### Dashboard Widgets (Vendor)

- High-density `Paper` components with `rounded-md`.
- Key metrics (KPIs) use `stat-lg` font size.
- Include a 12px nature-green or error-red "trend" indicator next to the main stat.

### Chips & Badges

- Used for "Wifi," "Free Breakfast," or "Available."
- Nature-green background with 10% opacity and 100% opacity text for high readability and a soft, modern look.
