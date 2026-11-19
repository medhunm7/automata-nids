import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

diagrams_dir = '/Users/medhun/.gemini/antigravity/scratch/automata-nids/Screenshots/diagrams'
os.makedirs(diagrams_dir, exist_ok=True)

# -------------------------------------------------------------
# 1. DFA State Diagram (FLAT Report Figure 1)
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 6), dpi=300)
ax.set_xlim(-0.5, 10.5)
ax.set_ylim(-1.5, 5.5)
ax.axis('off')

# Title
ax.text(0.0, 5.0, "DFA State Diagram - Automata NIDS Core", fontsize=15, fontweight='bold', family='sans-serif', color='#0f172a')
ax.text(0.0, 4.6, "States Q = { START (q0), SYN_SENT (q1), CONNECTION (q2), FAILED (q3), ALERT (qF) }", fontsize=10, color='#475569')

# Define state positions
state_coords = {
    'q0': (1.5, 2.5),
    'q1': (4.5, 3.8),
    'q2': (4.5, 1.2),
    'q3': (7.0, 2.5),
    'qF': (9.5, 2.5)
}

# Start arrow pointing into q0
ax.annotate('', xy=(1.0, 2.5), xytext=(0.1, 2.5),
            arrowprops=dict(arrowstyle="-|>", lw=2, color='#0f172a'))
ax.text(0.2, 2.7, "Start", fontsize=10, fontweight='bold', color='#0f172a')

# Draw Circles for States
for name, (x, y) in state_coords.items():
    if name == 'qF':
        # Double circle for accepting state
        circle_out = plt.Circle((x, y), 0.55, edgecolor='#dc2626', facecolor='#fee2e2', lw=2.5)
        circle_in = plt.Circle((x, y), 0.46, edgecolor='#dc2626', facecolor='#fee2e2', lw=1.5)
        ax.add_patch(circle_out)
        ax.add_patch(circle_in)
        ax.text(x, y + 0.08, "q_alert", fontsize=10, fontweight='bold', ha='center', va='center', color='#991b1b')
        ax.text(x, y - 0.18, "(ALERT)", fontsize=8, ha='center', va='center', color='#991b1b')
    else:
        circle = plt.Circle((x, y), 0.52, edgecolor='#1e293b', facecolor='#f8fafc', lw=2.0)
        ax.add_patch(circle)
        label_text = name
        sub_text = "START" if name == 'q0' else ("SYN_SENT" if name == 'q1' else ("CONN" if name == 'q2' else "FAILED"))
        ax.text(x, y + 0.08, label_text, fontsize=11, fontweight='bold', ha='center', va='center', color='#0f172a')
        ax.text(x, y - 0.16, f"({sub_text})", fontsize=7.5, ha='center', va='center', color='#475569')

# Transitions
# q0 -> q1 (SYN / PORT_SCAN)
ax.annotate('', xy=(4.05, 3.55), xytext=(1.95, 2.75),
            arrowprops=dict(arrowstyle="-|>", lw=1.8, color='#0284c7', shrinkA=0, shrinkB=0))
ax.text(2.6, 3.4, "SYN / PORT_SCAN", fontsize=8.5, color='#0369a1', fontweight='bold', rotation=20)

# q1 self loop (SYN or PORT_SCAN repeat)
loop_q1 = patches.Arc((4.5, 4.45), 0.6, 0.7, angle=0, theta1=0, theta2=280, lw=1.8, color='#0284c7')
ax.add_patch(loop_q1)
ax.annotate('', xy=(4.65, 4.3), xytext=(4.66, 4.35),
            arrowprops=dict(arrowstyle="-|>", lw=1.8, color='#0284c7'))
ax.text(4.5, 4.9, "SYN (step 1)\nPORT_SCAN (step 1,2)", fontsize=7.5, ha='center', color='#0369a1')

# q1 -> qF (3rd SYN or 4th PORT_SCAN)
ax.annotate('', xy=(9.0, 2.8), xytext=(4.95, 3.9),
            arrowprops=dict(arrowstyle="-|>", lw=1.8, color='#b91c1c', shrinkA=0, shrinkB=0))
ax.text(6.8, 3.8, "3rd SYN / 4th PORT_SCAN", fontsize=8.5, color='#b91c1c', fontweight='bold')

# q0 -> q3 (LOGIN_FAIL)
ax.annotate('', xy=(6.5, 2.5), xytext=(2.02, 2.5),
            arrowprops=dict(arrowstyle="-|>", lw=1.8, color='#ea580c', shrinkA=0, shrinkB=0))
ax.text(3.7, 2.65, "LOGIN_FAIL (1st)", fontsize=8.5, color='#c2410c', fontweight='bold')

# q3 self loop (LOGIN_FAIL 2nd, 3rd)
loop_q3 = patches.Arc((7.0, 3.15), 0.6, 0.7, angle=0, theta1=0, theta2=280, lw=1.8, color='#ea580c')
ax.add_patch(loop_q3)
ax.annotate('', xy=(7.15, 3.0), xytext=(7.16, 3.05),
            arrowprops=dict(arrowstyle="-|>", lw=1.8, color='#ea580c'))
ax.text(7.0, 3.6, "LOGIN_FAIL\n(2nd, 3rd fail)", fontsize=7.5, ha='center', color='#c2410c')

# q3 -> qF (LOGIN_SUCCESS after 3 fails)
ax.annotate('', xy=(8.95, 2.5), xytext=(7.52, 2.5),
            arrowprops=dict(arrowstyle="-|>", lw=1.8, color='#b91c1c', shrinkA=0, shrinkB=0))
ax.text(8.2, 2.65, "LOGIN_SUCCESS", fontsize=8, color='#b91c1c', fontweight='bold', ha='center')

# q0 -> q2 (CONNECT)
ax.annotate('', xy=(4.05, 1.45), xytext=(1.95, 2.25),
            arrowprops=dict(arrowstyle="-|>", lw=1.8, color='#7c3aed', shrinkA=0, shrinkB=0))
ax.text(2.6, 1.6, "CONNECT", fontsize=8.5, color='#6d28d9', fontweight='bold', rotation=-20)

# q2 -> q0 (DISCONNECT)
ax.annotate('', xy=(1.8, 2.1), xytext=(4.1, 1.05),
            arrowprops=dict(arrowstyle="-|>", lw=1.8, color='#7c3aed', linestyle='--', shrinkA=0, shrinkB=0))
ax.text(2.8, 0.9, "DISCONNECT (cycle)", fontsize=8.0, color='#6d28d9')

# q2 -> qF (5th oscillating CONNECT)
ax.annotate('', xy=(9.0, 2.2), xytext=(4.95, 1.1),
            arrowprops=dict(arrowstyle="-|>", lw=1.8, color='#b91c1c', shrinkA=0, shrinkB=0))
ax.text(6.8, 1.3, "5th CONNECT (Oscillation)", fontsize=8.5, color='#b91c1c', fontweight='bold')

# Reset arrow from qF back to q0 (Dotted)
ax.annotate('', xy=(1.5, 1.95), xytext=(9.5, 1.95),
            arrowprops=dict(arrowstyle="-|>", lw=1.6, color='#64748b', linestyle=':',
                            connectionstyle="arc3,rad=-0.35"))
ax.text(5.5, -0.65, "Threat dispatched & stored in MongoDB; Machine resets to q0",
        fontsize=9, color='#475569', ha='center', style='italic')

plt.tight_layout()
plt.savefig(os.path.join(diagrams_dir, 'dfa_state_diagram.png'), bbox_inches='tight')
plt.close()
print("Generated dfa_state_diagram.png")


# -------------------------------------------------------------
# 2. DFA Transition Diagram (Step-by-Step Port Scan & SYN Flood)
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 4.5), dpi=300)
ax.set_xlim(-0.5, 10.5)
ax.set_ylim(-0.5, 4.0)
ax.axis('off')

ax.text(0.0, 3.6, "DFA Transition Diagram - SYN Flood Detection Pattern", fontsize=14, fontweight='bold', color='#0f172a')
ax.text(0.0, 3.2, "Sequential transitions driven by incoming TCP SYN packet events without ACK completion", fontsize=9.5, color='#475569')

boxes = [
    (1.2, 1.8, "q0\n(START)", False),
    (3.8, 1.8, "q1\n(SYN_SENT 1)", False),
    (6.4, 1.8, "q1\n(SYN_SENT 2)", False),
    (9.0, 1.8, "q_alert\n(ALERT)", True)
]

for x, y, label, is_final in boxes:
    if is_final:
        rect = patches.FancyBboxPatch((x-0.75, y-0.6), 1.5, 1.2, boxstyle="round,pad=0.1",
                                      edgecolor='#dc2626', facecolor='#fee2e2', lw=2.5)
        rect_in = patches.FancyBboxPatch((x-0.65, y-0.5), 1.3, 1.0, boxstyle="round,pad=0.08",
                                         edgecolor='#dc2626', facecolor='#fee2e2', lw=1.5)
        ax.add_patch(rect)
        ax.add_patch(rect_in)
        ax.text(x, y, label, ha='center', va='center', fontsize=9.5, fontweight='bold', color='#991b1b')
    else:
        rect = patches.FancyBboxPatch((x-0.75, y-0.6), 1.5, 1.2, boxstyle="round,pad=0.1",
                                      edgecolor='#1e293b', facecolor='#f8fafc', lw=2.0)
        ax.add_patch(rect)
        ax.text(x, y, label, ha='center', va='center', fontsize=9.5, fontweight='bold', color='#0f172a')

# Start arrow
ax.annotate('', xy=(0.45, 1.8), xytext=(0.0, 1.8),
            arrowprops=dict(arrowstyle="-|>", lw=2, color='#0f172a'))
ax.text(0.0, 2.1, "Start", fontsize=9, fontweight='bold')

# Transitions between boxes
ax.annotate('', xy=(3.05, 1.8), xytext=(1.95, 1.8),
            arrowprops=dict(arrowstyle="-|>", lw=2, color='#0284c7'))
ax.text(2.5, 2.15, "1st SYN", fontsize=9, fontweight='bold', ha='center', color='#0369a1')

ax.annotate('', xy=(5.65, 1.8), xytext=(4.55, 1.8),
            arrowprops=dict(arrowstyle="-|>", lw=2, color='#0284c7'))
ax.text(5.1, 2.15, "2nd SYN", fontsize=9, fontweight='bold', ha='center', color='#0369a1')

ax.annotate('', xy=(8.25, 1.8), xytext=(7.15, 1.8),
            arrowprops=dict(arrowstyle="-|>", lw=2, color='#b91c1c'))
ax.text(7.7, 2.15, "3rd SYN", fontsize=9, fontweight='bold', ha='center', color='#b91c1c')

# Reset rule note
ax.text(5.1, 0.6, "Normal ACK or FIN packet: resets FSM sequence back to q0 (START)\nAlert condition triggered when sequence reaches q_alert; Security incident recorded in database",
        ha='center', fontsize=9, color='#475569', style='italic')

plt.tight_layout()
plt.savefig(os.path.join(diagrams_dir, 'dfa_transition_diagram.png'), bbox_inches='tight')
plt.close()
print("Generated dfa_transition_diagram.png")


# -------------------------------------------------------------
# 3. Network Topology Diagram (CN Report Figure 1)
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(12, 5.5), dpi=300)
ax.set_xlim(-0.5, 12.5)
ax.set_ylim(-0.8, 6.0)
ax.axis('off')

# Banner Header
header_rect = patches.FancyBboxPatch((1.5, 5.2), 9.0, 0.7, boxstyle="round,pad=0.08",
                                     edgecolor='#0284c7', facecolor='#0284c7', lw=1.5)
ax.add_patch(header_rect)
ax.text(6.0, 5.55, "AUTOMATA NIDS - NETWORK TOPOLOGY & CLOUD DEPLOYMENT",
        fontsize=12, fontweight='bold', color='#ffffff', ha='center', va='center')

# Components
nodes = [
    (1.0, 2.8, "CLIENT PC\n(Web Browser)\n192.168.1.10", '#eff6ff', '#1d4ed8'),
    (3.2, 2.8, "LAN SWITCH\n(Layer 2)\nAccess Network", '#f8fafc', '#475569'),
    (5.4, 2.8, "DEFAULT GATEWAY\n(Router Layer 3)\n192.168.1.1", '#f0fdf4', '#16a34a'),
    (7.6, 2.8, "INTERNET\n(Public WAN)\nCloud Edge", '#fdf4ff', '#9333ea'),
    (10.2, 4.0, "FRONTEND HOST\n(Vercel Edge / CDN)\nautomata-nids.vercel.app", '#ecfeff', '#0891b2'),
    (10.2, 2.0, "APPLICATION SERVER\n(Render Web Service)\nNode.js + Express API", '#eff6ff', '#2563eb'),
    (10.2, -0.1, "DATABASE CLUSTER\n(MongoDB Atlas Cloud)\nmedhun5.avzjiol.mongodb.net", '#f0fdf4', '#059669')
]

for x, y, text, fc, ec in nodes:
    box = patches.FancyBboxPatch((x-0.9, y-0.6), 1.8, 1.2, boxstyle="round,pad=0.1",
                                edgecolor=ec, facecolor=fc, lw=2.0)
    ax.add_patch(box)
    ax.text(x, y, text, ha='center', va='center', fontsize=8.0, fontweight='bold', color='#0f172a')

# Communication Links
# Client -> Switch
ax.annotate('', xy=(2.3, 2.8), xytext=(1.9, 2.8), arrowprops=dict(arrowstyle="<->", lw=2, color='#1e293b'))
ax.text(2.1, 3.1, "Ethernet\nCat-6", fontsize=7.5, ha='center', color='#475569')

# Switch -> Router
ax.annotate('', xy=(4.5, 2.8), xytext=(4.1, 2.8), arrowprops=dict(arrowstyle="<->", lw=2, color='#1e293b'))
ax.text(4.3, 3.1, "FastEthernet\n100 Mbps", fontsize=7.5, ha='center', color='#475569')

# Router -> Internet
ax.annotate('', xy=(6.7, 2.8), xytext=(6.3, 2.8), arrowprops=dict(arrowstyle="<->", lw=2, color='#16a34a'))
ax.text(6.5, 3.1, "WAN Fiber\nISP Uplink", fontsize=7.5, ha='center', color='#16a34a')

# Internet -> Vercel Frontend
ax.annotate('', xy=(9.3, 3.9), xytext=(8.5, 3.1), arrowprops=dict(arrowstyle="<->", lw=2, color='#0891b2'))
ax.text(8.7, 3.8, "HTTPS / 443\nTLS 1.3", fontsize=7.5, color='#0891b2', fontweight='bold')

# Vercel Frontend -> Render Backend (REST API)
ax.annotate('', xy=(10.2, 2.6), xytext=(10.2, 3.4), arrowprops=dict(arrowstyle="<->", lw=2, color='#2563eb'))
ax.text(10.7, 3.0, "Axios REST\nCORS / JWT", fontsize=7.5, color='#2563eb', fontweight='bold')

# Render Backend -> MongoDB Atlas
ax.annotate('', xy=(10.2, 0.5), xytext=(10.2, 1.4), arrowprops=dict(arrowstyle="<->", lw=2, color='#059669'))
ax.text(10.8, 0.95, "mongodb+srv\nTLS / TCP 27017", fontsize=7.5, color='#059669', fontweight='bold')

plt.tight_layout()
plt.savefig(os.path.join(diagrams_dir, 'network_topology.png'), bbox_inches='tight')
plt.close()
print("Generated network_topology.png")


# -------------------------------------------------------------
# 4. TCP Three-Way Handshake & State Transition (CN Report Figure 2)
# -------------------------------------------------------------
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5.5), dpi=300)

# (b) TCP Handshake
ax1.set_xlim(-0.5, 6.5)
ax1.set_ylim(-0.5, 6.5)
ax1.axis('off')

ax1.text(3.0, 6.2, "(b) TCP Three-Way Handshake (Connection Establishment)",
         fontsize=10.5, fontweight='bold', ha='center', color='#0f172a')

# Client & Server Hosts
client_box = patches.FancyBboxPatch((0.2, 4.8), 1.6, 0.9, boxstyle="round,pad=0.1",
                                    edgecolor='#2563eb', facecolor='#eff6ff', lw=2)
ax1.add_patch(client_box)
ax1.text(1.0, 5.25, "Client Host\n(Port: 52134)", fontsize=8.5, fontweight='bold', ha='center', color='#1e40af')

server_box = patches.FancyBboxPatch((4.2, 4.8), 1.6, 0.9, boxstyle="round,pad=0.1",
                                    edgecolor='#0284c7', facecolor='#ecfeff', lw=2)
ax1.add_patch(server_box)
ax1.text(5.0, 5.25, "Render Server\n(Port: 443)", fontsize=8.5, fontweight='bold', ha='center', color='#0369a1')

# Lifelines
ax1.plot([1.0, 1.0], [0.8, 4.8], color='#64748b', lw=1.5, linestyle='--')
ax1.plot([5.0, 5.0], [0.8, 4.8], color='#64748b', lw=1.5, linestyle='--')

# 1. SYN
ax1.annotate('', xy=(5.0, 3.8), xytext=(1.0, 4.3),
             arrowprops=dict(arrowstyle="-|>", lw=2, color='#2563eb'))
ax1.text(3.0, 4.25, "1. SYN (Seq = x)\n[Half-Open Request]", fontsize=8, ha='center', color='#1d4ed8', fontweight='bold')

# 2. SYN + ACK
ax1.annotate('', xy=(1.0, 2.7), xytext=(5.0, 3.3),
             arrowprops=dict(arrowstyle="-|>", lw=2, color='#0284c7'))
ax1.text(3.0, 3.15, "2. SYN + ACK (Seq = y, Ack = x + 1)\n[Server Acknowledgment]", fontsize=8, ha='center', color='#0369a1', fontweight='bold')

# 3. ACK
ax1.annotate('', xy=(5.0, 1.6), xytext=(1.0, 2.2),
             arrowprops=dict(arrowstyle="-|>", lw=2, color='#059669'))
ax1.text(3.0, 2.05, "3. ACK (Ack = y + 1)\n[Connection Established]", fontsize=8, ha='center', color='#047857', fontweight='bold')

# State summaries
ax1.text(1.0, 0.3, "Client State:\nCLOSED -> SYN-SENT\n-> ESTABLISHED", fontsize=7.5, ha='center', color='#334155')
ax1.text(5.0, 0.3, "Server State:\nLISTEN -> SYN-RECEIVED\n-> ESTABLISHED", fontsize=7.5, ha='center', color='#334155')


# (c) TCP State Transition Diagram
ax2.set_xlim(-0.5, 6.5)
ax2.set_ylim(-0.5, 6.5)
ax2.axis('off')

ax2.text(3.0, 6.2, "(c) TCP State Transition Diagram",
         fontsize=10.5, fontweight='bold', ha='center', color='#0f172a')

# Client side states
ax2.text(1.5, 5.7, "Client (Active Open)", fontsize=9, fontweight='bold', ha='center', color='#2563eb')
client_states = [
    (1.5, 4.9, "CLOSED"),
    (1.5, 3.3, "SYN-SENT"),
    (1.5, 1.7, "ESTABLISHED")
]
for x, y, name in client_states:
    c = patches.Ellipse((x, y), 1.6, 0.7, edgecolor='#2563eb', facecolor='#eff6ff', lw=1.8)
    ax2.add_patch(c)
    ax2.text(x, y, name, ha='center', va='center', fontsize=8, fontweight='bold', color='#1e40af')

ax2.annotate('', xy=(1.5, 3.65), xytext=(1.5, 4.55), arrowprops=dict(arrowstyle="-|>", lw=1.5, color='#2563eb'))
ax2.text(1.55, 4.1, "Send SYN", fontsize=7.5, color='#1e40af')

ax2.annotate('', xy=(1.5, 2.05), xytext=(1.5, 2.95), arrowprops=dict(arrowstyle="-|>", lw=1.5, color='#2563eb'))
ax2.text(1.55, 2.5, "Rcv SYN+ACK,\nSend ACK", fontsize=7, color='#1e40af')

# Server side states
ax2.text(4.5, 5.7, "Server (Passive Open)", fontsize=9, fontweight='bold', ha='center', color='#0284c7')
server_states = [
    (4.5, 4.9, "LISTEN"),
    (4.5, 3.3, "SYN-RECEIVED"),
    (4.5, 1.7, "ESTABLISHED")
]
for x, y, name in server_states:
    c = patches.Ellipse((x, y), 1.7, 0.7, edgecolor='#0284c7', facecolor='#ecfeff', lw=1.8)
    ax2.add_patch(c)
    ax2.text(x, y, name, ha='center', va='center', fontsize=8, fontweight='bold', color='#0369a1')

ax2.annotate('', xy=(4.5, 3.65), xytext=(4.5, 4.55), arrowprops=dict(arrowstyle="-|>", lw=1.5, color='#0284c7'))
ax2.text(4.55, 4.1, "Rcv SYN", fontsize=7.5, color='#0369a1')

ax2.annotate('', xy=(4.5, 2.05), xytext=(4.5, 2.95), arrowprops=dict(arrowstyle="-|>", lw=1.5, color='#0284c7'))
ax2.text(4.55, 2.5, "Send SYN+ACK,\nRcv ACK", fontsize=7, color='#0369a1')

# Dividing line
ax2.plot([3.0, 3.0], [1.0, 5.5], color='#cbd5e1', lw=1.2, linestyle=':')

plt.tight_layout()
plt.savefig(os.path.join(diagrams_dir, 'tcp_handshake_state.png'), bbox_inches='tight')
plt.close()
print("Generated tcp_handshake_state.png")


# -------------------------------------------------------------
# 5. Full Stack System Architecture (FSWD Report Figure 1)
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(11, 7.5), dpi=300)
ax.set_xlim(-0.5, 10.5)
ax.set_ylim(-0.5, 9.5)
ax.axis('off')

ax.text(5.0, 9.1, "AUTOMATA NIDS - FULL STACK SYSTEM ARCHITECTURE",
        fontsize=13, fontweight='bold', color='#0f172a', ha='center')

# Tier 1: Client Tier
tier1 = patches.FancyBboxPatch((0.5, 6.7), 9.0, 1.9, boxstyle="round,pad=0.1",
                               edgecolor='#0284c7', facecolor='#f0f9ff', lw=2)
ax.add_patch(tier1)
ax.text(5.0, 8.3, "CLIENT TIER: REACT 18 + VITE + TAILWIND CSS (Hosted on Vercel Edge)",
        fontsize=10, fontweight='bold', color='#0369a1', ha='center')

c_boxes = [
    (1.9, 7.3, "Dashboard\n(Recharts Telemetry)"),
    (3.9, 7.3, "Security Alerts\n(Triage Console)"),
    (5.9, 7.3, "Log Ingestion\n(CSV / TXT / JSON)"),
    (7.9, 7.3, "FSM Simulator\n(Node Visualizer)")
]
for x, y, txt in c_boxes:
    b = patches.FancyBboxPatch((x-0.8, y-0.4), 1.6, 0.8, boxstyle="round,pad=0.08",
                               edgecolor='#0284c7', facecolor='#ffffff', lw=1.2)
    ax.add_patch(b)
    ax.text(x, y, txt, ha='center', va='center', fontsize=7.5, color='#0f172a', fontweight='bold')

# Arrow Tier 1 -> Tier 2
ax.annotate('', xy=(5.0, 5.8), xytext=(5.0, 6.7), arrowprops=dict(arrowstyle="<->", lw=2, color='#1e293b'))
ax.text(5.1, 6.25, "HTTPS REST API (Axios + JWT Authentication)", fontsize=8.5, color='#1e293b', fontweight='bold')

# Tier 2: Server Tier
tier2 = patches.FancyBboxPatch((0.5, 2.5), 9.0, 3.3, boxstyle="round,pad=0.1",
                               edgecolor='#2563eb', facecolor='#eff6ff', lw=2)
ax.add_patch(tier2)
ax.text(5.0, 5.5, "APPLICATION SERVER TIER: NODE.JS + EXPRESS (Hosted on Render Cloud)",
        fontsize=10, fontweight='bold', color='#1d4ed8', ha='center')

s_boxes = [
    (1.8, 4.6, "Express Routes\n/upload, /events,\n/alerts, /dashboard"),
    (3.8, 4.6, "JWT Security\nBcrypt Hashing,\nRole Guard (Auth)"),
    (5.8, 4.6, "Log Stream Parser\nMulter + csv-parser\nNormalized Tuples"),
    (7.8, 4.6, "Report Engine\nForensic CSV &\nPDF Generation")
]
for x, y, txt in s_boxes:
    b = patches.FancyBboxPatch((x-0.8, y-0.5), 1.6, 1.0, boxstyle="round,pad=0.08",
                               edgecolor='#2563eb', facecolor='#ffffff', lw=1.2)
    ax.add_patch(b)
    ax.text(x, y, txt, ha='center', va='center', fontsize=7.2, color='#0f172a', fontweight='bold')

# Automata Engine Inside Tier 2
auto_box = patches.FancyBboxPatch((1.0, 2.7), 8.0, 1.2, boxstyle="round,pad=0.08",
                                  edgecolor='#dc2626', facecolor='#fef2f2', lw=1.8)
ax.add_patch(auto_box)
ax.text(5.0, 3.6, "AUTOMATA ENGINE CORE (server/automata/)", fontsize=9, fontweight='bold', color='#991b1b', ha='center')
ax.text(5.0, 3.1, "Deterministic Finite State Machine (M = Q, Sigma, delta, q0, F)\nActive Rules: SYN Flood (q0->q1->q1->qF) | Brute Force (q0->q3->q3->q3->qF) | Port Scan | Oscillation",
        fontsize=7.5, color='#7f1d1d', ha='center')

# Arrow Tier 2 -> Tier 3
ax.annotate('', xy=(5.0, 1.6), xytext=(5.0, 2.5), arrowprops=dict(arrowstyle="<->", lw=2, color='#16a34a'))
ax.text(5.1, 2.05, "Mongoose ODM / TLS Connection Pool (TCP 27017)", fontsize=8.5, color='#15803d', fontweight='bold')

# Tier 3: Database Tier
tier3 = patches.FancyBboxPatch((0.5, 0.1), 9.0, 1.5, boxstyle="round,pad=0.1",
                               edgecolor='#16a34a', facecolor='#f0fdf4', lw=2)
ax.add_patch(tier3)
ax.text(5.0, 1.3, "DATABASE TIER: MONGODB ATLAS CLUSTER (Cloud Replica Set)",
        fontsize=10, fontweight='bold', color='#15803d', ha='center')

db_boxes = [
    (2.3, 0.6, "users Collection\nAnalyst & Admin Credentials"),
    (5.0, 0.6, "networkevents Collection\nNormalized Traffic Ingests"),
    (7.7, 0.6, "alerts Collection\nConfirmed Threat Incidents")
]
for x, y, txt in db_boxes:
    b = patches.FancyBboxPatch((x-1.1, y-0.35), 2.2, 0.7, boxstyle="round,pad=0.08",
                               edgecolor='#16a34a', facecolor='#ffffff', lw=1.2)
    ax.add_patch(b)
    ax.text(x, y, txt, ha='center', va='center', fontsize=7.5, color='#0f172a', fontweight='bold')

plt.tight_layout()
plt.savefig(os.path.join(diagrams_dir, 'system_architecture.png'), bbox_inches='tight')
plt.close()
print("Generated system_architecture.png")
