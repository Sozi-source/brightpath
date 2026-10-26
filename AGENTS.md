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
6. **Enterprise Minimal Text & High Density (Strict Rule)**:
   - **NO TEXT CONGESTION**: Forbid multi-sentence paragraphs, verbose instructional prose, essay subtitles, and cluttered helper text under inputs. Enterprise apps (Stripe, Linear, GitHub) are concise and self-explanatory.
   - **Punchy Titles**: 1 to 3 words. Subtitles must be 1 short sentence (max 8-10 words) or omitted completely.
   - **High-Grade UI Assets**: Crisp Lucide icons in subtle tinted containers (`p-2 rounded-lg bg-blue-50 text-blue-700`), refined 1px borders (`border-slate-200`), sleek metric chips, and clean tabular data with zero fluff.
   - **Self-Explanatory Forms**: Form inputs must use clear, concise labels (`Category`, `Price (KES)`, `Admission No`) without multi-line explanatory paragraphs beneath them. Avoidable legal/policy disclaimers must be reduced to single-line checkboxes or tooltips.
7. **World-Class Refined Typography & Font Weights (Strict Rule)**:
   - **Font Stack**: Primary UI uses **Geist Sans** (`var(--font-sans)` with `font-feature-settings: "cv02", "cv03", "cv04", "cv11", "tnum"`). Code and numerical values use **Geist Mono** (`var(--font-mono)`). Never fall back to generic Arial.
   - **FORBID HEAVY/THICK WEIGHTS**: Never use `font-black` (900) or `font-extrabold` (800) anywhere in the application. Heavy bold headings create visual clutter and look unrefined.
   - **Headings & Titles**: Use `font-semibold` (600) with subtle negative letter-spacing (`tracking-tight`).
   - **Stats & Metric Numbers**: Stats numbers must be sleek and disciplined: use `text-2xl font-semibold text-slate-900 tracking-tight` or `font-mono font-semibold`. Forbid bloated, thick bold numbers.
