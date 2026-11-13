from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

OUT = Path('artifacts'); OUT.mkdir(exist_ok=True)
DOCX = OUT / 'imperial-college-business-plan-ready.docx'
BLUE, GOLD, LIGHT, GRID = '123B63', 'C79A32', 'F3F7FA', 'D9E1E8'

def font(run, size=12, bold=False, italic=False, color='000000'):
    run.font.name = 'Times New Roman'; run.font.size = Pt(size); run.bold = bold; run.italic = italic
    run.font.color.rgb = RGBColor.from_string(color)
    run._element.get_or_add_rPr().rFonts.set(qn('w:ascii'), 'Times New Roman')
    run._element.get_or_add_rPr().rFonts.set(qn('w:hAnsi'), 'Times New Roman')

def shade(cell, fill):
    pr = cell._tc.get_or_add_tcPr(); el = OxmlElement('w:shd'); el.set(qn('w:fill'), fill); pr.append(el)

def table_borders(table):
    pr = table._tbl.tblPr; b = OxmlElement('w:tblBorders')
    for edge in ('top','left','bottom','right','insideH','insideV'):
        e = OxmlElement('w:' + edge); e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), '6'); e.set(qn('w:color'), GRID); b.append(e)
    pr.append(b)

def cell_text(cell, text, bold=False, color='000000', size=9):
    cell.text = ''; p = cell.paragraphs[0]; p.paragraph_format.space_after = Pt(0); p.paragraph_format.line_spacing = 1.05
    font(p.add_run(str(text)), size, bold, False, color); cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER

def add_table(doc, headers, rows):
    t = doc.add_table(rows=1, cols=len(headers)); t.alignment = WD_TABLE_ALIGNMENT.CENTER; table_borders(t)
    for i, h in enumerate(headers): cell_text(t.rows[0].cells[i], h, True, 'FFFFFF'); shade(t.rows[0].cells[i], BLUE)
    for ri, row in enumerate(rows):
        cells = t.add_row().cells
        for i, value in enumerate(row):
            cell_text(cells[i], value)
            if ri % 2: shade(cells[i], LIGHT)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

def para(doc, text):
    p = doc.add_paragraph(); p.paragraph_format.line_spacing = 1.5; p.paragraph_format.space_after = Pt(6); p.add_run(text); return p

def bullets(doc, items):
    for text in items:
        p = doc.add_paragraph(style='List Bullet'); p.paragraph_format.line_spacing = 1.35; p.paragraph_format.space_after = Pt(3); p.add_run(text)

def numbered(doc, items):
    for text in items:
        p = doc.add_paragraph(style='List Number'); p.paragraph_format.line_spacing = 1.35; p.paragraph_format.space_after = Pt(3); p.add_run(text)

def h(doc, text, level=1):
    p = doc.add_heading(text, level=level); p.paragraph_format.space_before = Pt(12 if level == 1 else 8); p.paragraph_format.space_after = Pt(6); return p

doc = Document(); sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.27), Inches(11.69)
sec.top_margin, sec.bottom_margin, sec.left_margin, sec.right_margin = Inches(.75), Inches(.7), Inches(.85), Inches(.75)
for name in ('Normal','Body Text'):
    st = doc.styles[name]; st.font.name = 'Times New Roman'; st.font.size = Pt(12); st.paragraph_format.line_spacing = 1.5
    st._element.get_or_add_rPr().rFonts.set(qn('w:ascii'), 'Times New Roman'); st._element.get_or_add_rPr().rFonts.set(qn('w:hAnsi'), 'Times New Roman')
for name, size in [('Title',20),('Heading 1',15),('Heading 2',13),('Heading 3',12)]:
    st = doc.styles[name]; st.font.name = 'Times New Roman'; st.font.size = Pt(size); st.font.bold = True; st.font.color.rgb = RGBColor(0,0,0)
    st._element.get_or_add_rPr().rFonts.set(qn('w:ascii'), 'Times New Roman'); st._element.get_or_add_rPr().rFonts.set(qn('w:hAnsi'), 'Times New Roman')
footer = sec.footer.paragraphs[0]; footer.alignment = WD_ALIGN_PARAGRAPH.CENTER; font(footer.add_run('Imperial College of Medical and Health Sciences | Business Plan | Dummy planning dataset'), 9)

# Title page and preliminary pages
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_before = Pt(35); font(p.add_run('IMCHS'), 28, True, False, BLUE)
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; font(p.add_run('IMPERIAL COLLEGE OF MEDICAL AND HEALTH SCIENCES'), 15, True, False, BLUE)
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; font(p.add_run('Health sciences education and training'), 12, False, True, GOLD)
for _ in range(3): doc.add_paragraph()
p = doc.add_paragraph(style='Title'); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.add_run('Business Plan for New Course Expansion')
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; font(p.add_run('Thika Town, Kiambu County'), 12, True)
add_table(doc, ['Plan field','Planning entry'], [['Institution','Imperial College of Medical and Health Sciences'],['Enterprise','New-course expansion feasibility plan'],['Location','Thika Main Campus, Thika Town, Kiambu County'],['Planning period','2027–2029'],['Prepared for','Academic and management review'],['Data status','Source-backed fees and equipment; unresolved approvals remain marked']])
para(doc, 'This document uses the Imperial 2027 fees structure PDF and the root equipment workbook for the Mortuary Science and Optometry schedules. Proposed approvals, programme durations where absent, quotations and market evidence remain explicitly marked for confirmation.')
doc.add_page_break()
h(doc, 'Dedication'); para(doc, 'This plan is dedicated to learners, trainers and health-service partners who support practical, ethical and accessible health sciences education in Kenya.'); doc.add_page_break()
h(doc, 'Declaration'); para(doc, 'I declare that this business plan is presented for academic and management planning purposes. The figures, market observations, staffing assumptions and implementation dates marked as dummy or proposed must be verified before they are relied on for investment, licensing or public communication.'); add_table(doc, ['Candidate name','Signature','Date'], [['[Dummy candidate name]','________________','________________']]); doc.add_page_break()
h(doc, 'Acknowledgements'); para(doc, 'The plan acknowledges the contribution of institutional leadership, trainers, learners, health facilities and professional advisers whose feedback should inform the final feasibility decision. In the final version, insert the names of contributors who have actually participated.'); doc.add_page_break()
h(doc, 'Abbreviations and Acronyms'); add_table(doc, ['Acronym','Meaning'], [['CBC','Competency Based Curriculum'],['ICT','Information and Communication Technology'],['IMCHS','Imperial College of Medical and Health Sciences'],['KNEC','Kenya National Examinations Council'],['TVET','Technical and Vocational Education and Training'],['KES','Kenya shillings'],['QA','Quality assurance']]); doc.add_page_break()
h(doc, 'Table of Contents'); bullets(doc, ['Executive Summary','Chapter One: Business Description','Chapter Two: Marketing Plan','Chapter Three: Organization and Management','Chapter Four: Operations and Production','Chapter Five: Financial Plan','References','Appendices']); para(doc, 'The final Word export may update page numbering after institutional details and verified evidence are inserted.'); doc.add_page_break()

h(doc, 'Executive Summary')
para(doc, 'Imperial College of Medical and Health Sciences proposes a staged expansion at its Thika Main Campus into six programme lines: Certificate in Mortuary Science Level 5, Diploma in Mortuary Science Level 6, Certificate in Orthopaedic Trauma Medicine Level 5, Diploma in Orthopaedic Trauma Medicine Level 6, Diploma in Optometry, and Artificial Intelligence and Data Science. The programme names, term lengths and tuition fees are taken from the Imperial 2027 fees structure. Regulatory approval, curriculum ownership, entry requirements and placement capacity remain approval gates.')
para(doc, 'The supplied planning intake is 25 learners for each Mortuary and Orthopaedic level, 25 for Diploma in Optometry and 35 for Artificial Intelligence and Data Science. Derived full-programme tuition value is KES 33,750,000 before other charges. The equipment workbook gives KES 6,534,181.40 including VAT for Mortuary Science and KES 7,614,634.40 for Optometry. Orthopaedic Trauma (KES 3,600,000) and AI/Data Science (KES 3,200,000) are unconfirmed estimates carried over from the earlier planning draft. Any subtotal including them is provisional and must be confirmed through quotations.')
para(doc, 'The recommended decision is conditional approval for a documented stage-gate process. Management should confirm all six programme approval pathways, reconcile the source fee schedule with approved course documents, obtain quotations for the equipment lines, verify faculty and placement capacity, and authorize a pilot intake only after the readiness evidence is complete.')

h(doc, 'Chapter One: Business Description')
h(doc, '1.1 Business Identity and Brand', 2); para(doc, 'The proposed expansion will operate under Imperial College of Medical and Health Sciences. The IMCHS mark used in this planning document represents a simple institutional identifier rather than a registered logo. The brand promise is practical, ethical and learner-centred health sciences education. The college will position the expansion as a structured pathway that links classroom knowledge to supervised practice and employability skills.')
h(doc, '1.2 Location and Ownership', 2); para(doc, 'The expansion is planned for the ICMHS Thika Main Campus in Thika Town, Kiambu County, approximately 600 metres from Thika Level 5 Hospital according to the supplied institutional planning document. ICMHS is treated as an existing private medical, health sciences and applied technology education institution. The exact plot or street address, premises approvals and course approvals require confirmation from administration and the relevant authorities.')
h(doc, '1.3 Products and Services', 2); bullets(doc, ['Certificate in Mortuary Science Level 5: five terms at KES 28,000 per term; full tuition derived at KES 140,000.','Diploma in Mortuary Science Level 6: eight terms at KES 34,000 per term; full tuition derived at KES 272,000.','Certificate in Orthopaedic Trauma Medicine Level 5: five terms at KES 30,000 per term; full tuition derived at KES 150,000.','Diploma in Orthopaedic Trauma Medicine Level 6: eight terms at KES 33,000 per term; full tuition derived at KES 264,000.','Diploma in Optometry: eight terms at KES 34,000 per term; full tuition derived at KES 272,000.','Artificial Intelligence and Data Science: six terms at KES 30,000 per term; full tuition derived at KES 180,000.'])
h(doc, '1.4 Mission, Vision and Values', 2); para(doc, 'Mission: to provide practical and accountable health sciences education that equips learners for safe, respectful and evidence-informed service. Vision: to become a trusted local training partner for health support skills in the Thika area. Values: integrity, learner safety, competence, inclusion, confidentiality, continuous improvement and respect for professional scope.')
h(doc, '1.5 Goals and Objectives', 2); numbered(doc, ['Complete an approval and curriculum evidence file for all six programme lines.','Recruit and retain qualified trainers and practical supervisors for the approved intake.','Plan for 160 learners across the six supplied programme-line intakes, subject to capacity confirmation.','Maintain a documented quality-assurance cycle covering attendance, assessment, learner welfare and practical safety.','Reconcile course-level contribution using the supplied fees, direct costs and verified operating budget before launch.'])
h(doc, '1.6 Justification and Entry Strategy', 2); para(doc, 'The proposed expansion is justified as a feasibility opportunity rather than a confirmed market fact. Thika is a suitable planning location because it can connect learners to urban and peri-urban health facilities, transport routes and a wider catchment. Entry will be staged: verify approvals, validate demand with documented interviews, equip the minimum safe practical rooms, recruit trainers, pilot one intake and review outcomes before adding additional cohorts.')
h(doc, '1.7 SWOT Analysis', 2); add_table(doc, ['Area','Dummy assessment','Response'], [['Strengths','Existing institutional identity and proposed access to learning facilities.','Use staged intake and documented quality checks.'],['Weaknesses','New courses may lack verified demand history and specialist equipment.','Collect enrolment evidence and obtain quotations before procurement.'],['Opportunities','Short courses and facility-linked practical learning may diversify revenue.','Pilot employer-focused courses after core delivery is stable.'],['Threats','Approval delays, fee sensitivity and competition from established colleges.','Use a compliance gate, transparent fees and differentiated practical support.']])

h(doc, 'Chapter Two: Marketing Plan')
h(doc, '2.1 Customer Segments', 2); add_table(doc, ['Segment','Need','Offer','Evidence status'], [['School leavers','Structured entry into health support training.','Certificate pathway and learner support.','Dummy assumption; validate locally.'],['Working health assistants','Career progression and formal skills.','Flexible timetable and short courses.','Dummy assumption; interview facilities.'],['Facility-sponsored trainees','Reliable training and reporting.','Cohort packages and progress reports.','Proposal; no partnership assumed.'],['Adult learners','Practical, short-duration certification.','First aid and infection-prevention courses.','Pilot demand survey required.']])
h(doc, '2.2 Demand and Market Share', 2); para(doc, 'The supplied planning intake is 160 learners across six programme lines: 25 each for Mortuary Science Level 5, Mortuary Science Level 6, Orthopaedic Trauma Medicine Level 5, Orthopaedic Trauma Medicine Level 6 and Diploma in Optometry, plus 35 for Artificial Intelligence and Data Science. These are planning intakes, not measured market share. Management should record enquiry volume, conversion rates, competitor fees, learner travel distance and reasons for non-enrolment before approving the targets.'); add_table(doc, ['Programme line','Planning intake','Evidence required'], [['Mortuary Science Level 5','25','Enquiry, demand and placement validation'],['Mortuary Science Level 6','25','Enquiry, demand and placement validation'],['Orthopaedic Trauma Medicine Level 5','25','Enquiry, demand and placement validation'],['Orthopaedic Trauma Medicine Level 6','25','Enquiry, demand and placement validation'],['Diploma in Optometry','25','Enquiry, demand and placement validation'],['Artificial Intelligence and Data Science','35','Enquiry, demand and employer validation']])
h(doc, '2.3 Competition and Positioning', 2); add_table(doc, ['Competitor category','Strength','Possible gap','Plan response'], [['Established colleges','Brand recognition and course history','May have larger cohorts','Small-cohort support and practical tracking'],['Short-course providers','Fast, focused delivery','Limited progression pathways','Stackable short courses linked to formal study'],['Online providers','Convenience and low overhead','Limited physical practice','Blended content with supervised practical sessions']]); para(doc, 'No competitor name, price or market ranking is asserted in this dummy plan. A final version should insert verified observations with dates and sources.')
h(doc, '2.4 Pricing and Promotion', 2); add_table(doc, ['Programme line','Terms','Fee per term','Derived full tuition'], [['Mortuary Science Level 5','5','KES 28,000','KES 140,000'],['Mortuary Science Level 6','8','KES 34,000','KES 272,000'],['Orthopaedic Trauma Medicine Level 5','5','KES 30,000','KES 150,000'],['Orthopaedic Trauma Medicine Level 6','8','KES 33,000','KES 264,000'],['Diploma in Optometry','8','KES 34,000','KES 272,000'],['Artificial Intelligence and Data Science','6','KES 30,000','KES 180,000']]); bullets(doc, ['Use the supplied 2027 fees structure in the official information pack.','List registration, admission, examination, computer/internet, insurance, attachment, accommodation and other applicable charges separately.','Do not advertise a programme until its approval status, entry requirements and award title are confirmed.','Track enquiries, applications, deposits, enrolments, withdrawals and referrals in one register.'])
h(doc, '2.5 Sales Forecast', 2); add_table(doc, ['Programme line','Intake','Full tuition per learner','Derived tuition value'], [['Mortuary Science Level 5','25','KES 140,000','KES 3,500,000'],['Mortuary Science Level 6','25','KES 272,000','KES 6,800,000'],['Orthopaedic Trauma Medicine Level 5','25','KES 150,000','KES 3,750,000'],['Orthopaedic Trauma Medicine Level 6','25','KES 264,000','KES 6,600,000'],['Diploma in Optometry','25','KES 272,000','KES 6,800,000'],['Artificial Intelligence and Data Science','35','KES 180,000','KES 6,300,000'],['Total','160','','KES 33,750,000']])

h(doc, 'Chapter Three: Organization and Management')
h(doc, '3.1 Organization Structure', 2); para(doc, 'The proposed reporting structure is: Director and Principal → Academic Coordinator, Finance and Administration Officer, and Student Welfare and Compliance Officer. Trainers report to the Academic Coordinator. Practical supervisors report to the relevant trainer and maintain session records. The structure is a dummy operating design and should be aligned to the institution’s actual governance instruments.')
h(doc, '3.2 Staffing Plan', 2); add_table(doc, ['Position','Headcount','Main duties','Minimum planning requirement'], [['Principal / Director','1','Governance, approvals and performance oversight','Institutional authority'],['Academic Coordinator','1','Curriculum, timetable, assessment and trainer support','Relevant academic leadership'],['Trainers','4','Theory, practical instruction and assessment','Verified qualifications and registration'],['Lab / practical technician','1','Equipment, consumables and safety records','Relevant technical competence'],['Finance and admin officer','1','Fees, payroll, procurement and records','Controls and reporting skills'],['Welfare and compliance officer','1','Learner support, complaints and compliance files','Safeguarding and records skills']])
h(doc, '3.3 Remuneration Assumptions', 2); add_table(doc, ['Role group','Monthly dummy cost','Annual cost','Status'], [['Academic and practical team','KES 360,000','KES 4,320,000','Budget assumption'],['Administration and welfare','KES 90,000','KES 1,080,000','Budget assumption'],['Part-time specialists','KES 50,000','KES 600,000','Use only when scheduled'],['Total payroll envelope','KES 500,000','KES 6,000,000','Review after staffing plan']]); para(doc, 'The financial model uses a lower fixed operating-cost assumption than the full payroll envelope during the pilot year because some trainers are assumed to be scheduled part-time. This must be reconciled against actual contracts before approval.')
h(doc, '3.4 Recruitment and Training', 2); numbered(doc, ['Publish role requirements and verify credentials before appointment.','Use a structured induction covering learner safety, assessment integrity, confidentiality and escalation.','Review trainer performance each term using attendance, assessment quality, learner feedback and compliance records.','Maintain a skills matrix and annual professional-development plan.'])
h(doc, '3.5 Regulation and Professional Support', 2); add_table(doc, ['Requirement','Authority or adviser','Evidence/status','Fee'], [['Course approval','Relevant regulator and examining body','[Confirm locally]','[Confirm locally]'],['Premises and fire safety','County and safety authorities','[Confirm locally]','[Confirm locally]'],['Trainer credentials','Professional bodies and institutional HR','Collect copies before appointment','[Confirm locally]'],['Data and learner records','Institutional policy and applicable law','Draft policy required','[Confirm locally]']])

h(doc, 'Chapter Four: Operations and Production')
h(doc, '4.1 Facilities and Layout', 2); para(doc, 'The dummy operating layout includes two classrooms, one computer and digital-learning room, one practical laboratory room, a small resource centre, an administration office, a learner welfare desk and accessible sanitation facilities. The layout must be checked against occupancy, safety, accessibility, ventilation, equipment and licensing requirements before use.')
h(doc, '4.2 Delivery Workflow', 2); numbered(doc, ['Receive an enquiry and issue the verified course information pack.','Screen entry requirements and record the application decision.','Confirm fees, timetable, learner agreement and orientation date.','Deliver theory and practical sessions using attendance and lesson records.','Assess learning using approved instruments and moderate results.','Provide supervised exposure only where a documented placement or practical arrangement exists.','Review learner progress, welfare issues and complaints through the quality-assurance meeting.','Complete term and annual performance reports before the next intake.'])
h(doc, '4.3 Equipment and Materials', 2); add_table(doc, ['Programme / equipment source','Equipment scope','Cost including VAT','Evidence status'], [['Mortuary Science workbook','44 listed items including biosafety cabinet, centrifuges, autopsy tables, embalming machines, aspirator and PPE','KES 6,534,181.40','Workbook estimate; vendor quotation confirmation required'],['Optometry workbook','21 listed instruments including phoropters, retinoscopes, slit lamps, keratometers, tonometers and lensmeters','KES 7,614,634.40','Workbook estimate; vendor quotation confirmation required'],['Orthopaedic Trauma Medicine planning schedule','Fracture fixation models, traction/splinting sets, orthopedic instruments, casting station and simulation manikins','KES 3,600,000 (UNCONFIRMED ESTIMATE)','Unconfirmed; obtain and verify quotations'],['Artificial Intelligence and Data Science planning schedule','Workstations, GPU-capable servers, networking, power backup and secure data environment','KES 3,200,000 (UNCONFIRMED ESTIMATE)','Unconfirmed; obtain and verify quotations'],['Provisional equipment subtotal','All four equipment schedules','KES 20,948,815.80 (PROVISIONAL)','Includes unconfirmed Orthopaedic and AI estimates; not an approved budget']])
h(doc, '4.4 Quality, Safety and Waste Management', 2); para(doc, 'Quality controls will include approved lesson plans, attendance registers, assessment moderation, equipment logs, incident reporting, practical-room checklists and learner feedback. Any biological or hazardous waste must be managed through a documented procedure and an approved service arrangement. The plan does not assert that such an arrangement currently exists; it is an implementation requirement.')
h(doc, '4.5 Implementation Schedule', 2); add_table(doc, ['Month','Milestone','Responsible role','Evidence'], [['1','Confirm feasibility, approvals path and budget','Director','Decision memo'],['2','Validate demand and collect supplier quotations','Marketing and finance','Interview log and quotes'],['3','Complete premises and safety review','Compliance officer','Readiness checklist'],['4','Recruit and induct trainers','Academic coordinator','Credential file'],['5','Install equipment and test systems','Technician','Asset and test records'],['6','Pilot orientation and first intake','Principal','Enrolment and attendance register']])

h(doc, 'Chapter Five: Financial Plan')
h(doc, '5.1 Financial Assumptions', 2); bullets(doc, ['Fees and term lengths are taken from the supplied Imperial 2027 fees structure.','The six programme-line planning intakes total 160 learners and derive KES 33,750,000 in full-programme tuition value.','Mortuary Science equipment is calculated from the root workbook at KES 6,534,181.40 including VAT; Optometry is KES 7,614,634.40 including VAT.','UNCONFIRMED: Orthopaedic Trauma Medicine KES 3,600,000 and Artificial Intelligence/Data Science KES 3,200,000 are provisional estimates from the earlier draft, not validated source-file costs. Obtain quotations before using them in an approved budget.','The equipment subtotal and revised funding requirement are provisional because they include those two unconfirmed estimates.','Other charges such as registration, admission, examinations, computer/internet, insurance, accommodation and attachment are listed in the 2027 fees structure and must be mapped by programme before the final cash-flow model.','Operating costs, financing terms, depreciation, tax and working-capital timing require Finance confirmation before they are treated as final.'])
h(doc, '5.2 Start-up Capital', 2); add_table(doc, ['Use of funds','Amount / status'], [['Mortuary Science equipment','KES 6,534,181.40; workbook estimate'],['Optometry equipment','KES 7,614,634.40; workbook estimate'],['Orthopaedic Trauma Medicine equipment','KES 3,600,000; UNCONFIRMED estimate'],['Artificial Intelligence and Data Science equipment','KES 3,200,000; UNCONFIRMED estimate'],['Provisional course-equipment subtotal','KES 20,948,815.80; includes unconfirmed estimates'],['Pre-operational approvals, curriculum and launch preparation','KES 1,800,000; planning allowance'],['Working-capital buffer','KES 4,200,000; planning allowance'],['Provisional initial funding requirement','KES 26,948,815.80; subject to quotation and Finance confirmation']]); add_table(doc, ['Funding source','Amount','Status'], [['Institutional contribution','[Confirm]','Finance confirmation required'],['Debt or external capital','[Confirm]','Financing terms required'],['Other approved funding','[Confirm]','Evidence required'],['Total funding','[Recalculate]','Cannot be finalized until equipment estimates are confirmed']])
h(doc, '5.3 Projected Income Statement', 2); add_table(doc, ['Item','Year 1','Year 2','Year 3'], [['Revenue','KES 10,680,000','KES 14,664,000','KES 18,360,000'],['Variable costs','KES 2,160,000','KES 2,880,000','KES 3,600,000'],['Fixed operating costs','KES 4,400,000','KES 5,200,000','KES 6,000,000'],['Depreciation','KES 940,000','KES 940,000','KES 940,000'],['Interest','KES 480,000','KES 360,000','KES 240,000'],['Projected net profit before tax','KES 2,700,000','KES 5,284,000','KES 7,580,000']])
h(doc, '5.4 Cash Flow Summary', 2); add_table(doc, ['Cash flow item','Year 1','Year 2','Year 3'], [['Opening cash','KES 0','KES 2,700,000','KES 7,984,000'],['Operating cash surplus','KES 3,640,000','KES 6,104,000','KES 8,520,000'],['Debt principal and capital reserve','KES 940,000','KES 820,000','KES 700,000'],['Closing cash before distributions','KES 2,700,000','KES 7,984,000','KES 15,804,000']])
h(doc, '5.5 Break-even and Ratios', 2); add_table(doc, ['Metric','Dummy result','Interpretation'], [['Contribution per learner','KES 110,000','Tuition less variable cost'],['Fixed cash cost plus interest','KES 4,880,000','Year 1 planning base'],['Break-even learners','45 learners','Rounded up from 44.36'],['Gross contribution margin','79.8%','Revenue less variable costs divided by revenue'],['Net margin before tax','25.3%','Projected profit divided by revenue'],['Debt to start-up capital','42.6%','Proposed loan divided by start-up requirement']])
h(doc, '5.6 Financial Risks and Controls', 2); add_table(doc, ['Risk','Control','Trigger','Contingency'], [['Lower enrolment','Monthly enquiry and conversion tracking','Below 60% of target','Delay non-essential purchases and add verified outreach'],['Cost overruns','Three quotations and approval limits','Quote exceeds budget by 10%','Re-scope or stage procurement'],['Fee collection delays','Written fee schedule and receivables aging','Overdue balance above policy','Payment plan and enrolment controls'],['Approval delay','Compliance gate before advertising','No written confirmation','Hold intake and preserve cash reserve']])

h(doc, 'References'); para(doc, 'The following source records were used for the populated planning tables. Regulatory, demand, placement and quotation evidence remains a final approval requirement.'); bullets(doc, ['Imperial College of Medical and Health Sciences, Updated Fees Structure for Year 2027, Thika Campus.','OPTOMETRY.xlsx, MORTUARY SCIENCE and OPTOMETRY worksheets, supplied equipment schedules and cost estimates.','ICMHS Mission, Vision and Values: https://icmhs.co.ke/mission-and-values','ICMHS official home page and academic programmes: https://icmhs.co.ke/','ICMHS faculty and leadership: https://icmhs.co.ke/faculty-and-leadership'])
h(doc, 'Appendix A: Source Data and Confirmation Register'); add_table(doc, ['Field','Populated value','Remaining action'], [['Programme lines','Six: four level-specific lines plus Optometry and AI/Data Science','Confirm approval and award titles'],['Term lengths','5, 8, 5, 8, 8 and 6 respectively','Reconcile with approved curricula'],['Tuition fees','KES 28,000; 34,000; 30,000; 33,000; 34,000; 30,000 per term','Confirm fee circular and applicable charges'],['Course-equipment capital','KES 20,948,815.80','Obtain quotations and procurement approval'],['Other charges','Registration, admission, examination, computer/internet, insurance, accommodation, attachment and other listed charges','Map by programme and intake'],['Campus','Thika Main Campus, approximately 600 metres from Thika Level 5 Hospital','Confirm exact address and capacity audit']])
h(doc, 'Appendix B: Decision Checklist'); bullets(doc, ['Confirm the approval pathway and entry requirements for all six programme lines.','Confirm whether Optometry requires an additional Level 5 pathway or remains Diploma-only.','Verify course duration, award title and fee treatment against the approved curriculum.','Collect quotations for every Excel equipment line and the Orthopaedic/AI planning schedules.','Complete the campus room, safety, accessibility and practical-placement audit.','Confirm named faculty, credentials, availability and contracts.','Map all 2027 other charges to each programme and complete the three-year cash-flow model.','Obtain management sign-off before advertising or admitting learners.'])

doc.save(DOCX)

# Create the companion print-ready PDF from the same deterministic DOCX content.
from docx.table import Table as DocxTable
from docx.text.paragraph import Paragraph as DocxParagraph
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph as PdfParagraph, Spacer, Table as PdfTable, TableStyle, PageBreak
from xml.sax.saxutils import escape

def blocks(parent):
    for child in parent.element.body.iterchildren():
        if child.tag.endswith('}p'): yield DocxParagraph(child, parent)
        elif child.tag.endswith('}tbl'): yield DocxTable(child, parent)

PDF = OUT / 'imperial-college-business-plan-ready.pdf'
styles = getSampleStyleSheet()
normal = ParagraphStyle('PlanBody', parent=styles['Normal'], fontName='Times-Roman', fontSize=12, leading=18, spaceAfter=6)
title = ParagraphStyle('PlanTitle', parent=normal, fontSize=20, leading=24, alignment=TA_CENTER, spaceAfter=12)
h1 = ParagraphStyle('PlanH1', parent=normal, fontSize=15, leading=19, spaceBefore=12, spaceAfter=6)
h2 = ParagraphStyle('PlanH2', parent=normal, fontSize=13, leading=17, spaceBefore=8, spaceAfter=6)
small = ParagraphStyle('PlanSmall', parent=normal, fontSize=9, leading=10)
story = []
for block in blocks(doc):
    if isinstance(block, DocxParagraph):
        text = block.text.strip()
        if not text: continue
        style_name = block.style.name if block.style else 'Normal'
        if style_name == 'Title': style = title
        elif style_name == 'Heading 1': style = h1
        elif style_name in ('Heading 2','Heading 3'): style = h2
        elif 'List Bullet' in style_name: style = normal; story.append(PdfParagraph('• ' + escape(text), style)); continue
        elif 'List Number' in style_name: style = normal; story.append(PdfParagraph(escape(text), style)); continue
        else: style = normal
        story.append(PdfParagraph(escape(text), style))
    else:
        data = []
        for row in block.rows:
            data.append([PdfParagraph(escape(cell.text.replace('\n',' ')), small) for cell in row.cells])
        t = PdfTable(data, repeatRows=1, hAlign='CENTER')
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#123B63')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),0.5,colors.HexColor('#D9E1E8')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
        story.extend([t, Spacer(1, 6)])

def pdf_footer(canvas, doc_obj):
    canvas.saveState(); canvas.setFont('Times-Roman', 9); canvas.setFillColor(colors.HexColor('#444444'))
    canvas.drawCentredString(A4[0] / 2, 0.42 * inch, f'Imperial College of Medical and Health Sciences | Page {doc_obj.page}')
    canvas.restoreState()

SimpleDocTemplate(str(PDF), pagesize=A4, rightMargin=.75*inch, leftMargin=.85*inch, topMargin=.75*inch, bottomMargin=.65*inch).build(story, onFirstPage=pdf_footer, onLaterPages=pdf_footer)
print(DOCX); print(PDF)


