# Flowchart: Ingestion, Automata Processing & Alerting

## 1. System Execution Flowchart

```
                 +--------------------------+
                 |          START           |
                 +--------------------------+
                              |
                              v
                 +--------------------------+
                 | Receive Log File (Upload)|
                 |  or Live Packet Stream   |
                 +--------------------------+
                              |
                              v
                 +--------------------------+
                 | Determine File Format:   |
                 |      CSV / TXT / JSON    |
                 +--------------------------+
                              |
                              v
                 +--------------------------+
                 | Parse & Normalize Record |
                 | (Timestamp, IPs, Action) |
                 +--------------------------+
                              |
                              v
                 +--------------------------+
                 | Retrieve Active FSM for  |
                 |   Session (by Source IP) |
                 +--------------------------+
                              |
                              v
                 +--------------------------+
                 | Evaluate Transition:     |
                 | delta(q_current, action) |
                 +--------------------------+
                              |
                              +---------------------------------------+
                              |                                       |
                              v                                       v
                     [ Next State == ALERT? ]                         |
                              |                                       |
                   +----------+----------+                            |
                   |                     |                            |
                 YES                     NO                           |
                   |                     |                            |
                   v                     v                            |
        +---------------------+  +---------------------+              |
        | Generate Alert      |  | Tag Event: SAFE     |              |
        | Tag: SUSPICIOUS     |  | Update State to     |              |
        | Set Severity        |  | q_next              |              |
        | Record State Trace  |  +----------+----------+              |
        | Reset FSM to START  |             |                         |
        +----------+----------+             |                         |
                   |                        |                         |
                   +------------+-----------+                         |
                                |                                     |
                                v                                     |
                   +--------------------------+                       |
                   | Store Event & Alert      |                       |
                   | Records in Database      |                       |
                   +--------------------------+                       |
                                |                                     |
                                v                                     |
                   +--------------------------+                       |
                   | Refresh Dashboard &      |                       |
                   | Trigger Live Alert UI    |                       |
                   +--------------------------+                       |
                                |                                     |
                                v                                     |
                   +--------------------------+                       |
                   |           END            |                       |
                   +--------------------------+                       |
```
