# CSS-UI-01C Responsive Layout Audit

## Baseline

Measured Chromium layout before CSS-UI-01C changes at the requested viewports. Screenshots are in `artifacts/css-ui-01c/before/`.

| Viewport | Landing header | Hero minimum | Get Started bounds | Login card bounds | Finding |
| --- | ---: | ---: | ---: | ---: | --- |
| 667 × 375 | 91 px high | 330 px | y=327–367 | y=10–485 | Two-row header leaves the CTA 8 px above the viewport bottom; auth card continues 110 px below the first view. |
| 844 × 390 | 52 px high | 330 px | y=296–336 | y=10–483 | Desktop navigation is selected by width despite the short phone landscape; auth card continues 93 px below the first view. |
| 874 × 402 | 52 px high | 330 px | y=297–337 | y=10–483 | Same short-landscape sizing and card overflow as 844 × 390. |
| 320 × 568 | 95 px high | 500 px | y=504–552 | y=26–606 | Portrait CTA fits, but the auth card is 38 px taller than the viewport. |

The authentication screenshots did not reproduce a clipped heading at the tested viewport sizes: the seal, Welcome heading, tabs, email, password, and submit button begin within the viewport. The long card does extend below the initial view, and its role preview requires scrolling. The page has natural document scrolling; the auth scene uses `min-height`, not a fixed height, and there is no global vertical overflow lock.

## Root causes

1. The landing header switches only at `max-width: 760px`. At 667 × 375 this creates a two-row logo/action plus navigation header (91 px); at 844 × 390 it switches to desktop navigation. The short-landscape media rule reduces nav item height but does not change the width-based layout mode.
2. The short-landscape hero still has a forced `min-height` of 330 px. Combined with the header and page padding, this places the 667 × 375 primary actions at the viewport edge even though the hero content can fit in less vertical space.
3. The centered login card is 456 px wide and about 475 px tall in short landscape. Top alignment already keeps the heading reachable, but the full form and role preview cannot fit in the first screen. Existing overlapping width and height rules make the intended compact layout dependent on which breakpoint wins.
4. Mobile portrait uses a 500 px hero minimum and a two-row header. These currently keep the CTA visible at 320 × 568, but leave little first-screen margin and consume avoidable vertical space.

## Correction plan

- Use a compact mobile menu in phone portrait and short phone landscape, independent of a 760 px width boundary.
- Let the hero use content-driven height in short landscape and use a 24–30 px heading range there.
- Explicitly top-align and compact the auth card on short screens; retain natural page scrolling and safe-area padding so every control remains reachable.
- Add browser assertions for element rectangles, menu overlap, CTA first-screen visibility, top reachability, scroll-to-control behavior, and actual form activation at the requested viewports.
