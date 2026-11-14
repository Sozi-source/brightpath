export interface PreliminaryVariantContext {
  seed?: string;
  businessName: string;
  candidateName: string;
  admissionNumber: string;
  institutionName: string;
  supervisorName: string;
  townOrMarket: string;
  county: string;
  course?: string | null;
  level?: string | null;
  industrySector?: string | null;
  primaryProduct?: string | null;
  dedicationText?: string | null;
  acknowledgementsText?: string | null;
}

function hashSeed(input: string, salt: string): number {
  const combined = `${salt}::${input.trim().toLowerCase()}`;
  let h = 2166136261;
  for (let i = 0; i < combined.length; i += 1) {
    h ^= combined.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

function cleanEnterpriseTitle(raw: string): string {
  return (
    raw
      .replace(/\s*—\s*Complete KNEC Business Plan.*$/i, "")
      .replace(/\s*\((?:Craft Certificate|Diploma|Certificate)\)\s*$/i, "")
      .trim() || "Proposed Enterprise"
  );
}

function normalizeCourseAward(course?: string | null, level?: string | null): string {
  const rawCourse = (course || "Human Nutrition and Dietetics").trim();
  const rawLevel =
    level === "craft" || /certificate|craft/i.test(level || "")
      ? "Craft Certificate"
      : "Diploma";
  if (/^(?:certificate|diploma|craft|higher\s+diploma)\b/i.test(rawCourse)) {
    return rawCourse;
  }
  return `${rawLevel} in ${rawCourse}`;
}

export function isPlaceholderPreliminary(content: string): boolean {
  const trimmed = (content || "").trim();
  if (!trimmed) return true;
  return (
    /marketplace reference copy is provided for academic adaptation/i.test(trimmed) ||
    /\[Write a personal dedication/i.test(trimmed) ||
    /\[Write acknowledgements/i.test(trimmed) ||
    /\[Enter (?:candidate|index|institution|supervisor) name\]/i.test(trimmed) ||
    /\[(?:Supervisor|Institution|Candidate) name\]/i.test(trimmed) ||
    /\[Admission number withheld\]/i.test(trimmed)
  );
}

export function buildVariedDeclaration(ctx: PreliminaryVariantContext): string {
  const enterprise = cleanEnterpriseTitle(ctx.businessName);
  const candidate = ctx.candidateName.trim() || "Candidate";
  const admission = ctx.admissionNumber.trim() || "ADM/2026/001";
  const institution = ctx.institutionName.trim() || "Accredited TVET Institution";
  const supervisor = ctx.supervisorName.trim() || "Project Supervisor";
  const award = normalizeCourseAward(ctx.course, ctx.level);
  const seedKey = `${ctx.seed || ""}|${enterprise}|${candidate}|${admission}`;
  const variant = hashSeed(seedKey, "knec-declaration") % 8;

  switch (variant) {
    case 0:
      return `### DECLARATION BY CANDIDATE
I hereby declare that this business plan for **${enterprise}** is my original work and that I personally undertook its research, operational design, and financial formulation in accordance with Kenya National Examinations Council (KNEC) assessment guidelines. It has not been presented to any other examination body or training institution for the award of any certificate, diploma, or degree.

Candidate Name: **${candidate}**<br>Index / Admission Number: **${admission}**<br>Institution: **${institution}**<br>Signature: ______________________________<br>Date: ______________________________

---

### APPROVAL BY SUPERVISOR
This business plan has been submitted for Kenya National Examinations Council (KNEC) examination with my approval as the appointed institutional project supervisor.

Supervisor Name: **${supervisor}**<br>Designation: **Project Supervisor**<br>Institution: **${institution}**<br>Signature: ______________________________<br>Date: ______________________________`;

    case 1:
      return `### CANDIDATE'S STATEMENT OF ORIGINALITY
I confirm that the business plan titled **${enterprise}** is my independent academic and entrepreneurial work prepared in partial fulfilment of the requirements for the award of **${award}**. No part of this manuscript has been copied from another candidate's work or previously submitted for assessment at **${institution}** or any other examining body.

| Verification Particular | Candidate Record |
| :--- | :--- |
| **Full Name of Candidate** | **${candidate}** |
| **KNEC Index / Admission No.** | **${admission}** |
| **Training Institution** | **${institution}** |
| **Candidate Signature** | ______________________________ |
| **Date of Submission** | ______________________________ |

### SUPERVISOR'S ENDORSEMENT
I certify that I have supervised the preparation of this business plan by the candidate named above and confirm that it meets the required academic and structural standards for presentation to the Kenya National Examinations Council (KNEC).

| Verification Particular | Supervisor Record |
| :--- | :--- |
| **Name of Project Supervisor** | **${supervisor}** |
| **Departmental Role** | **Appointed KNEC Project Supervisor** |
| **Institution** | **${institution}** |
| **Supervisor Signature** | ______________________________ |
| **Date of Approval** | ______________________________ |`;

    case 2:
      return `### STATEMENT OF ORIGINALITY AND ACADEMIC INTEGRITY
In submitting this business plan for **${enterprise}**, I make the following formal undertakings under the examination regulations of the Kenya National Examinations Council (KNEC):

1. **Original Authorship:** This business plan is the product of my own field inquiry, operational planning, and financial computation carried out during my training at **${institution}**.
2. **Non-Duplication:** This manuscript has not been previously presented in whole or in part to any examination council, polytechnic, college, or university for an academic award.
3. **Attribution of Sources:** Where secondary data, technical benchmarks, or regulatory standards have been consulted, due acknowledgement has been provided in the text and references.

**Candidate Name:** ${candidate}<br>**Admission / Index No.:** ${admission}<br>**Signature:** ______________________________ **Date:** ______________________________

---

### INSTITUTIONAL SUPERVISOR CERTIFICATION
I have guided the candidate throughout the formulation of this business plan and reviewed the final manuscript. I am satisfied that it conforms to KNEC business plan guidelines for **${award}** and recommend it for examination.

**Supervisor Name:** ${supervisor}<br>**Institution:** ${institution}<br>**Signature:** ______________________________ **Date:** ______________________________`;

    case 3:
      return `### DECLARATION AND INSTITUTIONAL CERTIFICATION
#### 1. Declaration by the Candidate
I, **${candidate}** (Index / Admission No.: **${admission}**), solemnly declare that this business plan for **${enterprise}** represents my own unaided work developed during my course of study for **${award}** at **${institution}**. It has never been submitted to any other institution or examination body for academic credit.

#### 2. Certification by the Project Supervisor
I, **${supervisor}**, confirm that the candidate developed this business plan under my academic supervision at **${institution}** and that the completed manuscript is hereby approved for submission to the Kenya National Examinations Council (KNEC).

| Capacity | Full Name & Identification | Official Signature | Date |
| :--- | :--- | :--- | :--- |
| **Candidate** | **${candidate}**<br>Adm/Index: ${admission} | ________________________ | ______________ |
| **Project Supervisor** | **${supervisor}**<br>${institution} | ________________________ | ______________ |`;

    case 4:
      return `### STUDENT DECLARATION
This business plan for **${enterprise}** is my own original compilation prepared in partial fulfilment of the requirements of the Kenya National Examinations Council (KNEC) for the award of **${award}**. All market assumptions, operational workflows, and financial schedules were formulated by me and have not been submitted for any other award at **${institution}** or elsewhere.

* **Candidate Full Name:** **${candidate}**
* **Admission / Index Number:** **${admission}**
* **Department / Course:** **${award}**
* **Signature:** ______________________________
* **Date:** ______________________________

---

### OFFICIAL SUPERVISOR RECOMMENDATION
I have examined this business plan prepared by **${candidate}** and confirm that the work was carried out under my direct supervision in accordance with the syllabus requirements of the Kenya National Examinations Council (KNEC).

* **Supervisor Name:** **${supervisor}**
* **Training Institution:** **${institution}**
* **Signature:** ______________________________
* **Date:** ______________________________`;

    case 5:
      return `### CERTIFICATE OF AUTHORSHIP
I certify that the business plan presented herein for **${enterprise}** was conceived, researched, and written by me as a candidate at **${institution}**. No portion of this work has been unlawfully reproduced from existing commercial plans or prior examination submissions.

Candidate: **${candidate}**<br>Admission / Index No.: **${admission}**<br>Course of Study: **${award}**<br>Candidate Signature: ______________________________<br>Date: ______________________________

---

### SUPERVISORY RELEASE FOR KNEC ASSESSMENT
Having reviewed the chapters, operational schedules, and financial projections contained in this business plan for **${enterprise}**, I hereby release and approve the manuscript for formal assessment by the Kenya National Examinations Council (KNEC).

Approved by: **${supervisor}** (Project Supervisor)<br>Institution: **${institution}**<br>Supervisor Signature: ______________________________<br>Date: ______________________________`;

    case 6:
      return `### DECLARATION OF INDEPENDENT WORK
I declare that this business plan for **${enterprise}**, prepared for operations in **${ctx.townOrMarket}, ${ctx.county}**, is my original academic project submitted to the Kenya National Examinations Council (KNEC). It has not been presented to any other examining authority or tertiary institution for the conferment of a certificate or diploma.

### SUPERVISOR'S APPROVAL FOR EXAMINATION
This business plan has been prepared under my guidance and is submitted to the Kenya National Examinations Council (KNEC) with my approval as the institutional supervisor at **${institution}**.

| Signatory Role | Full Name | Reference / Designation | Signature & Date |
| :--- | :--- | :--- | :--- |
| **Candidate** | **${candidate}** | Index / Adm No.: **${admission}** | Sign: _______________<br>Date: _______________ |
| **Supervisor** | **${supervisor}** | Project Supervisor, **${institution}** | Sign: _______________<br>Date: _______________ |`;

    default:
      return `### CANDIDATE DECLARATION AND SUPERVISOR APPROVAL
**Candidate's Declaration:**<br>I, **${candidate}**, hereby declare that this business plan for **${enterprise}** is my authentic work formulated in partial fulfilment of the requirements for **${award}** at **${institution}**, and that it has not been submitted to any other examination institution.

Signature of Candidate: ______________________________<br>Admission / Index Number: **${admission}**<br>Date: ______________________________

---

**Supervisor's Approval:**<br>This business plan has been presented for examination with my approval as the appointed institutional supervisor at **${institution}**.

Signature of Supervisor: ______________________________<br>Supervisor Name: **${supervisor}**<br>Date: ______________________________`;
  }
}

export function buildVariedDedication(ctx: PreliminaryVariantContext): string {
  if (ctx.dedicationText && !isPlaceholderPreliminary(ctx.dedicationText)) {
    return `### DEDICATION\n${ctx.dedicationText.replace(/^^\s*#{1,6}\s+DEDICATION\s*/i, "").trim()}`;
  }

  const enterprise = cleanEnterpriseTitle(ctx.businessName);
  const candidate = ctx.candidateName.trim() || "the candidate";
  const institution = ctx.institutionName.trim() || "my training institution";
  const town = ctx.townOrMarket.trim() || "the local market";
  const county = ctx.county.trim() || "the county";
  const sector = (ctx.industrySector || "nutrition and enterprise").trim();
  const product = (ctx.primaryProduct || "quality nutritional products and services").trim();
  const seedKey = `${ctx.seed || ""}|${enterprise}|${candidate}|${town}|${county}`;
  const variant = hashSeed(seedKey, "knec-dedication") % 8;

  switch (variant) {
    case 0:
      return `### DEDICATION
This business plan for **${enterprise}** is dedicated to my family, mentors, and fellow professionals in **${county}** whose steadfast encouragement, moral support, and commitment to community well-being inspired my academic training at **${institution}** and the formulation of this enterprise.`;

    case 1:
      return `### DEDICATION
**To My Family and Guardians:**<br>For their patience, financial sacrifice, and prayers throughout my studies at **${institution}**, which gave me the foundation to complete this business plan.

**To the Community of ${town}, ${county}:**<br>Whose everyday demand for accessible, dependable **${product.toLowerCase()}** motivated the design of **${enterprise}** as a practical solution for local households and institutions.`;

    case 2:
      return `### DEDICATION
I dedicate this business plan for **${enterprise}** to three pillars of my academic and professional journey:

* **My Family:** For standing by me with unwavering encouragement and resources during my training at **${institution}**.
* **My Trainers and Mentors:** For instilling the technical discipline required to translate classroom knowledge in **${sector}** into a viable commercial venture.
* **Prospective Clients in ${town} and ${county}:** Whom this enterprise aspires to serve with integrity, quality, and professionalism.`;

    case 3:
      return `### DEDICATION
This manuscript is dedicated to my beloved parents, siblings, and close friends whose belief in my potential sustained me through every stage of my coursework at **${institution}**. I also dedicate this work to emerging youth entrepreneurs across **${county}** who strive to build self-reliant enterprises in the **${sector}** sector.`;

    case 4:
      return `### DEDICATION
I wholeheartedly dedicate this business plan for **${enterprise}** to my family members for their constant support and understanding during the long hours spent researching and compiling this project. Special dedication also goes to my colleagues at **${institution}** and the hardworking residents of **${town}, ${county}**, whose resilience inspired the vision behind this venture.`;

    case 5:
      return `### DEDICATION
This work is dedicated to:

1. **My Family and Loved Ones** — whose moral and material support made my studies at **${institution}** possible.
2. **Health and Enterprise Practitioners in ${county}** — who demonstrate daily that well-managed local businesses can improve household nutrition and community livelihoods in **${town}**.`;

    case 6:
      return `### DEDICATION
*“Committed to enterprise, service, and community transformation in ${town}, ${county}.”*

I dedicate this business plan for **${enterprise}** to my parents and mentors whose counsel shaped my character and work ethic, and to every aspiring graduate of **${institution}** working to turn technical skills into sustainable employment.`;

    default:
      return `### DEDICATION
This business plan for **${enterprise}** is fondly dedicated to my family for their sacrifice and encouragement throughout my training at **${institution}**, and to the families and institutional clients of **${town} and the wider ${county}** whom this venture is designed to serve.`;
  }
}

export function buildVariedAcknowledgements(ctx: PreliminaryVariantContext): string {
  if (ctx.acknowledgementsText && !isPlaceholderPreliminary(ctx.acknowledgementsText)) {
    return `### ACKNOWLEDGEMENTS\n${ctx.acknowledgementsText.replace(/^\s*#{1,6}\s+ACKNOWLEDGEMENTS\s*/i, "").trim()}`;
  }

  const enterprise = cleanEnterpriseTitle(ctx.businessName);
  const candidate = ctx.candidateName.trim() || "the candidate";
  const institution = ctx.institutionName.trim() || "the training institution";
  const supervisor = ctx.supervisorName.trim() || "my project supervisor";
  const town = ctx.townOrMarket.trim() || "the target town";
  const county = ctx.county.trim() || "the target county";
  const sector = (ctx.industrySector || "nutrition and dietetics").trim();
  const product = (ctx.primaryProduct || "enterprise offerings").trim();
  const seedKey = `${ctx.seed || ""}|${enterprise}|${candidate}|${supervisor}|${institution}`;
  const variant = hashSeed(seedKey, "knec-acknowledgements") % 8;

  switch (variant) {
    case 0:
      return `### ACKNOWLEDGEMENTS
I express sincere gratitude to my project supervisor, **${supervisor}**, and the administration and teaching faculty of **${institution}** for their rigorous academic supervision, technical guidance, and constructive feedback during the preparation of this business plan for **${enterprise}** in **${town}, ${county}**.

Special appreciation is also extended to local market respondents, prospective suppliers, and regulatory officers in **${county}** whose practical insights informed the operational workflows and financial planning assumptions presented in this manuscript, as well as to my family and classmates for their continuous encouragement.`;

    case 1:
      return `### ACKNOWLEDGEMENTS
The successful completion of this business plan for **${enterprise}** was made possible through the guidance and cooperation of several individuals and institutions to whom I remain deeply grateful:

* **Project Supervision:** My foremost thanks go to **${supervisor}**, whose patient mentorship, critical review of each chapter, and constructive guidance shaped the structure and analytical depth of this plan.
* **Institutional Faculty:** I thank the principal, departmental heads, and trainers at **${institution}** for equipping me with the entrepreneurial and technical competencies required to design a venture around **${product.toLowerCase()}**.
* **Field & Market Informants:** I appreciate the traders, equipment vendors, and local residents in **${town}, ${county}** who shared practical cost and market information during my preliminary assessment.
* **Family & Peers:** Finally, I thank my family and fellow trainees for their moral and material support throughout my training period.`;

    case 2:
      return `### ACKNOWLEDGEMENTS
First and foremost, I wish to register my profound gratitude to my supervisor, **${supervisor}**, for providing tireless academic guidance, timely corrections, and professional insight from the initial business concept to the final compilation of **${enterprise}**.

I am equally indebted to the lecturers and technical staff at **${institution}** whose instruction in entrepreneurship, operations, and **${sector.toLowerCase()}** laid the groundwork for this project. Their insistence on realistic budgeting and regulatory compliance greatly strengthened Chapter Three, Chapter Four, and Chapter Five of this manuscript.

Finally, I thank the business operators and suppliers consulted in **${town} (${county})** for their candid perspective on local market conditions, as well as my family and coursemates for their steadfast support.`;

    case 3:
      return `### ACKNOWLEDGEMENTS
Preparing this business plan for **${enterprise}** required technical input and encouragement from many quarters. I wish to acknowledge the following contributions:

1. **${supervisor} (Project Supervisor):** For dedicated supervision, detailed review of the financial schedules and operational plans, and unwavering commitment to KNEC quality standards.
2. **Management and Trainers of ${institution}:** For providing a conducive learning environment, reference materials, and practical training throughout my course.
3. **Commercial Contacts in ${town}, ${county}:** Including local retail operators, raw material suppliers, and county licensing personnel who provided benchmark operational information.
4. **My Family and Study Colleagues:** For their prayers, constructive discussions, and financial support during the compilation of this work.`;

    case 4:
      return `### ACKNOWLEDGEMENTS
#### Academic Supervision and Faculty Support
I extend my heartfelt appreciation to my project supervisor, **${supervisor}**, for the invaluable advice, patience, and scholarly supervision accorded to me during the drafting of this business plan for **${enterprise}**. I also thank the departmental faculty at **${institution}** for their thorough instruction across all modules of my training.

#### Industry, Community, and Personal Support
I am grateful to the small-enterprise operators, prospective institutional clients, and equipment suppliers in **${town} and ${county}** who responded to my inquiries on pricing and distribution for **${product.toLowerCase()}**. Above all, I thank my family for their unfailing encouragement and financial backing throughout my studies.`;

    case 5:
      return `### ACKNOWLEDGEMENTS
I wish to convey my sincere appreciation to everyone whose technical input, mentorship, and encouragement contributed to the completion of this business plan for **${enterprise}** in **${town}, ${county}**.

| Stakeholder / Contributor | Nature of Support and Contribution |
| :--- | :--- |
| **${supervisor}** | Direct academic supervision, chapter-by-chapter review, and verification of KNEC structure. |
| **Faculty of ${institution}** | Classroom instruction, technical mentorship in **${sector}**, and entrepreneurship training. |
| **Market Respondents in ${town}** | Practical feedback on customer preferences, local distribution channels, and supplier pricing in **${county}**. |
| **Family & Fellow Candidates** | Continuous moral encouragement, peer review, and financial support throughout the project period. |

To all who contributed directly or indirectly to the realization of this manuscript, I offer my warmest thanks.`;

    case 6:
      return `### ACKNOWLEDGEMENTS
This business plan for **${enterprise}** could not have been completed without the dedicated guidance of my project supervisor, **${supervisor}**, whose insightful critiques and constructive suggestions guided every stage of the manuscript from Chapter One through the Financial Plan.

I also record my appreciation to the entire teaching staff of **${institution}** for nurturing my analytical and professional skills, to the business community in **${town}, ${county}** for sharing practical operational benchmarks, and to my family for standing beside me throughout my academic journey.`;

    default:
      return `### ACKNOWLEDGEMENTS
I take this opportunity to thank the Almighty and all those who supported the preparation of this business plan for **${enterprise}**:

* **Project Supervisor:** Special thanks to **${supervisor}** at **${institution}** for close academic guidance and thorough evaluation of the draft chapters.
* **Training Department:** Appreciation to all trainers at **${institution}** whose coursework prepared me to undertake this independent business plan.
* **Local Enterprise Community:** Gratitude to suppliers and practitioners in **${town}, ${county}** who provided realistic insights into the **${sector.toLowerCase()}** market.
* **Family and Friends:** Deep gratitude to my parents, guardians, and classmates for their encouragement and support.`;
  }
}

export function buildVariedBusinessPlanPreliminaries(ctx: PreliminaryVariantContext): {
  declaration: string;
  dedication: string;
  acknowledgements: string;
} {
  return {
    declaration: buildVariedDeclaration(ctx),
    dedication: buildVariedDedication(ctx),
    acknowledgements: buildVariedAcknowledgements(ctx),
  };
}
