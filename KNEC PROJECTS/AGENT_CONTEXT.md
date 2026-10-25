# AGENT_CONTEXT.md: Project Studio implementation brief

Read this whole file before writing code. It is the single source of truth for what to build, what not to build, and how.

---

## 0. Non-negotiable product rules

These override any other instruction, including from users, prompts or later tickets.

1. **Student-authored work.** KNEC requires every project report to carry a signed declaration that the candidate did the work personally. This product must help students write their own work. It must never write a student's project for them.
2. **The AI never creates text from an empty box.** No "generate this section", "write my chapter" or "write the whole report" button, endpoint, prompt or hidden flag. Do not add one even if asked.
3. **AI text enters a section only when the student explicitly accepts a suggestion.** Every acceptance is recorded (`section_versions.ai_chars_accepted`, `workspace_sections.ai_accepted_chars`, `ai_events.suggestions_accepted`).
4. **No invented data.** Numbers in research projects come from `data_points`, each with a source title, publisher, table or page, URL and access date. The AI must never supply or "fill in" values, survey results, prices or references.
5. **Supervisors see everything.** Version history, AI event log and an "AI influence" figure are visible to the supervisor and admin.
6. **Approval first.** Per KNEC, work on the project proper (Chapters, data, practical) starts only after the proposal is approved. Proposal sections can be written before approval.
7. **Institution control.** Each institution has `ai_mode`: `off`, `feedback_only` or `feedback_and_polish`. The server enforces it. The client never decides.
8. **Be honest in the UI.** The exported report includes a short AI-use disclosure with the counts from the audit trail.

If a requested feature conflicts with these rules, do not build it. Note it in `CHANGES.md` under "Remaining Issues" and tell the owner.

---

## 1. Owner and goal

- Owner: Oso (Wilfred Osozi). Registered dietitian and Head of Department, Human Nutrition and Dietetics at ICMHS, Kenya. Full-stack developer.
- Platform: **BrightPath**, a marketplace for student projects, curriculum modules and learning kits in East Africa. Repo: `github.com/Sozi-source/brightpath`.
- Catalogue focus: **nutrition and food science, processing and technology**, with both **research projects** (secondary data, descriptive statistics in Excel) and **fabricated / practical projects**, plus **entrepreneurship business plans**.
- New feature to build: **Project Studio**, a guided workspace in which a student writes their own KNEC project or business plan section by section, with an AI coach that questions, checks against the marking rubric and suggests language improvements, and a supervisor portal for review and sign-off.

---

## 2. Existing codebase (verify by reading before editing)

Facts taken from `CHANGES.md`, `supabase/schema.sql` and the files read so far. Confirm anything you rely on.

- Next.js **16.4.3**, React **19.3.0**, Turbopack, Tailwind CSS **v4**, TypeScript 5 **strict**, ESLint clean (no `any`).
- Next.js 16 uses `cacheComponents` (Partial Prerendering). **Do not** use `export const dynamic = "force-dynamic"`. Dynamic pages use `export const instant = false;`. Read `node_modules/next/dist/docs/` for the current conventions before using unfamiliar APIs.
- `src/proxy.ts` is the request proxy (Next.js 16 replacement for `middleware`). Session handled with `@supabase/ssr` (0.12.x) and `@supabase/supabase-js` (2.118.x).
- Supabase clients: `src/lib/supabase/client.ts`, `server.ts`, `admin.ts` (service role, server only). Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (falls back to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`), `SUPABASE_SERVICE_ROLE_KEY`, Paystack keys.
- Types: `src/types/database.ts` holds hand-written interfaces (`UserProfile`, `Project`, `Module`, `Lesson`, `Order`, etc.). Extend it for new tables.
- Roles: `student | trainer | admin` (this work adds `supervisor`). Role-based login redirect in `src/app/(auth)/actions.ts` (admin to `/admin`, trainer to `/trainer`, student to `/learn`).
- Server-action pattern: `"use server"`, a `verify...()` function that checks the session and role, `revalidatePath(...)` after writes. Reuse this pattern. See `src/app/trainer/actions.ts` (`verifyTrainerOrAdmin`) and `src/app/admin/actions.ts` (`verifyAdmin`).
- Purchases: `projects` + `orders`. Paystack initialise and webhook routes; `/api/download` creates signed URLs from the private `project-files` bucket after checking a paid order.
- Guide content: `modules` contain `lessons` (`title`, `body` markdown, `video_url`, `position`, `is_free`). Bulk import accepts JSON modules with nested lessons (`bulkImportModules`) and CSV/JSON projects (`bulkImportProjects`).
- UI style: zinc greys, indigo accent, `lucide-react` icons, rounded-2xl cards, small text. Match it.
- Security triggers already in `002_auth_and_security.sql`: `handle_new_user()` (creates profile, role `student`) and `prevent_role_escalation()`.
- Known gaps (Phase 0 fixes them): `/learn` only lists lessons with a one-line preview, there is no lesson reader, and paid lessons are not gated.

**Working convention:** after every change, append an entry to `CHANGES.md` using the existing format: `## [date] , Title`, then Category, Status, Problem, Files Changed, Implementation, Reason, Validation, Database Impact, Security Impact, Remaining Issues. Before finishing any task run `npx tsc --noEmit`, `npm run lint` and `npm run build`. All three must pass with zero errors.

---

## 3. KNEC rules the product must model

Source: KNEC Business and Technical Examinations project guidelines (Part II to V and score cards).

- Projects are 80% practical (fabrication, data collection or a practical assignment).
- **Craft:** the supervisor designs the project. At most five candidates share a title. Proposal and defence are required (no marks on the score card).
- **Diploma / Higher Diploma:** the candidate designs the project with the supervisor and does it personally. Proposal and defence are marked.
- No candidate starts the project before the proposal is approved by the Project Moderation Panel.
- A project log (Annex 12) records every candidate-supervisor interaction, from approval to submission.
- Report format: A4, Times New Roman 12, 1.5 spacing, bound, two copies. Craft at least 10 pages. Diploma at least 40 pages excluding appendices. APA referencing. Signed declarations by candidate and supervisor.

### Score cards

| Craft trade project (1A) | Marks |
|---|---|
| Fabrication / data collection | 75 |
| Synopsis, Ch1, Ch2, Ch3, Ch4 | 4 each (20) |
| Final report submission | 5 |

| Diploma / Higher Diploma trade project (1B) | Marks |
|---|---|
| Title, rationale | 5 |
| Defence, moderation, approval | 10 |
| Fabrication / data collection | 25 |
| Synopsis 2, Definition of terms 3, Ch1 5, Ch2 8, Ch3 10, Ch4 10, References 2 | 40 |
| Project defence | 15 |
| Final report submission | 5 |

| Entrepreneurship (Craft, Diploma, Higher Diploma) | Marks |
|---|---|
| Title, rationale 5; defence, approval 10 | 15 |
| Synopsis 5, Ch1 10, Ch2 10, Ch3 15, Ch4 15, Ch5 15 | 70 |
| Project defence 10; final submission 5 | 15 |

Use these numbers in `src/lib/studio/rubrics.ts` so the AI feedback and progress UI refer to the correct marks. Keep them as data, since KNEC may change them.

---

## 4. What to build

### 4.1 Workspace types and templates

`workspace_type`: `trade_fabrication`, `research_secondary`, `business_plan`. `level`: `craft`, `diploma`, `higher_diploma`.

Define templates in code, not in the database: `src/lib/studio/templates/{trade,research,business}.ts`. Each exports an ordered array:

```ts
export interface SectionDef {
  key: string;            // e.g. "ch1.problem"
  title: string;          // "1.2 Statement of the problem"
  phase: "proposal" | "project";
  guidance: string;       // what a good section contains (shown to the student)
  rubricMarks?: number;   // looked up by level from rubrics.ts
  levels?: Array<"craft" | "diploma" | "higher_diploma">; // omit = all
  minWords?: number;
}
```

Section keys (derive wording from the template documents in `docs/templates/`):

- **Proposal phase (all types):** `proposal.title`, `proposal.problem`, `proposal.objectives`, `proposal.rationale`.
- **Trade and research:** `synopsis`, `ack`, `terms` (Diploma+ only), `ch1.background`, `ch1.problem`, `ch1.objectives`, `ch1.questions`, `ch1.justification`, `ch1.scope`, `ch2.intro`, `ch2.background`, `ch2.related`, `ch2.gap`, then Chapter 3 by type:
  - trade: `ch3.design`, `ch3.materials`, `ch3.procedure`, `ch3.safety`, `ch3.records`
  - research: `ch3.design`, `ch3.sources`, `ch3.variables`, `ch3.verification`, `ch3.analysis`, `ch3.ethics`
  - then `ch4.results`, `ch4.discussion`, `ch4.cost` (trade only), `ch4.conclusions`, `ch4.recommendations`.
- **Business plan:** `synopsis`; `ch1.name`, `ch1.products`, `ch1.ownership`, `ch1.location`, `ch1.mission`, `ch1.legal`, `ch1.swot`; `ch2.research`, `ch2.target`, `ch2.competitors`, `ch2.mix`, `ch2.forecast`; `ch3.structure`, `ch3.staffing`, `ch3.management`, `ch3.remuneration`, `ch3.preop`; `ch4.workflow`, `ch4.layout`, `ch4.equipment`, `ch4.materials`, `ch4.quality`, `ch4.schedule`; `ch5.startup`, `ch5.assumptions`, `ch5.income`, `ch5.cashflow`, `ch5.balance`, `ch5.breakeven`, `ch5.risks`.
- Tables inside the report (equipment lists, competitor table, financial statements) are structured inputs (JSON) attached to a section, not free text. The financial statements come from the financial model (section 4.8).

When a workspace is created, insert one `workspace_sections` row per `SectionDef` that applies to its type and level.

### 4.2 Routes

Student side (`src/app/studio/...`):

| Route | Purpose |
|---|---|
| `/studio` | List the student's workspaces and progress |
| `/studio/new` | Onboarding wizard: type, level, course, institution, supervisor (by code or email) |
| `/studio/[id]` | Overview: status, section checklist, marks map, supervisor comments |
| `/studio/[id]/problem` | Problem finder (topic bank plus AI questions) |
| `/studio/[id]/write/[sectionKey]` | Section editor plus coach panel |
| `/studio/[id]/data` | Research data points and source log (research type) |
| `/studio/[id]/log` | Project log (Annex 12 draft) |
| `/studio/[id]/defence` | Mock defence practice |
| `/studio/[id]/export` | Report export (docx) and disclosure |

Supervisor side: `/supervisor` (candidates, pending approvals) and `/supervisor/[workspaceId]` (read sections, version history, AI log, data points, log entries; approve, comment, sign).

Learn side (Phase 0): `/learn/[moduleId]` and `/learn/[moduleId]/[lessonId]`.

Every route is a server component with `export const instant = false;`, checks the session, and redirects to `/login` if needed. Update the role redirect: `supervisor` goes to `/supervisor`.

### 4.3 Onboarding

Collect: full name (already in `profiles.full_name`), **admission number** (`profiles.admission_number`), course, level, institution, supervisor.

- Validate admission number as non-empty text (formats vary by institution).
- Supervisor selection: by invite code or by searching supervisors in the same institution. A student cannot approve their own project.
- Never request national ID numbers, phone numbers or other data not needed. This is personal data under the Kenya Data Protection Act. The owner is responsible for ODPC registration and privacy notices. Add a privacy notice line and consent checkbox at onboarding.

### 4.4 Problem finder (proposal phase)

Flow:
1. Student picks a broad area (food insecurity, child malnutrition, child care practices, maternal knowledge and attitude, food science and processing, and others from `topic_bank`).
2. Show matching `topic_bank` rows (idea, suggested indicators, suggested sources).
3. AI (`topic_suggestions`) asks narrowing questions: place, group, period, data availability. It may suggest three narrowed angles. It does not pick for the student.
4. Student writes their own title, problem statement, objectives and rationale in the proposal sections.
5. Student submits for approval (`proposal_pending`). Supervisor approves or requests changes.

For Craft, the supervisor may set the title. Allow the supervisor to edit `project_workspaces.title` and mark the proposal approved.

Seed `topic_bank` from `docs/kits/Project_Kit_02_Stage1...docx` (section 2.2 topic bank) in a seed script `scripts/seed-topic-bank.mjs` (idempotent).

### 4.5 Section editor

- Plain textarea or lightweight editor (no heavy dependency). Autosave every few seconds and on blur; each save writes `workspace_sections.current_text` and appends `section_versions` (source `student_typed`). Debounce to limit rows.
- Show: guidance text, rubric marks for this section at this level, word count, status.
- Coach panel (right side) with actions listed in 4.6. Actions the institution's `ai_mode` disallows are hidden and rejected server-side.
- Lock project-phase sections until `status = 'approved'` (UI and RLS).
- Status flow per section: `empty` to `draft` (first text) to `reviewed` (student requests supervisor review) to `final` (supervisor marks it done).

### 4.6 AI coach

One server route: `POST /api/studio/ai`. Server-side only. Never expose the API key.

Request:
```ts
{ workspaceId: string; sectionKey?: string; kind: AiKind; studentText?: string; question?: string }
```
Server steps, in order:
1. Authenticate. Load the workspace. Confirm the caller is the student who owns it.
2. Load the institution's `ai_mode`. Reject if the `kind` is not allowed (`off`: nothing; `feedback_only`: all kinds except `language_suggestion`).
3. Rate-limit per user: for example 40 calls per day and 10 per hour, counted from `ai_events`. Return 429 with a clear message.
4. Reject `studentText` over a sane limit (for example 12,000 characters).
5. Reject `rubric_feedback` and `language_suggestion` when the section text is under a minimum (for example 40 words). The student must write first. Reply with a prompt telling them what to write about.
6. Build the prompt from `src/lib/studio/prompts.ts` (below), call the Anthropic API with `ANTHROPIC_API_KEY` and model from `ANTHROPIC_MODEL` (default `claude-sonnet-5-5`). Request JSON output and validate it with a schema (zod or a small manual validator). On invalid JSON retry once, then fail gracefully.
7. Insert an `ai_events` row with the structured response using the **service role** client. Return the response and the event id.
8. Suggestion acceptance: `POST /api/studio/ai/accept` with `{ eventId, suggestionIndex }`. The server applies the replacement to the student's current text (find `original` in text, replace with `suggested`), writes a `section_versions` row with source `student_accepted_suggestion` and `ai_chars_accepted = suggested.length`, updates `workspace_sections` (`current_text`, `ai_accepted_chars += suggested.length`) and `ai_events.suggestions_accepted += 1`. If `original` is no longer found, return a clear error and let the student refresh.

AI kinds and outputs (all JSON):

| kind | What it does | Output shape |
|---|---|---|
| `coach_question` | Asks 3 to 5 Socratic questions to help the student think about the section. Gives no text to paste. | `{ questions: string[] }` |
| `rubric_feedback` | Checks the student's draft against the section's guidance and the marks it carries. Says what is present, what is missing, and what to improve. | `{ strengths: string[]; gaps: string[]; nextSteps: string[]; estimatedBand: "weak"\|"fair"\|"good"\|"strong" }` |
| `language_suggestion` | Sentence-level suggestions on clarity, grammar and concision for the student's own text. Each suggestion keeps the student's meaning. | `{ suggestions: { original: string; suggested: string; reason: string }[] }`, maximum 8 per call |
| `example_other_topic` | Gives a short model paragraph that shows structure, on a **different** topic from the student's. Clearly labelled as an example. | `{ topicUsed: string; example: string; whatToNotice: string[] }` |
| `mock_defence` | Asks questions about the student's own report, one at a time, and gives feedback on their typed answers. | `{ question: string; focus: string }` and `{ feedback: string; followUp?: string }` |
| `reference_check` | Checks reference format (APA) and flags entries that look incomplete. Does not invent references. Optionally verifies a DOI through the Crossref API. | `{ issues: { reference: string; problem: string; fix: string }[] }` |
| `topic_suggestions` | Narrowing questions and up to 3 angles for a broad area. | `{ questions: string[]; angles: { title: string; why: string; dataToCheck: string }[] }` |

Guardrails in code (not just in the prompt):
- `language_suggestion` returns a suggestion only if its `original` string is found verbatim in the student's text. Drop any that are not.
- Reject a `language_suggestion` whose `suggested` differs so much from `original` that it adds new claims: simple guard, `suggested.length <= original.length * 1.6`, and no new numbers (digits in `suggested` not present in `original`) and no new citations (parentheses with a year). Drop failures.
- Strip any URLs, numbers or citations the AI adds in `example_other_topic` (it is an example, so mark it "not for copying").
- Log everything. Never delete `ai_events`.

**System prompt (put in `src/lib/studio/prompts.ts`, adapt wording but keep every rule):**

```
You are a writing coach for a Kenyan TVET student completing a KNEC project report or business plan.
Your job is to help the student think, check and improve THEIR OWN work. You are not their ghostwriter.

Rules you must always follow:
1. Never write, draft or complete a section for the student. Never produce text intended to be pasted into their report.
2. Only comment on, question or suggest edits to text the student has written. If they have written nothing, ask them questions to help them start.
3. Never invent facts, data, statistics, survey results, prices, quotations or references. If the student needs a number, tell them what kind of source to look for and let them find and record it.
4. Language suggestions must keep the student's meaning. Do not add new claims, numbers or citations.
5. Use simple, clear English suitable for a Craft or Diploma student. Short sentences.
6. Refer to the KNEC section purpose and marks provided. Explain WHY something earns marks.
7. If the student asks you to write it for them, kindly refuse and offer to ask questions or check what they have written.
8. Return only valid JSON in the requested shape. No preamble.
Context: level={{level}}, project type={{type}}, course={{course}}, section={{sectionTitle}} ({{marks}} marks).
Section purpose: {{guidance}}
```

### 4.7 Research data module (research_secondary type)

- `/studio/[id]/data`: table of `data_points` with an "add" form. **Required fields:** indicator, value, unit, survey year, source title, publisher, table or page, URL, access date. No save without them.
- Flag `verified_against_original` as a checkbox the student ticks after checking the original report. Show a warning on unverified points.
- Compute descriptive statistics **in the app** from the student's own data points, grouped by indicator: count, mean, median, min, max, range, sample standard deviation, change between consecutive survey years (percentage points and %), annual change. Put the maths in `src/lib/studio/stats.ts` as pure functions with unit tests. The reference implementation is the Excel workbook `Secondary_Data_Descriptive_Stats_Workbook.xlsx`; the app results must match its formulas (sample SD, `(last-first)/(lastYear-firstYear)` for average annual change).
- Simple line chart per indicator (Recharts or a small SVG component).
- Export the data and stats as `.xlsx` using the existing workbook layout (formulas, not pasted values) if feasible; otherwise CSV.
- The AI never touches `data_points`.

### 4.8 Business plan financial model

- For `business_plan` workspaces, build a form that mirrors the Excel model `Business_Plan_Financial_Model_Template.xlsx` (Inputs sheet): price, units, growth, variable cost, fixed costs, start-up costs, funding, loan, tax.
- Compute income statement, loan schedule, cash flow, balance sheet and break-even in `src/lib/studio/finance.ts` as pure, tested functions. Replicate the workbook's formulas exactly, including the balance check (must equal 0).
- Store inputs as JSON on the section `ch5.startup` (or a dedicated `financial_inputs jsonb` column on `project_workspaces`; add it in a new migration if chosen).
- No default example values in the live form. Empty inputs, with the example shown only as helper text.
- The AI may give rubric feedback on the student's written explanation. It does not choose or change the numbers.

### 4.9 Project log (Annex 12 draft)

- `project_log_entries`: student can add entries manually. The system also auto-creates draft entries (`auto_generated = true`) from activity: first login after approval, each section moved to `reviewed`, supervisor comments, data points added. Keep these short and factual ("Edited Chapter One: Statement of the problem. Requested supervisor review.").
- Student signs (`student_signed_at`), supervisor signs and comments (`supervisor_signed_at`). RLS and the trigger stop students signing for supervisors.
- Export as a table in the report appendix. **State clearly in the UI that the official Annex 12 form from the institution must still be used where required.** This is a draft aid.

### 4.10 Supervisor portal

- `/supervisor`: list of linked candidates with status, progress (sections done / total), last activity, pending items.
- Approve or request changes on the proposal (`supervisor_reviews`, then set `status = 'approved'`; this sets `approved_at` through the trigger).
- Section review: read-only text, version history diff (simple), comment, mark `final`.
- Show **AI influence** per section and overall: `ai_accepted_chars / max(length(current_text), 1)`, as a percentage, plus counts of AI events by kind. Make clear this is approximate.
- Sign log entries.

### 4.11 Export

`POST /api/studio/export` (or a server action) builds a `.docx` with the `docx` npm package, following KNEC format: A4, Times New Roman 12, 1.5 spacing, cover and title page, declarations (blank signature lines), contents field, lists, sections in order, references, appendices (log, data points and source log).

- Never export unless the student triggers it. Include on the last page a short **AI-use disclosure** generated from the audit trail (counts of coach questions, feedback requests, suggestions shown and accepted).
- Use `docs/templates/Project_Report_Template_Craft_Diploma.docx` and `Business_Plan_Template_KNEC.docx` as the layout reference. Match headings and order.
- Block export of a workspace that is not `approved` or `submitted`.

### 4.12 Mock defence

Chat-style page. The AI asks one question at a time based on the student's own sections and data (for example "Why did you choose these survey years?"). The student types an answer; the AI gives short feedback and a follow-up. Store as `mock_defence` events. No scoring claims. Never reveal answers to the real defence.

---

## 5. Phase 0: fix existing gaps (do this first)

1. **Lesson reader:** `/learn/[moduleId]` (lesson list with progress) and `/learn/[moduleId]/[lessonId]` that renders `lessons.body` as sanitised markdown (use `react-markdown` with `rehype-sanitize`; no raw HTML). Show the video if `video_url` is set.
2. **Gating:** a lesson body is returned only if `lessons.is_free`, or the user has a row in `module_access` for the module, or the user is the module's trainer or an admin. Enforce in the server query, not only in the UI. Today anyone can read all lesson bodies through the `/learn` query; stop selecting `body` for gated lessons in the list page.
3. **Progress:** use `lesson_progress` (already in schema). Mark complete button; show per-module percentage.
4. **Grant access:** extend the purchase flow so a paid order for a module grants `module_access` (Paystack webhook, service role). Admin can grant manually. Institution grants come later.
5. Update `/learn` to link into the reader and stop showing `body` previews for gated lessons.

---

## 6. Phases

| Phase | Deliverable | Done when |
|---|---|---|
| 0 | Lesson reader, gating, progress, `module_access` (section 5) | A free lesson opens for anyone; a gated lesson returns nothing without access; build passes |
| 1 | Run `003a` then `003`; add `supervisor` role and redirect; institutions; admission number and institution on profiles; types updated | Migration applies cleanly; admin can create institutions and assign supervisors |
| 2 | Templates, onboarding, workspace overview, problem finder (without AI), proposal submission, supervisor approval | A student creates a workspace, writes proposal sections, submits; supervisor approves; project sections unlock |
| 3 | Section editor with autosave and versions; progress and marks map | Text saves, versions append, locked sections stay locked before approval (UI and RLS) |
| 4 | AI coach: `/api/studio/ai`, accept route, guardrails, rate limits, institution `ai_mode`, audit trail | All guardrail tests pass (section 8); no endpoint can write a section from empty |
| 5 | Research data module with stats and charts; business plan finance module | Stats and finance match the Excel references on the test cases |
| 6 | Annex 12 log, supervisor portal (versions, AI influence, comments, sign-off) | Supervisor sees candidate drafts and AI log; students cannot sign as supervisor |
| 7 | Export docx with disclosure; mock defence | Export opens in Word with correct layout and disclosure |
| 8 | Institution licences and billing (Paystack), bulk student onboarding | Later; scope separately with the owner |

Do one phase at a time. Finish, validate, log in `CHANGES.md`, then stop and report before starting the next.

---

## 7. Environment and configuration

Add to `.env.example` (placeholders only; never commit real keys; GitHub push protection previously blocked a placeholder that looked like a key, so use descriptive words):

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-sonnet-5-5
STUDIO_AI_DAILY_LIMIT=40
STUDIO_AI_HOURLY_LIMIT=10
```

- Call the Anthropic API from server code only (`src/lib/studio/ai.ts`). Use the official SDK or `fetch` to `https://api.anthropic.com/v1/messages`. Set a request timeout and `max_tokens` (about 1,000 to 1,500).
- If the AI is unavailable, the editor must still work. Show a friendly message.
- Redact nothing from `ai_events.student_input`, but do not log it to console or third-party services.

---

## 8. Testing and acceptance

Write tests for pure logic (Vitest or the project's existing runner; add one if none exists).

**Unit tests:**
- `stats.ts`: for stunting series 35 (2008), 26 (2014), 18 (2022): changes -9 and -8 pp; % change -25.7% and -30.8%; annual change -1.5 and -1.0; mean 26.33; median 26; sample SD 8.50; overall change -17 pp; average annual change -1.214 pp/year. For overweight series 6.3, 5.5, 4.7, 4.1, 3.2 (1998, 2003, 2008, 2014, 2022): mean 4.76; median 4.7; SD 1.20.
- `finance.ts`: with the example inputs in the workbook (price 150, 800 units/month, 10% growth years 2 and 3, 5% price rise, variable cost 90, fixed costs 30,000/month, equipment 120,000 over 5 years, stock 40,000, other start-up 30,000, capital 150,000, loan 100,000 at 12% over 3 years, tax 0): Year 1 sales 1,440,000; gross profit 576,000; net profit 180,000; closing cash 230,666.67; balance check 0 in all years; break-even 6,600 units per year.
- Guardrails: `language_suggestion` filter drops suggestions whose `original` is not in the text, that add digits, or that add a year in parentheses.

**Integration and security checks (manual or automated):**
- A student cannot read another student's workspace, sections, data or AI events.
- A student cannot set `status = 'approved'`, `approved_at`, or sign as supervisor.
- A student cannot edit project-phase sections before approval (RLS, not only UI).
- A supervisor sees only linked candidates.
- `ai_events` cannot be inserted from the browser client.
- With `ai_mode = 'off'` every AI route returns 403.
- No route accepts an empty text and returns generated section text.
- Rate limit returns 429 after the configured count.

**Definition of done for every task:** `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean; `CHANGES.md` entry added; no `any`; no secrets committed; migration is idempotent where practical.

---

## 9. Supporting assets to place in the repo

Put these under `docs/` so agents can read them:

- `docs/templates/Project_Report_Template_Craft_Diploma.docx`
- `docs/templates/Business_Plan_Template_KNEC.docx`
- `docs/templates/Business_Plan_Financial_Model_Template.xlsx`
- `docs/templates/Secondary_Data_Descriptive_Stats_Workbook.xlsx`
- `docs/kits/Project_Kit_01_Stage1_OFSP_Soy_Composite_Flour.docx` (trade, Craft)
- `docs/kits/Project_Kit_02_Stage1_Research_Child_Nutrition_Trends.docx` (research, Craft)
- `docs/Project_Format.docx` (KNEC guidelines: the original source)

The kits are also products to sell on BrightPath through the existing `projects` upload flow (zip into the private bucket, CSV import for the catalogue row). Lessons for the online guides will be supplied later as JSON in the `bulkImportModules` shape:

```json
[{ "title": "Kit 01: OFSP-Soy Composite Flour", "description": "Step-by-step guide", "position": 1,
   "lessons": [{ "title": "1. Hygiene and set-up", "body": "markdown...", "video_url": "", "position": 1, "is_free": true }] }]
```

---

## 10. Out of scope (do not build)

- One-click generation of any section, chapter or report.
- Auto-filling data points, survey results, prices, references or financial inputs.
- Any way for a student to approve their own proposal or sign for their supervisor.
- Selling or exporting finished projects intended for submission under another person's name.
- Plagiarism detection beyond what is described (leave to the institution's own tools).

---

## 11. Open questions for the owner (ask, do not guess)

1. Which Paystack flow should grant `module_access` (per module or per kit bundle)? Price points?
2. Should institutions be able to create supervisor and student accounts in bulk (CSV)?
3. Default `ai_mode` for new institutions: currently `feedback_and_polish`.
4. Is Annex 12 available as a form layout to replicate exactly?
5. Preferred editor: plain textarea (default) or a rich text editor?
6. Does the owner want a public marketing page for the Studio, separate from the product pages?
