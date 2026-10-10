---
name: Clear Ledger
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00201d'
  on-tertiary-container: '#0c9488'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-currency:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  display-currency-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system serves a mobile-first peer-to-peer expense-splitting PWA designed for shared living arrangements. The aesthetic fuses fintech-grade precision with the approachability of a collaborative domestic utility. It eliminates the social friction, ambiguity, and discomfort often associated with shared finances among housemates and young professionals.

The visual direction follows **Modern Fintech Utility**: clean, architectural card layouts, high-legibility typographic hierarchies, and functional color coding. The experience relies on immediate clarity—users can ascertain their net balance, individual group shares, and outstanding dues in a fraction of a second without cognitive strain. The interface conveys structural reliability through slate surfaces, balanced by vibrant teal and indigo interactive anchors that make frequent micro-interactions (logging a grocery run, settling an electricity bill) feel frictionless, definitive, and effortless.

## Colors

The palette establishes crisp balance and unmistakable financial status differentiation.

- **Primary (`#0F172A` / `#1E293B`)**: Deep Slate and Navy define primary navigation anchors, core structural chrome, typography, and prominent summary card surfaces.
- **Secondary (`#4F46E5`)**: Indigo acts as the focal brand accent for primary conversion actions, active tabs, and primary state toggles.
- **Tertiary (`#0D9488`)**: Vibrant Teal highlights secondary actions, quick-split shortcuts, and interactive utility chips.
- **Semantic Status Signals**:
  - **Positive / Settled (`#059669`)**: Emerald green signals positive balances ("you are owed"), successful payouts, and complete settlements. Tinted background: `#ECFDF5`.
  - **Negative / Owes (`#E11D48`)**: Vivid rose signals outstanding obligations ("you owe") and overdue balances. Tinted background: `#FFF1F2`.
  - **Pending / Action Required (`#D97706`)**: Warm amber signals draft expenses, unverified receipts, and pending approval items. Tinted background: `#FFFBEB`.
- **Surfaces & Backgrounds**: The base canvas is set to `#F8FAFC`, paired with pure white (`#FFFFFF`) card planes to build legible separation without visual weight.

## Typography

The typographic hierarchy pairs **Plus Jakarta Sans** for headers, numeric financial representations, and body copy with **Inter** for compact labels, system captions, and interactive metadata.

Currency amounts (prominently featuring the INR `₹` sign) must always utilize tabular figures (`font-variant-numeric: tabular-nums`) to ensure strict vertical alignment across ledger lists, breakdown sheets, and settlement cards. The designated display currency tokens maintain tight letter tracking to emphasize large numerical balances without dominating vertical screen real estate on compact viewports.

## Elevation & Depth

Depth is established via layered surface stacking combined with cool, ambient slate drop shadows and subtle structural border lines:

- **Canvas (Level 0)**: `#F8FAFC` base surface, zero shadow.
- **Cards & Ledger Units (Level 1)**: Pure white `#FFFFFF` surface paired with a fine 1px border (`rgba(226, 232, 240, 0.8)`) and an ultra-soft slate shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)`.
- **Floating Overlays & Action Bars (Level 2)**: Sticky bottom quick-action bars and summary panels utilize `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)` with a translucent backdrop blur (`backdrop-filter: blur(8px)`) over scrollable items.
- **Drawers, Sheets & Modals (Level 3)**: Bottom-sheet expense splitters use `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`, anchored over a `#0F172A` backdrop mask at 40% opacity.

## Shapes

The shape vocabulary employs a modern rounded geometry (Level 2). Standard container elements, input modules, and cards use an 8px (`0.5rem`) base corner radius, expanding to 16px (`1rem`) on outer feature cards and expense list modules, and 24px (`1.5rem`) on bottom sheets and modal dialogs. 

Small tags, state indicators, and floating avatars deviate toward continuous pill radiuses (`9999px`) to maintain clear shape differentiation between content containers and tappable status entities.

## Components

### Buttons
- **Primary**: Indigo (`#4F46E5`), text white, 48px height, 12px horizontal padding, font `label-lg`. Pressed state darkens to `#4338CA`.
- **Secondary / Quick Pay**: Deep slate (`#0F172A`), text white, 48px height.
- **Subtle / Ghost**: Light slate tint (`#F1F5F9`), text `#1E293B`, 48px height, used for secondary actions like "Remind" or "Add Receipt".

### Status Pills & Balance Badges
- Compact pill-shaped labels (`rounded-full`, 24px–28px height, 8px–12px padding) using uppercase font `label-sm`.
- **Lent / Positive**: `#ECFDF5` background with `#059669` typography (e.g., "+₹1,250").
- **Owed / Negative**: `#FFF1F2` background with `#E11D48` typography (e.g., "-₹450").
- **Settled / Neutral**: `#F1F5F9` background with `#64748B` typography.

### Input Fields
- Minimum height of 48px with a 1px border of `#CBD5E1` and `#FFFFFF` background.
- Focus state reveals an Indigo `#4F46E5` ring (`box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2)`).
- **Currency Entry Inputs**: Auto-focused, large numeric fields supporting the `₹` prefix locked in slate gray `#64748B` with heavy bold font sizes (`display-currency`).

### Cards & Ledger Lists
- Expense items feature a clean 3-zone layout:
  1. Left: 40px rounded avatar or category icon tile (groceries, rent, utilities).
  2. Center: Title, paid-by metadata, and relative timestamp (`body-md` and `body-sm`).
  3. Right: Formatted currency display aligned flush-right, paired with status pill or user share attribution.
- Dividers between list items use hairline lines (`#F1F5F9`), avoiding heavy visual separation.

### Specialized Roommate Modules
- **Quick-Split Toggle**: Segmented pill control ("Split Equally", "Exact Amounts", "By Percent") with smooth transition easing.
- **Settlement Card**: High-contrast slate gradient card (`#0F172A` to `#1E293B`) presenting the housemate pair, settlement amount, and direct UPI/payment intent button in one single touch target.