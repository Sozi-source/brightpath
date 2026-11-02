import type { BusinessPlanSpecs, BusinessPlanModel } from "./businessPlanTypes";
import { resolveBusinessPlanModel } from "./businessPlanTypes";
import { computeBusinessPlanFinancials } from "./businessPlanMath";

export { resolveBusinessPlanModel };

export function getBusinessPlanModelGuidance(model: BusinessPlanModel) {
  if (model === "consultancy") {
    return {
      unit: "consultation sessions",
      operations: "nutrition assessment and counselling services",
      workplace: "consultation room and client records area",
      equipment: "clinical assessment and office equipment",
      supplies: "consumables and client education materials",
    };
  }
  if (model === "beverages") {
    return {
      unit: "bottles",
      operations: "beverage processing and distribution",
      workplace: "food preparation and processing premises",
      equipment: "processing equipment",
      supplies: "ingredients and packaging materials",
    };
  }
  if (model === "milling") {
    return {
      unit: "packs",
      operations: "grain milling and food production",
      workplace: "food preparation and processing premises",
      equipment: "milling and packaging equipment",
      supplies: "ingredients and packaging materials",
    };
  }
  return {
    unit: "service or product units",
    operations: "business operations",
    workplace: "business premises",
    equipment: "equipment and tools",
    supplies: "operating supplies",
  };
}

export function validateBusinessPlanModelSpecs(specs: BusinessPlanSpecs): string[] {
  const model = resolveBusinessPlanModel(specs);
  if (model !== "consultancy") return [];

  const identity = `${specs.industrySector} ${specs.primaryProduct} ${specs.productDescription}`.toLowerCase();
  const issues: string[] = [];
  if (/milling|porridge flour|food manufacturing|juice processing|bottled juice/.test(identity)) {
    issues.push("The selected model is nutrition consultancy, but the product or sector describes food manufacturing. Align the product and sector or select the manufacturing model.");
  }
  const locationRationale = (specs.locationRationale || "").toLowerCase();
  if (/located near|nearby|referral from|referrals from/.test(locationRationale)) {
    const placeMatches = locationRationale.match(/\b(?:Lodwar|Kitui|Machakos|Nairobi|Mombasa|Kisumu|Nakuru|Eldoret)\b/gi) || [];
    const foreignPlace = placeMatches.find((place) => place.toLowerCase() !== specs.townOrMarket.trim().toLowerCase());
    if (foreignPlace) {
      issues.push(`The consultancy location rationale mentions ${foreignPlace} while the business is based in ${specs.townOrMarket}. Verify or remove that proximity claim.`);
    }
  }
  return issues;
}

export function getConsultancyLocationRationaleCorrection(specs: BusinessPlanSpecs): string | null {
  if (resolveBusinessPlanModel(specs) !== "consultancy") return null;
  const rationale = (specs.locationRationale || "").toLowerCase();
  if (!/located near|nearby|referral from|referrals from/.test(rationale)) return null;
  const placeMatches = rationale.match(/\b(?:Lodwar|Kitui|Machakos|Nairobi|Mombasa|Kisumu|Nakuru|Eldoret)\b/gi) || [];
  const foreignPlace = placeMatches.find((place) => place.toLowerCase() !== specs.townOrMarket.trim().toLowerCase());
  if (!foreignPlace) return null;
  return `The practice will serve clients in ${specs.townOrMarket}, ${specs.county}. Confirm accessibility, privacy, transport options, and any nearby health facilities through a local site visit; no referral arrangements are assumed.`;
}

export function correctConsultancyLocationClaims(content: string, specs: BusinessPlanSpecs) {
  if (resolveBusinessPlanModel(specs) !== "consultancy") return content;
  const town = specs.townOrMarket.trim();
  const county = specs.county.trim();
  const correctedLocationSentence = `The practice will serve clients in ${town}, ${county}; confirm local facilities and referral routes before describing them as nearby or established.`;
  const proximityPattern = /\b(?:near|nearby|close to|referral from|referrals from|direct\s+\w*\s*referral)\b/i;
  return content.replace(/[^.!?\n]+(?:[.!?]+(?=\s|$)|$)/g, (sentence) => {
    const placeMatches = sentence.match(/\b(?:Lodwar|Kitui|Machakos|Nairobi|Mombasa|Kisumu|Nakuru|Eldoret)\b/gi) || [];
    if (!placeMatches.length || !proximityPattern.test(sentence)) return sentence;
    const foreignPlace = placeMatches.some((place) => place.toLowerCase() !== town.toLowerCase());
    if (!foreignPlace) return sentence;
    const leadingSpace = sentence.match(/^\s*/)?.[0] || "";
    const trailingSpace = sentence.match(/\s*$/)?.[0] || "";
    const prefix = sentence.slice(leadingSpace.length).match(/^(?:\*\*[^*]+\*\*\s*)/);
    return `${leadingSpace}${prefix?.[0] || ""}${correctedLocationSentence}${trailingSpace}`;
  });
}

const serviceEvidenceNote = `Service volumes, client demand, prices, operating costs, and referral arrangements are planning assumptions unless supported by saved evidence. Confirm local access, professional scope, supplier quotations, and applicable requirements before committing funds. Keep client information confidential, obtain consent before assessments, and review bookings, costs, and feedback monthly.`;

const consultancyBodies: Record<string, string> = {
  "prelim.executive_summary": `The proposed practice, ${"${specs.businessName}"}, will provide individualized nutrition assessment, dietary counselling, and meal-planning services in ${"${specs.townOrMarket}, ${specs.county}"}. Its intended clients include ${"${specs.targetCustomersDescription}"}. The candidate proposes charging KES ${"${formatKES(specs.unitSellingPrice)}"} for a consultation, with an estimated variable service cost of KES ${"${formatKES(specs.unitCostOfProduction)}"}. The service will be delivered through booked appointments, client consent, private consultations, written guidance, and follow-up where agreed. The candidate's exact qualifications and registration must be verified before the plan states that services may be provided. Startup funding, capacity, demand, and profit are projections from candidate-supplied assumptions and should be reconciled with quotations and local evidence. No clinic referral, survey result, permit, or supplier quote is treated as confirmed unless documented.`,
  "ch1.name": `${"${specs.businessName}"} is a proposed client-service enterprise in ${"${specs.townOrMarket}, ${specs.county}"}. Its name connects nutrition care with practical support for individuals and families. The green leaf can represent wellbeing and growth, while a simple gold accent can signal warmth and vitality without implying food production. The brand should use clear, accessible language and avoid claims that promise treatment or guaranteed health outcomes. Its materials will identify the services offered, appointment channels, consultation duration, and the nutrition professional responsible. The slogan, Personalized Nutrition for Vibrant Living, communicates tailored guidance while leaving clinical decisions to appropriately qualified practitioners.`,
  "ch1.location": `The proposed practice will operate from ${"${specs.streetOrBuilding}, ${specs.townOrMarket}, ${specs.county}"}, subject to confirming the lease, permitted use, accessibility, privacy, sanitation, and utility arrangements. The premises should provide a private consultation room, a waiting area, a handwashing point, secure storage for assessment tools, and locked or access-controlled client records. Site selection should consider public transport, safe pedestrian access, parking where available, and convenience for clients with mobility needs. Any named health facility or referral route must be checked against the actual town before it is described as nearby or established.`,
  "ch1.nature": `The enterprise provides nutrition assessment, dietary counselling, and individualized meal-planning services. Income is earned from consultation sessions and any clearly defined follow-up packages; the practice does not manufacture or sell packaged foods under this model. Work begins with client intake and consent, followed by an assessment appropriate to the practitioner's verified training and scope. Advice is tailored to the client's goals, health history, resources, and preferences, with referral to a qualified clinician when a condition falls outside the service scope. The business creates value through accessible appointments, clear written guidance, confidentiality, and planned follow-up.`,
  "ch1.products": `The flagship service is an individualized nutrition consultation with a written dietary guide and agreed follow-up. A session may include client history, dietary recall, basic anthropometric measurements where appropriate, goal setting, and a practical meal plan. The proposed session price is KES ${"${formatKES(specs.unitSellingPrice)}"}; the estimated variable service cost is KES ${"${formatKES(specs.unitCostOfProduction)}"} per session, subject to confirmation from actual time, materials, and payment costs. Deliverables may be provided digitally or in print according to client preference. The service must state its limits clearly: it supports nutrition education and planning and does not replace medical diagnosis, prescribing, or emergency care.`,
  "ch1.ownership": `The enterprise is proposed as a ${"${specs.formOfOwnership}"} and will be registered using the candidate's confirmed legal form and current registration requirements. A sole proprietor may retain direct control and keep the initial structure simple; the candidate should confirm personal liability, record-keeping, tax, and permit obligations before launch. The proprietor will be responsible for appointment delivery, client confidentiality, payment records, and monthly financial review. If the practice later hires staff or adds group services, responsibilities and insurance should be reviewed. Any future incorporation or change in ownership remains a proposal until supported by legal and financial advice.`,
  "ch1.mission": `The proposed vision is to become a trusted and accessible nutrition consultancy serving clients in ${"${specs.county}"}. Its mission is to provide respectful, evidence-informed nutrition assessment, counselling, and practical meal-planning support within the practitioner's verified professional scope. Core values are client dignity, confidentiality, informed consent, affordability, cultural respect, and honest communication about evidence and limitations. The practice will avoid guarantees, disclose fees before service, keep records securely, and refer clients when their needs require care beyond its competence. These values guide client interactions, staff conduct, record handling, and decisions about future service expansion.`,
  "ch1.goals": `During the first year, the proprietor will prepare compliant premises, confirm professional and county requirements, establish appointment and record systems, and begin service after required approvals are in place. The planning target is ${"${formatKES(specs.monthlyProductionUnitsYear1)} consultations per month"}, not manufactured product output. Monthly records will track enquiries, bookings, completed sessions, cancellations, client follow-up, revenue, and operating costs. The proprietor will review progress each quarter and adjust appointment capacity or promotion using observed results. In Years 2 and 3, growth may come from additional appointment hours, group education, or employer wellness sessions if demand, competence, staffing, and approvals support expansion.`,
  "ch1.justification": `The proposed practice responds to demand for individualized, practical nutrition guidance in ${"${specs.townOrMarket}"}. Its commercial case depends on clients being willing and able to pay for assessment, meal planning, and follow-up at the stated price. The plan should distinguish this opportunity from clinical treatment, public health services, and free educational information. Local affordability, competing service prices, transport access, and client priorities require verification through documented market research. The business can start with a modest appointment-based operation and scale its hours or service packages only after actual bookings and cash-flow records support the change.`,
  "ch1.entry": `Market entry will begin with a clear service list, published fees, appointment booking process, privacy notice, and client consent procedure. Promotion can use educational talks, community noticeboards, a professional website or social page, and outreach to organizations that serve the intended client groups. The practice may introduce itself to nearby health providers, but no referral partnership should be claimed until agreed and documented. Early feedback will be collected with consent and without disclosing private health information. Growth options include follow-up consultations, group nutrition education, and workplace wellness sessions, subject to demonstrated demand and the practitioner's verified qualifications.`,
  "ch1.swot": `| Category | Consultancy-specific position | Response |
| :--- | :--- | :--- |
| Strengths | Nutrition training, personalized sessions, and a low-inventory service model. | Verify credentials and define services within professional scope. |
| Weaknesses | New practice, limited client base, and dependence on appointment income. | Start with controlled costs and measure bookings and repeat visits. |
| Opportunities | Demand for practical meal planning, preventive education, and follow-up support. | Test these services locally before investing in expansion. |
| Threats | Competition, affordability constraints, privacy incidents, and changes in client demand. | Use transparent fees, secure records, referral boundaries, and a cash reserve. |

This assessment is a planning tool, not proof of market demand or partnership. The proprietor should review it quarterly against appointment records, client feedback, verified competitor observations, and actual operating costs.`,
  "ch2.customers": `The proposed customer groups are adults seeking support with balanced eating, clients managing a clinician-diagnosed condition who need nutrition education, families seeking practical meal planning, and employers considering wellness education. The practice should define which groups it can serve competently and when a medical referral is needed. Potential customers may differ in income, food access, language, culture, and ability to attend in person. Intake questions should be relevant and proportionate; sensitive information must be collected with consent and stored securely. The candidate should validate local demand through documented conversations or a survey before treating any group as a proven market segment.`,
  "ch2.demand": `Demand should be estimated from the service catchment, likely client groups, appointment availability, observed local prices, and a realistic conversion from enquiries to booked sessions. The supplied population or market-size figure is not evidence by itself. A simple estimate can show the number of addressable clients, the proportion expected to seek paid nutrition support, and the monthly capacity available to the proprietor. Each input should be labelled as sourced, candidate-estimated, or awaiting local confirmation. The Year 1 target of ${"${formatKES(specs.monthlyProductionUnitsYear1)} sessions per month"} must be checked against working days, session duration, administration time, and follow-up commitments before it is treated as achievable.`,
  "ch2.competitors": `Competitor analysis should compare nutrition practices, clinics, hospitals, pharmacies, online services, and free public education that clients in ${"${specs.townOrMarket}"} can actually access. No competitor names or prices are assumed in this preset. Record the source and date for each observed fee, service, location, and customer access route. Compare appointment length, privacy, follow-up, format of meal guidance, and professional qualifications only when this information is available. Where evidence is missing, mark it for local verification rather than inventing a competitor or weakness. The practice's position should rest on its verified service scope and client experience, not unsupported superiority claims.`,
  "ch2.pricing": `The proposed fee is KES ${"${formatKES(specs.unitSellingPrice)}"} per consultation. The candidate should show how the fee was set using the session length, preparation and follow-up time, consumable costs, rent and utility allocation, payment charges, and observed local alternatives. The estimated variable cost is KES ${"${formatKES(specs.unitCostOfProduction)}"} per session; confirm it from records after trial appointments. State whether written meal guidance and follow-up are included or charged separately. Display fees before booking, explain cancellation and rescheduling terms, and avoid price comparisons until competitor prices have been observed and recorded.`,
  "ch2.promotion": `Promotion will explain the practice's services, qualifications, appointment process, fees, and limits in clear, non-stigmatizing language. Suitable channels may include a professional social media page, community information sessions, printed service leaflets, and outreach to employers or local organizations. Health information should be educational, evidence-informed, and reviewed before publication. Client stories, photographs, or testimonials require explicit consent and must not disclose private information. Any referral relationship should be described as a proposal until written agreement exists. The monthly promotion budget of KES ${"${formatKES(specs.marketingPromotionBudgetMonthly)}"} should be monitored against enquiries, completed bookings, and repeat appointments rather than likes or impressions alone.`,
  "ch2.distribution": `This practice delivers services through booked in-person consultations at the proposed premises and, where appropriate and feasible, remote appointments. Each route requires a private setting, reliable appointment communication, secure handling of client information, and a clear method for sharing written meal guidance. The plan should state the service area and any transport or connectivity limits. Group education can be offered at partner venues only after access and responsibilities are agreed. The practice does not require retail stockists, wholesale distribution, product delivery routes, or a goods warehouse. Appointment volume should be scheduled with enough time for preparation, documentation, and follow-up.`,
  "ch2.forecast": `The forecast converts planned monthly consultation sessions into revenue using the stated fee and a realistic ramp-up. For each year, show planned sessions, average fee, gross revenue, variable service costs, payroll, rent, utilities, promotion, financing, and net result. Session numbers must be feasible within the proprietor's working hours and include administration and follow-up time. Use the financial engine's deterministic calculations; do not substitute narrative estimates. Year 2 and Year 3 growth rates are candidate assumptions and should be supported by a capacity plan. Update the forecast after launch using actual bookings, cancellations, collections, and expenses.`,
  "ch3.structure": `The practice begins with a lean structure led by the proprietor, who oversees service delivery, client records, finances, quality, and business development. A receptionist or administrative assistant may support bookings, payments, and communications if the budget allows. Clinical or nutrition decisions remain with a professional whose qualifications and registration have been verified. The reporting structure should identify who handles client complaints, data access, referrals, and continuity when the proprietor is unavailable. Outsourced bookkeeping or legal support may be engaged as needed. The organogram should reflect the actual proposed staffing plan rather than a manufacturing, production, or quality-control department.`,
  "ch3.management": `The proprietor will manage appointments, conduct nutrition consultations within verified competence, prepare client guidance, maintain confidential records, monitor service quality, and review cash flow. The business plan should state the candidate's exact qualification, institution, completion status, and professional registration only after checking supporting documents. Do not infer a diploma or active KNDI registration from a course title. Continuing professional development, supervision, and referral arrangements should be documented where applicable. Administrative records should separate business accounts from client health information. Management capacity should be assessed against expected appointment hours, preparation time, reporting duties, and any other employment or study commitments.`,
  "ch3.staffing": `Staffing should match the appointment volume and protect client confidentiality. The proprietor is responsible for nutrition services only within verified professional scope. A part-time receptionist may manage bookings, payment records, and routine enquiries without access to unnecessary clinical details. A bookkeeper may support monthly accounts and tax records. If another nutrition professional is engaged, verify qualifications, registration, role boundaries, and supervision arrangements before assigning clients. The staffing table should identify headcount, duties, minimum qualifications, work hours, and proposed pay. The current plan should not include a machine operator, packaging attendant, grain processor, or factory supervisor unless the business model is formally changed.`,
  "ch3.remuneration": `The payroll plan should distinguish the proprietor's drawings from employee wages and include only roles the practice expects to fund. Monthly salary assumptions must be checked against the actual work schedule and available cash. Statutory deductions and employer obligations should be calculated under current verified requirements rather than inserted as unsupported flat estimates. The staffing table should show headcount, gross pay, applicable deductions, employer costs, and total monthly payroll. If the proprietor initially works alone, state that clearly and show the conditions that would justify hiring an assistant. Review payroll quarterly against completed consultations and cash collections.`,
  "ch3.recruitment": `Recruitment will be proportionate to the practice's workload and financial capacity. If an administrative assistant is needed, the proprietor will define duties, verify references, agree on confidentiality obligations, and train the employee on appointment handling, respectful communication, payment records, and secure document storage. Any nutrition professional will have qualifications and registration checked before service delivery. Staff will receive orientation on client consent, privacy, appropriate referral, complaints, and emergency procedures relevant to their roles. Training records and performance reviews will be kept. Hiring dates remain proposed until funding and demand justify the position.`,
  "ch3.legal": `Before opening, the proprietor should confirm the business registration, county business permit, premises use, data-protection duties, tax obligations, and any professional registration or practice requirements that apply to the exact services offered. Confirm these requirements with the issuing authority or qualified adviser and record the evidence and current fee. Do not list food-manufacturing permits, KEBS product certification, or food-handler requirements unless the practice adds a regulated food product or the authority confirms they apply. The business should maintain client consent, privacy, secure-record, complaint, and referral procedures. This plan does not assume that any licence or approval has already been granted.`,
  "ch3.support": `The practice may obtain professional support from a qualified accountant, legal adviser, insurer, and relevant nutrition professional body or mentor. Any adviser or organization should be named only after the relationship is confirmed; this draft does not assume a bank, clinic, or referral partner has agreed to participate. Accounting support can help organize receipts, payroll, taxes, and monthly financial reports. Legal advice can clarify leases, client terms, privacy notices, and professional obligations. Insurance needs should be assessed against the actual services and premises. Record the scope, cost, and status of each proposed support arrangement.`,
  "ch4.facilities": `The practice requires a private consultation room, a small reception or waiting area, a handwashing point, accessible sanitation, secure storage for equipment, and a locked or access-controlled records area. The proposed premises are ${"${specs.workshopSquareMeters} square metres"} at ${"${specs.streetOrBuilding}"}, with rent of KES ${"${formatKES(specs.monthlyRent)}"} per month, subject to lease and local verification. Arrange seating to protect privacy and provide safe access for clients. A simple layout should show client arrival, consultation, payment, and exit without exposing records or conversations. No production line, raw-grain storage, packaging room, or goods warehouse is required for this service model.`,
  "ch4.workflow": `Service delivery begins when a client enquires and receives information about the service, fee, appointment, and privacy practices. At the appointment, the practitioner obtains consent, gathers relevant history, assesses the client's stated goals, and uses measurements only when appropriate and within competence. The practitioner prepares practical nutrition guidance, explains uncertainty and limitations, agrees on next steps, and documents the consultation securely. Where a medical condition or need is outside scope, the client is referred to an appropriate qualified provider. Follow-up appointments are scheduled with consent. A closing check confirms the client understands the plan and knows how to ask questions.`,
  "ch4.equipment": `Equipment should support safe, appropriate nutrition assessment and client education. The candidate may budget for a digital scale, stadiometer, body-composition analyzer if justified, laptop, printer, secure storage, consultation furniture, and licensed software. Quantities, prices, suppliers, warranties, and quotation dates must be checked before purchase; the preset's amounts are planning estimates, not supplier quotations. Equipment must be calibrated or maintained according to manufacturer guidance where applicable. Client data should be stored on access-controlled devices with backups and suitable security. Keep the budget limited to clinical assessment and office needs.`,
  "ch4.materials": `The practice's recurring supplies may include client intake forms, printed or digital educational materials, stationery, cleaning products, and disposable items needed for assessment. The monthly quantity and cost in the budget should be based on expected appointments and actual supplier quotations. Digital materials can reduce printing but require accessible formats and secure transmission. No grain, fruit, flour, food packaging, or farm-gate raw materials are needed to deliver consultations. Identify each supplier only after verification and mark unconfirmed quotations as pending. Track stock purchases monthly and use materials efficiently without compromising hygiene, privacy, or the clarity of client guidance.`,
  "ch4.labor": `Appointments should be scheduled within the proprietor's available working hours and allow time for client preparation, the consultation itself, record keeping, written guidance, breaks, and follow-up. The monthly target of ${"${formatKES(specs.monthlyProductionUnitsYear1)} sessions"} should be converted into weekly bookings and checked against realistic session duration. Administrative tasks should be included in the work schedule rather than treated as unpaid spare capacity. If an assistant is engaged, define booking hours, payment reconciliation, record-access limits, and cover arrangements. Review appointment duration and workload after the first operating months and revise capacity when actual records show that service quality can be maintained.`,
  "ch4.quality": `Quality assurance focuses on accurate, respectful, evidence-informed advice and safe client information handling. Use a consistent intake and consent process, document the basis of recommendations, explain uncertainty, and set follow-up expectations. Protect paper and electronic records from unauthorized access, retain only necessary information, and establish a process for client corrections or complaints. Maintain assessment equipment as recommended and clean reusable tools between clients. Refer clients whose needs are outside the practitioner's training or scope. Monitor client feedback and service records to identify improvements. Food production testing, moisture checks, packaging integrity, grain waste, and factory sanitation controls do not apply to this consultancy model.`,
  "ch4.schedule": `The service capacity plan should state consultation hours per day, working days per week, average appointment duration, preparation and follow-up time, and planned time away from the practice. Monthly capacity is the number of sessions that can be delivered without reducing service quality or compromising documentation. The target of ${"${formatKES(specs.monthlyProductionUnitsYear1)} sessions per month"} should be tested against this schedule before it is used in the sales forecast. Maintenance planning covers assessment tools, computers, software licences, data backups, and premises safety. Add appointment capacity only when actual demand, staffing, and finances support the change.`,
  "ch5.assumptions": `The financial model treats each paid consultation as one service unit. The unit fee, variable cost, monthly session capacity, annual growth, staffing, rent, utilities, marketing, financing, and tax assumptions must be reviewed and supported by candidate records or verified evidence. Revenue depends on completed and paid appointments, not production output or inventory turnover. The model's deterministic calculations should remain unchanged by AI. Reconcile the number of available appointment hours with the monthly sessions in the forecast, and show any unresolved input as an assumption requiring confirmation before implementation.`,
  "ch5.sources": `Start-up funding may combine the proprietor's savings with a loan or other financing that is actually available and accepted. The preset does not assume approval from a named fund, bank, family member, or microfinance provider. Record each proposed source, amount, terms, interest, fees, repayment schedule, and evidence status. Treat the owner contribution as an assumption until funds are confirmed. Do not commit the practice to a repayment obligation until written terms have been reviewed and the monthly cash-flow forecast shows that repayments are affordable.`,
  "ch5.income": `The income statement uses consultation revenue less variable service-delivery costs, payroll, premises, utilities, transport, promotion, depreciation, financing costs, and applicable taxes. The financial table is calculated from the entered assumptions. A positive result is a projection, not proof of viability. The candidate should verify the fee, number of completed sessions, variable cost per session, salaries, and fixed overheads using documented evidence. Compare actual receipts and expenses monthly with the forecast, explain material differences, and revise future assumptions through the approved financial model rather than changing calculated totals manually.`,
  "ch5.cashflow": `The cash-flow schedule models collections from paid consultations and the timing of operating costs, payroll, rent, utilities, transport, marketing, and loan repayments. It assumes client fees are collected according to the stated payment terms; cancellations, delayed payments, and seasonal changes may affect cash. Confirm opening funds and any loan before treating them as available. Keep business receipts and expenditure records, reconcile bank and mobile-money collections monthly, and maintain an adequate reserve for fixed costs. The table values are generated by the deterministic financial model and should not be edited independently.`,
  "ch5.breakeven": `Break-even is expressed as the number of paid consultation sessions required to cover fixed costs at the stated fee and variable service cost. Compare the result with realistic appointment capacity, including consultation, preparation, documentation, and follow-up time. If the required sessions exceed available capacity or contribution is not positive, the current assumptions are not viable and should be reviewed. This calculation does not establish market demand. Confirm the fee, service cost, monthly overheads, and achievable appointment schedule before drawing conclusions from the break-even table.`,
  "ch5.risks": `| Risk | Possible effect | Proposed response |
| :--- | :--- | :--- |
| Low bookings or cancellations | Revenue below plan | Track enquiries and bookings; keep fixed costs controlled. |
| Professional-scope or credential issue | Service interruption or client harm | Verify qualifications, registration, scope, and referral boundaries before launch. |
| Confidentiality breach | Client harm and loss of trust | Restrict record access, secure devices, and use a written privacy process. |
| Equipment failure | Delayed or limited assessments | Maintain tools and arrange an alternative assessment process. |
| Cash-flow pressure | Difficulty meeting rent or payroll | Reconcile monthly cash and retain a suitable reserve. |

Review risks quarterly and update responses using actual records. Likelihood, impact, and reserve amounts should be confirmed by the proprietor rather than assumed.` ,
  "app.workplan": `| Activity | Proposed timing | Evidence or completion check |
| :--- | :--- | :--- |
| Confirm professional scope and registration | Before opening | Verified documents and requirements |
| Confirm lease, premises use, and county requirements | Before fitting out | Lease and written authority guidance |
| Obtain current equipment and supplies quotations | Before purchase | Dated supplier quotations |
| Set up privacy, consent, booking, and record systems | Before first client | Reviewed procedures and test records |
| Begin client education and appointment promotion | After approvals | Dated materials and spending records |
| Review capacity, bookings, and cash flow | Monthly | Updated operating and financial records |`,
  "app.invoices": `### Evidence still to collect

This appendix is reserved for dated quotations and local market evidence. No supplier quotation, competitor observation, customer survey, clinic referral agreement, or approval is claimed by this preset. Attach actual quotations for assessment equipment, consultation furniture, software, printing, and recurring supplies. Include supplier name, item description, quantity, unit price, VAT or delivery terms where shown, quotation date, and validity period. Add a dated competitor observation sheet only after checking service, location, and fee directly. For demand estimates, record the survey method, sample, date, and results. Mark missing evidence as [Quotation required] or [Confirm locally].`,
};

export function getConsultancySectionContent(key: string, title: string, specs: BusinessPlanSpecs) {
  const formatKES = (value: number) => Math.round(value).toLocaleString("en-KE");
  const tables: Record<string, string> = {
    "ch2.competitors": specs.competitors.length
      ? `| Competitor / alternative | Observed location | Observed fee | Evidence status |\n| :--- | :--- | :--- | :--- |\n${specs.competitors.map((item) => `| ${item.name} | ${item.location} | ${item.priceLevel} | Candidate observation; verify date and source |`).join("\n")}`
      : "No competitor observations have been entered. Complete a dated local comparison before making market-position claims.",
    "ch3.staffing": `| Position | Count | Monthly pay (KES) | Duties and qualifications |\n| :--- | ---: | ---: | :--- |\n${specs.staffing.map((item) => `| ${item.position} | ${item.count} | ${formatKES(item.monthlySalary)} | ${item.duties}; ${item.qualifications} |`).join("\n") || "| Proprietor | 1 | [Confirm] | Verify credentials and role scope |"}`,
    "ch3.remuneration": `| Position | Count | Gross monthly pay (KES) | Deductions / employer costs |\n| :--- | ---: | ---: | :--- |\n${specs.staffing.map((item) => `| ${item.position} | ${item.count} | ${formatKES(item.monthlySalary)} | Confirm current statutory treatment |`).join("\n") || "| Proprietor | 1 | [Confirm] | Confirm whether payroll applies |"}`,
    "ch4.equipment": `| Clinical or office equipment | Qty | Unit cost (KES) | Supplier / quote status |\n| :--- | ---: | ---: | :--- |\n${specs.machinery.map((item) => `| ${item.item} | ${item.quantity} | ${formatKES(item.unitCost)} | ${item.supplier || "[Quotation required]"} |`).join("\n")}`,
    "ch4.materials": `| Consumable or client material | Monthly quantity | Monthly cost (KES) | Supplier / quote status |\n| :--- | :--- | ---: | :--- |\n${specs.rawMaterials.map((item) => `| ${item.material} | ${item.monthlyQuantity} | ${formatKES(item.monthlyCost)} | ${item.supplier || "[Quotation required]"} |`).join("\n")}`,
  };
  const body = consultancyBodies[key];
  if (key === "references") {
    const sources = specs.research?.sources || [];
    const content = sources.length
      ? sources.map((source, index) => `${index + 1}. ${source.title}. ${source.url}`).join("\n\n")
      : "No verified sources are attached yet. Add current, authoritative sources for nutrition practice requirements, local market evidence, and relevant public health claims before final submission. Do not treat this note as a reference entry.";
    return `### ${title}\n\n${content}`;
  }
  if (!body) return null;
  const rendered = body.replaceAll("${specs.streetOrBuilding}, ${specs.townOrMarket}, ${specs.county}", `${specs.streetOrBuilding}, ${specs.townOrMarket}, ${specs.county}`)
    .replaceAll("${specs.townOrMarket}, ${specs.county}", `${specs.townOrMarket}, ${specs.county}`)
    .replaceAll("${specs.businessName}", specs.businessName)
    .replaceAll("${specs.formOfOwnership}", specs.formOfOwnership)
    .replaceAll("${specs.locationRationale}", specs.locationRationale || "[Confirm local site advantages]")
    .replaceAll("${specs.targetCustomersDescription}", specs.targetCustomersDescription || "[Confirm intended client groups]")
    .replaceAll("${formatKES(specs.unitSellingPrice)}", formatKES(specs.unitSellingPrice))
    .replaceAll("${formatKES(specs.unitCostOfProduction)}", formatKES(specs.unitCostOfProduction))
    .replaceAll("${formatKES(specs.monthlyProductionUnitsYear1)}", formatKES(specs.monthlyProductionUnitsYear1))
    .replaceAll("${formatKES(specs.marketingPromotionBudgetMonthly)}", formatKES(specs.marketingPromotionBudgetMonthly))
    .replaceAll("${formatKES(specs.monthlyRent)}", formatKES(specs.monthlyRent))
    .replaceAll("${specs.townOrMarket}", specs.townOrMarket)
    .replaceAll("${specs.county}", specs.county)
    .replaceAll("${specs.streetOrBuilding}", specs.streetOrBuilding)
    .replaceAll("${specs.workshopSquareMeters}", String(specs.workshopSquareMeters))
    .replaceAll("${specs.unitSellingPrice}", String(specs.unitSellingPrice))
    .replaceAll("${specs.unitCostOfProduction}", String(specs.unitCostOfProduction))
    .replaceAll("${specs.monthlyProductionUnitsYear1}", String(specs.monthlyProductionUnitsYear1))
    .replaceAll("${specs.marketingPromotionBudgetMonthly}", String(specs.marketingPromotionBudgetMonthly))
    .replaceAll("${specs.monthlyRent}", String(specs.monthlyRent));
  const evidenceTable = tables[key] ? `\n\n${tables[key]}` : "";
  if (key === "ch2.forecast") {
    const fin = computeBusinessPlanFinancials(specs);
    const forecast = `| Forecast | Year 1 | Year 2 | Year 3 |\n| :--- | ---: | ---: | ---: |\n| Paid consultations | ${formatKES(Math.round(fin.annualSalesYear1 / Math.max(1, specs.unitSellingPrice)))} | ${formatKES(Math.round(fin.annualSalesYear2 / Math.max(1, specs.unitSellingPrice)))} | ${formatKES(Math.round(fin.annualSalesYear3 / Math.max(1, specs.unitSellingPrice)))} |\n| Revenue (KES) | ${formatKES(fin.annualSalesYear1)} | ${formatKES(fin.annualSalesYear2)} | ${formatKES(fin.annualSalesYear3)} |`;
    return `### ${title}\n\n${rendered}\n\n${forecast}\n\n${serviceEvidenceNote}`;
  }
  return `### ${title}\n\n${rendered}${evidenceTable ? `\n\n${evidenceTable}` : ""}\n\n${serviceEvidenceNote}`;
}

export function getBusinessModelConflictFindings(
  specs: BusinessPlanSpecs,
  sections: Array<{ key: string; content: string }>
) {
  const model = resolveBusinessPlanModel(specs);
  const forbidden = model === "consultancy"
    ? /\b(?:hammer mill|milling machine|grain moisture|farmgate|pouch sealer|pouch filling|grain intake|porridge flour|smallholder farmer|production plant|manufacturing workflow|food manufacturing|vacuum.packag|grain prices)\b/i
    : model === "beverages"
      ? /\b(?:grain milling|hammer mill|porridge flour|grain moisture|farmgate grain|grain intake|milling workflow)\b/i
      : model === "milling"
        ? /\b(?:juice bottling|fruit pulper|pasteurization tank|beverage processing|bottled juice|fruit puree)\b/i
        : null;
  if (!forbidden) return [];
  return sections.flatMap((section) => forbidden.test(section.content)
    ? [{ sectionKey: section.key, issue: `This section contains language associated with a different business area than the selected ${model} model. Review the enterprise activity and revise the section.` }]
    : []);
}

const knownKenyanPlaceCoordinates: Record<string, [number, number]> = {
  juja: [-1.1, 37.01],
  lodwar: [3.12, 35.6],
  kitui: [-1.37, 38.01],
  machakos: [-1.52, 37.26],
  nairobi: [-1.29, 36.82],
  mombasa: [-4.04, 39.66],
  kisumu: [-0.09, 34.77],
  nakuru: [-0.30, 36.08],
  eldoret: [0.52, 35.27],
};

function distanceKm(a: [number, number], b: [number, number]) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const [lat1, lon1] = a.map(radians);
  const [lat2, lon2] = b.map(radians);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const arc = 2 * Math.asin(Math.sqrt(
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  ));
  return 6371 * arc;
}

export function getBusinessPlanGeographicFindings(
  specs: BusinessPlanSpecs,
  sections: Array<{ key: string; content: string }>
) {
  const businessPlace = Object.keys(knownKenyanPlaceCoordinates).find((place) =>
    new RegExp(`\\b${place}\\b`, "i").test(`${specs.townOrMarket} ${specs.county}`)
  );
  if (!businessPlace) return [];
  const businessCoordinates = knownKenyanPlaceCoordinates[businessPlace];
  return sections.flatMap((section) => {
    const distantPlaces = Object.entries(knownKenyanPlaceCoordinates)
      .filter(([place, coordinates]) => place !== businessPlace && distanceKm(businessCoordinates, coordinates) >= 100)
      .map(([place]) => place);
    const suspiciousLines = section.content.split(/\r?\n/).filter((line) => {
      if (section.key !== "ch2.competitors" && !/competitor|alternative|referral|located near|nearby/i.test(line)) return false;
      return distantPlaces.some((place) => new RegExp(`\\b${place}\\b`, "i").test(line));
    });
    return suspiciousLines.length
      ? [{
          sectionKey: section.key,
          issue: `This section names ${distantPlaces.filter((place) => suspiciousLines.some((line) => new RegExp(`\\b${place}\\b`, "i").test(line))).join(", ")} as a competitor or nearby service, but the business is based in ${specs.townOrMarket}, ${specs.county}. These locations are over 100 km apart.`,
          recommendation: "Remove the out-of-area provider from the local competitor table, or label it as a distant benchmark only if that comparison is relevant and verified. Confirm the provider and fee before retaining the entry.",
        }]
      : [];
  });
}
