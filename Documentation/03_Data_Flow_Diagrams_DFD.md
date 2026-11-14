# Data Flow Diagrams (DFD)

## 1. Level 0 DFD (Context Diagram)

```
                       Log Files (CSV/TXT/JSON)
                                 |
                                 v
+------------------+     +-------------------------------+     +------------------+
|                  |     |                               |     |                  |
|  Network Admin / | --> |      AUTOMATA-BASED NIDS      | --> |  SOC Analyst /   |
|  Packet Capture  |     |         SYSTEM (0.0)          |     |  Security Auditor|
|                  | <-- |                               |     |                  |
+------------------+     +-------------------------------+     +------------------+
       ^                                 |                              |
       | Credentials / Login             v                              v
       +-------------------   [ Database Storage ]             PDF Reports /
                                  (MongoDB)                   Forensic Alerts
```

## 2. Level 1 DFD (Decomposition)

```
[ User / Admin ]
       | (Credentials)
       v
+--------------+      Valid Session
| 1.0 Auth     | ------------------------------------+
| & RBAC       |                                     |
+--------------+                                     v
                                            +------------------+
[ Raw Log File ]                            | 3.0 Automata     |
       |                                    | Detection Engine |
       v                                    +------------------+
+--------------+   Normalized Event Stream           |
| 2.0 Ingest   | ----------------------------------->|
| & Log Parser |                                     | Evaluates Sigma transitions
+--------------+                                     v
                                            +------------------+
                                            | 4.0 Alert &      |
                                            | Incident Manager |
                                            +------------------+
                                                     |
                         +---------------------------+---------------------------+
                         v                                                       v
               +--------------------+                                  +--------------------+
               | 5.0 Database Store |                                  | 6.0 Reporting & UI |
               | (Events & Alerts)  |                                  | (Dashboard & PDF)  |
               +--------------------+                                  +--------------------+
```

## 3. Level 2 DFD (Automata Engine Core 3.0)

```
Normalized Event: (src_ip, dst_ip, protocol, port, action)
       |
       v
[ 3.1 Session Key Lookup ] ---> Retrieve / Instantiate FSM by src_ip
       |
       v
[ 3.2 Symbol Mapping ] --------> Map action string into Sigma alphabet
       |
       v
[ 3.3 State Transition Logic ] -> delta(q_current, symbol)
       |
       +----> If q_next != ALERT: Update FSM state, tag event as SAFE.
       |
       +----> If q_next == ALERT:
                 |
                 +-> Generate Alert Record (ID, Severity, Trace, Mitigation)
                 +-> Tag event as SUSPICIOUS
                 +-> Reset FSM state to START (q0)
```
