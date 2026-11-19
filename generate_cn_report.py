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
# 1. BUILD DOCX: REPORT 2 (COMPUTER NETWORKS)
# =========================================================================
def build_cn_docx():
    doc = docx.Document()

    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        header = section.header
        hp = header.paragraphs[0]
        hp.text = "Velalar College of Engineering and Technology • Department of IT • Computer Networks Report"
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hp.style.font.size = Pt(8.5)
        hp.style.font.color.rgb = RGBColor(100, 116, 139)

        footer = section.footer
        fp = footer.paragraphs[0]
        fp.text = "Automata-Based Network Intrusion Detection System • Subject: Computer Networks"
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        fp.style.font.size = Pt(8.5)
        fp.style.font.color.rgb = RGBColor(100, 116, 139)

    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)

    # Title & Metadata
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run("COMPUTER NETWORKS PROJECT-BASED ASSESSMENT REPORT\n")
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 23, 42)

    run = p.add_run("AUTOMATA-BASED NETWORK INTRUSION DETECTION SYSTEM\n")
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = RGBColor(2, 132, 199)

    run = p.add_run("Name: MEDHUN M  |  Reg No: 732924ITR072\n")
    run.font.size = Pt(10.5)
    run.font.bold = True
    run.font.color.rgb = RGBColor(51, 65, 85)

    run = p.add_run("Department of Information Technology | Velalar College of Engineering and Technology (Autonomous)\n")
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(71, 85, 105)

    run = p.add_run("Subject: Computer Networks | Academic Year: 2026 - 2027\n\n")
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(71, 85, 105)

    # 1. INTRODUCTION
    h1 = doc.add_heading("1. INTRODUCTION", level=1)
    h1.style.font.color.rgb = RGBColor(15, 23, 42)
    doc.add_paragraph(
        "Computer networks form the operational backbone of modern digital infrastructures, enabling distributed systems to exchange data "
        "via standardized protocol suites such as TCP/IP. However, the open, packet-switched architecture of IP networks also exposes servers "
        "and client workstations to diverse cyber threats—including volumetric Transmission Control Protocol (TCP) SYN floods, port scanning "
        "reconnaissance probes, brute-force credential stuffing, and connection oscillation attacks."
    )
    doc.add_paragraph(
        "The Automata-Based Network Intrusion Detection System (NIDS) is engineered to inspect, classify, and mitigate these network anomalies "
        "by combining computer networking principles with formal language theory. The system monitors packet header tuples "
        "(Timestamp, Source IP, Destination IP, Protocol, Port, Action), reconstructs per-session TCP connection states, and applies "
        "deterministic automata rules to identify malicious communication sequences in real time."
    )

    doc.add_heading("1.1 Objectives", level=2)
    objectives = [
        "Analyze the multi-tier client-server communication model connecting web browsers, edge CDN proxies, application runtimes, and distributed databases.",
        "Model the physical and logical network topology connecting client hosts through Layer 2 switches and Layer 3 gateways to cloud infrastructure.",
        "Demonstrate TCP connection establishment via the three-way handshake (SYN, SYN-ACK, ACK) and explain how TCP SYN flood attacks exploit half-open socket states.",
        "Examine IPv4 and IPv6 addressing, CIDR subnetting, socket endpoint abstractions, and port assignment standards.",
        "Trace the end-to-end request-response traversal of network packets across HTTP, HTTPS, TLS 1.3, and REST/JSON protocols."
    ]
    for obj in objectives:
        p = doc.add_paragraph()
        r = p.add_run("• ")
        r.font.bold = True
        p.add_run(obj)

    # 2. NETWORK TOPOLOGY
    h1 = doc.add_heading("2. NETWORK TOPOLOGY", level=1)
    doc.add_paragraph(
        "The network topology models the physical and logical pathway traversed by telemetry packets and user requests. "
        "Figure 1 illustrates the end-to-end network architecture of the deployed Automata NIDS system, encompassing client-side LAN infrastructure, "
        "WAN gateway traversal, public internet routing, Vercel frontend edge distribution, Render cloud backend execution, and MongoDB Atlas database clustering."
    )

    topo_img_path = os.path.join(diagrams_dir, 'network_topology.png')
    if os.path.exists(topo_img_path):
        doc.add_picture(topo_img_path, width=Inches(6.2))
        cp = doc.add_paragraph()
        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cr = cp.add_run("Figure 1: Comprehensive Network Topology of the Deployed Automata NIDS System.")
        cr.font.size = Pt(9)
        cr.font.italic = True
        cr.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_heading("2.1 Network Components & Roles", level=2)
    comp_table = doc.add_table(rows=7, cols=3)
    comp_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_headers = ["Network Component", "OSI Layer", "Operational Role in Automata NIDS"]
    for j, h in enumerate(c_headers):
        c = comp_table.rows[0].cells[j]
        set_cell_background(c, "E2E8F0")
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9.5)

    components = [
        ("Client PC (Analyst Workstation)", "Layer 7 (Application)", "Hosts the web browser rendering the React 18 interface, initiating REST calls, and displaying security analytics."),
        ("LAN Switch", "Layer 2 (Data Link)", "Provides high-speed Ethernet switching within the local subnet (192.168.1.0/24), forwarding MAC frames to the default gateway."),
        ("Default Gateway / Router", "Layer 3 (Network)", "Performs Network Address Translation (NAT) and IP packet routing, forwarding internal traffic to the WAN ISP uplink."),
        ("Vercel Edge Network (CDN)", "Layer 7 (Application / Edge)", "Hosts the static React frontend bundle across globally distributed edge nodes, terminating client TLS sessions via HTTPS (Port 443)."),
        ("Render Cloud Server", "Layer 7 / Layer 4", "Executes the Node.js/Express.js backend container, hosting the REST API and executing the core Automata Intrusion Detection Engine."),
        ("MongoDB Atlas Cluster", "Layer 7 / Layer 4", "Cloud-managed replica set database storing user authentication records, ingested packet events, and verified threat incidents over TLS port 27017.")
    ]

    for i, row_data in enumerate(components):
        row = comp_table.rows[i + 1]
        for j, val in enumerate(row_data):
            c = row.cells[j]
            p = c.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(9)
            if j == 0:
                r.font.bold = True
            set_cell_margins(c, 60, 60, 90, 90)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 3. COMMUNICATION FLOW
    h1 = doc.add_heading("3. COMMUNICATION FLOW", level=1)
    doc.add_paragraph(
        "Communication across the NIDS follows a strictly sequenced client-server pipeline:"
    )
    flow_steps = [
        "Packet Ingestion / Form Submission: The security analyst selects and submits network traffic logs (CSV, TXT, JSON) via the React frontend interface.",
        "Transport Layer Encapsulation: The browser initiates an HTTPS POST request targeting the Render backend endpoint (/upload or /events), encapsulating the payload into TCP segments.",
        "Gateway Routing & NAT: The local router translates the private source IP (192.168.1.10) to a public IP address via NAT and routes packets across the public internet.",
        "TLS Handshake & Decryption: Cloudflare and Render edge reverse-proxies terminate TLS 1.3 encryption, validate certificates, and pass cleartext HTTP requests to the Express application.",
        "Middleware Ingestion & Stream Parsing: Express applies Helmet security headers, parses multipart log streams via Multer and csv-parser, and normalizes records into 6-tuples.",
        "Automata Threat Evaluation: The AutomataDetector maps each packet action symbol against active session DFAs. When a sequence satisfies an attack grammar, an alert object is spawned.",
        "Database Persistence: Mongoose executes asynchronous TLS MongoDB wire-protocol commands (Port 27017) to store events and alerts in MongoDB Atlas.",
        "Telemetry Response Delivery: Express transmits an HTTP 200/201 JSON response payload back to the client browser, prompting Recharts visualization re-rendering."
    ]
    for i, s in enumerate(flow_steps, 1):
        p = doc.add_paragraph()
        r_num = p.add_run(f"Step {i}: ")
        r_num.font.bold = True
        p.add_run(s)

    # 4. TCP THREE-WAY HANDSHAKE & TCP STATE TRANSITIONS
    h1 = doc.add_heading("4. TCP PROTOCOL & STATE TRANSITIONS", level=1)
    doc.add_paragraph(
        "Transmission Control Protocol (TCP) is a connection-oriented, reliable transport-layer protocol governing all application traffic "
        "between the React client, Express API server, and MongoDB database. Before any data can be transferred, TCP establishes a virtual circuit "
        "using the canonical Three-Way Handshake."
    )

    tcp_img_path = os.path.join(diagrams_dir, 'tcp_handshake_state.png')
    if os.path.exists(tcp_img_path):
        doc.add_picture(tcp_img_path, width=Inches(6.2))
        cp = doc.add_paragraph()
        cp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cr = cp.add_run("Figure 2: (b) TCP Three-Way Handshake Connection Establishment & (c) TCP State Transition Diagram.")
        cr.font.size = Pt(9)
        cr.font.italic = True
        cr.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_heading("4.1 Handshake Sequence Analysis", level=2)
    hs_table = doc.add_table(rows=4, cols=4)
    hs_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    h_headers = ["Handshake Step", "Client Action & State", "Server Action & State", "TCP Flag & Sequence Numbers"]
    for j, h in enumerate(h_headers):
        c = hs_table.rows[0].cells[j]
        set_cell_background(c, "E2E8F0")
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9)

    hs_data = [
        ("1. SYN Packet", "Client sends SYN segment requesting a connection; moves from CLOSED to SYN-SENT.", "Server is listening in LISTEN state on port 443; receives segment and enters SYN-RECEIVED.", "SYN Flag = 1\nSeq = x (Client ISN)"),
        ("2. SYN + ACK Packet", "Client receives server acknowledgment and sequence number; prepares final ACK.", "Server allocates transmission control block (TCB) buffers and sends SYN+ACK.", "SYN = 1, ACK = 1\nSeq = y, Ack = x + 1"),
        ("3. ACK Packet", "Client transmits final ACK segment and enters ESTABLISHED state. Socket ready for data.", "Server receives final ACK and transitions to ESTABLISHED. Full-duplex circuit active.", "ACK Flag = 1\nSeq = x + 1, Ack = y + 1")
    ]
    for i, row_data in enumerate(hs_data):
        row = hs_table.rows[i + 1]
        for j, val in enumerate(row_data):
            c = row.cells[j]
            p = c.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if j == 0:
                r.font.bold = True
            set_cell_margins(c, 50, 50, 80, 80)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    doc.add_heading("4.2 TCP SYN Flood Attack Vulnerability & NIDS Detection", level=2)
    doc.add_paragraph(
        "A standard TCP server allocates memory buffers (the SYN backlog queue) upon receiving a SYN packet while awaiting the final ACK. "
        "In a TCP SYN Flood Attack, a malicious host floods the target server with rapid, repeated SYN packets from spoofed IP addresses, "
        "deliberately withholding the final ACK. As a result, the server's SYN backlog queue saturates, causing legitimate connection requests to be dropped.\n\n"
        "In our Automata-Based NIDS, the DFA specifically monitors half-open connection sequences. When a source host emits three consecutive "
        "SYN requests without intervening ACK or FIN packets, the automaton transitions: q0 → q1 → q1 → q_alert, instantly generating a "
        "'Possible SYN Flood Attack' critical security incident before server resource exhaustion occurs."
    )

    # 5. IP ADDRESSING & CONFIGURATION
    h1 = doc.add_heading("5. IP ADDRESSING & NETWORK CONFIGURATION", level=1)
    doc.add_paragraph(
        "IP addresses provide logical host identification across network interfaces. The Automata NIDS system operates in a hybrid environment "
        "spanning local IPv4 private subnets and globally routable cloud IP blocks."
    )

    ip_table = doc.add_table(rows=6, cols=5)
    ip_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    ip_headers = ["Device / Endpoint", "IPv4 Address", "Subnet Mask / CIDR", "IPv6 Address (Example)", "Scope / Role"]
    for j, h in enumerate(ip_headers):
        c = ip_table.rows[0].cells[j]
        set_cell_background(c, "E2E8F0")
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9)

    ip_data = [
        ("Analyst Client PC", "192.168.1.10", "255.255.255.0 (/24)", "2001:db8:1::10/64", "Local Private Host (DHCP leased)"),
        ("Local Router / Gateway", "192.168.1.1", "255.255.255.0 (/24)", "2001:db8:1::1/64", "Default Gateway & NAT Interface"),
        ("Local Development Server", "127.0.0.1", "255.0.0.0 (/8)", "::1/128", "Loopback Testing Interface"),
        ("Vercel Edge Frontend", "76.76.21.21 (Anycast)", "Public Routable", "2600:1f18::/32", "Public Cloud Edge CDN Endpoint"),
        ("Render Backend API", "Dynamic Cloud Egress", "Public Routable", "2606:4700::/32", "Public Cloud Web Service Host")
    ]
    for i, row_data in enumerate(ip_data):
        row = ip_table.rows[i + 1]
        for j, val in enumerate(row_data):
            c = row.cells[j]
            p = c.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if j == 0:
                r.font.bold = True
            set_cell_margins(c, 50, 50, 80, 80)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 6. PORT NUMBERS
    h1 = doc.add_heading("6. PORT NUMBERS & TRANSPORT SERVICES", level=1)
    doc.add_paragraph(
        "Port numbers (16-bit integers ranging from 0 to 65535) delineate discrete application-layer services residing on a single host. "
        "Table 6.1 enumerates the operational ports utilized throughout the Automata NIDS architecture:"
    )

    port_table = doc.add_table(rows=7, cols=4)
    port_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    p_headers = ["Service Name", "Standard Port", "Transport Protocol", "Usage in Automata NIDS Project"]
    for j, h in enumerate(p_headers):
        c = port_table.rows[0].cells[j]
        set_cell_background(c, "E2E8F0")
        p = c.paragraphs[0]
        r = p.add_run(h)
        r.font.bold = True
        r.font.size = Pt(9)

    port_data = [
        ("HTTP", "80", "TCP", "Unencrypted web traffic; automatically redirected to HTTPS (Port 443)."),
        ("HTTPS", "443", "TCP", "Secure web application traffic encrypted with TLS 1.3 across Vercel and Render."),
        ("DNS", "53", "UDP / TCP", "Resolves domain hostnames (automata-nids.vercel.app, render.com, mongodb.net)."),
        ("Local Express Server", "5000", "TCP", "Default Node.js backend port utilized during local development testing."),
        ("Render Production Server", "10000", "TCP", "Default production container listening port assigned by Render cloud runtime."),
        ("MongoDB Atlas", "27017", "TCP", "Encrypted database wire protocol port utilized by Mongoose connection pool.")
    ]
    for i, row_data in enumerate(port_data):
        row = port_table.rows[i + 1]
        for j, val in enumerate(row_data):
            c = row.cells[j]
            p = c.paragraphs[0]
            r = p.add_run(val)
            r.font.size = Pt(8.5)
            if j == 0:
                r.font.bold = True
            set_cell_margins(c, 50, 50, 80, 80)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 7. NETWORK PROTOCOLS
    h1 = doc.add_heading("7. NETWORK PROTOCOLS", level=1)
    doc.add_paragraph("The application leverages core networking protocols across multiple layers of the OSI stack:")
    
    protocols = [
        ("HTTP & HTTPS (Hypertext Transfer Protocol Secure)", "Application layer protocol providing stateless resource transfer. HTTPS encapsulates HTTP within Transport Layer Security (TLS 1.3), encrypting all log payloads, tokens, and telemetry against sniffing and tampering."),
        ("TCP (Transmission Control Protocol)", "Connection-oriented transport protocol ensuring reliable, in-sequence packet delivery, flow control, and congestion mitigation between client and server runtimes."),
        ("UDP (User Datagram Protocol)", "Connectionless transport protocol characterized by minimal transmission latency. Used primarily by DNS queries resolving external API and database cluster hostnames."),
        ("DNS (Domain Name System)", "Hierarchical distributed database resolving human-readable Fully Qualified Domain Names (FQDN) into IP addresses. Specifically, DNS SRV records (mongodb+srv) resolve Atlas shard endpoints dynamically."),
        ("REST API & JSON Data Encoding", "Representational State Transfer architectural pattern utilizing standard HTTP verbs (GET, POST, DELETE) with JavaScript Object Notation (JSON) payloads for structured message exchange.")
    ]
    for name, desc in protocols:
        p = doc.add_paragraph()
        r = p.add_run(f"• {name}: ")
        r.font.bold = True
        p.add_run(desc)

    # 8. REQUEST-RESPONSE WORKING
    h1 = doc.add_heading("8. REQUEST-RESPONSE WORKING (END-TO-END TRACE)", level=1)
    doc.add_paragraph(
        "To understand the practical networking workflow, consider an analyst uploading a log file 'traffic_capture.csv' containing suspicious packets:\n"
        "1. DNS Lookup: The browser queries the local DNS resolver (Port 53) to obtain the IP address for automata-nids-backend.onrender.com.\n"
        "2. TCP & TLS Setup: A TCP 3-way handshake is completed on port 443, followed by TLS 1.3 cryptographic key negotiation.\n"
        "3. HTTP POST Transmission: Axios dispatches a POST /upload request containing multipart form data and a JWT Bearer token.\n"
        "4. Server Processing: Express intercepts the request, validates the JWT signature, unmarshals the CSV log stream into packet tuples, and passes them to the Automata Engine.\n"
        "5. Threat Interception: The automata engine drives sessions across states. Upon reaching q_alert, an alert object is constructed.\n"
        "6. DB Transaction: Mongoose opens a TCP socket connection (Port 27017) to MongoDB Atlas, executing an insertMany operation.\n"
        "7. Response Delivery: Render transmits an HTTP 200 OK JSON payload back to the client workstation.\n"
        "8. UI Re-render: React parses the JSON response and updates the Recharts graphs and alerts table without requiring a page refresh."
    )

    # 9. CONCLUSION
    h1 = doc.add_heading("9. CONCLUSION", level=1)
    doc.add_paragraph(
        "This project comprehensively demonstrates the indispensable role of computer networking principles in designing modern cybersecurity software. "
        "The end-to-end architecture illustrates how network topologies, routing gateways, TCP socket lifecycles, IP subnetting, port abstractions, "
        "and application-layer protocols operate in harmony to support real-time intrusion analysis. By coupling low-level transport stream analysis "
        "with formal automata state progression, the system successfully bridges foundational networking theory with enterprise-grade threat detection."
    )

    docx_path = os.path.join(output_dir, "REPORT_2_CN_AUTOMATA_NIDS.docx")
    doc.save(docx_path)
    print(f"Generated {docx_path}")
    return docx_path


# =========================================================================
# 2. BUILD PDF: REPORT 2 (COMPUTER NETWORKS)
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


def build_cn_pdf():
    pdf_path = os.path.join(output_dir, "REPORT_2_CN_AUTOMATA_NIDS.pdf")
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

    story = []

    # Title Banner
    story.append(Paragraph("<b>COMPUTER NETWORKS PROJECT-BASED ASSESSMENT REPORT</b>", title_style))
    story.append(Paragraph("<b>AUTOMATA-BASED NETWORK INTRUSION DETECTION SYSTEM</b>", title_style))
    story.append(Paragraph("<b>Name: MEDHUN M &nbsp;|&nbsp; Reg No: 732924ITR072</b><br/>Department of Information Technology &nbsp;|&nbsp; Velalar College of Engineering and Technology<br/>Subject: Computer Networks &nbsp;|&nbsp; Academic Year: 2026 - 2027", sub_title))
    story.append(Spacer(1, 12))

    # 1. INTRODUCTION
    story.append(Paragraph("<b>1. INTRODUCTION</b>", h1))
    story.append(Paragraph(
        "Computer networks enable distributed applications to exchange mission-critical telemetry across standardized protocol suites like TCP/IP. "
        "However, open packet-switched networks are vulnerable to volumetric attacks such as TCP SYN floods, port scans, and credential brute-forcing. "
        "The Automata-Based NIDS project applies computer networking concepts alongside formal automata theory to inspect packet headers "
        "(Timestamp, Source IP, Destination IP, Protocol, Port, Action), reconstruct per-session TCP socket states, and intercept threats in real time.", body
    ))
    story.append(Paragraph("<b>Objectives:</b>", h2))
    objs = [
        "Analyze the multi-tier client-server communication model between browser, CDN, API server, and cloud database.",
        "Model the physical and logical network topology connecting client hosts through Layer 2 switches and Layer 3 gateways.",
        "Demonstrate TCP connection establishment via the three-way handshake and evaluate SYN flood half-open buffer vulnerabilities.",
        "Examine IPv4/IPv6 addressing, CIDR subnetting, port numbers, and transport protocols in depth.",
        "Trace complete packet request-response lifecycles across HTTP, HTTPS, TLS 1.3, and REST API calls."
    ]
    for o in objs:
        story.append(Paragraph(f"• {o}", bullet))

    # 2. TOPOLOGY
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>2. NETWORK TOPOLOGY</b>", h1))
    topo_img_path = os.path.join(diagrams_dir, 'network_topology.png')
    if os.path.exists(topo_img_path):
        story.append(Image(topo_img_path, width=480, height=220))
        story.append(Paragraph("Figure 1: Comprehensive Network Topology of the Deployed Automata NIDS System.", caption))

    comp_pdf_data = [
        [Paragraph("<b>Component</b>", body), Paragraph("<b>Layer</b>", body), Paragraph("<b>Role in Automata NIDS</b>", body)],
        [Paragraph("Client PC (Analyst)", body), Paragraph("Layer 7", body), Paragraph("Web browser rendering React interface & telemetry charts.", body)],
        [Paragraph("LAN Switch", body), Paragraph("Layer 2", body), Paragraph("Ethernet switching within private subnet (192.168.1.0/24).", body)],
        [Paragraph("Default Gateway / Router", body), Paragraph("Layer 3", body), Paragraph("NAT translation and WAN routing to public ISP gateway.", body)],
        [Paragraph("Vercel Edge Network", body), Paragraph("Layer 7", body), Paragraph("CDN hosting static frontend bundle; TLS termination (Port 443).", body)],
        [Paragraph("Render Application Server", body), Paragraph("Layer 7 / 4", body), Paragraph("Express.js backend container executing Automata Engine.", body)],
        [Paragraph("MongoDB Atlas Database", body), Paragraph("Layer 7 / 4", body), Paragraph("Cloud replica set storing events, alerts, and users over TLS 27017.", body)]
    ]
    t_comp = Table(comp_pdf_data, colWidths=[120, 70, 314])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_comp)

    # 3. COMMUNICATION FLOW
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>3. COMMUNICATION FLOW</b>", h1))
    flows = [
        "<b>User Request:</b> Analyst uploads packet stream or queries metrics via the React dashboard.",
        "<b>Transport Encapsulation:</b> Browser encapsulates JSON/form data into HTTPS POST packets (Port 443).",
        "<b>Gateway Traversal:</b> Local router applies NAT (192.168.1.10 → Public IP) and forwards packets to WAN.",
        "<b>Cloud Termination:</b> Cloudflare & Render terminate TLS 1.3 and route HTTP requests to Express router.",
        "<b>Engine Processing:</b> Automata engine maps action symbols against DFA rules and detects attack sequences.",
        "<b>DB Persistence:</b> Incident records are dispatched over TLS to MongoDB Atlas (Port 27017).",
        "<b>Client Response:</b> JSON telemetry payload returned to browser; Recharts graphs update dynamically."
    ]
    for f in flows:
        story.append(Paragraph(f"• {f}", bullet))

    # 4. TCP HANDSHAKE & STATES
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>4. TCP PROTOCOL & STATE TRANSITIONS</b>", h1))
    tcp_img_path = os.path.join(diagrams_dir, 'tcp_handshake_state.png')
    if os.path.exists(tcp_img_path):
        story.append(Image(tcp_img_path, width=480, height=220))
        story.append(Paragraph("Figure 2: TCP Three-Way Handshake Connection Establishment & State Transitions.", caption))

    story.append(Paragraph("<b>SYN Flood Attack Analysis:</b> In a TCP SYN Flood, an attacker floods a target with consecutive SYN packets without responding with the final ACK. This exhausts the server's SYN backlog queue (half-open connection limit). The Automata NIDS detects this via rule sequence: q0 → q1 (SYN) → q1 (SYN) → q_alert (SYN), triggering a critical alert and rate-limiting recommendation before server crash.", body))

    # 5. IP & PORTS
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>5. IP ADDRESSING & PORT NUMBERS</b>", h1))
    ports_pdf_data = [
        [Paragraph("<b>Service</b>", body), Paragraph("<b>Port</b>", body), Paragraph("<b>Transport</b>", body), Paragraph("<b>Usage in Automata NIDS</b>", body)],
        [Paragraph("HTTP", body), Paragraph("80", body), Paragraph("TCP", body), Paragraph("Unencrypted web traffic; redirected to HTTPS.", body)],
        [Paragraph("HTTPS", body), Paragraph("443", body), Paragraph("TCP", body), Paragraph("TLS 1.3 encrypted web application traffic.", body)],
        [Paragraph("DNS", body), Paragraph("53", body), Paragraph("UDP / TCP", body), Paragraph("Resolves Vercel, Render, and Atlas hostnames.", body)],
        [Paragraph("Node.js Server", body), Paragraph("5000 / 10000", body), Paragraph("TCP", body), Paragraph("Local development (5000) & Render cloud port (10000).", body)],
        [Paragraph("MongoDB Atlas", body), Paragraph("27017", body), Paragraph("TCP", body), Paragraph("Encrypted database connection pool endpoint.", body)]
    ]
    t_ports = Table(ports_pdf_data, colWidths=[90, 70, 70, 274])
    t_ports.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e2e8f0')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_ports)

    # 6. PROTOCOLS & CONCLUSION
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>6. NETWORK PROTOCOLS & CONCLUSION</b>", h1))
    story.append(Paragraph(
        "The system incorporates HTTP/HTTPS, TCP, UDP, DNS, and REST/JSON across the complete OSI stack. "
        "By enforcing deterministic automata evaluations on raw socket header tuples, the Automata-Based NIDS bridges "
        "foundational computer networking theory with production cyber-defense engineering.", body
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated {pdf_path}")
    return pdf_path

if __name__ == '__main__':
    build_cn_docx()
    build_cn_pdf()
