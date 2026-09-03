# Smooth menu skeleton loading

## Goal
Add immediate, shimmering loading placeholders across the public menu while preserving the exact final layout and preventing content shifts.

## Implementation
- Track the initial loading state for categories, dishes, offers, options, and theme as one coordinated menu load, including safe completion when any request fails.
- Add reusable skeleton primitives and composed placeholders for:
  - Category tiles in the existing two-column grid.
  - Offer cards in the existing responsive offer grid.
  - Four “الأكثر طلباً” dish cards matching the real 4:3 image and content layout.
  - Full-width dish cards matching the expanded category layout.
- Show category skeletons immediately on first load and dish skeletons briefly when a category is opened, then cross-fade to actual content.
- Track image readiness per URL so each real image is revealed only after decoding/loading; retain a same-size shimmer underneath and fall back to the existing placeholder on error.
- Use semantic theme colors for a subtle gold/forest shimmer, with `prefers-reduced-motion` support.

## Validation
- Verify initial load, offers, featured four-slot layout, category switching, image completion, and failed-image fallback.
- Check mobile and desktop layouts for stable dimensions and no visible layout jump.
- Confirm the current build remains clean.
