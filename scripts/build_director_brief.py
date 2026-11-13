from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph as RP, Spacer, Table as RT, TableStyle, PageBreak, KeepTogether
from xml.sax.saxutils import escape

ROOT=Path('artifacts'); ROOT.mkdir(exist_ok=True)
DOCX=ROOT/'ICMHS_directors_expansion_investment_brief.docx'
PDF=ROOT/'ICMHS_directors_expansion_investment_brief.pdf'
NAVY='153B5B'; BLUE='1673A5'; GOLD='D5A52F'; PALE='EAF2F7'; INK='172B3A'; MUTED='526575'; WHITE='FFFFFF'; LINE='CBD7E0'; AMBER='FFF2D2'; GREEN='E5F3ED'

programs=[
 ('Mortuary Science Certificate','Level 5',5,28000,25,'140,000','3,500,000'),
 ('Mortuary Science Diploma','Level 6',8,34000,25,'272,000','6,800,000'),
 ('Orthopaedic Trauma Medicine Certificate','Level 5',5,30000,25,'150,000','3,750,000'),
 ('Orthopaedic Trauma Medicine Diploma','Level 6',8,33000,25,'264,000','6,600,000'),
 ('Optometry Diploma','Diploma',8,34000,25,'272,000','6,800,000'),
 ('Artificial Intelligence and Data Science','Course level to confirm',6,30000,35,'180,000','6,300,000'),
]

def shade(cell,fill):
    pr=cell._tc.get_or_add_tcPr(); sh=OxmlElement('w:shd'); sh.set(qn('w:fill'),fill); pr.append(sh)
def borders(table):
    pr=table._tbl.tblPr; bs=OxmlElement('w:tblBorders')
    for edge in ('top','left','bottom','right','insideH','insideV'):
        e=OxmlElement('w:'+edge); e.set(qn('w:val'),'single'); e.set(qn('w:sz'),'5'); e.set(qn('w:color'),LINE); bs.append(e)
    pr.append(bs)
def run(p,text,size=10,bold=False,color=INK,font='Aptos'):
    r=p.add_run(text); r.bold=bold; r.font.name=font; r.font.size=Pt(size); r.font.color.rgb=RGBColor.from_string(color)
    r._element.get_or_add_rPr().rFonts.set(qn('w:ascii'),font); r._element.get_or_add_rPr().rFonts.set(qn('w:hAnsi'),font); return r
def cell(cell,text,bold=False,fill=None,color=INK,size=9):
    cell.text=''; p=cell.paragraphs[0]; p.paragraph_format.space_after=Pt(0); p.paragraph_format.line_spacing=1.0
    run(p,str(text),size,bold,color)
    cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
    if fill: shade(cell,fill)
def table(doc,headers,rows,widths=None,highlight_last=False):
    t=doc.add_table(rows=1,cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=False; borders(t)
    for i,x in enumerate(headers): cell(t.rows[0].cells[i],x,True,NAVY,WHITE,8.5)
    for ri,row in enumerate(rows):
        cs=t.add_row().cells
        for i,x in enumerate(row):
            fill=(GREEN if highlight_last and ri==len(rows)-1 else (PALE if ri%2==1 else WHITE))
            cell(cs[i],x,bold=(highlight_last and ri==len(rows)-1),fill=fill,size=8.5)
    if widths:
        for row in t.rows:
            for i,w in enumerate(widths): row.cells[i].width=Inches(w)
    doc.add_paragraph().paragraph_format.space_after=Pt(2)
    return t
def para(doc,text,size=10,color=INK,bold_prefix=None):
    p=doc.add_paragraph(); p.paragraph_format.space_after=Pt(5); p.paragraph_format.line_spacing=1.12
    if bold_prefix and text.startswith(bold_prefix): run(p,bold_prefix,size,True,color); run(p,text[len(bold_prefix):],size,False,color)
    else: run(p,text,size,False,color)
    return p
def title(doc,text,level=1):
    p=doc.add_paragraph(); p.paragraph_format.space_before=Pt(10 if level==1 else 6); p.paragraph_format.space_after=Pt(5)
    run(p,text,15 if level==1 else 11,True,NAVY); return p
def bullets(doc,items):
    for item in items:
        p=doc.add_paragraph(); p.paragraph_format.left_indent=Inches(.18); p.paragraph_format.first_line_indent=Inches(-.14); p.paragraph_format.space_after=Pt(3); p.paragraph_format.line_spacing=1.08
        run(p,'•  ',10,True,BLUE); run(p,item,9.5)

d=Document(); sec=d.sections[0]; sec.page_width=Inches(8.27); sec.page_height=Inches(11.69)
sec.top_margin=Inches(.58); sec.bottom_margin=Inches(.58); sec.left_margin=Inches(.68); sec.right_margin=Inches(.68)
normal=d.styles['Normal']; normal.font.name='Aptos'; normal.font.size=Pt(10); normal._element.rPr.rFonts.set(qn('w:ascii'),'Aptos'); normal._element.rPr.rFonts.set(qn('w:hAnsi'),'Aptos')
head=sec.header.paragraphs[0]; head.alignment=WD_ALIGN_PARAGRAPH.RIGHT; run(head,'ICMHS  /  DIRECTORS’ INVESTMENT BRIEF',8,True,MUTED)
foot=sec.footer.paragraphs[0]; foot.alignment=WD_ALIGN_PARAGRAPH.CENTER; run(foot,'CONFIDENTIAL • PLANNING BASIS • NOVEMBER 2026',8,False,MUTED)

# Fast decision page
p=d.add_paragraph(); p.paragraph_format.space_before=Pt(12); run(p,'IMPERIAL COLLEGE OF MEDICAL AND HEALTH SCIENCES',11,True,BLUE)
p=d.add_paragraph(); p.paragraph_format.space_after=Pt(2); run(p,'New Programme Portfolio',25,True,NAVY)
p=d.add_paragraph(); p.paragraph_format.space_after=Pt(10); run(p,'Investment and operating decision brief  |  Thika Main Campus  |  November 2026',10,False,MUTED)
table(d,['PORTFOLIO','FULL-COURSE TUITION VALUE','COURSE-EQUIPMENT ESTIMATE'],[['6 programme lines / 160 planned learners','KES 33.75m','KES 20.95m*']], [2.2,2.25,2.25])
title(d,'Decision requested')
para(d,'Approve continued feasibility and procurement validation for the six programme lines. Release capital by stage gate after programme approval, campus capacity, faculty, placement and quotation evidence is complete. The current pack supports a conditional feasibility decision; it does not yet support an unconditional launch or a verified profit forecast.',10)
title(d,'What the current figures say')
table(d,['Measure','Current planning result','Director reading'],[
 ['Planned intake','160 learners','25 per programme line except AI/Data Science at 35'],
 ['Tuition over full course duration','KES 33,750,000','Derived from 2027 term fees × listed terms × planned intake'],
 ['Equipment estimate','KES 20,948,815.80','Includes KES 6.53m Mortuary and KES 7.61m Optometry workbook totals; Orthopaedic and AI amounts unconfirmed'],
 ['Setup and working capital','KES 6,000,000','KES 1.8m setup + KES 4.2m buffer; planning allowances requiring Finance approval'],
 ['Provisional initial funding envelope','KES 26,948,815.80','Not a committed budget; equipment contains unconfirmed estimates'],
], [1.7,1.8,3.2])
para(d,'*Provisional subtotal. Orthopaedic Trauma Medicine (KES 3.60m) and AI/Data Science (KES 3.20m) were carried over from the earlier draft and require supplier quotations and approval.',8.5,MUTED)
title(d,'Management position')
bullets(d,['Protect the existing marketing team’s role: it owns recruitment execution, enquiry tracking and conversion reporting. The plan sets no new marketing campaign or invented budget.','Use the six programme lines as separate investment cases; shared facilities do not remove course-specific staffing, equipment and placement costs.','Approve no public launch until award titles, regulator pathway, entry requirements and practical capacity are verified.'])

d.add_page_break(); title(d,'Portfolio economics')
para(d,'The 2027 institutional fee schedule supplies course duration and tuition per term. Full-course tuition values below are calculated, not quoted totals; they exclude separately listed charges, discounts, arrears, refunds and withdrawals.')
rows=[]
for n,lev,terms,fee,intake,full,total in programs:
    rows.append([n,lev,str(terms),f'KES {fee:,}',str(intake),f'KES {full}',f'KES {total}'])
rows.append(['TOTAL / PORTFOLIO','', '', '', '160','', 'KES 33,750,000'])
table(d,['Programme','Level','Terms','Fee / term','Intake','Fee / learner','Tuition value'],rows,[1.75,.85,.45,.8,.5,.9,1.05],True)
title(d,'Other charges and collection timing')
para(d,'The 2027 fee circular lists registration, admission, examinations, computer/internet, activity, insurance, stationery, transport, student welfare, ID, medical, library, attachment, accommodation and course-specific items. These are not added to the KES 33.75m tuition value because applicability and collection timing must be mapped by programme. Finance should model collections by term against the published payment schedule.')
title(d,'Revenue interpretation')
bullets(d,['KES 33.75m is the total tuition value if all planned learners complete and pay every term. It is earned and collected over six to eight terms, not received at launch.','It is not Year 1 revenue, cash at hand, gross profit or net profit. The cohorts’ start dates and semester-by-semester enrolments are not provided.','The AI/Data Science award level is not specified in the fee circular; six terms and KES 30,000 per term are shown as listed, pending confirmation of award title and approval.'])

d.add_page_break(); title(d,'Capital plan and cost confidence')
table(d,['Capital item','Current amount','Confidence / action'],[
 ['Mortuary Science equipment','KES 6,534,181.40','Workbook item schedule, quantity × unit cost × 1.16 VAT; supplier quotes still required'],
 ['Optometry equipment','KES 7,614,634.40','Workbook total; confirm supplier quotations, quantities, VAT and delivery'],
 ['Orthopaedic Trauma equipment','KES 3,600,000','UNCONFIRMED estimate from earlier draft; replace with itemized specification and quotes'],
 ['AI/Data Science equipment','KES 3,200,000','UNCONFIRMED estimate from earlier draft; confirm workstation/server architecture and quotes'],
 ['Equipment subtotal','KES 20,948,815.80','PROVISIONAL: includes the two unconfirmed amounts'],
 ['Pre-operational setup','KES 1,800,000','Planning allowance; obtain itemized budget and approval'],
 ['Working capital','KES 4,200,000','Planning allowance; replace with monthly cash requirement'],
 ['Indicative capital envelope','KES 26,948,815.80','PROVISIONAL; reforecast after quotations and cash plan'],
],[1.75,1.45,3.6],True)
title(d,'Mortuary and Optometry source schedules')
para(d,'The Mortuary workbook lists 44 equipment and supply lines and calculates costs using a 16% VAT factor. Its computed total is KES 6,534,181.40. The Optometry sheet lists 21 instruments and gives a total of KES 7,614,634.40. These are workbook estimates, not supplier quotations. Several Mortuary lines have zero unit cost or zero quantity; confirm whether they are intentionally nil, supplied elsewhere, or omitted before procurement.')
title(d,'Funding structure')
para(d,'Funding sources are not confirmed. The earlier draft’s proposed equity and borrowing split is not carried forward as committed financing. Finance should present institutional contribution, borrowing or asset finance only after approval of funding capacity, terms, repayment timing and security. The amount to raise remains the provisional capital envelope above.')

d.add_page_break(); title(d,'Operating economics and financial model')
title(d,'Known cost inputs',2)
table(d,['Input','Annual / monthly basis','Status'],[
 ['Recurring operating costs','KES 16,260,000 / year','Earlier source plan estimate; needs reconciliation to budget and scope'],
 ['Payroll schedule','KES 405,000 / month (KES 4,860,000 annualized)','Earlier source plan role estimates; validate headcount, teaching loads and statutory costs'],
 ['Programme consumables / platforms','KES 405,000 / month (KES 4,860,000 annualized)','Earlier source plan allowances; quotes and quantities required'],
 ['Other operating cost implied','KES 6,540,000 / year','Arithmetic difference only; source plan does not itemize it'],
 ['Course direct costs per learner','Not confirmed by programme level','Prior draft contains figures but not enough evidence to map them safely'],
],[1.8,2.0,3.0])
title(d,'What can be concluded now',2)
para(d,'At the planned intake, the portfolio has KES 33.75m in potential tuition across the full duration of six cohorts. Comparing that lifetime tuition value directly with one year of KES 16.26m operating cost would mix different periods and create a misleading profit result. A reliable operating margin, break-even intake, cash runway and payback period require cohort start dates, annual term collections, course-level direct costs, shared-cost allocation and confirmed capital timing.')
title(d,'Finance model to approve',2)
table(d,['Model schedule','Required calculation','Decision use'],[
 ['Cohort revenue','Learners by course and term × fee; collection timing, arrears, discounts, withdrawals','Cash receipts and earned revenue by year'],
 ['Direct delivery costs','Faculty hours, practical consumables, placements, assessment, software/cloud per course','Contribution per learner and course'],
 ['Shared operating costs','Payroll, utilities, administration, marketing-team allocation and campus overhead','Portfolio margin without double counting'],
 ['Capital and funding','Quoted equipment, installation, VAT, setup, deposits and debt/equity timing','Funding ask and cash runway'],
 ['Scenarios','Lower/base/upside intake, launch delay, fee collection and equipment variance','Downside resilience and launch thresholds'],
],[1.45,3.3,2.05])
title(d,'Provisional decision thresholds',2)
bullets(d,['Each course must show positive contribution at an approved minimum viable intake after direct teaching, practical, placement and assessment costs.','Portfolio cash must stay above a Board-approved minimum reserve through the full first cohort cycle.','Procurement approval requires itemized specification, comparable quotations, VAT and delivery terms, warranty, installation and lifecycle support.'])

d.add_page_break(); title(d,'Commercial execution')
title(d,'Marketing and admissions',2)
para(d,'ICMHS already has an active marketing team. The expansion should use that capability rather than create a parallel marketing function. The team should own enquiry qualification, open-day leads, employer outreach, application conversion and course-level funnel reporting. Communications should use approved programme titles, fees, duration, entry requirements and approval status.')
table(d,['Monthly funnel measure','Report by programme'],[['Qualified enquiries','Source, campaign/channel and applicant profile'],['Applications and offers','Eligibility, offer date and response'],['Deposits and registrations','Conversion rate and collection status'],['Deferrals and withdrawals','Reason and recoverable revenue impact'],['Cost per registered learner','Actual marketing spend allocated by course']], [2.1,4.7])
title(d,'Operating and launch sequence',2)
table(d,['Stage','Timing','Release condition'],[
 ['Feasibility and demand evidence','Months 1–2','Management accepts course-level demand and competitor file'],
 ['Approval and curriculum','Months 2–5','Written approval path, award, entry criteria and faculty profile confirmed'],
 ['Facilities and procurement','Months 4–8','Campus audit, quotes, specifications and capital approval'],
 ['Staff and placements','Months 6–10','Qualified faculty secured; placement capacity documented'],
 ['Admissions and pilot','Months 9–12','Only approved courses marketed; intake fits safe capacity'],
 ['Review and scale','Months 13–18','Actual conversion, costs, quality and cash reviewed by directors'],
],[1.7,1.0,4.1])
title(d,'Director dashboard')
bullets(d,['Approval status and days to next gate, by programme.','Marketing funnel: enquiries → applications → offers → deposits → registered learners.','Budget: approved, committed, paid, forecast-at-completion and variance.','Academic readiness: faculty coverage, lab readiness, placements and safety actions.','Finance: fee collection, direct cost per learner, contribution, cash runway and overdue actions.'])

d.add_page_break(); title(d,'Key risks and open decisions')
table(d,['Risk / decision','Current position','Owner action'],[
 ['Award and regulator approval','All six lines require course-level confirmation; AI award level unclear','Academic / Quality: confirm title, regulator, entry and scope'],
 ['Orthopaedic and AI equipment budget','KES 3.60m and KES 3.20m are unconfirmed estimates','Procurement: create itemized bills and obtain comparable quotes'],
 ['Mortuary source schedule','44 lines; some nil-cost/nil-quantity entries','Procurement / Academic: confirm completeness and required quantities'],
 ['Optometry equipment','21 instrument lines and workbook total available','Procurement: verify specifications, VAT, delivery and service'],
 ['Demand and cohort size','Planning intakes total 160; no underlying survey/enquiry evidence in sources reviewed','Marketing: provide actual funnel and course demand evidence'],
 ['Annual financial forecast','KES 16.26m recurring cost estimate not reconciled; term cash timing missing','Finance: provide monthly 3-year course-level model'],
 ['Placement capacity','No executed placement agreements supplied','Industry Liaison: secure documented capacity before admissions'],
 ['Campus readiness','Thika Main Campus identified; exact capacity audit outstanding','Facilities: certify rooms, safety, accessibility and equipment fit'],
],[1.65,2.55,2.6])
title(d,'Approval requested')
para(d,'Approve the next feasibility stage and request a director review pack from Academic/Quality, Finance, Procurement, Facilities and Marketing against the actions above. Do not authorize the full capital envelope until the provisional equipment amounts, setup budget, working capital and course-level operating model are reconciled.')
title(d,'Source basis')
bullets(d,['ICMHS Updated Fees Structure for Year 2027, Thika Campus: term fees and lengths.','OPTOMETRY.xlsx: Mortuary Science and Optometry equipment schedules.','Earlier Imperial expansion feasibility plan: planned intakes, staffing and consumables allowances, operating-cost estimate, stage gates and unconfirmed Orthopaedic/AI equipment estimates.'])

d.save(DOCX)

# PDF built from the same concise content through DOCX block traversal.
from docx.table import Table as DT
from docx.text.paragraph import Paragraph as DP
styles=getSampleStyleSheet()
body=ParagraphStyle('ICMHSBody',parent=styles['BodyText'],fontName='Helvetica',fontSize=8.8,leading=11.2,textColor=colors.HexColor('#172B3A'),spaceAfter=4)
big=ParagraphStyle('ICMHSBig',parent=body,fontName='Helvetica-Bold',fontSize=24,leading=27,textColor=colors.HexColor('#153B5B'),spaceAfter=4)
hh=ParagraphStyle('ICMHSHead',parent=body,fontName='Helvetica-Bold',fontSize=14,leading=17,textColor=colors.HexColor('#153B5B'),spaceBefore=8,spaceAfter=5)
hh2=ParagraphStyle('ICMHSHead2',parent=body,fontName='Helvetica-Bold',fontSize=10.5,leading=13,textColor=colors.HexColor('#153B5B'),spaceBefore=5,spaceAfter=3)
tiny=ParagraphStyle('ICMHSTiny',parent=body,fontSize=7.3,leading=8.5,spaceAfter=0)
def walk(parent):
    for el in parent.element.body.iterchildren():
        if el.tag.endswith('}p'): yield DP(el,parent)
        elif el.tag.endswith('}tbl'): yield DT(el,parent)
story=[]
for b in walk(d):
    if isinstance(b,DP):
        tx=b.text.strip()
        if not tx: continue
        sn=b.style.name if b.style else ''
        sty=big if tx=='New Programme Portfolio' else hh if sn=='Heading 1' else hh2 if sn=='Heading 2' else body
        if tx.startswith('•  '): tx='•  '+escape(tx[3:])
        else: tx=escape(tx)
        story.append(RP(tx,sty))
    else:
        data=[]
        for row in b.rows:
            data.append([RP(escape(c.text).replace('\n','<br/>'),tiny) for c in row.cells])
        widths=[(A4[0]-1.36*inch)/len(data[0])]*len(data[0])
        t=RT(data,colWidths=widths,repeatRows=1,hAlign='CENTER')
        t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#153B5B')),('TEXTCOLOR',(0,0),(-1,0),colors.white),('GRID',(0,0),(-1,-1),.4,colors.HexColor('#CBD7E0')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),4),('RIGHTPADDING',(0,0),(-1,-1),4),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4)]))
        story.extend([t,Spacer(1,5)])
def footer(canvas,doc):
    canvas.saveState(); canvas.setFont('Helvetica',7); canvas.setFillColor(colors.HexColor('#526575'))
    canvas.drawCentredString(A4[0]/2,.34*inch,f'ICMHS  |  DIRECTORS’ INVESTMENT BRIEF  |  {doc.page}')
    canvas.restoreState()
SimpleDocTemplate(str(PDF),pagesize=A4,leftMargin=.68*inch,rightMargin=.68*inch,topMargin=.55*inch,bottomMargin=.55*inch).build(story,onFirstPage=footer,onLaterPages=footer)
print(DOCX); print(PDF)
