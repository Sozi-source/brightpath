from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph as RP, Spacer, Table as RT, TableStyle
from xml.sax.saxutils import escape

src=sorted(Path(r'C:\Users\sozi\Downloads').glob('business-plan-for-imperial*.docx'),key=lambda p:p.stat().st_mtime)[-1]
out=Path('artifacts'); out.mkdir(exist_ok=True); wp=out/'ICMHS_full_business_plan_directors_edition_updated.docx'; pp=out/'ICMHS_full_business_plan_directors_edition_updated.pdf'
d=Document(src)
repl={
'BUSINESS PLAN FOR IMPERIAL COLLEGE OF MEDICAL AND HEALTH SCIENCES � NEW COURSE EXPANSION FEASIBILITY PLAN IN THIKA TOWN, KIAMBU COUNTY':'BUSINESS PLAN FOR IMPERIAL COLLEGE OF MEDICAL AND HEALTH SCIENCES: NEW PROGRAMME PORTFOLIO INVESTMENT AND OPERATING PLAN',
'INSTITUTIONAL FEASIBILITY AND IMPLEMENTATION BRIEF':'DIRECTORS’ BUSINESS PLAN | THIKA MAIN CAMPUS | NOVEMBER 2026',
'The current planning case models full-programme tuition value of KES 0 for the planning intake, based on the supplied fee-per-semester and duration data. Course-level direct delivery costs remain uncosted until Finance supplies approved budgets. Recurring annual operating costs are approximately KES 16,260,000. Indicative initial funding is KES 21,100,000, comprising equipment, pre-operational setup and working capital. The resulting comparison of programme tuition value against one year of operating cost is KES -19,750,000 before financing, tax and depreciation; it is not a cash forecast.':'The 2027 fee schedule provides terms and tuition for six programme lines. At stated planned intakes, potential full-course tuition is KES 33,750,000, collected over five to eight terms. Equipment estimates total KES 20,948,815.80 provisionally; Orthopaedic and AI/Data Science costs remain unconfirmed. Adding KES 1,800,000 setup and KES 4,200,000 working-capital allowances gives a provisional capital envelope of KES 26,948,815.80. Recurring operating cost of KES 16,260,000 is an unreconciled annual source estimate. Available evidence does not support an annual profit forecast.',
'The proposed monthly communications allowance is KES 85,000 until replaced by an approved campaign budget. Marketing effectiveness should be measured using qualified enquiries, applications, offers, registrations and cost per registered learner.':'ICMHS has an active marketing team. It will lead enquiries, outreach, open days, application conversion and course-level funnel reporting. This plan adds no invented marketing budget; incremental campaigns should follow the approved annual budget.',
'The planning case estimates full-programme tuition value of KES 0 from the proposed intake. This is calculated from the supplied semester fees and course durations; it is not a Year 1 cash receipt forecast. The cash model must stage collections by semester and exclude grants, short courses, ancillary charges and bad-debt adjustments until confirmed.':'At full planned intake and completion, six programme lines generate KES 33,750,000 tuition over their full duration. This is not Year 1 revenue or launch cash. Forecast collections by term using cohort start dates, payment schedules, arrears, discounts and withdrawals. Other charges in the fee circular remain excluded until mapped by course.',
'The current equipment envelope is KES 15,100,000. Each item requires a technical specification, at least comparable quotations, warranty, installation, calibration, service support, user training, safety controls and an assigned asset owner before purchase.':'Mortuary Science and Optometry workbook estimates are KES 6,534,181.40 and KES 7,614,634.40. Orthopaedic Trauma (KES 3,600,000) and AI/Data Science (KES 3,200,000) are unconfirmed earlier-draft estimates. The KES 20,948,815.80 subtotal is provisional pending itemized quotations, VAT, delivery and installation.',
'The planning case indicates full-programme tuition value of KES 0, recurring annual operating costs of KES 16,260,000, and a comparison surplus of KES -19,750,000 before financing, tax and depreciation. Direct course costs are not included because approved course-level costings have not yet been supplied.':'The six lines produce KES 33,750,000 potential tuition across programme duration. The source plan estimates annual operating cost of KES 16,260,000 but does not reconcile its basis to course delivery. Comparing lifetime tuition with one year of costs would mislead. Finance should complete a term-by-term three-year model before directors assess profit, break-even, payback or debt capacity.',
'These are dummy planning amounts. Replace them with approved quotations, internal cost allocations, taxes, installation, delivery, service contracts and contingency before authorization.':'The capital schedule is a feasibility estimate. Mortuary and Optometry amounts are workbook calculations; Orthopaedic and AI/Data Science amounts remain unconfirmed. Setup and working capital are allowances. Obtain approved quotations and a monthly cash requirement before authorization.',
'The draft capitalization assumes KES 7,500,000 in institutional equity and KES 4,000,000 in proposed borrowing. The resulting planning funding gap is KES 9,600,000 before any omitted costs or financing charges.':'No funding source or financing commitment is confirmed. Finance the provisional KES 26,948,815.80 envelope only after validating quotations, funding capacity, terms, timing and repayment ability.',
'The draft staffing model carries an estimated monthly payroll of KES 405,000 before statutory costs, benefits, part-time teaching, overtime and annual adjustments. Finance should replace this with approved salary bands, contracts, employer contributions and course cost-centre allocations.':'The earlier staffing schedule totals KES 405,000 monthly before statutory costs, benefits and additional teaching. Validate roles, teaching load, employment status and allocation by course before forecasting.',
'The draft monthly consumables allowance is KES 405,000. Actual usage should be tracked by course, practical session, cohort and stock issue. Procurement must maintain approved specifications, reorder levels, batch or serial records where relevant and safe disposal procedures.':'The earlier schedule lists monthly allowances of KES 65,000 Mortuary, KES 90,000 Optometry, KES 110,000 Orthopaedic and KES 140,000 AI/Data Science, totalling KES 405,000. Validate quantities, supplier prices and cohort usage.'}
for p in d.paragraphs:
 if p.text in repl: p.text=repl[p.text]
 if p.text.strip()=='INSTITUTIONAL DECISION BRIEF': p.text=''
 if 'The recommended structure is: Board or governing authority;' in p.text:
  p.text='The department will be led by one Head of Department, supported by one Course Coordinator and the trainers required for approved course delivery. The Head of Department reports to the Principal/Managing Director and is accountable for departmental performance, staffing, budget, quality and compliance. The Course Coordinator manages the timetable, learner progress, assessments, records and day-to-day course delivery. Trainers deliver theory and practical instruction, assess competence and maintain course records. Finance, Admissions and Marketing, Quality Assurance, Facilities, ICT and Clinical/Industry Liaison provide shared institutional support; they do not replace the department’s academic reporting line.'
 if 'The structure should separate approval, delivery, finance control and quality assurance.' in p.text:
  p.text='The Head of Department owns the departmental plan and reports monthly on enrolment, fee collection, staffing, teaching delivery, practical readiness, placements, quality issues and budget variance. The Course Coordinator maintains the underlying course and learner records. Finance validates financial reporting, while Quality Assurance independently monitors academic and regulatory controls.'
 if 'The final course names, awards, entry requirements' in p.text: p.text='Programme names, levels and fees below follow the 2027 ICMHS fees circular. Confirm each regulator approval, award and entry criteria before marketing or admissions.'
 if 'The expansion covers Mortuary Science' in p.text: p.text='The portfolio comprises Mortuary Science Level 5 and Level 6, Orthopaedic Trauma Medicine Level 5 and Level 6, Diploma in Optometry, and Artificial Intelligence and Data Science.'
 if 'The draft case assumes the proposed intake' in p.text: p.text='Tuition values use the 2027 fee circular and planned intakes. Course direct costs, term collection timing, shared overhead, financing and tax remain Finance inputs. Costs labelled unconfirmed must not be approved as quotations.'
 if 'All six proposed programme offerings are planned' in p.text: p.text=p.text.replace('All six proposed programme offerings','All six programme lines')
 if 'six proposed programme offerings' in p.text: p.text=p.text.replace('six proposed programme offerings','six programme lines')
 if 'full-programme tuition value of KES 0' in p.text: p.text=p.text.replace('full-programme tuition value of KES 0','full-course tuition value of KES 33,750,000 across all planned learners')

# Update the source intake and fee table.
for t in d.tables:
 if not t.rows: continue
 hdr=' '.join(c.text.lower() for c in t.rows[0].cells)
 if 'proposed course' in hdr and 'full programme fee' in hdr:
  rows=[['Programme line','Intake','Terms','Fee / term','Full tuition / learner','Cohort tuition'],['Mortuary Science Certificate L5','25','5','KES 28,000','KES 140,000','KES 3,500,000'],['Mortuary Science Diploma L6','25','8','KES 34,000','KES 272,000','KES 6,800,000'],['Orthopaedic Trauma Certificate L5','25','5','KES 30,000','KES 150,000','KES 3,750,000'],['Orthopaedic Trauma Diploma L6','25','8','KES 33,000','KES 264,000','KES 6,600,000'],['Optometry Diploma','25','8','KES 34,000','KES 272,000','KES 6,800,000'],['Artificial Intelligence and Data Science','35','6','KES 30,000','KES 180,000','KES 6,300,000'],['TOTAL','160','','','','KES 33,750,000']]
  for ri,row in enumerate(rows):
   cs=t.rows[ri].cells if ri<len(t.rows) else t.add_row().cells
   for i,x in enumerate(row): cs[i].text=x
  for ri in range(len(t.rows)-1,len(rows)-1,-1): t._tbl.remove(t.rows[ri]._tr)
 if 'fee per semester' in hdr and 'duration' in hdr and 'direct cost per learner' in hdr:
  rows=[['Course','Fee per term','Duration (terms)','Full programme tuition','Direct cost per learner'],['Mortuary Science Certificate (Level 5)','KES 28,000','5','KES 140,000','[Costing required]'],['Mortuary Science Diploma (Level 6)','KES 34,000','8','KES 272,000','[Costing required]'],['Orthopaedic Trauma Medicine Certificate (Level 5)','KES 30,000','5','KES 150,000','[Costing required]'],['Orthopaedic Trauma Medicine Diploma (Level 6)','KES 33,000','8','KES 264,000','[Costing required]'],['Diploma in Optometry','KES 34,000','8','KES 272,000','[Costing required]'],['Artificial Intelligence and Data Science','KES 30,000','6','KES 180,000','[Costing required]']]
  for ri,row in enumerate(rows):
   cs=t.rows[ri].cells if ri<len(t.rows) else t.add_row().cells
   for i,x in enumerate(row): cs[i].text=x
  for ri in range(len(t.rows)-1,len(rows)-1,-1): t._tbl.remove(t.rows[ri]._tr)
 if 'planning intake' in hdr and 'evidence required before approval' in hdr:
  rows=[['Programme line','Planning intake','Evidence required before approval'],['Mortuary Science Level 5','25','Demand and placement validation'],['Mortuary Science Level 6','25','Demand and placement validation'],['Orthopaedic Trauma Medicine Level 5','25','Demand and placement validation'],['Orthopaedic Trauma Medicine Level 6','25','Demand and placement validation'],['Diploma in Optometry','25','Demand and clinical placement validation'],['Artificial Intelligence and Data Science','35','Demand and employer validation']]
  for ri,row in enumerate(rows):
   cs=t.rows[ri].cells if ri<len(t.rows) else t.add_row().cells
   for i,x in enumerate(row): cs[i].text=x
  for ri in range(len(t.rows)-1,len(rows)-1,-1): t._tbl.remove(t.rows[ri]._tr)
 if 'role' in hdr and 'headcount' in hdr and any('head of department' in c.text.lower() for row in t.rows for c in row.cells):
  staff=[['Position','Headcount','Planning cost','Accountability / qualification'],['Head of Department','1','KES 80,000/month (source estimate)','Department leadership; relevant postgraduate qualification and verified experience [confirm]'],['Course Coordinator','1','KES 60,000/month (source estimate)','Timetable, records, learner progress and assessments; relevant professional qualification and teaching experience [confirm]'],['Trainers','As required by approved courses','[Costing required]','Qualified subject trainers and practical supervisors; ratios, credentials and workloads to be confirmed'],['Total identified monthly salary estimate','2 named roles only','KES 140,000 plus trainer costs','Excludes statutory costs, benefits, part-time load and shared support']]
  for ri,row in enumerate(staff):
   cs=t.rows[ri].cells if ri<len(t.rows) else t.add_row().cells
   for i,x in enumerate(row): cs[i].text=x
  for ri in range(len(t.rows)-1,len(staff)-1,-1): t._tbl.remove(t.rows[ri]._tr)

# Institutional typography and page geometry for an expanded readable plan.
for s in d.sections:
 s.page_width=Inches(8.27); s.page_height=Inches(11.69); s.top_margin=Inches(.72); s.bottom_margin=Inches(.65); s.left_margin=Inches(.8); s.right_margin=Inches(.72)
for name in ['Normal']:
 st=d.styles[name]; st.font.name='Times New Roman'; st.font.size=Pt(12); st.font.color.rgb=RGBColor(31,47,61); st.paragraph_format.line_spacing=1.5; st.paragraph_format.space_after=Pt(7)
 st._element.get_or_add_rPr().rFonts.set(qn('w:ascii'),'Aptos'); st._element.get_or_add_rPr().rFonts.set(qn('w:hAnsi'),'Aptos')
for name,size in [('Title',24),('Heading 1',17),('Heading 2',13),('Heading 3',11)]:
 st=d.styles[name]; st.font.name='Aptos Display'; st.font.size=Pt(size); st.font.bold=True; st.font.color.rgb=RGBColor.from_string('153B5B')
for t in d.tables:
 for ri,row in enumerate(t.rows):
  for c in row.cells:
   for p in c.paragraphs:
    p.paragraph_format.line_spacing=1.05; p.paragraph_format.space_after=Pt(2)
    for r in p.runs: r.font.name='Aptos'; r.font.size=Pt(8.5)
   sh=OxmlElement('w:shd'); sh.set(qn('w:fill'),'153B5B' if ri==0 else ('EEF4F8' if ri%2 else 'FFFFFF')); c._tc.get_or_add_tcPr().append(sh)
   if ri==0:
    for p in c.paragraphs:
     for r in p.runs: r.bold=True; r.font.color.rgb=RGBColor(255,255,255)

def heading(x):
 p=d.add_paragraph(); p.paragraph_format.space_before=Pt(12); p.paragraph_format.space_after=Pt(5); r=p.add_run(x); r.bold=True; r.font.size=Pt(14); r.font.color.rgb=RGBColor.from_string('153B5B')
def para(x):
 p=d.add_paragraph(x); p.paragraph_format.line_spacing=1.3; p.paragraph_format.space_after=Pt(6)
def tab(h,rows):
 t=d.add_table(rows=1,cols=len(h))
 for i,x in enumerate(h): t.rows[0].cells[i].text=x
 for row in rows:
  cs=t.add_row().cells
  for i,x in enumerate(row): cs[i].text=str(x)
 for ri,row in enumerate(t.rows):
  for c in row.cells:
   for p in c.paragraphs:
    p.paragraph_format.line_spacing=1.0
    for r in p.runs: r.font.size=Pt(8.5)
   sh=OxmlElement('w:shd'); sh.set(qn('w:fill'),'153B5B' if ri==0 else ('EEF4F8' if ri%2 else 'FFFFFF')); c._tc.get_or_add_tcPr().append(sh)
   if ri==0:
    for p in c.paragraphs:
     for r in p.runs: r.bold=True; r.font.color.rgb=RGBColor(255,255,255)

heading('DIRECTORS’ FINANCIAL REVIEW')
para('The financial schedules distinguish verified fees from estimates. The 2027 fee circular supports the course terms and tuition. Mortuary and Optometry equipment amounts are workbook calculations; Orthopaedic and AI/Data Science amounts remain unconfirmed. Annual operating expenses, setup and working capital require Finance reconciliation.')
tab(['Measure','Amount','Basis / confidence'],[['Full-course tuition value','KES 33,750,000','160 planned learners; tuition × terms'],['Mortuary equipment','KES 6,534,181.40','Workbook calculation including 16% VAT factor'],['Optometry equipment','KES 7,614,634.40','Workbook stated total; quote verification needed'],['Orthopaedic equipment','KES 3,600,000','UNCONFIRMED earlier-draft estimate'],['AI/Data Science equipment','KES 3,200,000','UNCONFIRMED earlier-draft estimate'],['Equipment subtotal','KES 20,948,815.80','Provisional; includes unconfirmed inputs'],['Setup and working capital','KES 6,000,000','KES 1.8m + KES 4.2m planning allowances'],['Initial capital envelope','KES 26,948,815.80','Provisional; reforecast after quotes']])
heading('Portfolio tuition build')
tab(['Programme','Intake','Fee / term','Terms','Tuition / learner','Cohort tuition'],[['Mortuary Science L5','25','28,000','5','140,000','3,500,000'],['Mortuary Science L6','25','34,000','8','272,000','6,800,000'],['Orthopaedic Trauma L5','25','30,000','5','150,000','3,750,000'],['Orthopaedic Trauma L6','25','33,000','8','264,000','6,600,000'],['Optometry Diploma','25','34,000','8','272,000','6,800,000'],['AI and Data Science','35','30,000','6','180,000','6,300,000'],['TOTAL','160','','','','33,750,000']])
para('This is lifetime tuition value for planned cohorts assuming full enrolment, persistence and collection. It is not annual revenue or cash at launch. Term dates, payment cadence, discounts, arrears and withdrawals must drive the three-year forecast. Other charges listed in the fees circular are excluded until mapped by course.')
heading('Operating cost reconciliation')
tab(['Cost category','Monthly','Annualized','Status'],[['Payroll schedule','405,000','4,860,000','Earlier plan estimate; verify scope and statutory costs'],['Consumables/platform schedule','405,000','4,860,000','Earlier allowance; quotes and quantities required'],['Unitemized difference to OPEX','545,000','6,540,000','Arithmetic difference only; not a new estimate'],['Total recurring OPEX','1,355,000','16,260,000','Source plan total; Finance reconciliation required']])
para('The unitemized difference is the supplied annual OPEX less annualized payroll and consumables. Finance should identify utilities, placements, assessment, maintenance, shared services and other included costs before adopting the total.')
heading('Three-year model schedules')
tab(['Schedule','Driver','Control'],[['Tuition receipts','Course × cohort × term × fee','Reconcile learners to registration and cash receipts'],['Direct teaching','Faculty hours and practical sessions by course','Approved workload and cost-centre allocation'],['Consumables and placements','Learners × session use / placement events','Stock issue records and written partner terms'],['Shared costs','Room hours, staff time or headcount allocation','Document driver; prevent double counting'],['Capital and funding','Quoted items, tax, delivery, installation and payment milestones','Track commitment, payment and asset register'],['Working capital','Monthly outflow less scheduled collections','Board minimum cash reserve and escalation rule']])
para('Income statement, cash flow and balance sheet should be linked. Current sources lack cohort start dates, collection timing, confirmed direct costs, opening balances, financing terms, depreciation policy and tax treatment. Those fields must be supplied by Finance before forecasts are treated as approved.')
heading('Revenue sensitivities (not forecasts)')
para('Illustrations below apply simple uptake percentages to full-course tuition value. They hold price constant and exclude timing, cost, discount and collection effects.')
tab(['Uptake','Equivalent learners','Lifetime tuition'],[['50%','80','KES 16,875,000'],['75%','120','KES 25,312,500'],['100%','160','KES 33,750,000']])
heading('Break-even and return measures')
tab(['Metric','Model calculation','Current status'],[['Contribution / learner','Net tuition less attributable direct variable costs','Direct costs not validated by course level'],['Break-even intake','Fixed course costs ÷ contribution / learner','Not calculable from current evidence'],['Operating margin','Operating surplus ÷ recognized annual revenue','Cohort timing not modeled'],['Cash runway','Unrestricted cash ÷ monthly net cash outflow','Opening cash and timing unavailable'],['Capital payback','Cumulative incremental cash flow vs. approved CAPEX','Equipment partly unquoted']])
para('Use the formulae after Finance validates inputs. Do not compare whole-course tuition with one year of operating expenses; that mixes time periods and cannot establish profit.')
heading('Financial approval gates')
tab(['Gate','Evidence','Owner'],[['Before procurement','Itemized specifications, comparable quotes, VAT, delivery and lifecycle cost','Finance and Procurement'],['Before marketing/admissions','Approved award, entry criteria, fee basis, capacity and faculty readiness','Academic and Quality'],['Before intake','Term cash model, minimum viable cohort, placement evidence and reserve','Directors and Finance'],['After first term','Collections, learner persistence, direct cost and forecast variance','Portfolio sponsor'],['Before scale-up','Course contribution, quality results, capacity and capital return case','Board']])
heading('Appendix: source and assumption register')
tab(['Input','Value','Source / status'],[['Fees and terms','2027 course schedule','ICMHS fees PDF'],['Intakes','25 per line; AI/Data Science 35','Earlier Imperial plan'],['Mortuary equipment','KES 6,534,181.40','OPTOMETRY.xlsx; workbook formulas'],['Optometry equipment','KES 7,614,634.40','OPTOMETRY.xlsx stated total'],['Orthopaedic equipment','KES 3,600,000','UNCONFIRMED earlier-draft estimate'],['AI/Data Science equipment','KES 3,200,000','UNCONFIRMED earlier-draft estimate'],['Recurring OPEX','KES 16,260,000/year','Earlier plan estimate; reconcile'],['Setup / working capital','KES 1.8m / KES 4.2m','Planning allowances; validate']])
heading('Appendix: Director dashboard')
tab(['Indicator','Definition','Review'],[['Enquiry conversion','Registered learners ÷ qualified enquiries','Monthly'],['Collection rate','Cash received ÷ tuition due','Monthly'],['Course contribution','Recognized tuition less direct course costs','Each term'],['Budget variance','Actual + commitments less approved budget','Monthly'],['Placement coverage','Confirmed slots ÷ learners needing placement','Before admissions'],['Cash runway','Available cash ÷ monthly net outflow','Monthly']])

d.save(wp)

# Build a consistent PDF from the completed Word paragraphs and tables.
from docx.table import Table as DT
from docx.text.paragraph import Paragraph as DP
from docx.oxml.ns import nsmap
from docx.document import Document as DocType
styles=getSampleStyleSheet(); body=ParagraphStyle('b',parent=styles['BodyText'],fontName='Times-Roman',fontSize=12,leading=18,spaceAfter=8,textColor=colors.HexColor('#172B3A')); h1=ParagraphStyle('h1',parent=body,fontName='Helvetica-Bold',fontSize=16,leading=20,spaceBefore=12,textColor=colors.HexColor('#153B5B')); h2=ParagraphStyle('h2',parent=body,fontName='Helvetica-Bold',fontSize=13,leading=17,spaceBefore=8,textColor=colors.HexColor('#153B5B')); small=ParagraphStyle('s',parent=body,fontSize=9,leading=12,spaceAfter=0)
story=[]
for p in d.paragraphs:
 tx=p.text.strip()
 if tx: story.append(RP(escape(tx),h1 if p.style.name=='Heading 1' else h2 if p.style.name in ('Heading 2','Heading 3') else body))
for t in d.tables:
 data=[[RP(escape(c.text).replace('\n','<br/>'),small) for c in row.cells] for row in t.rows]
 if data:
  tb=RT(data,repeatRows=1,hAlign='CENTER'); tb.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#153B5B')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#CBD7E0')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)])); story.extend([tb,Spacer(1,6)])
def footer(c,doc):
 c.saveState(); c.setFont('Times-Roman',8); c.setFillColor(colors.HexColor('#526575')); c.drawCentredString(A4[0]/2,.38*inch,f'ICMHS BUSINESS PLAN | DIRECTORS’ EDITION | {doc.page}'); c.restoreState()
SimpleDocTemplate(str(pp),pagesize=A4,leftMargin=.76*inch,rightMargin=.72*inch,topMargin=.72*inch,bottomMargin=.62*inch).build(story,onFirstPage=footer,onLaterPages=footer)
print(wp); print(pp)
