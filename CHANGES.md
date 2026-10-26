# Change Log

## Project Overview

BrightPath is an educational and digital products marketplace platform built for students, academic trainers, and institutions in East Africa. It provides access to ready-made technical projects, business plans, curriculum revision modules, video lessons, and automated commission splits powered by Supabase and Paystack.

---

## Current Baseline (Audit as of 2026-10-25)

- **Framework**: Next.js 16.4.3 with React 19.3.0 and Turbopack.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/turbopack`).
- **Database & Auth**: Supabase PostgreSQL 15+ with Row Level Security, `@supabase/ssr` (0.12.7), and `@supabase/supabase-js` (2.118.0).
- **Payment Processing**: Paystack configured in `.env.local` for KES transactions.
- **Type Safety**: TypeScript 5 configured with strict mode (`npx tsc --noEmit` passing with 0 errors).
- **Build Verification**: `npm run build` succeeds cleanly with all static and dynamic routes compiled.
- **Identified Deficits Before Audit**:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` missing from `.env.local`, causing Supabase client initialization failures.
  - Login failure distinguishing unconfirmed email vs wrong password.
  - Missing admin dashboard, trainer studio, and public landing pages.
  - Unimplemented purchase routes (`/api/paystack/...`, `/api/download`, `/library`).
  - ESLint reports 19 warnings/errors regarding `@typescript-eslint/no-explicit-any` and unescaped entities.

## [2026-10-26] — Phase 1: Supabase Direct Migrations, Supervisor Role, & Institutions

**Category:** Database & Architecture

**Status:** Completed

**Problem:**
Project Studio required the new `supervisor` user role, TVET institutions infrastructure with configurable AI coaching modes (`ai_mode`), and 10 new database tables with RLS and automated transition triggers. Furthermore, database migrations needed to be structured so they can be pushed directly to remote Supabase via Supabase CLI (`supabase db push`) without manual dashboard steps.

**Files Changed:**
- `supabase/config.toml`
- `supabase/migrations/20261024000001_initial_schema.sql`
- `supabase/migrations/20261025000002_auth_and_security.sql`
- `supabase/migrations/20261026000003_supervisor_role.sql`
- `supabase/migrations/20261026000004_project_studio.sql`
- `supabase/003a_supervisor_role.sql`
- `supabase/003_project_studio.sql`
- `KNEC PROJECTS/003_project_studio.sql`
- `src/types/database.ts`
- `src/proxy.ts`
- `src/app/(auth)/actions.ts`
- `src/app/admin/actions.ts`
- `src/app/admin/page.tsx`
- `src/app/supervisor/page.tsx`
- `CHANGES.md`

**Implementation:**
1. **Supabase Direct Push Configuration**:
   - Initialized standard Supabase configuration (`supabase/config.toml`).
   - Created four sequential, idempotent migration files in `supabase/migrations/`:
     - `20261024000001_initial_schema.sql`: Baseline marketplace schema.
     - `20261025000002_auth_and_security.sql`: Auth signup triggers and role escalation prevention.
     - `20261026000003_supervisor_role.sql`: Extends `user_role` enum with `'supervisor'`.
     - `20261026000004_project_studio.sql`: Full Project Studio schema (`institutions`, `topic_bank`, `project_workspaces`, `workspace_sections`, `section_versions`, `ai_events`, `data_points`, `project_log_entries`, `supervisor_reviews`, `module_access`).
   - Executed `npx supabase db push --project-ref txntmeinwhwiavfcluja` directly pushing all 4 migrations to the live remote database.
2. **Type Safety & Schema Alignment**:
   - Extended `src/types/database.ts` with `UserRole = "student" | "trainer" | "admin" | "supervisor"`, `Institution`, `ProjectWorkspace`, `WorkspaceSection`, `SectionVersion`, `AiEvent`, `DataPoint`, `ProjectLogEntry`, `SupervisorReview`.
3. **Supervisor Role Routing**:
   - Updated `src/app/(auth)/actions.ts` so users with `role: "supervisor"` automatically land on `/supervisor`.
   - Updated `src/proxy.ts` to protect `/supervisor` and `/studio` routes.
4. **Supervisor Portal Base**:
   - Created `/supervisor` displaying candidate workspaces, proposal review queue, and institution details.
5. **Admin Institutions Management**:
   - Added server actions `createInstitution`, `updateInstitutionAiMode`, and `assignUserInstitution` in `src/app/admin/actions.ts`.
   - Added Institutions section to `/admin` dashboard allowing administrators to register institutions and toggle `ai_mode` (`feedback_and_polish`, `feedback_only`, `off`).
   - Added `supervisor` option to Admin role management select.

**Reason:**
Establishes the foundational database schema, institutional governance, and supervisor workflows for Project Studio per the master brief.

**Validation:**
- `npx supabase db push` successfully applied all 4 migrations to remote database.
- Database query check confirmed tables `institutions`, `project_workspaces`, `module_access` return live data with 0 errors.
- `npx tsc --noEmit` passed with 0 errors.
- `npm run lint` passed with 0 warnings / 0 errors.
- `npm run build` compiled all 17 routes cleanly.

**Database Impact:**
- Applied `20261026000003_supervisor_role.sql` and `20261026000004_project_studio.sql` to production Supabase database.

**Security Impact:**
- Row Level Security (RLS) active on all Project Studio tables.
- Server-side guard triggers (`guard_workspace_update`, `guard_log_update`) prevent students from approving their own proposals or forging supervisor signatures.

---

## [2026-10-25] — Phase 0: Curriculum Lesson Reader, Gating, & Progress Tracking

**Category:** Feature & Security

**Status:** Completed

**Problem:**
Previously, the curriculum overview at `/learn` selected all lesson `body` content indiscriminately, allowing unauthenticated or non-enrolled users to inspect full lesson text. There was also no lesson reader route (`/learn/[moduleId]/[lessonId]`), no module overview route (`/learn/[moduleId]`), no student completion progress tracking, and no infrastructure for gating non-free content.

**Files Changed:**
- `src/types/database.ts`
- `src/lib/learn/access.ts`
- `src/app/learn/actions.ts`
- `src/components/learn/CompleteLessonButton.tsx`
- `src/components/learn/LessonContent.tsx`
- `src/app/learn/[moduleId]/page.tsx`
- `src/app/learn/[moduleId]/[lessonId]/page.tsx`
- `src/app/learn/page.tsx`
- `src/app/admin/actions.ts`
- `src/app/api/paystack/webhook/route.ts`
- `supabase/003_module_access.sql`
- `package.json`
- `.gitignore`
- `CHANGES.md`

**Implementation:**
1. **Server-Side Lesson Access Verification**:
   - Implemented `checkLessonAccess()` in `src/lib/learn/access.ts`.
   - Free lessons (`is_free: true`) are accessible to all users.
   - Non-free lessons strictly require authentication and verify admin role, author trainer ownership, or explicit grant in `module_access`.
   - On denial, the server never queries or returns `lesson.body`.
2. **Sanitized Lesson Reader**:
   - Created `/learn/[moduleId]/[lessonId]` featuring `<LessonContent>` with `react-markdown` and `rehype-sanitize` to guarantee zero raw HTML or XSS injection.
   - Supported responsive video playback for YouTube embeds and HTML5 media.
   - Built seamless previous/next lesson navigation and syllabus outline sidebar.
3. **Module Overview & Progress Tracking**:
   - Created `/learn/[moduleId]` displaying module description, trainer name, progress percentage, and lesson list.
   - Implemented `lesson_progress` toggle via server action `toggleLessonCompletion` in `src/app/learn/actions.ts`.
   - Created client component `<CompleteLessonButton>` with optimistic transitions.
4. **List Query Protection**:
   - Updated `/learn` to omit `body` completely from overview queries, preventing payload data leakage.
   - Added module progress bars and completion badges for authenticated students.
5. **Access Granting Infrastructure**:
   - Added `grantModuleAccess` and `revokeModuleAccess` server actions to `src/app/admin/actions.ts`.
   - Updated Paystack webhook in `src/app/api/paystack/webhook/route.ts` to automatically record `module_access` when purchases complete.
   - Added SQL migration file `supabase/003_module_access.sql`.

**Reason:**
Fulfills Phase 0 of the Project Studio specification, closing existing content leaks and establishing the student revision reader.

**Validation:**
- `npx tsc --noEmit` passed with 0 errors.
- `npm run lint` passed with 0 warnings / 0 errors.
- `npm run build` compiled all 16 static/dynamic/PPR routes cleanly.

**Database Impact:**
- Defined `module_access` table with RLS in `supabase/003_module_access.sql`.
- Actively utilizes `lesson_progress` table.

**Security Impact:**
- Zero content leakage for gated lessons across list and reader endpoints.
- XSS prevention via `rehype-sanitize` abstract syntax tree sanitization.

**Remaining Issues:**
- `module_access` table SQL migration needs to be applied in Supabase SQL editor when module purchases are actively sold.

---

## [2026-10-25] — Root Layout React 19 / TypeScript Hardening

**Category:** Code Quality & Type Safety

**Status:** Completed

**Problem:**
`src/app/layout.tsx` was relying on undeclared `LayoutProps<"/">` which triggered `TS2304: Cannot find name 'LayoutProps'` when running TypeScript checking on fresh environments prior to Next.js route type generation.

**Files Changed:**
- `src/app/layout.tsx`
- `CHANGES.md`

**Implementation:**
- Explicitly typed `RootLayout` with `Readonly<{ children: React.ReactNode }>`.
- Confirmed `npx tsc --noEmit` and `npm run lint` execute cleanly with 0 errors.

**Reason:**
Ensures headless CI/CD and developer type-checking passes consistently without pre-existing `.next/types`.

---

## [2026-10-25] — Git Repository Initialization & Secret Scanning Remediation

**Category:** DevOps & Security

**Status:** Completed

**Problem:**
When pushing the initial codebase to GitHub remote `https://github.com/Sozi-source/brightpath.git`, GitHub Push Protection blocked commit `d27aee9440ba0511bd710e0c65db3206685c0266` because `.env.example` contained dummy placeholder prefix `sk_test_<hex>`, matching Stripe/Paystack test secret key scanning signatures.

**Files Changed:**
- `.env.example`
- `CHANGES.md`

**Implementation:**
- Sanitized `.env.example` to replace test key dummy strings with generic descriptors `your_paystack_secret_key_here` and `your_paystack_public_key_here`.
- Replaced the initial commit via `git commit --amend` to purge the flagged token string from git history.
- Verified `.gitignore` ensures actual secrets (`.env.local`, `.env*.local`) and build artifacts remain unversioned.

**Reason:**
Complies with GitHub secret scanning push protections while keeping clean environment variable templates for developers.

---

## [2026-10-25] — Authentication & Supabase Key Resolution

**Category:** Bug Fix & Security

**Status:** Completed

**Problem:**
Users were unable to sign in or initialize the Supabase client because `.env.local` only defined `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, whereas `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, and `src/proxy.ts` strictly looked for `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Furthermore, login failure error messages did not differentiate between an unconfirmed email address and incorrect password credentials.

**Files Changed:**
- `.env.local`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/proxy.ts`
- `src/app/(auth)/actions.ts`

**Implementation:**
- Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` pointing to the publishable key.
- Updated `client.ts`, `server.ts`, and `proxy.ts` to fall back to `process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` if `NEXT_PUBLIC_SUPABASE_ANON_KEY` is absent.
- Implemented `src/app/(auth)/actions.ts` with distinct error handling:
  ```ts
  if (error) {
    fail(
      "/login",
      error.message.toLowerCase().includes("confirm")
        ? "Confirm your email first."
        : "Wrong email or password."
    );
  }
  ```
- Implemented role-based redirection on login (`admin` to `/admin`, `trainer` to `/trainer`, `student` to `/learn`).

**Reason:**
Resolves client initialization crashes and informs users whether they need to confirm their email before logging in.

**Validation:**
- Verified with diagnostic scripts against Supabase Auth API (`Invalid login credentials` properly captured).
- User successfully authenticated and reached the administrative dashboard.

**Database Impact:**
None directly on tables. Auth tokens and session cookies correctly handled through `@supabase/ssr`.

**Security Impact:**
Service role keys remain strictly server-side. Session validation handled via HttpOnly cookies and `proxy.ts`.

**Remaining Issues:**
None for basic login.

---

## [2026-10-25] — Database Security & Profile Trigger Migration

**Category:** Database & Security

**Status:** Completed

**Problem:**
The initial schema (`supabase/schema.sql`) omitted an automatic profile creation trigger on `auth.users` insert, meaning newly registered users did not have an associated row in `public.profiles`. Additionally, the existing update policy on `profiles` lacked column-level protection, allowing non-admin users to update their own `role` to `'admin'`.

**Files Changed:**
- `supabase/002_auth_and_security.sql`

**Implementation:**
- Created `handle_new_user()` trigger to automatically populate `public.profiles` upon signup with default role `'student'`.
- Created `prevent_role_escalation()` trigger on `public.profiles` preventing non-admin users from altering `role`.
- Enabled RLS and created select/all policies on `platform_settings`.
- Added insert policy for `profiles` ensuring users can only insert their own row with role `'student'`.

**Reason:**
Prevents privilege escalation and ensures data consistency across the user management lifecycle.

**Validation:**
- Migration validated syntax and logic against PostgreSQL 15 schema.
- Prepared for execution in the Supabase SQL editor upon platform recovery.

**Database Impact:**
Adds two database triggers and enables RLS on `platform_settings`.

**Security Impact:**
Eliminates role-tampering vulnerability and protects platform commission rate settings.

**Remaining Issues:**
Execute in Supabase SQL editor once dashboard API connectivity is restored.

---

## [2026-10-25] — Service-Role Admin Provisioning Utility

**Category:** Feature & Infrastructure

**Status:** Completed

**Problem:**
Due to Supabase management API timeouts preventing access to the SQL and Table editors, the administrator needed a local, secure mechanism to confirm email addresses, reset passwords, and assign administrative roles.

**Files Changed:**
- `scripts/make-admin.mjs`

**Implementation:**
- Built an idempotent Node.js CLI script using `@supabase/supabase-js`.
- Reads `SUPABASE_SERVICE_ROLE_KEY` exclusively from `.env.local`.
- Uses `sb.auth.admin.updateUserById` to mark `email_confirm: true` and optionally set a new password.
- Upserts the admin profile with `role: 'admin'`.

**Reason:**
Provides a local, reliable administrative rescue tool without needing the Supabase web dashboard.

**Validation:**
- Executed: `node --env-file=.env.local scripts/make-admin.mjs osoziw@gmail.com`.
- Confirmed `osoziw@gmail.com` confirmed and marked as `admin` in `profiles`.

**Database Impact:**
Updates `auth.users.email_confirmed_at` and upserts row in `public.profiles`.

**Security Impact:**
Service role key is kept local and never exposed in browser code.

**Remaining Issues:**
None.

---

## [2026-10-25] — Next.js 16 Partial Prerendering & Route Segment Configuration

**Category:** Bug Fix & Architecture

**Status:** Completed

**Problem:**
Next.js 16 with `cacheComponents: true` (Partial Prerendering enabled by default) disallows legacy `export const dynamic = "force-dynamic"` and throws build errors when dynamic headers or cookies are read during prerendering.

**Files Changed:**
- `src/app/admin/page.tsx`
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/page.tsx`
- `src/app/trainer/page.tsx`
- `src/app/learn/page.tsx`
- `src/app/projects/page.tsx`

**Implementation:**
- Replaced `export const dynamic` with Next.js 16 canonical route segment configuration:
  `export const instant = false;`
- Configured dynamic routes accessing session cookies and `searchParams` to allow server-rendered blocking navigation.

**Reason:**
Aligns codebase with Next.js 16 breaking changes as documented in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/instant.md`.

**Validation:**
- Ran `npm run build` with Turbopack: verified 100% build pass (14/14 static and dynamic routes generated).

**Database Impact:**
None.

**Security Impact:**
None.

**Remaining Issues:**
None.

---

## [2026-10-25] — Full Admin Dashboard & Trainer Studio

**Category:** Feature & UI/UX

**Status:** Completed

**Problem:**
The `/admin` and `/trainer` routes contained minimal placeholder text, leaving administrators and trainers unable to inspect metrics, approve trainers, moderate projects, adjust commission rates, or manage educational modules.

**Files Changed:**
- `src/app/admin/page.tsx`
- `src/app/admin/actions.ts`
- `src/app/trainer/page.tsx`
- `src/app/trainer/actions.ts`
- `src/app/page.tsx`
- `src/app/projects/page.tsx`
- `src/app/learn/page.tsx`

**Implementation:**
- Built comprehensive Admin Dashboard featuring:
  - 4 KPI cards (Students, Trainers, Projects, Commission Revenue).
  - Commission rate control form connected to `updateCommission` server action.
  - Moderation queue for pending trainers and projects.
  - Projects catalog with one-click Publish / Reject buttons.
  - User profile management table with role assignment.
  - Paystack transactions table.
- Built Trainer Studio featuring:
  - Project upload form with instant publishing for administrators.
  - Multi-chapter curriculum manager with attached video URLs and lesson notes.
  - Overview of published materials with deletion controls.

**Reason:**
Empowers administrators and trainers to operate the platform end-to-end.

**Validation:**
- Verified in browser by user (`http://localhost:3000/admin`).
- Verified with `npm run build` with Turbopack.

**Database Impact:**
Queries and updates `platform_settings`, `profiles`, `trainer_profiles`, `modules`, `lessons`, `projects`, and `orders`.

**Security Impact:**
Protected by `verifyAdmin()` and `verifyTrainerOrAdmin()` server-side checks.

**Remaining Issues:**
None.

---

## [2026-10-25] — Bulk Upload Hub for Projects & Curriculum

**Category:** Feature & UI/UX

**Status:** Completed

**Problem:**
Adding projects and revision lessons one-by-one was time-consuming. Trainers and administrators needed a way to import multiple projects and course chapters simultaneously.

**Files Changed:**
- `src/app/trainer/actions.ts`
- `src/app/trainer/page.tsx`

**Implementation:**
- Implemented `bulkImportProjects` supporting both `.csv` and `.json` files and direct copy-paste.
- Implemented custom, zero-dependency CSV parser with quote and delimiter handling.
- Implemented `bulkImportModules` supporting nested JSON curriculum structures (modules containing lessons).
- Added UI in Trainer Studio with expandable template guides and file pickers.

**Reason:**
Enables rapid catalog scaling from spreadsheets and structured curriculum documents.

**Validation:**
- Executed `npm run build` and verified all routes compile cleanly.

**Database Impact:**
Performs batch inserts to `projects`, `modules`, and `lessons`.

**Security Impact:**
Validates data types and assigns authenticated user ID as trainer.

**Remaining Issues:**
None.

---

## [2026-10-25] — Strict Type System & ESLint Audit Resolution

**Category:** Code Quality & Type Safety

**Status:** Completed

**Problem:**
A baseline ESLint check flagged 19 errors and warnings across the codebase regarding `@typescript-eslint/no-explicit-any`, unescaped React JSX entities, and unused icon imports.

**Files Changed:**
- `src/types/database.ts`
- `src/app/admin/page.tsx`
- `src/app/learn/page.tsx`
- `src/app/login/page.tsx`
- `src/app/page.tsx`
- `src/app/projects/page.tsx`
- `src/app/trainer/actions.ts`
- `src/app/trainer/page.tsx`

**Implementation:**
- Created centralized database interfaces in `src/types/database.ts` covering `UserProfile`, `TrainerProfile`, `Project`, `Module`, `Lesson`, `Order`, `ContentReport`, and `PlatformSettings`.
- Replaced all raw `any` types with typed domain models across admin and trainer actions/views.
- Fixed unescaped apostrophes in JSX (`Don&apos;t`, `haven&apos;t`).
- Cleaned up unused imports across all routes.

**Reason:**
Ensures enterprise-grade maintainability, eliminates runtime casting hazards, and maintains strict TypeScript & ESLint standards.

**Validation:**
- Executed `npm run lint`: passed with 0 errors, 0 warnings.
- Executed `npx tsc --noEmit`: passed with 0 type errors.
- Executed `npm run build`: verified clean Turbopack production compilation.

**Database Impact:**
None.

**Security Impact:**
Strong typing reduces accidental undefined property access or injection vectors.

**Remaining Issues:**
None.

---

## [2026-10-25] — Student Digital Library & Paystack Purchase Pipeline

**Category:** Feature & Integration

**Status:** Completed

**Problem:**
The `/library`, `/api/download`, `/api/paystack/initialize`, and `/api/paystack/webhook` routes were empty stubs returning HTTP 501, preventing students from purchasing projects, receiving order confirmations, or downloading source code.

**Files Changed:**
- `src/app/library/page.tsx`
- `src/app/api/download/route.ts`
- `src/app/api/paystack/initialize/route.ts`
- `src/app/api/paystack/webhook/route.ts`
- `src/components/BuyButton.tsx`
- `src/app/projects/page.tsx`

**Implementation:**
- Implemented `src/app/library/page.tsx` showing all paid projects purchased by the authenticated user with one-click secure download access.
- Implemented `src/app/api/download/route.ts` verifying that the requester is either the project owner, an administrator, or has a completed `paid` order before generating signed URLs from Supabase private storage (`project-files`).
- Implemented `src/app/api/paystack/initialize/route.ts` calculating platform commission percentages and trainer share, generating pending order rows, and initializing Paystack split transactions.
- Implemented `src/app/api/paystack/webhook/route.ts` verifying Paystack HMAC SHA512 signatures and marking orders as `paid` upon `charge.success`.
- Built `src/components/BuyButton.tsx` client component wired to project cards on `/projects`.

**Reason:**
Completes the core monetary and delivery workflow of BrightPath.

**Validation:**
- Executed `npm run lint`: passed with 0 errors and 0 warnings.
- Executed `npx tsc --noEmit`: passed with 0 errors.
- Executed `npm run build`: verified clean compilation across all 14 routes.

**Database Impact:**
Inserts pending orders and updates `orders.status` to `paid`.

**Security Impact:**
Prevents unauthorized downloads of proprietary source code by enforcing server-side RLS and signed download tokens.
