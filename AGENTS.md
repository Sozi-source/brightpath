<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## BrightPath Institutional UI Standard (Mandatory)

**Strict Rule:** Never generate generic "AI Default UI" (dark-mode zinc-950, gigantic bubble-pill `rounded-3xl` corners, centered floating single cards, or washed-out gray text).

All pages across the application must strictly adhere to the **Kenya Education Cloud (KEC)** institutional standard detailed in [`docs/UI_DESIGN_SYSTEM.md`](docs/UI_DESIGN_SYSTEM.md):
1. **Institutional Shell**: Fixed global top bar (`h-16`, white) with 9-dot app launcher (`:::`) + persistent deep navy sidebar (`#0f3554`) with academic tracks and tool dividers.
2. **Two-Tone Accent Stripe**: Signature Blue (60%) + Kenyan Gold (40%) horizontal stripe across primary header cards.
3. **Interlocking Breadcrumb Ribbon**: Integrated pill/chevron tabs (`Home > Studio > Craft > Chapter 1`).
4. **Disciplined Geometry**: `rounded-lg` (8px) to `rounded-xl` (12px), crisp 1px borders (`border-slate-200`), clean `shadow-xs`, and soft blue-gray canvas (`#f4f7fb`).
5. **High-Contrast Typography**: Dark charcoal-navy headings (`#0f172a`), bold metadata bars, and readable tabular data (WCAG AAA compliant).
