from pathlib import Path
from xml.sax.saxutils import escape

from docx import Document
from docx.document import Document as DocType
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from docx.table import Table as DocxTable
from docx.text.paragraph import Paragraph as DocxParagraph
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph as RP, SimpleDocTemplate, Spacer, Table as RT, TableStyle

SRC = Path("artifacts/New courses_business Plan_ICMHS.docx")
OUT = Path("artifacts")
OUT.mkdir(exist_ok=True)
DOCX_OUT = OUT / "ICMHS_Nakuru_business_plan_directors_edition.docx"
PDF_OUT = OUT / "ICMHS_Nakuru_business_plan_directors_edition.pdf"

doc = Document(SRC)

PARA_REPLACEMENTS = {
    "BUSINESS PLAN FOR IMPERIAL COLLEGE OF MEDICAL AND HEALTH SCIENCES — NEW COURSE EXPANSION FEASIBILITY PLAN IN THIKA TOWN, KIAMBU COUNTY": (
        "BUSINESS PLAN FOR IMPERIAL COLLEGE OF MEDICAL AND HEALTH SCIENCES — "
        "NAKURU CAMPUS NEW COURSE EXPANSION FEASIBILITY PLAN"
    ),
    "THIKA MAIN CAMPUS | NOVEMBER 2026": (
        "DIRECTORS’ BUSINESS PLAN | NAKURU CAMPUS (RONALD NGARA STREET) | NOVEMBER 2026"
    ),
}

for p in doc.paragraphs:
    txt = p.text.strip()
    if txt in PARA_REPLACEMENTS:
        p.text = PARA_REPLACEMENTS[txt]
    elif "assigned to the Thika Main Campus" in txt:
        p.text = (
            "ICMHS is an existing private medical and health-sciences training institution with an established "
            "institutional identity and practical-training orientation. All six programme lines in this plan are "
            "assigned to the ICMHS Nakuru Campus along Ronald Ngara Street (opposite Christ the King Catholic Church), "
            "Nakuru City, Nakuru County, approximately 3 to 4 kilometres from Nakuru Teaching and Referral Hospital "
            "(Nakuru Level 5), subject to final capacity and approval checks. The expansion should be treated as a "
            "staged portfolio decision rather than an automatic launch. Each offering requires a separate approval gate "
            "covering curriculum, entry requirements, staffing, facilities, equipment, placement capacity, learner demand, "
            "pricing and contribution to institutional sustainability."
        )
    elif "All six programme lines are planned for the ICMHS Thika Main Campus" in txt:
        p.text = (
            "All six programme lines are planned for the ICMHS Nakuru Campus along Ronald Ngara Street "
            "(approximately 150 metres from Christ the King Catholic Church) in Nakuru City CBD, Nakuru County, "
            "within a 10 to 15 minute drive (3 to 4 kilometres) of Nakuru Teaching and Referral Hospital (Nakuru Level 5). "
            "As an active TVETA-regulated campus, Nakuru provides an established urban catchment across Nakuru County and "
            "the wider Rift Valley region, with access to lecture rooms, science and skills laboratories, ICT facilities, "
            "and regional clinical attachment partners."
        )
    elif "exact plot/street address and postal address are not published" in txt:
        p.text = (
            "The campus operates on Ronald Ngara Street in Nakuru City CBD (contact: 0713 050 000 / 0719 223 223; "
            "admissions@icmhs.co.ke). Exact floor-area allocation, lease/title terms, Nakuru County fire/public-health "
            "clearances, and course-specific practical room readiness must be documented in the pre-launch campus audit "
            "covering occupancy, skills-lab fit-out, ICT connectivity, power resilience, sanitation, accessibility, "
            "storage, security and emergency response."
        )
    elif "potential full-course tuition is KES 33,750,000" in txt:
        p.text = (
            "The 2027 fee schedule provides terms and tuition for six programme lines. At a reduced planning intake "
            "averaging 20 learners per course (120 learners total), potential full-course tuition is KES 25,560,000, "
            "collected over five to eight terms. Equipment estimates total KES 20,948,815.80 provisionally; Orthopaedic "
            "and AI/Data Science costs remain unconfirmed. Adding KES 1,800,000 setup and KES 4,200,000 working-capital "
            "allowances gives a provisional capital envelope of KES 26,948,815.80. Recurring operating cost of "
            "KES 16,260,000 is an unreconciled annual source estimate. Available evidence does not support an annual "
            "profit forecast."
        )
    elif "six programme lines generate KES 33,750,000 tuition" in txt:
        p.text = (
            "At full planned intake of 20 learners per course (120 learners) and completion, six programme lines "
            "generate KES 25,560,000 tuition over their full duration. This is not Year 1 revenue or launch cash. "
            "Forecast collections by term using cohort start dates, payment schedules, arrears, discounts and "
            "withdrawals. Other charges in the fee circular remain excluded until mapped by course."
        )
    elif "The six lines produce KES 33,750,000 potential tuition" in txt:
        p.text = (
            "The six lines produce KES 25,560,000 potential tuition across programme duration at 20 learners per course. "
            "The source plan estimates annual operating cost of KES 16,260,000 but does not reconcile its basis to "
            "course delivery. Comparing lifetime tuition with one year of costs would mislead. Finance should complete "
            "a term-by-term three-year model for Nakuru Campus before directors assess profit, break-even, payback "
            "or debt capacity."
        )


def set_table_rows(table, rows):
    for ri, row in enumerate(rows):
        cells = table.rows[ri].cells if ri < len(table.rows) else table.add_row().cells
        for ci, val in enumerate(row):
            cells[ci].text = str(val)
    for ri in range(len(table.rows) - 1, len(rows) - 1, -1):
        table._tbl.remove(table.rows[ri]._tr)


for t in doc.tables:
    if not t.rows:
        continue
    hdr = " ".join(" ".join(c.text.split()).lower() for c in t.rows[0].cells)

    if "purpose and rationale" in hdr and "proposed level" in hdr:
        set_table_rows(
            t,
            [
                ["Course", "Purpose and rationale", "Proposed level", "Delivery model", "Regulatory status"],
                [
                    "Mortuary Science",
                    "Assess demand for structured mortuary operations, anatomy, embalming, bereavement support, infection prevention and compliant mortuary practice training.",
                    "Level 5 (Certificate, 5 terms) & Level 6 (Diploma, 8 terms)",
                    "Skills-lab demonstrations plus supervised field/practicum placement",
                    "Approval pathway, curriculum and practice-site requirements [Confirm locally]",
                ],
                [
                    "Optometry",
                    "Assess demand for eye-care support and optometric training linked to community screening, refraction and supervised clinical practice.",
                    "Diploma / Level 6 (8 terms; confirm if Level 5 is offered)",
                    "Optometry skills laboratory plus supervised clinical placement",
                    "Approval pathway, professional-body requirements and clinical-site capacity [Confirm locally]",
                ],
                [
                    "Orthopedic and Trauma Medicine",
                    "Assess demand for practical orthopedic, fracture-care, trauma-response and rehabilitation-support skills across health facilities and emergency-care settings.",
                    "Level 5 (Certificate, 5 terms) & Level 6 (Diploma, 8 terms)",
                    "Simulation-based skills training plus supervised clinical placement",
                    "Approval pathway, scope of practice and clinical placement requirements [Confirm locally]",
                ],
                [
                    "Artificial Intelligence for Health and Medical Applications",
                    "Assess demand for applied AI, health informatics, data literacy and responsible automation skills supporting modern healthcare delivery.",
                    "6 terms (Level 5/6 or modular award to confirm with regulator)",
                    "Computer laboratory, project-based learning and industry-linked delivery",
                    "Curriculum ownership, certification route, data-protection and laboratory requirements [Confirm locally]",
                ],
            ],
        )
    elif "programme line" in hdr and "cohort tuition" in hdr:
        set_table_rows(
            t,
            [
                ["Programme line", "Intake", "Terms", "Fee / term", "Full tuition / learner", "Cohort tuition"],
                ["Mortuary Science Certificate L5", "20", "5", "KES 28,000", "KES 140,000", "KES 2,800,000"],
                ["Mortuary Science Diploma L6", "20", "8", "KES 34,000", "KES 272,000", "KES 5,440,000"],
                ["Orthopaedic Trauma Certificate L5", "20", "5", "KES 30,000", "KES 150,000", "KES 3,000,000"],
                ["Orthopaedic Trauma Diploma L6", "20", "8", "KES 33,000", "KES 264,000", "KES 5,280,000"],
                ["Optometry Diploma", "20", "8", "KES 34,000", "KES 272,000", "KES 5,440,000"],
                ["Artificial Intelligence and Data Science", "20", "6", "KES 30,000", "KES 180,000", "KES 3,600,000"],
                ["TOTAL", "120", "", "", "", "KES 25,560,000"],
            ],
        )
    elif "programme" in hdr and "tuition / learner" in hdr and "cohort tuition" in hdr:
        set_table_rows(
            t,
            [
                ["Programme", "Intake", "Fee / term", "Terms", "Tuition / learner", "Cohort tuition"],
                ["Mortuary Science L5", "20", "28,000", "5", "140,000", "2,800,000"],
                ["Mortuary Science L6", "20", "34,000", "8", "272,000", "5,440,000"],
                ["Orthopaedic Trauma L5", "20", "30,000", "5", "150,000", "3,000,000"],
                ["Orthopaedic Trauma L6", "20", "33,000", "8", "264,000", "5,280,000"],
                ["Optometry Diploma", "20", "34,000", "8", "272,000", "5,440,000"],
                ["AI and Data Science", "20", "30,000", "6", "180,000", "3,600,000"],
                ["TOTAL", "120", "", "", "", "25,560,000"],
            ],
        )
    elif "planning intake" in hdr and "evidence required before approval" in hdr:
        set_table_rows(
            t,
            [
                ["Programme line", "Planning intake", "Evidence required before approval"],
                ["Mortuary Science Level 5", "20", "Nakuru/Rift Valley demand and placement validation"],
                ["Mortuary Science Level 6", "20", "Nakuru/Rift Valley demand and placement validation"],
                ["Orthopaedic Trauma Medicine Level 5", "20", "Nakuru/Rift Valley demand and placement validation"],
                ["Orthopaedic Trauma Medicine Level 6", "20", "Nakuru/Rift Valley demand and placement validation"],
                ["Diploma in Optometry", "20", "Nakuru demand and clinical placement validation"],
                ["Artificial Intelligence and Data Science", "20", "Nakuru demand and employer validation"],
            ],
        )
    elif "equipment / facility requirement" in hdr and "total estimate" in hdr:
        set_table_rows(
            t,
            [
                ["Equipment / facility requirement", "Qty", "Unit estimate", "Total estimate", "Procurement status"],
                [
                    "Mortuary science teaching laboratory: 44 workbook-listed items including biosafety cabinet, centrifuges, autopsy tables, embalming machines, aspirator and PPE (incl. 16% VAT)",
                    "1",
                    "KES 6,534,181.40",
                    "KES 6,534,181.40",
                    "Workbook calculation; vendor quotation required",
                ],
                [
                    "Optometry skills laboratory: 21 workbook-listed instruments including phoropters, retinoscopes, slit lamps, keratometers, tonometers and lensmeters",
                    "1",
                    "KES 7,614,634.40",
                    "KES 7,614,634.40",
                    "Workbook stated total; quote verification required",
                ],
                [
                    "Orthopaedic and trauma skills lab: fracture fixation models, traction and splinting sets, orthopaedic instruments, casting station and simulation manikins",
                    "1",
                    "KES 3,600,000",
                    "KES 3,600,000",
                    "UNCONFIRMED earlier-draft estimate; quote required",
                ],
                [
                    "Artificial intelligence and data-science lab: workstation computers, GPU-capable servers, networking, power backup and secure data environment",
                    "1",
                    "KES 3,200,000",
                    "KES 3,200,000",
                    "UNCONFIRMED earlier-draft estimate; quote required",
                ],
                [
                    "PROVISIONAL EQUIPMENT SUBTOTAL",
                    "",
                    "",
                    "KES 20,948,815.80",
                    "Includes unconfirmed Orthopaedic & AI estimates",
                ],
            ],
        )
    elif "investment component" in hdr and "planning amount" in hdr:
        set_table_rows(
            t,
            [
                ["Investment component", "Planning amount"],
                ["Course-specific equipment (provisional; includes unconfirmed Orthopaedic & AI lines)", "KES 20,948,815.80"],
                ["Pre-operational approvals, curriculum, setup and launch preparation", "KES 1,800,000"],
                ["Working-capital buffer", "KES 4,200,000"],
                ["Provisional initial funding requirement", "KES 26,948,815.80"],
            ],
        )
    elif "measure" in hdr and "basis / confidence" in hdr:
        set_table_rows(
            t,
            [
                ["Measure", "Amount", "Basis / confidence"],
                ["Full-course tuition value", "KES 25,560,000", "120 planned learners (avg. 20/course); tuition × terms"],
                ["Mortuary equipment", "KES 6,534,181.40", "Workbook calculation including 16% VAT factor"],
                ["Optometry equipment", "KES 7,614,634.40", "Workbook stated total; quote verification needed"],
                ["Orthopaedic equipment", "KES 3,600,000", "UNCONFIRMED earlier-draft estimate"],
                ["AI/Data Science equipment", "KES 3,200,000", "UNCONFIRMED earlier-draft estimate"],
                ["Equipment subtotal", "KES 20,948,815.80", "Provisional; includes unconfirmed inputs"],
                ["Setup and working capital", "KES 6,000,000", "KES 1.8m + KES 4.2m planning allowances"],
                ["Initial capital envelope", "KES 26,948,815.80", "Provisional; reforecast after quotes"],
            ],
        )
    elif "uptake" in hdr and "lifetime tuition" in hdr:
        set_table_rows(
            t,
            [
                ["Uptake", "Equivalent learners", "Lifetime tuition"],
                ["50%", "60", "KES 12,780,000"],
                ["75%", "90", "KES 19,170,000"],
                ["100%", "120", "KES 25,560,000"],
            ],
        )
    elif "input" in hdr and "source / status" in hdr:
        set_table_rows(
            t,
            [
                ["Input", "Value", "Source / status"],
                ["Campus location", "Nakuru Campus, Ronald Ngara Street", "Verified ICMHS campus profile"],
                ["Fees and terms", "2027 course schedule", "ICMHS fees PDF (applied to Nakuru)"],
                ["Intakes", "20 learners per course (120 total)", "Nakuru Campus management planning target"],
                ["Mortuary equipment", "KES 6,534,181.40", "OPTOMETRY.xlsx; workbook formulas"],
                ["Optometry equipment", "KES 7,614,634.40", "OPTOMETRY.xlsx stated total"],
                ["Orthopaedic equipment", "KES 3,600,000", "UNCONFIRMED earlier-draft estimate"],
                ["AI/Data Science equipment", "KES 3,200,000", "UNCONFIRMED earlier-draft estimate"],
                ["Recurring OPEX", "KES 16,260,000/year", "Earlier plan estimate; reconcile for Nakuru"],
                ["Setup / working capital", "KES 1.8m / KES 4.2m", "Planning allowances; validate for Nakuru"],
            ],
        )

# Re-apply consistent table styling across all tables (including newly added/updated rows)
for t in doc.tables:
    for ri, row in enumerate(t.rows):
        for c in row.cells:
            for p in c.paragraphs:
                p.paragraph_format.line_spacing = 1.05
                p.paragraph_format.space_after = Pt(2)
                for r in p.runs:
                    r.font.name = "Aptos"
                    r.font.size = Pt(8.5)
                    if ri == 0:
                        r.bold = True
                        r.font.color.rgb = RGBColor(255, 255, 255)
            tcPr = c._tc.get_or_add_tcPr()
            for old_shd in tcPr.findall(qn("w:shd")):
                tcPr.remove(old_shd)
            sh = OxmlElement("w:shd")
            sh.set(qn("w:fill"), "153B5B" if ri == 0 else ("EEF4F8" if ri % 2 else "FFFFFF"))
            tcPr.append(sh)

try:
    doc.save(DOCX_OUT)
except PermissionError:
    DOCX_OUT = OUT / "ICMHS_Nakuru_business_plan_directors_edition_updated.docx"
    PDF_OUT = OUT / "ICMHS_Nakuru_business_plan_directors_edition_updated.pdf"
    doc.save(DOCX_OUT)


def iter_blocks(parent: DocType):
    for child in parent.element.body.iterchildren():
        if child.tag.endswith("}p"):
            yield DocxParagraph(child, parent)
        elif child.tag.endswith("}tbl"):
            yield DocxTable(child, parent)


styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    "NakuruTitle",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=15,
    leading=19,
    spaceBefore=6,
    spaceAfter=8,
    textColor=colors.HexColor("#153B5B"),
)
body_style = ParagraphStyle(
    "NakuruBody",
    parent=styles["BodyText"],
    fontName="Times-Roman",
    fontSize=10.5,
    leading=14.5,
    spaceAfter=6,
    textColor=colors.HexColor("#172B3A"),
)
h1_style = ParagraphStyle(
    "NakuruH1",
    parent=body_style,
    fontName="Helvetica-Bold",
    fontSize=13.5,
    leading=17,
    spaceBefore=12,
    spaceAfter=5,
    textColor=colors.HexColor("#153B5B"),
)
h2_style = ParagraphStyle(
    "NakuruH2",
    parent=body_style,
    fontName="Helvetica-Bold",
    fontSize=11.5,
    leading=15,
    spaceBefore=8,
    spaceAfter=4,
    textColor=colors.HexColor("#153B5B"),
)
small_style = ParagraphStyle(
    "NakuruSmall",
    parent=body_style,
    fontName="Helvetica",
    fontSize=8.2,
    leading=10.5,
    spaceAfter=0,
)
small_hdr_style = ParagraphStyle(
    "NakuruSmallHdr",
    parent=small_style,
    fontName="Helvetica-Bold",
    textColor=colors.white,
)

story = []
usable_width = A4[0] - (0.72 + 0.72) * inch

for block in iter_blocks(doc):
    if isinstance(block, DocxParagraph):
        tx = block.text.strip()
        if not tx:
            continue
        sname = block.style.name if block.style else "Normal"
        if sname == "Title":
            story.append(RP(escape(tx), title_style))
        elif sname == "Heading 1":
            story.append(RP(escape(tx), h1_style))
        elif sname in ("Heading 2", "Heading 3"):
            story.append(RP(escape(tx), h2_style))
        else:
            story.append(RP(escape(tx), body_style))
    else:
        ncols = len(block.rows[0].cells) if block.rows else 0
        if ncols == 0:
            continue
        data = []
        for ri, row in enumerate(block.rows):
            st = small_hdr_style if ri == 0 else small_style
            data.append([RP(escape(c.text.strip()).replace("\n", "<br/>"), st) for c in row.cells])
        col_w = usable_width / ncols
        tb = RT(data, colWidths=[col_w] * ncols, repeatRows=1, hAlign="CENTER")
        ts = [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#153B5B")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD7E0")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]
        for ri in range(1, len(data)):
            if ri % 2 == 1:
                ts.append(("BACKGROUND", (0, ri), (-1, ri), colors.HexColor("#EEF4F8")))
        tb.setStyle(TableStyle(ts))
        story.extend([tb, Spacer(1, 6)])


def footer(canvas, pdf_doc):
    canvas.saveState()
    canvas.setFont("Times-Roman", 8)
    canvas.setFillColor(colors.HexColor("#526575"))
    canvas.drawCentredString(
        A4[0] / 2,
        0.38 * inch,
        f"ICMHS NAKURU CAMPUS BUSINESS PLAN | DIRECTORS’ EDITION | {pdf_doc.page}",
    )
    canvas.restoreState()


SimpleDocTemplate(
    str(PDF_OUT),
    pagesize=A4,
    leftMargin=0.72 * inch,
    rightMargin=0.72 * inch,
    topMargin=0.72 * inch,
    bottomMargin=0.62 * inch,
).build(story, onFirstPage=footer, onLaterPages=footer)

print(f"DOCX: {DOCX_OUT}")
print(f"PDF:  {PDF_OUT}")
