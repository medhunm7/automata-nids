# Entity-Relationship (ER) Diagram

## 1. Conceptual Entity Model

```
+------------------+                    +------------------------+
|      USER        |                    |     NETWORK_EVENT      |
+------------------+                    +------------------------+
| PK  id           |                    | PK  id                 |
|     name         |                    |     timestamp          |
|     email (UQ)   |                    |     sourceIP           |
|     password     |                    |     destinationIP      |
|     role         |                    |     protocol           |
|     createdAt    |                    |     port               |
+--------+---------+                    |     action             |
         |                              |     status (SAFE/SUSP) |
         | 1                            |     fsmState           |
         | reviews                      |     matchedRule        |
         |                              | FK  alertTriggered     |
         v 0..*                         |     batchId            |
+------------------+                    |     createdAt          |
|  SECURITY_ALERT  |<-------------------+------------------------+
+------------------+      triggers                 1..*
| PK  id           |
|     alertId (UQ) |
|     attackType   |
|     ruleId       |
|     severity     |
|     timestamp    |
|     sourceIP     |
|     destinationIP|
|     protocol     |
|     port         |
|     action       |
|     description  |
|     recomAction  |
|     stateTrace[] |
|     status       |
|     createdAt    |
+------------------+
```

## 2. Cardinality & Relationship Constraints
1. **USER to SECURITY_ALERT (1 to Many):**
   - A single security user/analyst can review, dismiss, or investigate zero or many alerts.
   - An alert record preserves who reviewed or updated it.

2. **NETWORK_EVENT to SECURITY_ALERT (Many to 1 / 1 to 1):**
   - Multiple sequential events (e.g. 3 consecutive `SYN` packets) correlate to trigger a single `SECURITY_ALERT`.
   - The alert references the triggering event and records the list of matched packet IDs.
   - The triggering `NETWORK_EVENT` stores the foreign reference `alertTriggered`.
