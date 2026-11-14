# Comprehensive Testing & Verification Dossier

## 1. Testing Methodology
The Automata-Based NIDS was evaluated through a multi-tiered testing strategy:
1. **Formal Unit Testing:** Direct verification of the state transition function $\delta(q, \sigma)$ for each individual threat grammar.
2. **Stream Batch Integration Testing:** Ingestion of synthetic 120-packet test files (100 legitimate baseline events + 20 attack events).
3. **API End-to-End Testing:** Verification of all REST endpoints (`/login`, `/register`, `/upload`, `/events`, `/alerts`, `/dashboard`).
4. **Resilience & Fallback Testing:** Verification that the system operates gracefully whether connected to MongoDB or running in memory.

---

## 2. Test Execution Matrix

| Test ID | Test Scenario Description | Input Sequence ($\Sigma^*$) | Expected Final State | Expected Alert Trigger | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Rule 1: Three consecutive SYN packets | `SYN` $\to$ `SYN` $\to$ `SYN` | `ALERT` ($q_F$) | Possible SYN Flood Attack | **PASSED** |
| **TC-02** | Rule 1: Normal 3-way handshake completion | `SYN` $\to$ `ACK` $\to$ `DATA` | `START` ($q_0$) | None (Safe Event) | **PASSED** |
| **TC-03** | Rule 2: Three failed logins then success | `LOGIN_FAIL` $\times 3 \to$ `LOGIN_SUCCESS` | `ALERT` ($q_F$) | Brute Force Attack | **PASSED** |
| **TC-04** | Rule 2: Single failed login then success | `LOGIN_FAIL` $\to$ `LOGIN_SUCCESS` | `START` ($q_0$) | None (Safe Event) | **PASSED** |
| **TC-05** | Rule 3: Four rapid port scan probes | `PORT_SCAN` $\times 4$ | `ALERT` ($q_F$) | Port Scanning Attack | **PASSED** |
| **TC-06** | Rule 4: Oscillating connection cycle | `CONNECT` $\to$ `DISCONNECT` $\times 2 \to$ `CONNECT` | `ALERT` ($q_F$) | Abnormal Connection Pattern | **PASSED** |
| **TC-07** | Mixed Multi-session Ingestion | 100 Safe + 20 Suspicious Events | Batch Summary | Alerts Count $\ge 4$ | **PASSED** |
| **TC-08** | CSV Log File Ingestion | `sample_traffic.csv` upload | 200 OK | Accurate JSON summary response | **PASSED** |
| **TC-09** | JSON Log File Ingestion | `sample_traffic.json` upload | 200 OK | Identical alert count | **PASSED** |
| **TC-10** | JWT Protected Endpoint Access | Request to `/api/me` without token | 401 Unauthorized | Access Denied message | **PASSED** |
| **TC-11** | User Authentication Verification | `POST /login` with Admin credentials | 200 OK | Signed JWT returned | **PASSED** |
| **TC-12** | Alert Deletion Lifecycle | `DELETE /alerts/:id` | 200 OK | Record pruned from DB | **PASSED** |

---

## 3. Automated Automata Unit Test Script Output
Running `npm test` or `node automata/__tests__/automata.test.js` generates the following verified audit output:

```text
🧪 Starting Automata Engine Unit Tests...

  ✅ PASS: Rule 1: SYN -> SYN -> SYN triggers Possible SYN Flood Attack
  ✅ PASS: Rule 2: LOGIN_FAIL x3 -> LOGIN_SUCCESS triggers Brute Force Attack
  ✅ PASS: Rule 3: PORT_SCAN x4 triggers Port Scanning Attack
  ✅ PASS: Rule 4: CONNECT -> DISCONNECT -> CONNECT -> DISCONNECT -> CONNECT triggers Abnormal Connection Pattern
  ✅ PASS: Legitimate normal traffic remains SAFE without false positives

Automata Unit Tests Completed: 5/5 Passed.
```
