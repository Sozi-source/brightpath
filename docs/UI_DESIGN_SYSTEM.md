# BrightPath UI Design System & Architecture Specification

**Standard:** Institutional Academic LMS & Enterprise TVET Portal  
**Reference Benchmark:** Kenya Education Cloud ([`lms.kec.ac.ke`](https://lms.kec.ac.ke/))  
**Document Version:** 1.0.0  
**Target Audience:** All agents, developers, and UI engineers working on the BrightPath platform.  
**Rule Status:** **MANDATORY ACROSS ALL PAGES** — Strict override against generic AI aesthetic patterns.

---

## 1. Executive Directive: Eliminating the "AI Default UI"

Current generative AI coding models suffer from a pervasive bias toward a uniform, generic aesthetic: dark-zinc/slate monochrome palettes (`bg-zinc-950`, `border-zinc-800`), gigantic bubble-pill corners (`rounded-3xl`, `rounded-full`), washed-out low-contrast text (`text-zinc-500`), centered floating single-column cards on vast empty backgrounds, and tiny purple badges. 

While common in developer tooling and hobby projects, this look is **wholly inappropriate** for an official, accredited national educational platform in Kenya that serves TVET institutions, national polytechnics, KNEC examiners, supervisors, and candidates.

BrightPath must look, feel, and function like an **authoritative, enterprise-grade institutional learning portal** modeled on national standards such as the **Kenya Education Cloud (KEC)**.

### Comparison: Anti-Pattern vs. Institutional Standard

| Dimension | ❌ AI Default UI (Prohibited) | ✅ BrightPath Institutional Standard (Required) |
| :--- | :--- | :--- |
| **Visual Identity** | Dark-mode crypto/devtool monochrome (`zinc-950`, neon purple) | Authoritative Kenyan institutional navy (`#0f3554`), crisp white, and dual-color government accent stripes (Royal Blue `#1d4ed8` + Kenyan Gold `#f59e0b`). |
| **Page Architecture** | Isolated floating cards in screen center with ad-hoc topbars | Unified **Institutional Shell**: Fixed global top application bar with 9-dot app matrix + persistent, deep navy navigation sidebar with academic hierarchy. |
| **Card Geometry** | Exaggerated bubble radius (`rounded-3xl` / `rounded-[28px]`) | Clean, disciplined institutional radius: `rounded-lg` (8px) to `rounded-xl` (12px) with crisp 1px borders (`border-slate-200`) and subtle elevation (`shadow-xs`). |
| **Navigation & Trail** | Plain text `Home / Sub / Page` or invisible links | **Interlocking Breadcrumb Ribbon**: Styled pill tabs with arrow/chevron transitions giving candidates clear hierarchical context. |
| **Card Headers** | Plain text with generic Lucide icons | **Dual-Tone Accent Stripe**: Top edge features a 60/40 horizontal accent line (Blue + Gold) signaling national academic authority. |
| **Typography & Contrast** | Faded gray text (`text-zinc-500` / `zinc-600`) | High-contrast, legible typography: Dark slate/navy headings (`#0f172a`), crisp metadata bars, bold tabular data (WCAG AAA compliant). |
| **Information Density** | Sparse, airy, lots of empty padding | Structured, academic density: organized tables, rubrics cards, metadata bars, and clear document reader frames. |
| **Copy & Descriptions** | Congested, multi-sentence paragraphs, essay card subtitles, and explanatory disclaimers | **Enterprise Minimal Text**: Punchy 1-3 word titles, optional 1-sentence subtitle (max 10 words), zero essay subtitles, concise self-explanatory form inputs, and sleek high-grade cards with no clutter. |

---

## 1.1 Mandatory Rule: Enterprise Minimal Text & High Density

**Strict Rule:** Enterprise web applications (Stripe, Linear, GitHub, Vercel) never overwhelm users with dense explanatory prose, multi-line card subtitles, or long disclaimer paragraphs under form fields.

1. **Headings**: 1 to 3 words max (`Project Studio`, `Projects Marketplace`, `New Workspace`, `Administration`).
2. **Subtitles**: Exactly 1 short sentence (max 8-10 words) or omitted completely if the heading is self-explanatory.
3. **Card Content**: Remove avoidable paragraphs. Use compact metric chips, badges, and high-grade Lucide icons (`w-4 h-4` in tinted badge containers `p-2 rounded-lg bg-blue-50 text-blue-700`).
4. **Form Controls**: Labels must be concise (`Admission No`, `Price (KES)`, `Category`). Never put multi-line instructional paragraphs below inputs.
5. **Disclaimers & Policies**: Reduce bulky disclaimer boxes to sleek single-line checkboxes or contextual tooltips.

---

## 1.2 Mandatory Rule: World-Class Refined Typography & Font Weights

**Strict Rule:** Headings and metrics must NEVER use heavy, clunky bold weights (`font-black` or `font-extrabold`).

1. **Font Stack**: Primary typeface is **Geist Sans** with tabular numbers enabled (`font-feature-settings: "cv02", "cv03", "cv04", "cv11", "tnum"`). Code and numerical values use **Geist Mono**. Never fall back to generic Arial.
2. **Weight Discipline**:
   - **Primary Page Headings**: `text-xl sm:text-2xl font-semibold tracking-tight text-slate-900` (replaces heavy `font-extrabold`/`font-black`).
   - **Card Titles**: `text-sm font-semibold text-slate-900`.
   - **Stats Numbers**: `text-2xl font-semibold tracking-tight text-slate-900` or `font-mono font-semibold`. Forbid bloated `font-black` numbers.
   - **Metadata & Chips**: `font-medium` (500) or `font-semibold` (600).
   - **Prohibited Classes**: `font-black` (900) and `font-extrabold` (800) are strictly banned across all application files.

---

## 2. Color Palette & Design Tokens

The BrightPath palette derives from Kenya's official educational institution standards, blending professional academic navy with national accent colors and clean neutral paper surfaces.

### 2.1 Primary Institutional Tokens

```css
/* Primary Institutional Brand */
--brand-navy-deep: #0c2e4e;       /* Left sidebar background, footer anchor */
--brand-navy: #0f3554;            /* Primary sidebar and institutional cards */
--brand-navy-light: #18476f;      /* Sidebar hover state, active section */

/* National Academic Accent Line (The KEC Signature) */
--accent-blue: #1d4ed8;           /* Primary action blue (60% of top stripe) */
--accent-blue-hover: #1e40af;     /* Hover blue */
--accent-gold: #f59e0b;           /* Kenyan Academic Gold (40% of top stripe) */
--accent-gold-hover: #d97706;     /* Gold hover */

/* Academic Verification & Status */
--status-approved: #059669;       /* Emerald: Proposal approved, complete */
--status-pending: #d97706;        /* Amber: Pending supervisor moderation */
--status-revision: #dc2626;       /* Crimson: Revisions requested */
--status-locked: #64748b;         /* Slate: Locked project chapters */

/* Surfaces & Paper Canvas */
--surface-canvas: #f4f7fb;        /* Soft institutional blue-gray viewport canvas */
--surface-card: #ffffff;          /* Crisp white institutional card */
--surface-muted: #e8f1f8;         /* Breadcrumb pill tabs, secondary surfaces */
--border-card: #e2e8f0;           /* Clean 1px border */
--border-strong: #cbd5e1;         /* Dividers, input borders */

/* Typography */
--text-heading: #0f172a;          /* Charcoal-navy: high-authority headings */
--text-body: #334155;             /* Readable slate body text */
--text-muted: #64748b;            /* Subtitles, secondary metadata */
--text-sidebar: #f8fafc;          /* High contrast sidebar typography */
```

### 2.2 Tailwind Utility Equivalents
* **Canvas Background:** `bg-[#f4f7fb]` (or `bg-slate-50`)
* **Sidebar Navy:** `bg-[#0f3554]` (dark institutional blue)
* **Card Surface:** `bg-white` with `border border-slate-200`
* **Card Shadow:** `shadow-xs` or `shadow-sm`
* **Headings:** `text-slate-900 font-extrabold tracking-tight`
* **Body:** `text-slate-700 text-xs sm:text-sm leading-relaxed`

---

## 3. Global Application Shell Architecture

Every internal page (`/studio/*`, `/learn/*`, `/supervisor/*`, `/admin/*`, `/library`, `/projects`) must sit inside a unified, persistent **Institutional Shell** consisting of:

```
+--------------------------------------------------------------------------------------------------+
|  [:::]  BrightPath TVET LMS      [Global Search / Breadcrumbs]      [Academic Term]  [User Profile] |  <- Global Top Bar (64px, White)
+----------------+---------------------------------------------------------------------------------+
|                |  [BLUE / GOLD ACCENT STRIPE]                                                    |
|  [Active Book] |  PAGE TITLE (e.g. Amazing Daisy / Diploma Trade Fabrication)                    |  <- Page Action Banner
|  GraduationCap |  [ Home ] > [ Lessons ] > [ Craft ] > [ Chapter 1: Problem Formulation ]        |  <- Breadcrumb Ribbon
|                +---------------------------------------------------------------------------------+
|  Navigation:   |                                                                                 |
|  - Home        |  +---------------------------------------------------------------------------+  |
|  - Studio      |  | METADATA: Candidate: W. Osozi | Adm: HND/2024/0481 | Level: Diploma       |  |  <- Metadata Bar
|  - Topic Bank  |  +---------------------------------------------------------------------------+  |
|  - Curriculum  |  |                                                                           |  |
|  - Library     |  | MAIN CONTENT CANVAS (White cards, 8-12px corners, structured tables,     |  |  <- Main Canvas (Slate-50)
|  ------------- |  | guidance sidebars, document reader, KNEC rubrics map)                    |  |
|  Academic:     |  |                                                                           |  |
|  - Craft       |  |                                                                           |  |
|  - Diploma     |  |                                                                           |  |
|  - Business    |  +---------------------------------------------------------------------------+  |
|                |                                                                                 |
+----------------+---------------------------------------------------------------------------------+
```

### 3.1 The Global Top Header
* **Height:** Fixed `h-16` (64px).
* **Color:** Pure white `bg-white`, bottom border `border-b border-slate-200`.
* **Elements:**
  1. **9-Dot Matrix Icon (`:::`)**: Interactive app switcher launching the BrightPath TVET Suite (Project Studio, Curriculum Revision, Topic Bank, Digital Library, Annex 12 Portal).
  2. **Official Logo & Text**: BrightPath Education Portal with national TVET accreditation marker.
  3. **Right Controls**:
     - Academic Term / Examination Year indicator (e.g. `KNEC Nov/Dec 2026 Series`).
     - Role Badge: `Candidate` (Blue), `Supervisor` (Emerald), `Admin` (Purple).
     - User Profile Chip with department & institution abbreviation.

### 3.2 The Persistent Left Navigation Sidebar
* **Background:** Deep institutional navy `bg-[#0f3554]`.
* **Width:** Fixed `w-64` (256px) on desktop; slide-out drawer on mobile screens.
* **Top Context Anchor (The Active Course/Project Card)**:
  - Highlights the current candidate project or active lesson course with an icon (e.g. `GraduationCap` or `BookOpen`) and title.
* **Sectioned Menu Groups (Separated by subtle lines `border-t border-white/10`)**:
  - **Main Portal**:
    - `Dashboard / Home` (`Home` icon)
    - `Project Studio` (`Layers` / `FolderGit` icon)
    - `Curriculum Lessons` (`BookOpen` icon)
    - `Topic Bank` (`Lightbulb` icon)
    - `Annex 12 Project Log` (`ClipboardCheck` icon)
    - `Digital Library` (`Library` icon)
  - **Academic Tracks (Matching KEC Structure)**:
    - `Craft Certificate`
    - `Diploma Projects`
    - `Higher Diploma`
    - `Entrepreneurship`
  - **Administrative & Governance**:
    - `Supervisor Portal` (Supervisor / Admin only)
    - `Institutional Settings` (Admin only)
* **Item States**:
  - Normal: `text-slate-200 hover:bg-white/10 hover:text-white transition-colors`
  - Active: Bold white text `text-white font-bold bg-[#18476f] border-l-4 border-amber-400` (Kenyan gold accent marker).

---

## 4. Signature Components & Visual Hallmarks

### 4.1 The Two-Tone Institutional Accent Stripe
Every primary header card or major module must feature the KEC dual-color horizontal bar across its top border:

```tsx
/* Reusable Dual-Color Accent Line */
<div className="w-full h-1.5 flex overflow-hidden rounded-t-xl">
  <div className="bg-blue-600 w-[60%]" />
  <div className="bg-amber-400 w-[40%]" />
</div>
```

### 4.2 The Interlocking Breadcrumb Ribbon
Do not render standard single-line `>` breadcrumbs. Render the KEC interlocking breadcrumb ribbon:

```tsx
<div className="flex flex-wrap items-center gap-1 p-1 bg-[#e8f1f8] rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
  <Link href="/" className="px-2.5 py-1 rounded bg-white shadow-xs text-blue-700 hover:text-blue-800">
    Home
  </Link>
  <span className="text-slate-400 font-bold">›</span>
  <Link href="/studio" className="px-2.5 py-1 rounded hover:bg-white/60 text-slate-700">
    Project Studio
  </Link>
  <span className="text-slate-400 font-bold">›</span>
  <span className="px-2.5 py-1 text-slate-900 font-bold">
    Statement of the Problem
  </span>
</div>
```

### 4.3 Structured Metadata Bar
Directly below the page title, place a high-contrast institutional metadata strip:

```tsx
<div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 font-medium flex flex-wrap items-center gap-y-2 gap-x-4">
  <span><strong>Candidate:</strong> Wilfred Osozi</span>
  <span className="text-slate-300">•</span>
  <span><strong>Adm No:</strong> HND/2024/0481</span>
  <span className="text-slate-300">•</span>
  <span><strong>Track:</strong> Trade Fabrication (Craft 1A)</span>
  <span className="text-slate-300">•</span>
  <span><strong>Supervisor:</strong> Eng. K. Maina (ICMHS)</span>
</div>
```

### 4.4 Geometric Radius & Elevation Rules
* **Cards & Containers:** `rounded-xl` (12px) max. NEVER use `rounded-3xl` or `rounded-2xl` on content containers.
* **Buttons, Tabs, Inputs:** `rounded-lg` (8px).
* **Badges:** `rounded-md` (6px) or `rounded-full` only for compact status dots.
* **Borders:** Thin, crisp `border border-slate-200`.
* **Shadows:** Clean physical elevation: `shadow-xs` (`box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)`). Avoid heavy fuzzy blur glows.

---

## 5. Typography Hierarchy

| Style | Tailwind Classes | Semantic Usage |
| :--- | :--- | :--- |
| **Page Title** | `text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight` | Top of page inside primary header card |
| **Card / Chapter Title** | `text-base sm:text-lg font-bold text-slate-900` | Section headings, scorecard titles |
| **Subsection Title** | `text-sm font-bold text-slate-800` | Section Def titles, rubric categories |
| **Body Text** | `text-xs sm:text-sm text-slate-700 leading-relaxed` | Guidance text, student writing, descriptions |
| **Metadata & Labels** | `text-xs font-semibold text-slate-600` | Input labels, table headers, author lines |
| **Technical Tokens** | `text-[11px] font-mono font-bold uppercase tracking-wider` | Scorecard marks, admission numbers, codes |

---

## 6. Implementation Architecture

To ensure these rules are applied across every single route without code duplication:

1. **Global App Shell Component (`src/components/layout/AppShell.tsx`)**:
   - Manages the persistent Left Sidebar (with collapse toggle).
   - Manages the Top Header with 9-dot launcher, user details, and notifications.
   - Provides consistent padding and canvas styling (`bg-[#f4f7fb]`).
2. **Page Header Component (`src/components/layout/PageHeaderCard.tsx`)**:
   - Renders the signature two-tone accent stripe (Blue + Gold).
   - Renders the page title and integrated breadcrumb ribbon.
   - Accepts optional metadata bar items and action buttons.
3. **Card Container Component (`src/components/layout/ContentCard.tsx`)**:
   - Enforces `rounded-xl`, `border border-slate-200`, `bg-white`, and `shadow-xs`.

---

## 7. Compliance Checklist for All Future Work

Before committing any frontend UI work:
- [ ] Does the page use the **Institutional App Shell** with persistent Left Sidebar and Top Header?
- [ ] Is the canvas background soft institutional slate (`#f4f7fb`) instead of dark-mode zinc?
- [ ] Are cards styled with crisp white backgrounds, `rounded-xl` (12px) borders, and subtle shadows?
- [ ] Does the primary page banner feature the **Two-Tone Accent Stripe (Blue + Gold)**?
- [ ] Does the page display the **Interlocking Breadcrumb Ribbon**?
- [ ] Are headings dark navy/slate (`text-slate-900`) and metadata lines high-contrast?
- [ ] Have all bubbly `rounded-3xl` corners and generic purple badges been eliminated?
- [ ] Did `npx tsc --noEmit`, `npm run lint`, and `npm run build` all pass cleanly?
