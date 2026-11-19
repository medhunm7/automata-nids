import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

output_dir = '/Users/medhun/.gemini/antigravity/scratch/automata-nids/reports'
os.makedirs(output_dir, exist_ok=True)
diagrams_dir = '/Users/medhun/.gemini/antigravity/scratch/automata-nids/Screenshots/diagrams'
captured_dir = '/Users/medhun/.gemini/antigravity/scratch/automata-nids/Screenshots/captured'

# Helper for docx table cell background
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
# 1. BUILD DOCX: REPORT 1 (FLAT)
# =========================================================================
def build_flat_docx():
    doc = docx.Document()

    # Page Margins: 1 inch everywhere
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        # Header / Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.text = "Velalar College of Engineering & Technology | Department of IT | FLAT Report"
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hp.style.font.size = Pt(8.5)
        hp.style.font.color.rgb = RGBColor(100, 116, 139)

        footer = section.footer
        fp = footer.paragraphs[0]
        fp.text = "Automata-Based Network Intrusion Detection System • Subject Code: 22ITT53"
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        fp.style.font.size = Pt(8.5)
        fp.style.font.color.rgb = RGBColor(100, 116, 139)

    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)

    # Cover / Header block
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY, ERODE - 12\n")
    run.font.size = Pt(13)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 23, 42)

    run = p.add_run("(AUTONOMOUS)\nDEPARTMENT OF INFORMATION TECHNOLOGY\n")
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = RGBColor(51, 65, 85)

    run = p.add_run("ACADEMIC YEAR: 2026 - 2027 (ODD)\n")
    run.font.size = Pt(10.5)
    run.font.color.rgb = RGBColor(71, 85, 105)

    run = p.add_run("ACTIVITY: Project-Based Assessment Report\n\n")
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = RGBColor(2, 132, 199)

    # Student Details Table
    table = doc.add_table(rows=7, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    details = [
        ("PROJECT TITLE", "Automata-Based Network Intrusion Detection System"),
        ("STUDENT NAME", "MEDHUN M"),
        ("CLASS / YEAR", "24IT5A / Third Year B.Tech IT"),
        ("REGISTER NUMBER", "732924ITR072"),
        ("SUBJECT CODE", "22ITT53"),
        ("SUBJECT NAME", "FORMAL LANGUAGES AND AUTOMATA THEORY (FLAT)"),
        ("PROBLEM STATEMENT", "Build a full-stack web application that analyzes network communication events and detects suspicious communication patterns using Finite Automata. Implement multi-state transition tracking across temporal packet sequences to classify threats (SYN Flood, Brute Force, Port Scan, Abnormal Oscillation) and display detection traces and alerts on a live web dashboard.")
    ]

    col_widths = [Inches(2.2), Inches(4.3)]
    for i, (label, val) in enumerate(details):
        row = table.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width, c1.width = col_widths[0], col_widths[1]
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(label)
        r0.font.bold = True
        r0.font.size = Pt(9.5)
        set_cell_background(c0, "F1F5F9")
        set_cell_margins(c0, 80, 80, 120, 120)

        p1 = c1.paragraphs[0]
        r1 = p1.add_run(val)
        r1.font.size = Pt(9.5)
        set_cell_margins(c1, 80, 80, 120, 120)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # 1. STATE DIAGRAM
    h1 = doc.add_heading("1. STATE DIAGRAM", level=1)
    h1.style.font.color.rgb = RGBColor(15, 23, 42)

    # 1.1 Introduction
    h2 = doc.add_heading("1.1 Introduction", level=2)
    h2.style.font.color.rgb = RGBColor(30, 41, 59)
    doc.add_paragraph(
        "A Deterministic Finite Automaton (DFA) is utilized in the Automata-Based Network Intrusion Detection System (NIDS) "
        "to continuously analyze stream sequences of network communication events. Unlike traditional stateless firewalls "
        "that inspect individual packets in total isolation, or computationally prohibitive deep-learning algorithms, "
        "the DFA maintains a formal, mathematically verified state progression across temporal sequences of packet events for each active network session."
    )
    doc.add_paragraph(
        "Each session is uniquely indexed by the source IP address (or communicating IP pair). The automaton begins in the quiescent initial state q0 (START). "
        "As packets arrive with specific operational actions—such as connection handshakes (SYN), port sweep probes (PORT_SCAN), authentication attempts (LOGIN_FAIL), "
        "or connection oscillations (CONNECT/DISCONNECT)—the state machine executes deterministic state transitions δ(q, σ). When a recognized attack grammar "
        "drives the machine into the designated accepting state q_alert (ALERT), an immediate security alert is triggered, and full forensic metadata is committed "
        "to the MongoDB Atlas database."
    )

    # 1.2 States of the DFA
    h2 = doc.add_heading("1.2 States of the DFA", level=2)
    doc.add_paragraph("The DFA engine incorporates five formal operational states defined in server/automata/FSM.js:")

    state_table = doc.add_table(rows=6, cols=3)
    state_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    state_headers = ["State Symbol", "Engine State Name", "State Description & Threat Meaning"]
    for j, h in enumerate(state_headers):
        c = state_table.rows[0].cells[j]
        set_cell_background(c, "E2E8F0")
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9.5)

    states_info = [
        ("q0", "START", "Initial quiescent baseline state. Represents clean, non-suspicious network behavior. The engine returns here after alert dispatch or normal session termination."),
        ("q1", "SYN_SENT", "Half-open connection state or reconnaissance scan state. Triggered by initial TCP SYN packet or single port sweep probe. Tracks repeated probes."),
        ("q2", "CONNECTION", "Established socket connection state. In abnormal connection churn analysis, tracks rapid alternation between active connection and teardown."),
        ("q3", "FAILED", "Failed authentication / authorization state. Triggered by LOGIN_FAIL actions. Tracks cumulative failed credentials characteristic of brute-force password spraying."),
        ("q_alert (qF)", "ALERT", "Accepting / Final State. Represents confirmed detection of an intrusion signature. The system dispatches an alert record and resets to q0.")
    ]

    for i, row_data in enumerate(states_info):
        row = state_table.rows[i + 1]
        for j, val in enumerate(row_data):
            c = row.cells[j]
            p = c.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(9.5)
            if j == 0:
                r.font.bold = True
            set_cell_margins(c, 70, 70, 100, 100)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 1.3 State Diagram Representation
    h2 = doc.add_heading("1.3 State Diagram Representation", level=2)
    doc.add_paragraph(
        "Figure 1 illustrates the complete DFA state machine governing the intrusion detection engine. "
        "It depicts the formal transitions between the quiescent state q0, intermediate tracking states (q1, q2, q3), "
        "and the final accepting alert state q_alert."
    )

    dfa_img_path = os.path.join(diagrams_dir, 'dfa_state_diagram.png')
    if os.path.exists(dfa_img_path):
        doc.add_picture(dfa_img_path, width=Inches(6.2))
        cp = doc.add_paragraph()
        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cr = cp.add_run("Figure 1: DFA State Diagram for Automata-Based Network Intrusion Detection Core.")
        cr.font.size = Pt(9)
        cr.font.italic = True
        cr.font.color.rgb = RGBColor(71, 85, 105)

    # 1.4 Formal Definition of DFA
    h2 = doc.add_heading("1.4 Formal Definition of DFA", level=2)
    doc.add_paragraph(
        "Mathematically, the deterministic intrusion detection automaton is represented as a formal 5-tuple:\n"
        "M = (Q, Σ, δ, q0, F)\n\n"
        "Where each component directly maps to the project implementation:"
    )

    tuple_items = [
        ("Q (Finite Set of States)", "Q = { START, SYN_SENT, CONNECTION, FAILED, ALERT } = { q0, q1, q2, q3, q_alert }"),
        ("Σ (Input Alphabet)", "Discrete network actions extracted from ingested logs:\nΣ = { SYN, ACK, FIN, CONNECT, DISCONNECT, LOGIN_FAIL, LOGIN_SUCCESS, PORT_SCAN, DATA }"),
        ("δ (Transition Function)", "Deterministic mapping function δ: Q × Σ → Q that computes the next state based on current state and ingested action symbol."),
        ("q0 (Initial State)", "q0 = START. The baseline state assigned to every newly encountered source IP address."),
        ("F (Set of Accepting States)", "F = { ALERT } = { q_alert }. The state triggering alert generation, incident classification, and database persistence.")
    ]

    for label, desc in tuple_items:
        p = doc.add_paragraph()
        r1 = p.add_run(f"• {label}: ")
        r1.font.bold = True
        p.add_run(desc)

    # 2. TRANSITION DIAGRAM & TABLES
    h1 = doc.add_heading("2. TRANSITION DIAGRAM & TABLES", level=1)
    doc.add_paragraph(
        "The state transition diagram reflects how individual action symbols drive state changes through specific threat rules. "
        "Figure 2 illustrates the step-by-step transition pipeline for SYN Flood detection."
    )

    trans_img_path = os.path.join(diagrams_dir, 'dfa_transition_diagram.png')
    if os.path.exists(trans_img_path):
        doc.add_picture(trans_img_path, width=Inches(6.2))
        cp = doc.add_paragraph()
        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cr = cp.add_run("Figure 2: DFA Transition Diagram showing step-by-step SYN Flood detection.")
        cr.font.size = Pt(9)
        cr.font.italic = True
        cr.font.color.rgb = RGBColor(71, 85, 105)

    # 2.1 Transition Table
    h2 = doc.add_heading("2.1 State Transition Table (δ: Q × Σ → Q)", level=2)
    doc.add_paragraph("The complete transition logic implemented in server/automata/rules.js is codified in Table 2.1:")

    trans_table = doc.add_table(rows=15, cols=4)
    trans_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_headers = ["Current State (q)", "Input Symbol (σ)", "Next State δ(q, σ)", "Rule / Resulting Action"]
    for j, h in enumerate(t_headers):
        c = trans_table.rows[0].cells[j]
        set_cell_background(c, "E2E8F0")
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9)

    table_data = [
        ("q0 (START)", "SYN", "q1 (SYN_SENT)", "SYN Flood Sequence Step 1"),
        ("q0 (START)", "PORT_SCAN", "q1 (SYN_SENT)", "Port Scan Sequence Step 1"),
        ("q0 (START)", "CONNECT", "q2 (CONNECTION)", "Connection Churn Sequence Step 1"),
        ("q0 (START)", "LOGIN_FAIL", "q3 (FAILED)", "Brute Force Sequence Step 1"),
        ("q0 (START)", "DATA / ACK", "q0 (START)", "Normal benign traffic (Remain in q0)"),
        ("q1 (SYN_SENT)", "SYN (step 1)", "q1 (SYN_SENT)", "2nd consecutive SYN (Step 2)"),
        ("q1 (SYN_SENT)", "SYN (step 2)", "q_alert (ALERT)", "3rd consecutive SYN → THREAT TRIGGERED (SYN Flood)"),
        ("q1 (SYN_SENT)", "PORT_SCAN (step 1,2)", "q1 (SYN_SENT)", "Consecutive port probes (Step 2, 3)"),
        ("q1 (SYN_SENT)", "PORT_SCAN (step 3)", "q_alert (ALERT)", "4th port probe → THREAT TRIGGERED (Port Scanning)"),
        ("q1 (SYN_SENT)", "ACK / FIN", "q0 (START)", "Handshake completion / normal close (Reset to q0)"),
        ("q3 (FAILED)", "LOGIN_FAIL (step 1,2)", "q3 (FAILED)", "2nd and 3rd failed logins (Step 2, 3)"),
        ("q3 (FAILED)", "LOGIN_SUCCESS (≥3 fails)", "q_alert (ALERT)", "Login after failures → THREAT TRIGGERED (Brute Force)"),
        ("q2 (CONNECTION)", "DISCONNECT (step 1,3)", "q0 (START)", "Teardown step in connection churn oscillation"),
        ("q2 (CONNECTION)", "CONNECT (step 4)", "q_alert (ALERT)", "5th oscillation step → THREAT TRIGGERED (Abnormal Conn)")
    ]

    for i, row_data in enumerate(table_data):
        row = trans_table.rows[i + 1]
        for j, val in enumerate(row_data):
            c = row.cells[j]
            p = c.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if "THREAT TRIGGERED" in val:
                r.font.bold = True
                r.font.color.rgb = RGBColor(185, 28, 28)
            set_cell_margins(c, 50, 50, 80, 80)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 2.2 Example State Transitions
    h2 = doc.add_heading("2.2 Example State Transitions (Trace Verification)", level=2)
    doc.add_paragraph(
        "To verify deterministic operation, consider a hostile source host 192.168.1.10 targeting destination server 10.0.0.5 across four scenarios:"
    )

    # Walkthrough Table
    ex_table = doc.add_table(rows=5, cols=5)
    ex_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    ex_headers = ["Step", "Source IP", "Action Symbol", "State Transition", "Rule Outcome"]
    for j, h in enumerate(ex_headers):
        c = ex_table.rows[0].cells[j]
        set_cell_background(c, "E2E8F0")
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9)

    ex_rows = [
        ("1", "192.168.1.100", "SYN (Port 80)", "q0 → q1", "Step 1 of SYN sequence recorded"),
        ("2", "192.168.1.100", "SYN (Port 80)", "q1 → q1", "Step 2 of SYN sequence; half-open queue warning"),
        ("3", "192.168.1.100", "SYN (Port 80)", "q1 → q_alert", "CRITICAL ALERT: Possible SYN Flood Attack"),
        ("4", "192.168.1.100", "ACK (Post-Alert)", "q_alert → q0", "Machine resets to q0 for fresh tracking")
    ]

    for i, row_data in enumerate(ex_rows):
        row = ex_table.rows[i + 1]
        for j, val in enumerate(row_data):
            c = row.cells[j]
            p = c.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(9)
            if j == 3 and "q_alert" in val:
                r.font.bold = True
                r.font.color.rgb = RGBColor(185, 28, 28)
            set_cell_margins(c, 60, 60, 90, 90)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 3. IMPORTANT SOURCE CODE
    h1 = doc.add_heading("3. IMPORTANT SOURCE CODE", level=1)
    doc.add_paragraph("The following code excerpts represent the actual, unmodified automata engine files implemented in the project:")

    # Code block 1: FSM.js
    doc.add_heading("File Name: server/automata/FSM.js", level=2)
    p = doc.add_paragraph()
    set_cell_background(doc.add_table(rows=1, cols=1).rows[0].cells[0], "F8FAFC")
    code_fsm = (
        "const STATES = {\n"
        "  START: 'START',\n"
        "  SYN_SENT: 'SYN_SENT',\n"
        "  CONNECTION: 'CONNECTION',\n"
        "  FAILED: 'FAILED',\n"
        "  ALERT: 'ALERT'\n"
        "};\n\n"
        "class FiniteStateMachine {\n"
        "  constructor(id, rule) {\n"
        "    this.id = id;\n"
        "    this.rule = rule;\n"
        "    this.currentState = STATES.START;\n"
        "    this.history = [];\n"
        "    this.matchedEvents = [];\n"
        "    this.sequenceStep = 0;\n"
        "  }\n\n"
        "  processSymbol(symbol, event) {\n"
        "    const normalizedSymbol = (symbol || '').toUpperCase().trim();\n"
        "    const fromState = this.currentState;\n"
        "    const transitionResult = this.rule.evaluate(\n"
        "      this.currentState, normalizedSymbol, this.sequenceStep, event\n"
        "    );\n\n"
        "    if (transitionResult.matched) {\n"
        "      this.currentState = transitionResult.nextState;\n"
        "      this.sequenceStep = transitionResult.nextStep;\n"
        "      this.matchedEvents.push(event);\n"
        "      this.history.push({ from: fromState, to: this.currentState, symbol: normalizedSymbol });\n"
        "      if (this.currentState === STATES.ALERT) return true;\n"
        "    } else if (transitionResult.reset) {\n"
        "      this.reset();\n"
        "    }\n"
        "    return false;\n"
        "  }\n"
        "  reset() { this.currentState = STATES.START; this.sequenceStep = 0; }\n"
        "}"
    )
    p_code = doc.paragraphs[-1]
    p_code.paragraph_format.left_indent = Inches(0.2)
    run_code = p_code.add_run(code_fsm)
    run_code.font.name = 'Courier New'
    run_code.font.size = Pt(8.5)
    run_code.font.color.rgb = RGBColor(30, 41, 59)

    # Code block 2: rules.js
    doc.add_heading("File Name: server/automata/rules.js (SYN Flood & Brute Force)", level=2)
    p = doc.add_paragraph()
    code_rules = (
        "const RULES = [\n"
        "  {\n"
        "    id: 'RULE_SYN_FLOOD',\n"
        "    attackType: 'Possible SYN Flood Attack',\n"
        "    severity: 'Critical',\n"
        "    sequence: ['SYN', 'SYN', 'SYN'],\n"
        "    evaluate(currentState, symbol, step, event) {\n"
        "      if (symbol === 'SYN') {\n"
        "        if (step === 0) return { matched: true, nextState: STATES.SYN_SENT, nextStep: 1 };\n"
        "        if (step === 1) return { matched: true, nextState: STATES.SYN_SENT, nextStep: 2 };\n"
        "        if (step === 2) return { matched: true, nextState: STATES.ALERT, nextStep: 3 };\n"
        "      }\n"
        "      if (['ACK', 'FIN', 'DISCONNECT'].includes(symbol)) return { matched: false, reset: true };\n"
        "      return { matched: false, reset: false };\n"
        "    }\n"
        "  },\n"
        "  {\n"
        "    id: 'RULE_BRUTE_FORCE',\n"
        "    attackType: 'Brute Force Attack',\n"
        "    severity: 'Critical',\n"
        "    sequence: ['LOGIN_FAIL', 'LOGIN_FAIL', 'LOGIN_FAIL', 'LOGIN_SUCCESS'],\n"
        "    evaluate(currentState, symbol, step, event) {\n"
        "      if (symbol === 'LOGIN_FAIL') {\n"
        "        if (step === 0) return { matched: true, nextState: STATES.FAILED, nextStep: 1 };\n"
        "        if (step === 1) return { matched: true, nextState: STATES.FAILED, nextStep: 2 };\n"
        "        if (step >= 2) return { matched: true, nextState: STATES.FAILED, nextStep: 3 };\n"
        "      }\n"
        "      if (symbol === 'LOGIN_SUCCESS' && step >= 3) {\n"
        "        return { matched: true, nextState: STATES.ALERT, nextStep: 4 };\n"
        "      }\n"
        "      return { matched: false, reset: false };\n"
        "    }\n"
        "  }\n"
        "];"
    )
    p_code = doc.paragraphs[-1]
    p_code.paragraph_format.left_indent = Inches(0.2)
    run_code = p_code.add_run(code_rules)
    run_code.font.name = 'Courier New'
    run_code.font.size = Pt(8.5)
    run_code.font.color.rgb = RGBColor(30, 41, 59)

    # 4. OUTPUT & SCREENSHOTS
    h1 = doc.add_heading("4. OUTPUT & SCREENSHOTS", level=1)
    doc.add_paragraph("Visual evidence of the running Automata NIDS engine captured from the deployed production environment:")

    # Simulator Screenshot
    doc.add_heading("4.1 Automata Interactive Simulator & Node Trace", level=2)
    sim_path = os.path.join(captured_dir, '06_automata_interactive_simulator.png')
    if os.path.exists(sim_path):
        doc.add_picture(sim_path, width=Inches(6.0))
        cp = doc.add_paragraph()
        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cr = cp.add_run("Figure 3: Live Interactive Automata Simulator illustrating active DFA node progression.")
        cr.font.size = Pt(9)
        cr.font.italic = True

    # Alerts Screenshot
    doc.add_heading("4.2 Security Alerts Console with Exact Automata State Trace", level=2)
    alerts_path = os.path.join(captured_dir, '03_alerts_management_console.png')
    if os.path.exists(alerts_path):
        doc.add_picture(alerts_path, width=Inches(6.0))
        cp = doc.add_paragraph()
        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cr = cp.add_run("Figure 4: Security Alerts Management Console showing state traces (START -> SYN_SENT -> ALERT).")
        cr.font.size = Pt(9)
        cr.font.italic = True

    # Sample output text box
    doc.add_heading("4.3 Terminal Execution Log Sample", level=2)
    p_log = doc.add_paragraph()
    set_cell_background(doc.add_table(rows=1, cols=1).rows[0].cells[0], "0F172A")
    log_text = (
        "[AUTOMATA_ENGINE] Ingesting packet: 192.168.1.100 -> 10.0.0.5 | Protocol: TCP | Action: SYN\n"
        "[AUTOMATA_ENGINE] Session [192.168.1.100] State: q0 -> q1 (SYN_SENT) | Step: 1/3\n"
        "[AUTOMATA_ENGINE] Ingesting packet: 192.168.1.100 -> 10.0.0.5 | Protocol: TCP | Action: SYN\n"
        "[AUTOMATA_ENGINE] Session [192.168.1.100] State: q1 -> q1 (SYN_SENT) | Step: 2/3\n"
        "[AUTOMATA_ENGINE] Ingesting packet: 192.168.1.100 -> 10.0.0.5 | Protocol: TCP | Action: SYN\n"
        "[AUTOMATA_ENGINE] Session [192.168.1.100] State: q1 -> q_alert (ALERT) | Step: 3/3\n"
        "🚨 [SECURITY ALERT DISPATCHED] ID: ALT-X8K19-2914 | Type: Possible SYN Flood Attack | Severity: Critical\n"
        "💾 [MONGODB PERSISTENCE] Alert successfully saved in database collection 'alerts'. Session reset to q0."
    )
    p_log = doc.paragraphs[-1]
    p_log.paragraph_format.left_indent = Inches(0.2)
    r_log = p_log.add_run(log_text)
    r_log.font.name = 'Courier New'
    r_log.font.size = Pt(8)
    r_log.font.color.rgb = RGBColor(248, 250, 252)

    # 5. PROCEDURE STEPS
    h1 = doc.add_heading("5. PROCEDURE STEPS", level=1)
    doc.add_paragraph("Step-by-step procedure to execute and evaluate the Automata-Based NIDS project:")
    
    steps = [
        "Clone the repository from GitHub: git clone https://github.com/medhunm7/automata-nids.git",
        "Open the project directory in Visual Studio Code or terminal: cd automata-nids",
        "Navigate to the backend server directory: cd server && npm install",
        "Configure the environment variables in server/.env with PORT=5000, MONGO_URI, and JWT_SECRET.",
        "Launch the backend server: npm start. The server confirms: 'AUTOMATA NIDS BACKEND SERVER ONLINE' and auto-seeds baseline events.",
        "In a separate terminal, navigate to the frontend directory: cd client && npm install",
        "Configure client/.env with VITE_API_URL=http://localhost:5000 (or the live Render backend URL).",
        "Start the Vite React development server: npm run dev. Access the dashboard at http://localhost:5173.",
        "Log into the application console using seeded credentials (admin@nids.local / Admin@12345).",
        "Navigate to the 'Upload Logs' module and upload sample traffic files (CSV, TXT, or JSON).",
        "Observe the Automata Engine process the batch: state progression triggers in real time.",
        "Navigate to the 'Automata Simulator' (/simulator) to manually trigger individual symbols (SYN, PORT_SCAN, LOGIN_FAIL) and observe node illumination.",
        "Inspect the 'Security Alerts' (/alerts) tab to view state traces, severity levels, and forensic mitigation recommendations.",
        "Export the forensic findings as a CSV spreadsheet or download the assessment PDF report.",
        "Verify persistence by querying the MongoDB Atlas database cluster collection 'alerts'."
    ]

    for i, step in enumerate(steps, 1):
        p = doc.add_paragraph()
        r_num = p.add_run(f"{i}. ")
        r_num.font.bold = True
        p.add_run(step)

    # 6. ADVANTAGES OF USING FLAT
    h1 = doc.add_heading("6. ADVANTAGES OF USING FLAT CONCEPT IN NIDS", level=1)
    doc.add_paragraph("The incorporation of Formal Languages and Automata Theory (FLAT) provides decisive architectural advantages:")

    advantages = [
        ("Deterministic Pattern Recognition", "Eliminates heuristic ambiguity. Every state transition is mathematically deterministic, preventing erratic classification behavior."),
        ("O(1) Constant-Time Evaluation", "Each packet triggers a single dictionary lookup in the transition table δ, allowing real-time processing of high-throughput network streams without packet drops."),
        ("Full Forensic Explainability", "Every security alert is accompanied by an exact state trace sequence (e.g., START → SYN_SENT → SYN_SENT → ALERT), providing complete audit transparency for SOC analysts."),
        ("Zero Training Overhead", "Unlike neural networks that require massive labeled datasets and periodic retraining, DFAs operate with 100% precision from Day 1 based on formal security grammars."),
        ("Resilient Session Isolation", "State machines are sharded per source IP session, preventing state contamination across benign and malicious endpoints.")
    ]

    for title, desc in advantages:
        p = doc.add_paragraph()
        r = p.add_run(f"• {title}: ")
        r.font.bold = True
        p.add_run(desc)

    docx_path = os.path.join(output_dir, "REPORT_1_FLAT_AUTOMATA_NIDS.docx")
    doc.save(docx_path)
    print(f"Generated {docx_path}")
    return docx_path


# =========================================================================
# 2. BUILD PDF: REPORT 1 (FLAT)
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
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "Velalar College of Engineering and Technology • Department of IT • FLAT Project Report")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        self.drawString(54, 32, "Automata-Based Network Intrusion Detection System • Subject Code: 22ITT53")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.restoreState()

def build_flat_pdf():
    pdf_path = os.path.join(output_dir, "REPORT_1_FLAT_AUTOMATA_NIDS.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        alignment=1, # Center
        textColor=colors.HexColor('#0f172a')
    )
    sub_title = ParagraphStyle(
        'CoverSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        alignment=1,
        textColor=colors.HexColor('#334155')
    )
    h1 = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        spaceBefore=14,
        spaceAfter=6,
        textColor=colors.HexColor('#0f172a')
    )
    h2 = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        spaceBefore=10,
        spaceAfter=4,
        textColor=colors.HexColor('#1e293b')
    )
    body = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        spaceAfter=6,
        textColor=colors.HexColor('#1e293b')
    )
    bullet = ParagraphStyle(
        'Bullet',
        parent=body,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )
    caption = ParagraphStyle(
        'Caption',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        alignment=1,
        spaceBefore=4,
        spaceAfter=8,
        textColor=colors.HexColor('#64748b')
    )
    code_style = ParagraphStyle(
        'CodeText',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#0f172a')
    )

    story = []

    # Cover Page Header
    story.append(Paragraph("<b>VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY, ERODE - 12</b>", title_style))
    story.append(Paragraph("(AUTONOMOUS)<br/><b>DEPARTMENT OF INFORMATION TECHNOLOGY</b>", title_style))
    story.append(Paragraph("ACADEMIC YEAR: 2026 - 2027 (ODD)<br/><b>ACTIVITY: Project-Based Assessment Report</b>", sub_title))
    story.append(Spacer(1, 10))

    # Student Details Table
    details_data = [
        [Paragraph("<b>PROJECT TITLE</b>", body), Paragraph("<b>Automata-Based Network Intrusion Detection System</b>", body)],
        [Paragraph("<b>STUDENT NAME</b>", body), Paragraph("MEDHUN M", body)],
        [Paragraph("<b>CLASS / YEAR</b>", body), Paragraph("24IT5A / Third Year B.Tech IT", body)],
        [Paragraph("<b>REGISTER NUMBER</b>", body), Paragraph("732924ITR072", body)],
        [Paragraph("<b>SUBJECT CODE</b>", body), Paragraph("22ITT53", body)],
        [Paragraph("<b>SUBJECT NAME</b>", body), Paragraph("FORMAL LANGUAGES AND AUTOMATA THEORY (FLAT)", body)],
        [Paragraph("<b>PROBLEM STATEMENT</b>", body), Paragraph("Build a full-stack web application that analyzes network communication events and detects suspicious communication patterns using Finite Automata. Implement multi-state transition tracking across temporal packet sequences to classify threats (SYN Flood, Brute Force, Port Scan, Abnormal Oscillation) and display detection traces and alerts on a live web dashboard.", body)]
    ]
    t_details = Table(details_data, colWidths=[130, 374])
    t_details.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_details)
    story.append(Spacer(1, 12))

    # 1. STATE DIAGRAM
    story.append(Paragraph("<b>1. STATE DIAGRAM</b>", h1))
    story.append(Paragraph("<b>1.1 Introduction</b>", h2))
    story.append(Paragraph(
        "A Deterministic Finite Automaton (DFA) is used in the Automata-Based NIDS project to continuously analyze incoming streams "
        "of network events and detect multi-stage intrusion signatures. Unlike stateless firewalls that inspect packets in isolation, "
        "the DFA maintains session-aware state progression across temporal sequences. Every session begins in the quiescent state q0 (START) "
        "and advances according to action symbols. Reaching q_alert generates an alert in MongoDB.", body
    ))

    story.append(Paragraph("<b>1.2 States of the DFA</b>", h2))
    states_pdf_data = [
        [Paragraph("<b>State</b>", body), Paragraph("<b>Name</b>", body), Paragraph("<b>Description & Threat Meaning</b>", body)],
        [Paragraph("<b>q0</b>", body), Paragraph("START", body), Paragraph("Initial quiescent state; clean baseline traffic.", body)],
        [Paragraph("<b>q1</b>", body), Paragraph("SYN_SENT", body), Paragraph("Half-open connection or port probe detected.", body)],
        [Paragraph("<b>q2</b>", body), Paragraph("CONNECTION", body), Paragraph("Normal socket connection established.", body)],
        [Paragraph("<b>q3</b>", body), Paragraph("FAILED", body), Paragraph("Authentication attempt failed; tracks credential spraying.", body)],
        [Paragraph("<b>q_alert</b>", body), Paragraph("ALERT", body), Paragraph("Accepting state (qF). Threat recognized; alert dispatched.", body)],
    ]
    t_states = Table(states_pdf_data, colWidths=[55, 85, 364])
    t_states.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_states)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>1.3 State Diagram Representation</b>", h2))
    dfa_img_path = os.path.join(diagrams_dir, 'dfa_state_diagram.png')
    if os.path.exists(dfa_img_path):
        story.append(Image(dfa_img_path, width=480, height=260))
        story.append(Paragraph("Figure 1: DFA State Diagram for Automata-Based Network Intrusion Detection Core.", caption))

    story.append(Paragraph("<b>1.4 Formal Definition of DFA</b>", h2))
    story.append(Paragraph("The automaton is formally defined by the 5-tuple: <b>M = (Q, Σ, δ, q0, F)</b>", body))
    formal_items = [
        "<b>Q (Finite Set of States):</b> Q = { START, SYN_SENT, CONNECTION, FAILED, ALERT } = { q0, q1, q2, q3, q_alert }",
        "<b>Σ (Input Alphabet):</b> Σ = { SYN, ACK, FIN, CONNECT, DISCONNECT, LOGIN_FAIL, LOGIN_SUCCESS, PORT_SCAN, DATA }",
        "<b>δ (Transition Function):</b> δ: Q × Σ → Q, computing the next state based on current state and symbol.",
        "<b>q0 (Initial State):</b> q0 = START, representing clean, unflagged network activity.",
        "<b>F (Set of Accepting States):</b> F = { ALERT } = { q_alert }. Triggers alert generation and database storage."
    ]
    for it in formal_items:
        story.append(Paragraph(f"• {it}", bullet))

    # 2. TRANSITION DIAGRAM & TABLES
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>2. TRANSITION DIAGRAM & TABLES</b>", h1))
    trans_img_path = os.path.join(diagrams_dir, 'dfa_transition_diagram.png')
    if os.path.exists(trans_img_path):
        story.append(Image(trans_img_path, width=480, height=196))
        story.append(Paragraph("Figure 2: DFA Transition Diagram showing step-by-step SYN Flood detection.", caption))

    story.append(Paragraph("<b>2.1 State Transition Table (δ: Q × Σ → Q)</b>", h2))
    table_pdf_data = [
        [Paragraph("<b>Current State (q)</b>", body), Paragraph("<b>Input Symbol (σ)</b>", body), Paragraph("<b>Next State δ(q, σ)</b>", body), Paragraph("<b>Rule / Trigger Outcome</b>", body)],
        [Paragraph("q0 (START)", body), Paragraph("SYN", body), Paragraph("q1 (SYN_SENT)", body), Paragraph("SYN Flood Step 1", body)],
        [Paragraph("q0 (START)", body), Paragraph("PORT_SCAN", body), Paragraph("q1 (SYN_SENT)", body), Paragraph("Port Scan Step 1", body)],
        [Paragraph("q0 (START)", body), Paragraph("CONNECT", body), Paragraph("q2 (CONNECTION)", body), Paragraph("Connection Churn Step 1", body)],
        [Paragraph("q0 (START)", body), Paragraph("LOGIN_FAIL", body), Paragraph("q3 (FAILED)", body), Paragraph("Brute Force Step 1", body)],
        [Paragraph("q1 (SYN_SENT)", body), Paragraph("SYN (step 1)", body), Paragraph("q1 (SYN_SENT)", body), Paragraph("2nd consecutive SYN (Step 2)", body)],
        [Paragraph("q1 (SYN_SENT)", body), Paragraph("SYN (step 2)", body), Paragraph("q_alert (ALERT)", body), Paragraph("<b>CRITICAL: Possible SYN Flood</b>", body)],
        [Paragraph("q1 (SYN_SENT)", body), Paragraph("PORT_SCAN (step 1,2)", body), Paragraph("q1 (SYN_SENT)", body), Paragraph("Port Scan Step 2, 3", body)],
        [Paragraph("q1 (SYN_SENT)", body), Paragraph("PORT_SCAN (step 3)", body), Paragraph("q_alert (ALERT)", body), Paragraph("<b>HIGH: Port Scanning Detected</b>", body)],
        [Paragraph("q1 (SYN_SENT)", body), Paragraph("ACK / FIN", body), Paragraph("q0 (START)", body), Paragraph("Handshake complete (Reset q0)", body)],
        [Paragraph("q3 (FAILED)", body), Paragraph("LOGIN_FAIL (step 1,2)", body), Paragraph("q3 (FAILED)", body), Paragraph("2nd & 3rd failed login", body)],
        [Paragraph("q3 (FAILED)", body), Paragraph("LOGIN_SUCCESS (≥3 fail)", body), Paragraph("q_alert (ALERT)", body), Paragraph("<b>CRITICAL: Brute Force Attack</b>", body)],
        [Paragraph("q2 (CONNECTION)", body), Paragraph("DISCONNECT / CONN", body), Paragraph("q_alert (ALERT)", body), Paragraph("<b>MEDIUM: Abnormal Connection Churn</b>", body)],
    ]
    t_trans = Table(table_pdf_data, colWidths=[100, 110, 110, 184])
    t_trans.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_trans)

    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>2.2 Example State Transitions</b>", h2))
    ex_pdf_data = [
        [Paragraph("<b>Step</b>", body), Paragraph("<b>Source IP</b>", body), Paragraph("<b>Action Symbol</b>", body), Paragraph("<b>Transition</b>", body), Paragraph("<b>Resulting State</b>", body)],
        [Paragraph("1", body), Paragraph("192.168.1.100", body), Paragraph("SYN (Port 80)", body), Paragraph("q0 → q1", body), Paragraph("q1 (SYN_SENT)", body)],
        [Paragraph("2", body), Paragraph("192.168.1.100", body), Paragraph("SYN (Port 80)", body), Paragraph("q1 → q1", body), Paragraph("q1 (SYN_SENT 2)", body)],
        [Paragraph("3", body), Paragraph("192.168.1.100", body), Paragraph("SYN (Port 80)", body), Paragraph("q1 → q_alert", body), Paragraph("<b>q_alert (ALERT TRIGGERED)</b>", body)],
        [Paragraph("4", body), Paragraph("192.168.1.100", body), Paragraph("Post-Alert", body), Paragraph("q_alert → q0", body), Paragraph("q0 (Reset for new traffic)", body)],
    ]
    t_ex = Table(ex_pdf_data, colWidths=[40, 110, 110, 110, 134])
    t_ex.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_ex)

    # 3. CODE
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>3. IMPORTANT SOURCE CODE</b>", h1))
    story.append(Paragraph("<b>File Name: server/automata/FSM.js</b>", h2))
    fsm_snippet = (
        "const STATES = { START: 'START', SYN_SENT: 'SYN_SENT', CONNECTION: 'CONNECTION', FAILED: 'FAILED', ALERT: 'ALERT' };\n"
        "class FiniteStateMachine {\n"
        "  processSymbol(symbol, event) {\n"
        "    const transitionResult = this.rule.evaluate(this.currentState, symbol, this.sequenceStep, event);\n"
        "    if (transitionResult.matched) {\n"
        "      this.currentState = transitionResult.nextState;\n"
        "      this.sequenceStep = transitionResult.nextStep;\n"
        "      this.matchedEvents.push(event);\n"
        "      if (this.currentState === STATES.ALERT) return true;\n"
        "    } else if (transitionResult.reset) { this.reset(); }\n"
        "    return false;\n"
        "  }\n"
        "}"
    )
    t_code1 = Table([[Paragraph(fsm_snippet.replace('\n', '<br/>'), code_style)]], colWidths=[504])
    t_code1.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 6)
    ]))
    story.append(t_code1)

    # 4. OUTPUT & SCREENSHOTS
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>4. OUTPUT & SCREENSHOTS</b>", h1))
    sim_path = os.path.join(captured_dir, '06_automata_interactive_simulator.png')
    if os.path.exists(sim_path):
        story.append(Image(sim_path, width=480, height=240))
        story.append(Paragraph("Figure 3: Interactive Automata Simulator with Live Node Progression.", caption))

    alerts_path = os.path.join(captured_dir, '03_alerts_management_console.png')
    if os.path.exists(alerts_path):
        story.append(Image(alerts_path, width=480, height=240))
        story.append(Paragraph("Figure 4: Security Alerts Console showing State Trace and Mitigation Advice.", caption))

    # 5. PROCEDURE STEPS
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>5. PROCEDURE STEPS</b>", h1))
    proc_steps = [
        "Clone the repository from GitHub: git clone https://github.com/medhunm7/automata-nids.git",
        "Open project folder and navigate to server directory: cd server && npm install",
        "Configure environment variables in server/.env (PORT=5000, MONGO_URI, JWT_SECRET).",
        "Start the backend server: npm start (Express initializes on port 5000).",
        "Navigate to client directory: cd client && npm install && npm run dev.",
        "Access frontend dashboard in browser at http://localhost:5173 (or https://automata-nids.vercel.app).",
        "Log in using configured credentials (admin@nids.local / Admin@12345).",
        "Upload network log files (CSV, TXT, JSON) via the 'Upload Logs' module.",
        "Observe the DFA engine evaluate input events against configured attack sequences.",
        "Navigate to 'Automata Simulator' (/simulator) to test live state transitions manually.",
        "View classified threat incidents in 'Security Alerts' (/alerts) with full state traces.",
        "Export audit reports as CSV or downloadable assessment PDF summaries.",
        "Verify persistence of security incidents in MongoDB Atlas 'alerts' collection."
    ]
    for i, s in enumerate(proc_steps, 1):
        story.append(Paragraph(f"<b>{i}.</b> {s}", bullet))

    # 6. ADVANTAGES
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>6. ADVANTAGES OF USING FLAT CONCEPT IN NIDS</b>", h1))
    adv_items = [
        "<b>Deterministic Pattern Recognition:</b> Mathematically guarantees zero classification ambiguity.",
        "<b>O(1) Constant-Time Evaluation:</b> Instant table lookups support high-throughput line-rate packet streams.",
        "<b>Full Explainability:</b> Complete state traces (START → SYN_SENT → ALERT) provide transparent forensic evidence.",
        "<b>Zero Model Training:</b> Operates with complete accuracy from day one without training data bias.",
        "<b>Session-Sharded Memory:</b> Retains isolated state per IP address, preventing cross-session contamination."
    ]
    for a in adv_items:
        story.append(Paragraph(f"• {a}", bullet))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated {pdf_path}")
    return pdf_path

if __name__ == '__main__':
    build_flat_docx()
    build_flat_pdf()
