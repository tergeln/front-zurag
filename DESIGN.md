# Zurag — Figma Make implementation

Source: user-provided `Website Redesign for Conversions/src/App.tsx` and `src/index.css` (Figma file VO3WXXVTf2DGTovOL5WVwb).

## Visual direction
Adapt the source layout to existing Next.js components: pill buttons, large rounded hero photo, yellow decorative frames, floating note, numbered cards, lavender privacy panel, purple photographer CTA and charcoal footer. Preserve the plain Zurag name, original Mongolian/English dictionary text, existing routes, all four process steps, and centered copyright.

The original source's Findly brand, simulated upload/search, invented result counts, testimonials and unsupported privacy guarantees are intentionally excluded. Search still starts with selecting an actual event, and photographer applications use the existing application route. Authentication and payment code is unchanged by this redesign.

## Palette
- Primary: #6D28D9; hover: #5B21B6.
- Gold: #FFB84D.
- Paper: #F8F8F5; ink/footer: #151714.
- Soft panel: #F1E9FF.
- Dark mode: #141218 paper, #B69AF2 accent text.
- Geist and Geist Mono retain existing Cyrillic font configuration.

## Local image assets
All three source photographs are downloaded locally and rendered with Next/Image:
- public/images/figma-friends.jpg — hero, Sthembile Nobathana, Unsplash photo 1711743658461-38c875d37c8e.
- public/images/figma-celebration.jpg — privacy panel, Vann, Unsplash photo 1742890187030-1fbe30b2b298.
- public/images/figma-gathering.jpg — photographer panel, Freddie Collins, Unsplash photo 1667515385691-cde1596f7bc0.

These are illustrative stock photographs, not actual event listings or customer endorsements. Hero uses priority loading; lower images lazy load with responsive sizes. No external font or animation library was added.

## Verification
43 unit tests, ESLint, TypeScript. Browser review at 1440px and 390px, light/dark mode, and the how-it-works anchor. Authentication, payments and real AI search still require service credentials and are not validated by this visual pass.
