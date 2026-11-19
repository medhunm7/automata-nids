import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

output_dir = '/Users/medhun/.gemini/antigravity/scratch/automata-nids/reports'
os.makedirs(output_dir, exist_ok=True)
diagrams_dir = '/Users/medhun/.gemini/antigravity/scratch/automata-nids/Screenshots/diagrams'
captured_dir = '/Users/medhun/.gemini/antigravity/scratch/automata-nids/Screenshots/captured'

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

# =========================================================================
# 1. BUILD DOCX: REPORT 3 (FULL STACK WEB DEVELOPMENT)
# =========================================================================
def build_fswd_docx():
    doc = docx.Document()

    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        header = section.header
        hp = header.paragraphs[0]
        hp.text = "Velalar College of Engineering and Technology • Department of IT • FSWD Project Report"
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hp.style.font.size = Pt(8.5)
        hp.style.font.color.rgb = RGBColor(100, 116, 139)

        footer = section.footer
        fp = footer.paragraphs[0]
        fp.text = "Automata-Based Network Intrusion Detection System • Subject: Full Stack Web Development"
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        fp.style.font.size = Pt(8.5)
        fp.style.font.color.rgb = RGBColor(100, 116, 139)

    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)

    # Header block
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("FULL STACK WEB DEVELOPMENT\n")
    run.font.size = Pt(13)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 23, 42)

    run = p.add_run("AUTOMATA-BASED NETWORK INTRUSION DETECTION SYSTEM\n")
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = RGBColor(2, 132, 199)

    run = p.add_run("PROJECT-BASED ASSESSMENT REPORT\n\n")
    run.font.size = Pt(10.5)
    run.font.bold = True
    run.font.color.rgb = RGBColor(71, 85, 105)

    # Student Details Table
    doc.add_heading("STUDENT DETAILS", level=2)
    s_table = doc.add_table(rows=8, cols=2)
    s_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    s_data = [
        ("NAME", "MEDHUN M"),
        ("REGISTER NUMBER", "732924ITR072"),
        ("DEPARTMENT", "INFORMATION TECHNOLOGY"),
        ("YEAR / SEMESTER", "THIRD YEAR / SEMESTER V"),
        ("INSTITUTION", "VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY (AUTONOMOUS)"),
        ("LOCATION", "THINDAL, ERODE, TAMIL NADU, INDIA"),
        ("ACADEMIC YEAR", "2026 – 2027"),
        ("ASSIGNED PROJECT NUMBER", "FSWD-CAPSTONE-24")
    ]
    for i, (k, v) in enumerate(s_data):
        row = s_table.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width, c1.width = Inches(2.2), Inches(4.3)
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.font.bold = True
        r0.font.size = Pt(9.5)
        set_cell_background(c0, "F1F5F9")
        set_cell_margins(c0, 60, 60, 100, 100)

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.size = Pt(9.5)
        set_cell_margins(c1, 60, 60, 100, 100)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # Problem Statement & Overview
    doc.add_heading("PROBLEM STATEMENT", level=2)
    doc.add_paragraph(
        "Build a complete Full Stack Web Application that ingests raw network communication logs (CSV, TXT, JSON), "
        "tracks temporal packet event sequences per session, and detects suspicious communication patterns using Finite Automata. "
        "The application must provide JWT authentication, an interactive SOC surveillance dashboard, real-time Recharts telemetry, "
        "security alert management, and automated forensic PDF/CSV export."
    )

    doc.add_heading("PROJECT OVERVIEW", level=2)
    doc.add_paragraph(
        "The Automata-Based Network Intrusion Detection System is an enterprise-grade full-stack web application designed for Security Operations Centers (SOC). "
        "The frontend is built using React 18, Vite, Tailwind CSS, and Recharts, providing a cyber-defense dark-mode user interface. "
        "The backend is powered by Node.js and Express.js, featuring a custom-built Deterministic Finite Automaton (DFA) engine that evaluates "
        "incoming packet streams against four formal intrusion rules (SYN Flood, Brute Force, Port Scan, Connection Oscillation). "
        "Data persistence is managed via MongoDB Atlas, and the application is deployed into production on Vercel (frontend) and Render (backend)."
    )

    # 1. PROJECT STRUCTURE
    h1 = doc.add_heading("1. PROJECT STRUCTURE", level=1)
    doc.add_paragraph(
        "The repository follows a clean, decoupled monorepo architecture divided into client/ and server/ directories:"
    )

    # Architecture Diagram
    arch_img_path = os.path.join(diagrams_dir, 'system_architecture.png')
    if os.path.exists(arch_img_path):
        doc.add_picture(arch_img_path, width=Inches(6.2))
        cp = doc.add_paragraph()
        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cr = cp.add_run("Figure 1: Complete 3-Tier Full Stack System Architecture with Embedded Automata Engine.")
        cr.font.size = Pt(9)
        cr.font.italic = True
        cr.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_heading("1.1 Overall Project Tree", level=2)
    tree_text = (
        "automata-nids/\n"
        "├── client/                         # React 18 + Vite Frontend Application\n"
        "│   ├── src/\n"
        "│   │   ├── api/axios.js            # Axios client with JWT interceptor\n"
        "│   │   ├── components/             # Reusable UI widgets (Navbar, Sidebar, StatCard)\n"
        "│   │   ├── context/                # React Context providers (AuthContext, ThemeContext)\n"
        "│   │   ├── pages/                  # Route views (Dashboard, Alerts, Upload, Analytics)\n"
        "│   │   ├── App.jsx                 # Routing configuration & layout wrapper\n"
        "│   │   └── main.jsx                # React DOM mount point\n"
        "│   ├── index.html                  # HTML entry point\n"
        "│   ├── tailwind.config.js          # Tailwind CSS styling configuration\n"
        "│   ├── vite.config.js              # Vite bundler & reverse-proxy config\n"
        "│   └── vercel.json                 # Vercel SPA routing rewrite rules\n"
        "├── server/                         # Node.js + Express Backend Application\n"
        "│   ├── automata/                   # Deterministic Finite Automaton Core Engine\n"
        "│   │   ├── FSM.js                  # FiniteStateMachine class (Q, Sigma, delta, q0, F)\n"
        "│   │   ├── rules.js                # Rule signatures (SYN Flood, Brute Force, Port Scan)\n"
        "│   │   └── detector.js             # AutomataDetector session orchestrator\n"
        "│   ├── config/db.js                # MongoDB Atlas connection & resilient fallback\n"
        "│   ├── controllers/                # MVC Controller functions\n"
        "│   ├── middleware/                 # JWT Auth, Multer file upload, Error handlers\n"
        "│   ├── models/                     # Mongoose schemas (User, NetworkEvent, Alert)\n"
        "│   ├── routes/                     # REST Express API routes (/auth, /events, /alerts)\n"
        "│   ├── utils/                      # Log parser, seeder, report generator\n"
        "│   ├── server.js                   # Application entry point with Helmet & CORS\n"
        "│   └── package.json                # Backend dependencies (Express, Mongoose, JWT)\n"
        "├── Documentation/                  # System architecture, schemas, and algorithms\n"
        "├── Screenshots/                    # Visual interface captures\n"
        "├── render.yaml                     # Render Infrastructure as Code configuration\n"
        "└── README.md                       # Comprehensive project documentation\n"
    )
    p_tree = doc.add_paragraph()
    r_tree = p_tree.add_run(tree_text)
    r_tree.font.name = 'Courier New'
    r_tree.font.size = Pt(8)

    # 2. IMPORTANT SOURCE CODE
    h1 = doc.add_heading("2. IMPORTANT SOURCE CODE", level=1)
    doc.add_paragraph("Key implementation snippets extracted directly from the verified project files:")

    # 2.1 Backend Server (server/server.js)
    doc.add_heading("2.1 server/server.js – Security Middleware & Health Check", level=2)
    code_srv = (
        "app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));\n"
        "app.use(compression());\n"
        "app.use(cors({ origin: allowedOrigins, credentials: true }));\n"
        "app.use(express.json({ limit: '25mb' }));\n\n"
        "// Production Health Check required by Render & Uptime Monitors\n"
        "app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));\n\n"
        "app.use('/api', authRoutes);\n"
        "app.use('/api', eventRoutes);\n"
        "app.use('/api', alertRoutes);\n"
        "app.use('/api', dashboardRoutes);"
    )
    p_code = doc.add_paragraph()
    r_c = p_code.add_run(code_srv)
    r_c.font.name = 'Courier New'
    r_c.font.size = Pt(8.5)

    # 2.2 Automata Engine (server/automata/FSM.js)
    doc.add_heading("2.2 server/automata/FSM.js – Deterministic State Machine Engine", level=2)
    code_fsm = (
        "class FiniteStateMachine {\n"
        "  processSymbol(symbol, event) {\n"
        "    const normalizedSymbol = (symbol || '').toUpperCase().trim();\n"
        "    const transitionResult = this.rule.evaluate(\n"
        "      this.currentState, normalizedSymbol, this.sequenceStep, event\n"
        "    );\n"
        "    if (transitionResult.matched) {\n"
        "      this.currentState = transitionResult.nextState;\n"
        "      this.sequenceStep = transitionResult.nextStep;\n"
        "      this.matchedEvents.push(event);\n"
        "      if (this.currentState === STATES.ALERT) return true; // Reached accepting state\n"
        "    } else if (transitionResult.reset) {\n"
        "      this.reset();\n"
        "    }\n"
        "    return false;\n"
        "  }\n"
        "}"
    )
    p_code = doc.add_paragraph()
    r_c = p_code.add_run(code_fsm)
    r_c.font.name = 'Courier New'
    r_c.font.size = Pt(8.5)

    # 2.3 Database Model (server/models/Alert.js)
    doc.add_heading("2.3 server/models/Alert.js – Mongoose Incident Schema", level=2)
    code_alert = (
        "const alertSchema = new mongoose.Schema({\n"
        "  alertId: { type: String, required: true, unique: true, index: true },\n"
        "  attackType: { type: String, required: true, index: true },\n"
        "  ruleId: { type: String, required: true },\n"
        "  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },\n"
        "  timestamp: { type: Date, required: true },\n"
        "  sourceIP: { type: String, required: true, index: true },\n"
        "  destinationIP: { type: String, required: true },\n"
        "  protocol: { type: String, required: true },\n"
        "  port: { type: Number, required: true },\n"
        "  action: { type: String, required: true },\n"
        "  stateTrace: [{ type: String }],\n"
        "  matchedEventsCount: { type: Number, default: 0 },\n"
        "  status: { type: String, enum: ['Active', 'Investigating', 'Resolved'], default: 'Active' }\n"
        "}, { timestamps: true });"
    )
    p_code = doc.add_paragraph()
    r_c = p_code.add_run(code_alert)
    r_c.font.name = 'Courier New'
    r_c.font.size = Pt(8.5)

    # 2.4 Frontend API Client (client/src/api/axios.js)
    doc.add_heading("2.4 client/src/api/axios.js – Axios API Client & JWT Interceptor", level=2)
    code_axios = (
        "const instance = axios.create({\n"
        "  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\\/+$/, ''),\n"
        "  timeout: 30000,\n"
        "  headers: { 'Content-Type': 'application/json' }\n"
        "});\n\n"
        "instance.interceptors.request.use((config) => {\n"
        "  const token = localStorage.getItem('nids_token');\n"
        "  if (token) config.headers.Authorization = `Bearer ${token}`;\n"
        "  return config;\n"
        "});"
    )
    p_code = doc.add_paragraph()
    r_c = p_code.add_run(code_axios)
    r_c.font.name = 'Courier New'
    r_c.font.size = Pt(8.5)

    # 3. PROJECT OUTPUT SCREENSHOTS
    h1 = doc.add_heading("3. PROJECT OUTPUT SCREENSHOTS", level=1)
    doc.add_paragraph("Visual evidence captured from the running production application:")

    screens = [
        ("3.1 Application Authentication / Login", "00_login_page.png", "Figure 2: JWT Login Screen with role-based access control."),
        ("3.2 SOC Surveillance Dashboard", "01_dashboard_telemetry.png", "Figure 3: Surveillance Dashboard featuring telemetry stats and Recharts visualization."),
        ("3.3 Security Alerts Console & Triage", "03_alerts_management_console.png", "Figure 4: Alerts Management Console with severity filters, search, and state trace."),
        ("3.4 Multi-Format Network Log Upload", "04_log_file_upload.png", "Figure 5: Log File Upload module supporting CSV, TXT, and JSON formats."),
        ("3.5 Deep-Dive Traffic Analytics", "05_traffic_analytics_recharts.png", "Figure 6: Recharts Traffic Analytics showing protocol breakdown and top targeted ports."),
        ("3.6 Interactive Automata Simulator", "06_automata_interactive_simulator.png", "Figure 7: Interactive FSM Sandbox allowing manual symbol triggering."),
        ("3.7 Network Events Ingestion Grid", "08_network_events_table.png", "Figure 8: Ingested network events table displaying status (SAFE / SUSPICIOUS)."),
        ("3.8 Forensic PDF Report Exporter", "07_pdf_forensic_report.png", "Figure 9: Automated forensic PDF report generation screen.")
    ]

    for title, fname, caption_txt in screens:
        doc.add_heading(title, level=2)
        fpath = os.path.join(captured_dir, fname)
        if os.path.exists(fpath):
            doc.add_picture(fpath, width=Inches(6.0))
            cp = doc.add_paragraph()
            cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
            cr = cp.add_run(caption_txt)
            cr.font.size = Pt(9)
            cr.font.italic = True
            cr.font.color.rgb = RGBColor(71, 85, 105)

    # 4. PROJECT DESCRIPTION, OBJECTIVES AND MODULES
    h1 = doc.add_heading("4. PROJECT DESCRIPTION, OBJECTIVES AND MODULES", level=1)
    doc.add_heading("4.1 Project Description", level=2)
    doc.add_paragraph(
        "The Automata-Based Network Intrusion Detection System operates as a full-stack security platform. "
        "It provides network administrators with real-time visibility into traffic events, automatic pattern correlation, "
        "and incident prioritization based on formal mathematical models."
    )

    doc.add_heading("4.2 System Modules", level=2)
    mod_table = doc.add_table(rows=7, cols=2)
    mod_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    m_data = [
        ("Authentication Module", "Provides secure user registration, bcrypt password hashing, and JWT token authorization."),
        ("Log Ingestion Engine", "Parses multi-format streams (CSV, TXT, JSON) with Multer and normalizes raw records into structured 6-tuples."),
        ("Automata Detection Core", "Maintains session-sharded DFAs and executes O(1) state transitions across four threat signatures."),
        ("SOC Dashboard", "Presents real-time telemetry: Total Events, Safe Events, Suspicious Events, and Detection Accuracy."),
        ("Alerts Console", "Enables threat triage, multi-column search, severity filtering, and forensic detail inspection."),
        ("Reporting Engine", "Exports filtered alert records to CSV and compiles forensic PDF assessment reports.")
    ]
    for i, (m_name, m_desc) in enumerate(m_data):
        row = mod_table.rows[i + 1]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width, c1.width = Inches(2.2), Inches(4.3)
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(m_name)
        r0.font.bold = True
        r0.font.size = Pt(9)
        set_cell_background(c0, "F1F5F9")
        set_cell_margins(c0, 50, 50, 80, 80)

        p1 = c1.paragraphs[0]
        p1.add_run(m_desc).font.size = Pt(9)
        set_cell_margins(c1, 50, 50, 80, 80)

    # Set table header
    c_hdr0 = mod_table.rows[0].cells[0]
    c_hdr1 = mod_table.rows[0].cells[1]
    c_hdr0.width, c_hdr1.width = Inches(2.2), Inches(4.3)
    c_hdr0.paragraphs[0].add_run("Module Name").font.bold = True
    c_hdr1.paragraphs[0].add_run("Functional Description").font.bold = True
    set_cell_background(c_hdr0, "E2E8F0")
    set_cell_background(c_hdr1, "E2E8F0")

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 5. GITHUB & VERSION CONTROL
    h1 = doc.add_heading("5. GITHUB REPOSITORY & VERSION CONTROL", level=1)
    doc.add_paragraph(
        "Source code is maintained and tracked using Git version control and hosted on GitHub:\n"
        "• Repository Link: https://github.com/medhunm7/automata-nids\n"
        "• Production Branch: main\n\n"
        "Git commands utilized during development:\n"
        "git status\n"
        "git add .\n"
        "git commit -m \"feat: production deployment ready with health check & vercel/render configs\"\n"
        "git push origin main"
    )

    # 6. DEPLOYED APPLICATION LINKS
    h1 = doc.add_heading("6. DEPLOYED APPLICATION LINKS", level=1)
    dep_table = doc.add_table(rows=4, cols=2)
    dep_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    d_data = [
        ("Frontend Application (Vercel)", "https://automata-nids.vercel.app"),
        ("Backend REST API (Render)", "https://automata-nids-backend.onrender.com"),
        ("Render Health Check", "https://automata-nids-backend.onrender.com/health"),
        ("System Diagnostics Endpoint", "https://automata-nids-backend.onrender.com/api/health")
    ]
    for i, (k, v) in enumerate(d_data):
        row = dep_table.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width, c1.width = Inches(2.5), Inches(4.0)
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.font.bold = True
        r0.font.size = Pt(9.5)
        set_cell_background(c0, "F1F5F9")
        set_cell_margins(c0, 50, 50, 80, 80)

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(2, 132, 199)
        set_cell_margins(c1, 50, 50, 80, 80)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 7. CONCLUSION
    h1 = doc.add_heading("7. CONCLUSION", level=1)
    doc.add_paragraph(
        "The Automata-Based Network Intrusion Detection System successfully unites modern full-stack web engineering "
        "(React 18, Node.js, Express, MongoDB Atlas) with the mathematical rigor of Deterministic Finite Automata. "
        "By enforcing stateful pattern recognition directly over normalized packet tuples, the application detects volumetric "
        "and multi-stage cyber attacks in O(1) constant time with full forensic explainability. The production deployment "
        "on Vercel and Render demonstrates cloud scalability, automated CI/CD synchronization, and enterprise security readiness."
    )

    docx_path = os.path.join(output_dir, "REPORT_3_FSWD_AUTOMATA_NIDS.docx")
    doc.save(docx_path)
    print(f"Generated {docx_path}")
    return docx_path


# =========================================================================
# 2. BUILD PDF: REPORT 3 (FULL STACK WEB DEVELOPMENT)
# =========================================================================
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        if self._pageNumber > 1:
            self.drawString(54, 750, "Velalar College of Engineering and Technology • Department of IT • FSWD Project Report")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "Automata-Based Network Intrusion Detection System • Full Stack Web Development")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.restoreState()

def build_fswd_pdf():
    pdf_path = os.path.join(output_dir, "REPORT_3_FSWD_AUTOMATA_NIDS.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CoverTitle', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=12, leading=16, alignment=1, textColor=colors.HexColor('#0f172a')
    )
    sub_title = ParagraphStyle(
        'CoverSub', parent=styles['Normal'], fontName='Helvetica', fontSize=9.5, leading=13, alignment=1, textColor=colors.HexColor('#334155')
    )
    h1 = ParagraphStyle(
        'H1', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=11.5, leading=15, spaceBefore=12, spaceAfter=5, textColor=colors.HexColor('#0f172a')
    )
    h2 = ParagraphStyle(
        'H2', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, leading=13, spaceBefore=8, spaceAfter=4, textColor=colors.HexColor('#1e293b')
    )
    body = ParagraphStyle(
        'Body', parent=styles['Normal'], fontName='Helvetica', fontSize=9, leading=13, spaceAfter=5, textColor=colors.HexColor('#1e293b')
    )
    bullet = ParagraphStyle('Bullet', parent=body, leftIndent=15, firstLineIndent=-10, spaceAfter=3.5)
    caption = ParagraphStyle('Caption', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, leading=11, alignment=1, spaceBefore=4, spaceAfter=8, textColor=colors.HexColor('#64748b'))
    code_style = ParagraphStyle('CodeText', parent=styles['Normal'], fontName='Courier', fontSize=7.5, leading=10, textColor=colors.HexColor('#0f172a'))

    story = []

    # Title
    story.append(Paragraph("<b>FULL STACK WEB DEVELOPMENT</b>", title_style))
    story.append(Paragraph("<b>AUTOMATA-BASED NETWORK INTRUSION DETECTION SYSTEM</b>", title_style))
    story.append(Paragraph("<b>PROJECT-BASED ASSESSMENT REPORT</b>", sub_title))
    story.append(Spacer(1, 10))

    # Student Details
    story.append(Paragraph("<b>STUDENT DETAILS</b>", h2))
    s_pdf_data = [
        [Paragraph("<b>NAME</b>", body), Paragraph("MEDHUN M", body)],
        [Paragraph("<b>REGISTER NUMBER</b>", body), Paragraph("732924ITR072", body)],
        [Paragraph("<b>DEPARTMENT</b>", body), Paragraph("INFORMATION TECHNOLOGY", body)],
        [Paragraph("<b>YEAR / SEMESTER</b>", body), Paragraph("THIRD YEAR / SEMESTER V", body)],
        [Paragraph("<b>INSTITUTION</b>", body), Paragraph("VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY", body)],
        [Paragraph("<b>LOCATION</b>", body), Paragraph("THINDAL, ERODE, TAMIL NADU", body)],
        [Paragraph("<b>ACADEMIC YEAR</b>", body), Paragraph("2026 – 2027", body)],
        [Paragraph("<b>ASSIGNED PROJECT NO</b>", body), Paragraph("FSWD-CAPSTONE-24", body)]
    ]
    t_s = Table(s_pdf_data, colWidths=[140, 364])
    t_s.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_s)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>PROBLEM STATEMENT:</b> Build a full-stack web application that validates and classifies network communication events using Finite Automata. Detect multi-stage attacks across sequences of events, provide JWT authentication, SOC dashboard, Recharts analytics, and PDF forensic exports.", body))
    story.append(Paragraph("<b>PROJECT OVERVIEW:</b> Automata-Based NIDS unites React 18, Node.js, Express, and MongoDB Atlas. It features a custom Deterministic Finite Automaton engine that processes network logs and correlates threats in O(1) constant time per packet.", body))

    # 1. STRUCTURE
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>1. PROJECT ARCHITECTURE & STRUCTURE</b>", h1))
    arch_img_path = os.path.join(diagrams_dir, 'system_architecture.png')
    if os.path.exists(arch_img_path):
        story.append(Image(arch_img_path, width=480, height=270))
        story.append(Paragraph("Figure 1: Full-Stack 3-Tier System Architecture with Automata Core.", caption))

    # 2. SOURCE CODE
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>2. IMPORTANT SOURCE CODE</b>", h1))
    story.append(Paragraph("<b>server/server.js – Security Middleware & API Health Check</b>", h2))
    code_snip = (
        "app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));\n"
        "app.use(compression());\n"
        "app.use(cors({ origin: allowedOrigins, credentials: true }));\n"
        "app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));\n"
        "app.use('/api', authRoutes);\n"
        "app.use('/api', eventRoutes);\n"
        "app.use('/api', alertRoutes);\n"
        "app.use('/api', dashboardRoutes);"
    )
    t_code = Table([[Paragraph(code_snip.replace('\n', '<br/>'), code_style)]], colWidths=[504])
    t_code.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 5)
    ]))
    story.append(t_code)

    # 3. SCREENSHOTS
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>3. PROJECT OUTPUT SCREENSHOTS</b>", h1))
    
    dash_img = os.path.join(captured_dir, '01_dashboard_telemetry.png')
    if os.path.exists(dash_img):
        story.append(Image(dash_img, width=480, height=230))
        story.append(Paragraph("Figure 2: SOC Surveillance Dashboard with Real-Time Telemetry and Recharts.", caption))

    alerts_img = os.path.join(captured_dir, '03_alerts_management_console.png')
    if os.path.exists(alerts_img):
        story.append(Image(alerts_img, width=480, height=230))
        story.append(Paragraph("Figure 3: Security Alerts Triage Console with State Trace Metadata.", caption))

    upload_img = os.path.join(captured_dir, '04_log_file_upload.png')
    if os.path.exists(upload_img):
        story.append(Image(upload_img, width=480, height=230))
        story.append(Paragraph("Figure 4: Multi-Format Network Log Upload Interface (CSV, TXT, JSON).", caption))

    sim_img = os.path.join(captured_dir, '06_automata_interactive_simulator.png')
    if os.path.exists(sim_img):
        story.append(Image(sim_img, width=480, height=230))
        story.append(Paragraph("Figure 5: Interactive Automata Simulator with Step-by-Step DFA Visualizer.", caption))

    # 4. MODULES & REPO
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>4. MODULES & GITHUB REPOSITORY</b>", h1))
    story.append(Paragraph("<b>GitHub Repository:</b> https://github.com/medhunm7/automata-nids (main branch)", body))
    story.append(Paragraph("<b>Git Commands Used:</b> git status | git add . | git commit -m '...' | git push origin main", body))

    # 5. DEPLOYED LINKS
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>5. DEPLOYED APPLICATION LINKS</b>", h1))
    dep_pdf_data = [
        [Paragraph("<b>Component</b>", body), Paragraph("<b>Production URL</b>", body)],
        [Paragraph("Frontend Application (Vercel)", body), Paragraph("https://automata-nids.vercel.app", body)],
        [Paragraph("Backend REST API (Render)", body), Paragraph("https://automata-nids-backend.onrender.com", body)],
        [Paragraph("Backend Health Check", body), Paragraph("https://automata-nids-backend.onrender.com/health", body)],
        [Paragraph("System Diagnostics", body), Paragraph("https://automata-nids-backend.onrender.com/api/health", body)]
    ]
    t_dep = Table(dep_pdf_data, colWidths=[180, 324])
    t_dep.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_dep)

    # 6. CONCLUSION
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>6. CONCLUSION</b>", h1))
    story.append(Paragraph(
        "The Automata-Based NIDS represents a complete, robust Full-Stack MERN cybersecurity solution. "
        "By enforcing deterministic automata evaluations on raw socket header tuples, the system achieves constant-time O(1) "
        "threat correlation with 100% forensic explainability, successfully validated across live production deployments on Vercel and Render.", body
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated {pdf_path}")
    return pdf_path

if __name__ == '__main__':
    build_fswd_docx()
    build_fswd_pdf()
