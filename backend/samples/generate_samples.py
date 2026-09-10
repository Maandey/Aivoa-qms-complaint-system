import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf_sample(output_path: str):
    doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#0F172A'),
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748B')
    )
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=15,
        textColor=colors.HexColor('#334155')
    )

    story.append(Paragraph("ST. JUDE MEMORIAL HOSPITAL & MEDICAL CENTER", title_style))
    story.append(Paragraph("Department of Pharmacy & Quality Oversight | Clinical Supplies Division", subtitle_style))
    story.append(Paragraph("1200 Healthcare Parkway, Boston, MA 02115 | Email: qa-pharmacy@stjude-health.org", subtitle_style))
    story.append(Spacer(1, 15))

    story.append(Paragraph("<b>FORMAL CUSTOMER DEFECT COMPLAINT NOTIFICATION</b>", ParagraphStyle('H2', parent=styles['Heading2'], fontSize=12, textColor=colors.HexColor('#DC2626'))))
    story.append(Spacer(1, 10))

    data = [
        ["Field", "Details"],
        ["Complaint Source:", "Hospital Clinical Pharmacy Ward"],
        ["Customer Name:", "St. Jude Memorial Hospital"],
        ["Product Name:", "Paracetamol Tablets"],
        ["Product Strength / Grade:", "500 mg"],
        ["Batch / Lot Number:", "B24019"],
        ["Manufacturing Date:", "2024-01-15"],
        ["Expiry Date:", "2026-01-14"],
        ["Quantity Affected:", "120 bottles (100 tablets/bottle)"],
        ["Complaint Nature / Type:", "Physical Defect / Discoloration & Foreign Specks"],
        ["Complaint Date:", "2024-05-10"],
        ["Severity Assessment:", "Major - Critical Quality Attribute Deviation"]
    ]

    t = Table(data, colWidths=[180, 340])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    story.append(Paragraph("<b>DETAILED DESCRIPTION OF COMPLAINT:</b>", styles['Heading3']))
    desc_text = (
        "During routine morning dispensing in the Intensive Care and Inpatient Wards on May 10, 2024, "
        "ward pharmacy nurses observed abnormal brownish discoloration and small black specks embedded on the surface "
        "of Paracetamol 500mg tablets from sealed HDPE bottle batch B24019. Further visual inspection of 5 unopened bottles "
        "from carton #4 confirmed 8 to 12 affected tablets per bottle exhibiting chipping and surface mottling. "
        "Dispensing of batch B24019 has been immediately suspended across all hospital wards. All 120 remaining bottles "
        "have been quarantined. We request immediate root cause investigation and replacement shipment under cold-chain assurance."
    )
    story.append(Paragraph(desc_text, body_style))
    story.append(Spacer(1, 15))

    story.append(Paragraph("<b>Signed:</b> Dr. Eleanor Vance, PharmD - Chief of Clinical Inpatient Pharmacy", body_style))

    doc.build(story)
    print(f"Generated PDF at {output_path}")


def generate_eml_sample(output_path: str):
    eml_content = """From: "Dr. Marcus Thorne, Head of API Sourcing" <m.thorne@novartis-formulations.com>
To: "AIVOA Pharma Quality Customer Complaints" <quality-complaints@aivoa-pharma.com>
Date: Wed, 12 Jun 2024 09:14:22 +0100
Subject: CRITICAL COMPLAINT: Atorvastatin Calcium API Batch ATV-2024-001 OOS Residual Solvents
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

Dear Quality Assurance Team,

This is a formal Customer Complaint regarding raw material Active Pharmaceutical Ingredient (API) supplied to our Dublin Formulation Facility.

Customer Name: Novartis Formulations Dublin Plant
Complaint Source: Customer Quality Control Incoming Laboratory
Product Name: Atorvastatin Calcium API
Product Strength / Grade: 99.8% Purity (USP Grade Trihydrate)
Batch / Lot Number: ATV-2024-001
Manufacturing Date: 2024-02-10
Expiry Date: 2027-02-09
Quantity Affected: 50 kg (in 2 sealed polyethylene-lined fiber drums)
Complaint Date: 2024-06-12
Complaint Type: Chemical / Out of Specification (OOS) - Residual Solvents
Initial Severity: Critical

Detailed Description:
During incoming analytical release testing of Atorvastatin Calcium API Batch ATV-2024-001 by GC Headspace Gas Chromatography, our QC lab identified Methanol residual solvent at 3,850 ppm. According to ICH Q3C (R8) Impurities: Guideline for Residual Solvents and your Certificate of Analysis (COA) specification, the maximum acceptable limit for Methanol (Class 2 solvent) is 3,000 ppm. 

This batch fails release criteria and cannot be charged into the upcoming commercial FDF tablet granulation campaign. Both fiber drums (50 kg total) have been formally quarantined under Defect Notice DN-2024-881. Please issue an immediate containment protocol, initiate an Out-of-Specification (OOS) investigation at your synthesis facility, and advise on return authorization.

Best regards,
Dr. Marcus Thorne
VP of Quality Assurance & API Supply Chain
Novartis Formulations
"""
    with open(output_path, "w") as f:
        f.write(eml_content)
    print(f"Generated EML at {output_path}")


def generate_txt_sample(output_path: str):
    txt_content = """PHARMACEUTICAL CUSTOMER COMPLAINT INTAKE MEMO

Complaint Source: Retail Pharmacy Chain Logistics
Customer Name: Apollo Pharmacy Central Distribution Center
Complaint Date: 2024-07-04
Product Name: Amoxicillin Oral Suspension
Product Strength/Grade: 250 mg / 5 mL (100 mL bottle)
Batch/Lot Number: AMX-8921
Manufacturing Date: 2024-03-01
Expiry Date: 2025-08-31
Quantity Affected: 500 packs
Complaint Type: Physical Defect / Inadequate Re-suspendability & Severe Caking
Initial Severity: Major
Priority: High

Detailed Complaint Description:
Multiple retail pharmacists across 18 store branches reported that bottles of Amoxicillin 250mg/5mL powder for oral suspension (Batch AMX-8921) have formed rock-hard solid cakes at the bottom of the amber glass bottles. When pharmacists followed label reconstitution directions (adding 68 mL of purified water and shaking vigorously for 2 minutes), the caked powder failed to redisperse, leaving large gritty agglomerates and incomplete suspension. 

This creates a serious risk of dose heterogeneity and sub-potent antibiotic dosing for pediatric patients. Distribution of all 500 packs from this lot has been immediately frozen in the central warehouse. We require QA retain sample analysis and prompt corrective action.
"""
    with open(output_path, "w") as f:
        f.write(txt_content)
    print(f"Generated TXT at {output_path}")


if __name__ == "__main__":
    out_dir = os.path.dirname(os.path.abspath(__file__))
    generate_pdf_sample(os.path.join(out_dir, "sample_complaint_paracetamol.pdf"))
    generate_eml_sample(os.path.join(out_dir, "sample_complaint_atorvastatin.eml"))
    generate_txt_sample(os.path.join(out_dir, "sample_complaint_amoxicillin.txt"))

