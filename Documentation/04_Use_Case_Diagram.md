# Use Case Diagram & Descriptions

## 1. Actor Definitions
- **Security Analyst:** Monitors live dashboard telemetry, reviews security alerts, inspects state traces, and downloads PDF assessment reports.
- **Security Administrator:** Configures automata rules, uploads bulk packet capture logs, manages system users, and deletes/dismisses false-positive alerts.
- **Automata Detection Daemon:** Background engine that evaluates ingested packet streams against formal transition matrices.

## 2. Textual Use Case Model

```
+---------------------------------------------------------------------------------+
|                               AUTOMATA-BASED NIDS                               |
|                                                                                 |
|   (( User Authentication )) <---------------------------------+                 |
|            ^                                                  |                 |
|            | includes                                         |                 |
|   (( View Dashboard Telemetry )) <---------------+            |                 |
|   (( Ingest Network Logs (CSV/TXT/JSON) ))       |            |                 |
|            |                                     |            |                 |
|            v <<invokes>>                         |            |                 |
|   (( Run Automata Engine Detection ))            |            |                 |
|            |                                     |            |                 |
|            v <<produces>>                        |            |                 |
|   (( View & Filter Security Alerts )) -----------+            |                 |
|   (( Delete / Dismiss Alert ))                   |            |                 |
|   (( Export Alerts to CSV ))                     |            |                 |
|   (( Explore Traffic Analytics by Protocol )) ---+            |                 |
|   (( Step-by-Step FSM Simulator ))               |            |                 |
|   (( Generate Forensic PDF Report )) ------------+            |                 |
|                                                               |                 |
+---------------------------------------------------------------+-----------------+
              ^                                                 ^
              |                                                 |
      [ Security Analyst ]                            [ Security Admin ]
```

## 3. Detailed Use Case Specifications

### UC-01: Ingest Network Logs
- **Primary Actor:** Security Administrator / Analyst
- **Preconditions:** User is authenticated with a valid JWT token.
- **Flow of Events:**
  1. User selects a `.csv`, `.txt`, or `.json` file via drag-and-drop or file picker.
  2. System validates file format and streaming delimiters.
  3. Parser extracts normalized records `(Timestamp, Source IP, Destination IP, Protocol, Port, Action)`.
  4. Automata Engine evaluates each record against the FSM transition table.
  5. Processed events and generated alerts are committed to MongoDB.
  6. Real-time summary modal displays parsed event count, safe vs. suspicious count, and detection accuracy.
- **Postconditions:** Alerts are visible on the dashboard and alerts page immediately.

### UC-02: Interactive Automata Simulation
- **Primary Actor:** Security Analyst / College Evaluator
- **Preconditions:** None (public or authenticated).
- **Flow of Events:**
  1. User navigates to `/simulator`.
  2. User selects an attack preset (e.g. SYN Flood) or feeds custom action symbols ($+SYN, +LOGIN\_FAIL$).
  3. Interactive SVG canvas animates the current active state node ($q_0 \to q_1 \to \dots$).
  4. When state `ALERT` is reached, a threat interception card pops up detailing the mathematical condition $\delta^*(q_0, w) \in F$.
