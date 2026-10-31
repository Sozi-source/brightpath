# Business Plan Content Standard

**Status:** Required for BrightPath TVET business plans  
**Applies to:** Generation, AI review, supervisor review, section editing, and document export

BrightPath business plans must read as complete, structured Kenyan TVET enterprise plans. Use the approved script-generated plan as the quality baseline: clear professional prose, useful detail, itemized procedures, and tables where they make comparisons or figures easier to assess.

This standard governs manuscript content. The short-copy rules in `AGENTS.md` apply to product UI labels and helper text, not to academic or business-plan sections.

## Required document structure

Follow the section definitions in `src/lib/studio/templates/business.ts` and build content with `src/lib/studio/businessPlanBuilder.ts`.

1. **Executive summary:** 150–250 words covering the enterprise, offering, customers, operating plan, management, capital requirement, and projections.
2. **Chapter 1 — Business description:** Identity and brand, location, ownership, sector, products, mission and values, goals, justification, entry strategy, and SWOT.
3. **Chapter 2 — Marketing plan:** Customer segments, demand and market share, competitors, pricing, promotion, distribution, and sales forecast.
4. **Chapter 3 — Organization and management:** Organization structure, management capability, staffing, remuneration, recruitment and training, regulation, and professional support.
5. **Chapter 4 — Operations and production:** Facilities, workflow, equipment, materials and sourcing, labor schedule, quality and waste management, and production capacity.
6. **Chapter 5 — Financial plan:** Start-up costs, financing, assumptions, cash flow, income statement, balance sheet, break-even, ratios, and risks.
7. **References and appendices:** Verifiable references, implementation schedule, and actual or clearly pending supplier quotations.

Use the section guidance and `minWords` values in the template as minimum expectations. A section should explain its subject and apply it to the candidate's enterprise; short generic filler does not satisfy the requirement.

## Voice and substance

- Write in a professional, direct, evidence-led business-plan voice appropriate for a Kenyan TVET candidate.
- Explain the enterprise's choices and operating steps with concrete detail drawn from the candidate's specifications.
- Use concise paragraphs for rationale and analysis; use numbered steps for processes, objectives, and implementation sequences; use bullets for grouped actions, advantages, risks, and responsibilities.
- Keep headings and subheadings aligned with the KNEC section outline. Avoid repeated introductions, generic claims, and padding.
- Distinguish clearly between **candidate-supplied assumptions**, **verified findings**, and **proposed future actions**.
- Write future plans as proposals. Do not describe planned surveys, contracts, partnerships, approvals, licenses, premises, quotations, or customer findings as completed facts.

## Tables and itemized content

Use Markdown tables for data that readers need to compare or verify. Include a clear title or introduction, meaningful column names, consistent units, and a short interpretation after substantial tables.

| Section | Preferred structure |
|---|---|
| SWOT | Four-part matrix with strengths, weaknesses, opportunities, threats, and a practical response for each |
| Customer segments and competitors | Segment or competitor comparison with location, observed price, strengths, weaknesses, and evidence status |
| Pricing and sales forecast | Unit cost components, selling price, contribution, sales volume, and KES revenue by period |
| Organization and staffing | Simple reporting structure plus positions, headcount, duties, and qualifications |
| Remuneration | Itemized payroll with assumptions and statutory deductions identified separately |
| Regulation and compliance | Requirement, issuing authority, evidence/status, and fee only when verified |
| Equipment and materials | Item, quantity/required volume, unit or monthly cost, supplier, and quotation status |
| Production and implementation | Numbered process flow and a dated or month-by-month schedule |
| Financial plan | Deterministic model tables for start-up capital, funding, cash flow, income, balance sheet, break-even, and ratios |
| Risk management | Risk, likelihood or impact where supported, mitigation, responsible person, and contingency |

Do not force a table into reflective prose. Do not invent data to fill one; mark missing evidence as `[Confirm locally]` or `[Quotation required]`.

## Word export format

- Export business plans as `.docx` so students can download and continue editing the final file.
- Use A4 paper, Times New Roman at 12 pt throughout, and 1.5 line spacing, following the KNEC project-guide requirements.
- Preserve section headings, numbered procedures, bullet lists, and tables when converting the saved Markdown sections to Word.
- Keep a clean title page with candidate and institution details for the student's private export. Marketplace copies use a saved, reviewed snapshot and omit admission numbers and other candidate-specific identifiers.

## Evidence and financial integrity

- Cite research claims with numbered source references that map to verified URLs in the References section.
- Do not invent market sizes, local demographics, competitor names or prices, survey results, supplier quotes, licensing fees, tax rules, or regulatory requirements.
- Treat entered competitor, supplier, market-size, customer, and price details as candidate-supplied unless corroborated by a cited source.
- When evidence is missing, qualify the statement and identify the evidence the candidate should collect.
- Financial statements and ratios must come from `src/lib/studio/businessPlanMath.ts` and the candidate's supplied assumptions. AI must not recalculate, alter, or silently reconcile financial figures.

## Generation and review workflow

1. Build the full structured draft deterministically from candidate specifications.
2. Run the selected Gemini or Groq provider for limited factual corrections. Apply only exact, supported corrections; retain the script draft if AI review fails.
3. Keep the existing section-based review available for focused editing.
4. Offer a separate whole-document audit after generation. It checks factual support, consistency across chapters, completeness, repetition, and structure. It returns findings and source links; it does not silently rewrite the manuscript.
5. Make whole-document review available to the assigned supervisor and administrators. Link findings back to the relevant chapter or section.
6. Preserve existing candidate text during a normal build. Replacing saved sections requires the explicit **Rebuild Existing Draft** action and confirmation.

## Final quality check

- Every template section has substantive, enterprise-specific content.
- Procedures and objectives are itemized where sequence or accountability matters.
- Comparisons, forecasts, budgets, schedules, and financial statements use readable tables.
- Candidate assumptions, verified sources, and planned actions are not conflated.
- Citations resolve to the supplied references; unsupported claims are flagged for local verification.
- Financial values agree with the deterministic calculations and are unchanged by AI review.
- The executive summary, marketing plan, operating plan, and financial plan describe one consistent enterprise.
