# System Architecture: Automata-Based NIDS

## 1. Architectural Overview
The system follows a modular 3-tier Full-Stack Model-View-Controller (MVC) architecture with an embedded Finite Automata Processing Engine.

```
+-------------------------------------------------------------------------+
|                           CLIENT TIER (React + Vite)                    |
|  - Dashboard Console      - Security Alerts Grid    - Log Ingestion UI  |
|  - Recharts Visualizer    - FSM State Simulator     - PDF Exporter      |
+------------------------------------+------------------------------------+
                                     | HTTP / REST API (JWT Authenticated)
                                     v
+-------------------------------------------------------------------------+
|                       APPLICATION SERVER TIER (Node.js + Express)        |
|                                                                         |
|  [ Authentication & JWT ]       [ Log Ingestion & Stream Parser ]       |
|            |                                    |                       |
|            v                                    v                       |
|  +-------------------------------------------------------------------+  |
|  |             AUTOMATA ENGINE CORE (server/automata/)               |  |
|  |  - FSM State Manager (START, SYN_SENT, CONNECTION, FAILED, ALERT) |  |
|  |  - Rule Evaluator (SYN Flood, Brute Force, Port Scan, Oscillation)|  |
|  |  - Session Key Tracker & State Trace Recorder                     |  |
|  +-------------------------------------------------------------------+  |
|            |                                    |                       |
|  [ Alerts Dispatcher & API ]     [ Telemetry Metrics Aggregator ]       |
+------------------------------------+------------------------------------+
                                     | Mongoose ODM / Resilient Adapter
                                     v
+-------------------------------------------------------------------------+
|                           DATABASE TIER (MongoDB)                       |
|  - Users Collection      - NetworkEvents Collection  - Alerts Collection|
+-------------------------------------------------------------------------+
```

## 2. Component Descriptions

### A. Frontend Layer (React 18 + Vite + Tailwind CSS)
- **State & Context Management:** `AuthContext` securely tracks JWT tokens; `ThemeContext` toggles cybersecurity dark mode and high-contrast light mode.
- **Data Visualization (Recharts):** Renders dynamic Area Charts (packet stream volume over time), Bar Charts (protocol breakdown and severity distributions), and Pie Charts.
- **FSM Interactive Sandbox:** SVG-rendered state transition visualizer illustrating node transitions in real time.

### B. Backend Layer (Express.js)
- **MVC Route Routing:** Clean separation into routes, controllers, and domain models.
- **Streaming Parser (`logParser.js`):** Ingests CSV, TXT, and JSON streams, extracting normalized 6-tuples `(Timestamp, Source IP, Destination IP, Protocol, Port, Action)`.
- **Automata Module (`server/automata/`):** Houses the deterministic state machine engine, rule signatures, and session-state dispatchers.

### C. Database Layer (MongoDB)
- Indexed on `timestamp`, `sourceIP`, `protocol`, and `alertId` for rapid querying and aggregation pipelines.
- Supports resilient dual-mode operation (native MongoDB connection with embedded fallback store).
