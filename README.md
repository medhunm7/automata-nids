# Automata-Based Network Intrusion Detection System (NIDS)

[![CI/CD Pipeline](https://github.com/username/automata-nids/actions/workflows/node.yml/badge.svg)](https://github.com/username/automata-nids/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20%7C%2020%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Render](https://img.shields.io/badge/Deploy-Render-46e3b7.svg)](https://render.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

A modern, full-stack cybersecurity web platform that inspects network communication streams and detects multi-stage intrusion patterns using formal **Deterministic Finite Automata (DFA)**. Built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB, completely configured for automated CI/CD and production deployment on **Render** (Backend) and **Vercel** (Frontend).

---

## Table of Contents
1. [Project Description](#1-project-description)
2. [Features](#2-features)
3. [Technology Stack](#3-technology-stack)
4. [Folder Structure](#4-folder-structure)
5. [Local Installation](#5-local-installation)
6. [Environment Variables](#6-environment-variables)
7. [GitHub Setup](#7-github-setup)
8. [MongoDB Setup](#8-mongodb-setup)
9. [Render Deployment (Backend)](#9-render-deployment-backend)
10. [Vercel Deployment (Frontend)](#10-vercel-deployment-frontend)
11. [Screenshots Section](#11-screenshots-section)
12. [API Endpoints](#12-api-endpoints)
13. [Future Enhancements](#13-future-enhancements)
14. [License](#14-license)

---

## 1. Project Description
Conventional network firewalls inspect packets statelessly in isolation, failing to recognize complex attacks that unfold sequentially across multiple packet steps. Conversely, deep learning anomaly detectors introduce excessive computational latency, consume heavy resources, and suffer from unpredictable false positives that confuse security teams.

This project bridges that gap by implementing a mathematically rigorous **Deterministic Finite Automaton (DFA)**:

$$M = (Q, \Sigma, \delta, q_0, F)$$

- **Finite States ($Q$):** `START` ($q_0$), `SYN_SENT` ($q_1$), `CONNECTION` ($q_2$), `FAILED` ($q_3$), `ALERT` ($q_F$)
- **Input Alphabet ($\Sigma$):** `{SYN, ACK, FIN, CONNECT, DISCONNECT, LOGIN_FAIL, LOGIN_SUCCESS, PORT_SCAN, DATA}`
- **Transition Function ($\delta$):** $Q \times \Sigma \to Q$ deterministic state transition mapping.
- **Initial State ($q_0$):** `START` (quiescent baseline traffic).
- **Accepting States ($F$):** `{ALERT}` (drives instantaneous threat dispatch).

Whenever a sequence of network packet actions drives the automaton to the accepting state $q_F \in F$, an intrusion alert is automatically raised with full state trace telemetry, forensic logs, severity scoring, and actionable remediation countermeasures.

---

## 2. Features

- **JWT Authentication & RBAC:** Secure registration and login with salted `bcrypt` password hashing, JWT bearer authorization, and role management (`admin`, `analyst`, `auditor`). Demo accounts provided for quick testing.
- **Real-Time Surveillance Dashboard:** Stat cards (Total Packets, Verified Safe, Suspicious Flagged, Detection Accuracy %), Live Recharts Area chart, Protocol Donut chart, Severity Bar chart, and FSM Engine Status monitor.
- **Multi-Format Log Ingestion:** Drag-and-drop file ingestion supporting **CSV**, **TXT**, and **JSON** files with instantaneous FSM state analysis. One-click sample file download buttons included in the UI.
- **4 Formal Intrusion Automata Rules:**
  1. **Possible SYN Flood Attack (`RULE_SYN_FLOOD`):**
     $$\text{START} \xrightarrow{\text{SYN}} \text{SYN\_SENT} \xrightarrow{\text{SYN}} \text{SYN\_SENT} \xrightarrow{\text{SYN}} \text{ALERT}$$
     *Severity:* `Critical` | Rapid successive SYN flags without handshake completion.
  2. **Brute Force Attack (`RULE_BRUTE_FORCE`):**
     $$\text{START} \xrightarrow{\text{LOGIN\_FAIL}} \text{FAILED} \xrightarrow{\text{LOGIN\_FAIL}} \text{FAILED} \xrightarrow{\text{LOGIN\_FAIL}} \text{FAILED} \xrightarrow{\text{LOGIN\_SUCCESS}} \text{ALERT}$$
     *Severity:* `Critical` | 3 consecutive authentication failures followed by login success.
  3. **Port Scanning Attack (`RULE_PORT_SCAN`):**
     $$\text{START} \xrightarrow{\text{PORT\_SCAN}} \text{SYN\_SENT} \xrightarrow{\text{PORT\_SCAN}} \text{SYN\_SENT} \xrightarrow{\text{PORT\_SCAN}} \text{SYN\_SENT} \xrightarrow{\text{PORT\_SCAN}} \text{ALERT}$$
     *Severity:* `High` | 4 sequential rapid probes across dynamic destination ports.
  4. **Abnormal Connection Pattern (`RULE_ABNORMAL_CONN`):**
     $$\text{START} \xrightarrow{\text{CONNECT}} \text{CONNECTION} \xrightarrow{\text{DISCONNECT}} \text{START} \xrightarrow{\text{CONNECT}} \text{CONNECTION} \xrightarrow{\text{DISCONNECT}} \text{START} \xrightarrow{\text{CONNECT}} \text{ALERT}$$
     *Severity:* `Medium` | Rapid connection/teardown oscillation indicating keepalive evasion or slowloris beaconing.
- **Security Alerts Console:** Filter by severity (`Critical`, `High`, `Medium`, `Low`), multi-column search, date filter, sortable columns, CSV export, and alert dismissal (`DELETE /alerts/:id`).
- **Interactive Automata Simulator:** Interactive visual sandbox where users can click input symbols (`+SYN`, `+LOGIN_FAIL`, etc.) or load presets to observe live state transitions on an animated SVG state diagram.
- **Deep-Dive Traffic Analytics:** Visualizes protocol volume distributions (TCP, UDP, HTTP, HTTPS, FTP, SSH, DNS, SMTP), temporal trends (Daily, Weekly, Monthly), top attacking source IPs, and top targeted destination ports.
- **Audit-Ready PDF Reports:** Generate and download forensic PDF reports directly on the client (using `jspdf` & `jspdf-autotable`) or stream from the backend (using `pdfkit`).
- **Production Optimizations:** Security headers via `helmet`, HTTP response compression via `compression`, dynamic CORS support for Render/Vercel, dedicated health check (`GET /health`), and centralized error/404 handling.

---

## 3. Technology Stack

### Frontend
- **React 18** + **Vite 5** (Fast HMR and optimized production bundles)
- **Tailwind CSS 3** (Custom cyber theme, glassmorphism, glowing neon borders)
- **React Router 6** (SPA routing with protected routes)
- **Axios** (Configured with dynamic base URL and JWT request interceptors)
- **Recharts 2** (AreaChart, BarChart, PieChart, LineChart)
- **Lucide React** (Vector cybersecurity icon system)
- **jsPDF & jsPDF-AutoTable** (Client-side forensic PDF generation)

### Backend
- **Node.js** + **Express.js** (MVC architecture)
- **MongoDB** + **Mongoose ODM** (With resilient in-memory fallback store)
- **JSON Web Tokens (JWT)** + **bcryptjs** (Authentication & hashing)
- **Multer** + **csv-parser** (Log file ingestion & stream parsing)
- **Helmet** + **Compression** (Security headers & response compression)
- **PDFKit** (Server-side forensic PDF document rendering)

### DevOps & Deployment
- **Render** (Backend Node.js Web Service)
- **Vercel** (Frontend React SPA Hosting with edge rewrites)
- **GitHub Actions** (Continuous Integration & automated build/test workflow)

---

## 4. Folder Structure

```
automata-nids/
├── .github/
│   └── workflows/
│       └── node.yml                  # CI/CD automated test & build workflow
├── render.yaml                       # Render Infrastructure-as-Code Blueprint
├── vercel.json                       # Root Vercel deployment & rewrite config
├── package.json                      # Root orchestrator scripts
├── .gitignore                        # Git exclusion rules
├── README.md                         # Project documentation
├── Documentation/                    # Academic Capstone Documentation
│   ├── 01_Problem_Statement.md
│   ├── 02_System_Architecture.md
│   ├── 03_Data_Flow_Diagrams_DFD.md  # Level 0, 1, 2 DFDs
│   ├── 04_Use_Case_Diagram.md
│   ├── 05_ER_Diagram.md
│   ├── 06_Database_Schema.md
│   ├── 07_Flowchart.md
│   ├── 08_Algorithm.md               # O(n) pseudocode & complexity
│   ├── 09_Finite_Automata_Explanation.md # Formal 5-tuple, proofs, transition tables
│   ├── 10_Testing.md                 # Test matrix & automated verification
│   ├── 11_Future_Enhancements.md
│   ├── 12_Conclusion.md
│   └── sql/
│       ├── schema.sql                # Relational SQL schema with views
│       └── seed.sql                  # Relational sample dataset
├── Screenshots/                      # UI documentation placeholders
│   ├── README.md
│   └── *.png.placeholder
├── server/                           # Backend Application
│   ├── package.json
│   ├── server.js                     # Express entry point, helmet, compression
│   ├── .env.example                  # Backend environment template
│   ├── automata/                     # Finite State Machine Core
│   │   ├── FSM.js                    # FiniteStateMachine class
│   │   ├── rules.js                  # 4 Intrusion Grammar Rules
│   │   ├── detector.js               # Stream coordinator & metrics
│   │   └── __tests__/automata.test.js # Standalone unit tests (5/5 passed)
│   ├── config/db.js                  # MongoDB Mongoose & resilient fallback
│   ├── controllers/                  # auth, event, alert, dashboard, report
│   ├── middleware/                   # JWT auth, Multer upload
│   ├── models/                       # User, NetworkEvent, Alert
│   ├── routes/                       # REST endpoints
│   ├── utils/                        # logParser, sampleData, seeder
│   └── data/                         # Downloadable sample CSV, JSON, TXT
└── client/                           # Frontend React Application
    ├── package.json
    ├── vite.config.js                # Vite build configuration & proxy
    ├── vercel.json                   # Client SPA routing rewrite rules
    ├── tailwind.config.js            # Tailwind cybersecurity theme
    ├── index.html                    # Application HTML shell
    ├── .env.example                  # Frontend environment template
    └── src/
        ├── App.jsx                   # Route provider & protected layouts
        ├── main.jsx                  # React DOM root entry
        ├── index.css                 # Glassmorphic utilities & animations
        ├── api/axios.js              # Base URL resolver & JWT interceptor
        ├── context/                  # AuthContext & ThemeContext
        ├── components/               # Navbar, Sidebar, FsmVisualizer, StatCard, etc.
        ├── pages/                    # Dashboard, Alerts, Upload, Analytics,
        │                             # Events, AutomataSimulator, Reports, Auth
        └── utils/exportPdf.js        # Client-side PDF generation
```

---

## 5. Local Installation

### Prerequisites
- **Node.js** (v18.x or v20.x recommended)
- **npm** (v9.x or higher)
- **MongoDB** (Optional: the backend automatically engages its in-memory document store if MongoDB is not running locally).

### Step 1: Clone Repository & Navigate
```bash
git clone https://github.com/<USERNAME>/<REPOSITORY>.git
cd automata-nids
```

### Step 2: Install Dependencies
```bash
# Install root, server, and client dependencies in one command
npm run install:all
```

### Step 3: Configure Environment Files
```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

### Step 4: Run Development Servers
```bash
# Concurrently starts Express backend (port 5000) and Vite frontend (port 5173)
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

### Pre-Configured Demo Credentials:
- **Administrator:** `admin@nids.local` / `Admin@12345`
- **Analyst:** `analyst@nids.local` / `Analyst@12345`
*(Clickable demo autofill buttons are available on the login page).*

### Step 5: Run Automated Tests
```bash
# Run Automata Engine unit tests
npm run test:automata

# Run End-to-End API integration tests
node server/__tests__/api.test.js
```

---

## 6. Environment Variables

### Backend Configuration (`server/.env.example`)
```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/automata_nids?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```
- `MONGO_URI`: MongoDB connection string (supports local MongoDB or cloud MongoDB Atlas).
- `JWT_SECRET`: Secret key used for signing and verifying JSON Web Tokens.
- `PORT`: Port on which Express listens (Render provides this automatically in production).

### Frontend Configuration (`client/.env.example`)
```env
VITE_API_URL=https://your-render-backend.onrender.com
```
- `VITE_API_URL`: Fully qualified URL of the deployed Render backend (without trailing slash). Leave unset or set to `http://localhost:5000` during local development.

---

## 7. GitHub Setup

Follow these exact steps to push this project to your GitHub account:

### Step 1: Create a New GitHub Repository
1. Log into your account on [GitHub](https://github.com).
2. Click **New Repository**.
3. Name it `automata-nids` (or your preferred name).
4. Keep it **Public** or **Private**. Do **not** initialize with README or .gitignore (this project already includes them).

### Step 2: Add Remote and Push
Run the following commands in the project directory:

```bash
git remote add origin https://github.com/<USERNAME>/<REPOSITORY>.git
git branch -M main
git push -u origin main
```
*(Replace `<USERNAME>` and `<REPOSITORY>` with your GitHub username and repository name).*

---

## 8. MongoDB Setup (MongoDB Atlas Cloud)

For production deployment on Render, use a free cloud database on **MongoDB Atlas**:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Click **Build a Database** and select the **M0 Free Cluster**.
3. Under **Security Quickstart**:
   - **Authentication:** Create a Database User (e.g. username `nids_user`, choose a strong password).
   - **Network Access:** Add IP Address `0.0.0.0/0` (Allow Access from Anywhere, required for Render's dynamic outbound IPs).
4. Click **Connect** &rarr; **Drivers** &rarr; **Node.js**.
5. Copy the connection string format:
   ```
   mongodb+srv://nids_user:<password>@cluster0.mongodb.net/automata_nids?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your database user password. Use this as your `MONGO_URI` on Render.

> **Resilient Fallback Note:** If MongoDB Atlas is not configured or connection is temporarily interrupted, the system automatically falls back to its built-in in-memory document store. All APIs and Automata detection remain 100% functional.

---

## 9. Render Deployment (Backend)

Deploy the Express backend as a Web Service on Render:

### Method A: Deploy via Render Web UI (Recommended)
1. Sign in to [Render](https://render.com).
2. Click **New +** &rarr; **Web Service**.
3. Connect your GitHub repository.
4. Configure the service settings:
   - **Name:** `automata-nids-backend`
   - **Region:** Choose closest region (e.g., `Oregon (US West)` or `Frankfurt`)
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **Advanced** and add the following **Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (or leave default, Render sets this automatically) |
   | `MONGO_URI` | *Your MongoDB Atlas connection string* |
   | `JWT_SECRET` | *A random secure 32+ character string* |
   | `CLIENT_URL` | `https://your-frontend-app.vercel.app` *(update once Vercel is deployed)* |
6. Set **Health Check Path** to:
   ```
   /health
   ```
7. Click **Create Web Service**.
8. Once deployment completes, note your backend URL (e.g., `https://automata-nids-backend.onrender.com`).
9. Test the health endpoint in your browser:
   `https://automata-nids-backend.onrender.com/health` &rarr; Returns `{"status":"OK"}`.

### Method B: Deploy via Render Blueprint (`render.yaml`)
1. Click **New +** &rarr; **Blueprint**.
2. Select your repository. Render automatically reads `render.yaml` from the root and provisions the backend web service.
3. Fill in your `MONGO_URI` value in the prompt.

---

## 10. Vercel Deployment (Frontend)

Deploy the React + Vite frontend on Vercel:

### Step-by-Step Vercel Guide:
1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** &rarr; **Project**.
3. Import your GitHub repository (`automata-nids`).
4. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `client` *(or leave as root; both are supported via `vercel.json`)*.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://your-render-backend.onrender.com` |
   *(Ensure there is NO trailing slash).*
6. Click **Deploy**.
7. Vercel will build and assign a production URL (e.g., `https://automata-nids.vercel.app`).
8. **Final Step:** Copy your Vercel URL and update the `CLIENT_URL` environment variable on Render, then trigger a quick redeploy on Render to ensure strict CORS synchronization.

### Optional: Custom Domains on Vercel
1. Go to your Vercel Project Settings &rarr; **Domains**.
2. Enter your custom domain (e.g., `nids.yourdomain.com`).
3. Add the generated `CNAME` record in your DNS provider (Cloudflare, GoDaddy, Namecheap).

---

## 11. Screenshots Section

Visual placeholders and reference specifications are cataloged in [`Screenshots/`](Screenshots/):

| Screenshot | File | Description |
| :--- | :--- | :--- |
| **01** | `01_dashboard_telemetry.png` | Real-time surveillance dashboard with metrics, live traffic area chart, and protocol share. |
| **02** | `02_automata_engine_status.png` | Deterministic Finite Automaton (DFA) state diagram showing live state node paths. |
| **03** | `03_alerts_management_console.png` | Security alerts table with severity badges, multi-column search, and CSV export. |
| **04** | `04_log_file_upload.png` | Multi-format log ingestion interface (CSV, TXT, JSON) with real-time parsed results. |
| **05** | `05_traffic_analytics_recharts.png` | Deep-dive statistical Recharts analytics (Protocol volumes, Daily/Weekly/Monthly trends). |
| **06** | `06_automata_interactive_simulator.png` | Interactive FSM test sandbox with active node pulsing and input alphabet injection. |
| **07** | `07_pdf_forensic_report.png` | Generated college assessment forensic PDF report with summary, tables, and mitigation steps. |

---

## 12. API Endpoints

The backend supports both `/api/*` and root-level REST routes:

| HTTP Method | Route | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Render health check probe (returns `{"status":"OK"}`) | No |
| `GET` | `/api/health` | Comprehensive system & database diagnostic telemetry | No |
| `POST` | `/login` / `/api/login` | Authenticate analyst with email & password, returns JWT | No |
| `POST` | `/register` / `/api/register` | Register new security operator | No |
| `GET` | `/api/me` | Retrieve profile of authenticated analyst | Yes (Bearer) |
| `POST` | `/upload` / `/api/upload` | Ingest CSV, TXT, or JSON logs for FSM analysis | No / Optional |
| `GET` | `/events` / `/api/events` | List network events with pagination, protocol, & search filters | No / Optional |
| `POST` | `/events/simulate` | Inject test packet into the live Automata Engine | No / Optional |
| `GET` | `/events/download/sample/:format` | Download pre-generated sample traffic (`csv`, `json`, `txt`) | No |
| `GET` | `/alerts` / `/api/alerts` | Query alerts (search, filter by severity, sort by timestamp) | No / Optional |
| `GET` | `/alerts/:id` | Retrieve detailed forensic alert dossier with state trace | No / Optional |
| `DELETE` | `/alerts/:id` | Prune / dismiss alert from database | No / Optional |
| `GET` | `/alerts/export/csv` | Download complete alerts roster as CSV file | No / Optional |
| `GET` | `/dashboard` / `/api/dashboard` | Aggregated surveillance telemetry, trends, and charts data | No / Optional |
| `GET` | `/report/pdf` / `/api/report/pdf` | Stream server-generated PDF forensic report | No / Optional |

---

## 13. Future Enhancements

1. **Timed Automata (Alur-Dill Model):** Augment state transitions with real-valued clocks to enforce explicit timing constraints (e.g. 3 SYN packets within $\Delta t \le 200\text{ms}$).
2. **Nondeterministic Finite Automata (NFA):** Model overlapping attack signatures with $\epsilon$-transitions, converting to minimal DFAs using the Powerset Construction.
3. **Active IPS Mitigation (Preventive Mode):** Dynamically invoke OS-level firewall commands (`iptables` / `nftables` / AWS Security Groups) upon reaching state `ALERT`.
4. **Physical Packet Capture:** Integrate `libpcap` native C bindings in Node.js for live promiscuous mode packet sniffing from network interfaces.
5. **Distributed FSM Synchronization:** Scale session state machines horizontally across clustered nodes using Redis Pub/Sub or Apache Kafka.

---

## 14. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details. Open-source and suitable for academic capstone assessments and enterprise evaluations.
