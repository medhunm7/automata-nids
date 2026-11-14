# Mathematical & Theoretical Explanation of Finite Automata Engine

## 1. Formal Definition of the Automaton
The Intrusion Detection Engine is formally modeled as a **Deterministic Finite Automaton (DFA)**:

$$M = (Q, \Sigma, \delta, q_0, F)$$

Where:
- **$Q$** is the finite set of operational states:
  $$Q = \{ \text{START}, \text{SYN\_SENT}, \text{CONNECTION}, \text{FAILED}, \text{ALERT} \}$$
  In formal literature:
  $$Q = \{ q_0, q_1, q_2, q_3, q_F \}$$
- **$\Sigma$** is the finite input alphabet consisting of discrete network action symbols:
  $$\Sigma = \{ \text{SYN}, \text{ACK}, \text{FIN}, \text{CONNECT}, \text{DISCONNECT}, \text{LOGIN\_FAIL}, \text{LOGIN\_SUCCESS}, \text{PORT\_SCAN}, \text{DATA} \}$$
- **$\delta: Q \times \Sigma \to Q$** is the deterministic state transition function.
- **$q_0 = \text{START}$** is the unique initial state representing the quiet, non-suspicious baseline state.
- **$F \subseteq Q$** is the set of accepting / final states:
  $$F = \{ \text{ALERT} \} = \{ q_F \}$$
  Whenever a network sequence $w \in \Sigma^*$ drives the machine into $F$, a security alert is formally triggered:
  $$\delta^*(q_0, w) \in F \implies \text{THREAT\_INTERCEPTED}$$

---

## 2. State Transition Function Tables

### 2.1 Complete Master State Transition Matrix $\delta(q, \sigma)$

| Current State $q \in Q$ | Input Symbol $\sigma \in \Sigma$ | Next State $\delta(q, \sigma)$ | Condition / Sequence Step |
| :--- | :--- | :--- | :--- |
| **START ($q_0$)** | `SYN` | **SYN_SENT ($q_1$)** | Step 1 of SYN flood probe |
| **START ($q_0$)** | `PORT_SCAN` | **SYN_SENT ($q_1$)** | Step 1 of Port scan sweep |
| **START ($q_0$)** | `CONNECT` | **CONNECTION ($q_2$)** | Step 1 of Connection cycle |
| **START ($q_0$)** | `LOGIN_FAIL` | **FAILED ($q_3$)** | Step 1 of Authentication probe |
| **START ($q_0$)** | `DATA`, `ACK`, `DNS_QUERY` | **START ($q_0$)** | Normal legitimate traffic |
| | | | |
| **SYN_SENT ($q_1$)** | `SYN` (step 1) | **SYN_SENT ($q_1$)** | Step 2 of SYN flood (2 consecutive) |
| **SYN_SENT ($q_1$)** | `SYN` (step 2) | **ALERT ($q_F$)** | **Trigger: Possible SYN Flood Attack** |
| **SYN_SENT ($q_1$)** | `PORT_SCAN` (step 1,2) | **SYN_SENT ($q_1$)** | Sequential port probes |
| **SYN_SENT ($q_1$)** | `PORT_SCAN` (step 3) | **ALERT ($q_F$)** | **Trigger: Port Scanning Attack** |
| **SYN_SENT ($q_1$)** | `ACK`, `FIN` | **START ($q_0$)** | Handshake completed/closed normally |
| | | | |
| **FAILED ($q_3$)** | `LOGIN_FAIL` (step 1) | **FAILED ($q_3$)** | 2nd consecutive login failure |
| **FAILED ($q_3$)** | `LOGIN_FAIL` (step 2) | **FAILED ($q_3$)** | 3rd consecutive login failure |
| **FAILED ($q_3$)** | `LOGIN_SUCCESS` (after 3 fails) | **ALERT ($q_F$)** | **Trigger: Brute Force Attack** |
| **FAILED ($q_3$)** | `LOGIN_SUCCESS` (prior to 3 fails)| **START ($q_0$)** | Legitimate user recovered password |
| | | | |
| **CONNECTION ($q_2$)**| `DISCONNECT` (cycle step) | **START ($q_0$)** | Teardown step in oscillation |
| **CONNECTION ($q_2$)**| `CONNECT` (after 2 cycles) | **ALERT ($q_F$)** | **Trigger: Abnormal Connection Pattern** |
| **CONNECTION ($q_2$)**| `DATA`, `ACK` | **CONNECTION ($q_2$)** | Normal sustained session |
| | | | |
| **ALERT ($q_F$)** | Any symbol | **START ($q_0$)** | Alert dispatched; machine resets |

---

## 3. Formal Walkthrough of the Four Required Threat Patterns

### Pattern 1: Possible SYN Flood Attack
- **Attack Grammar:** $L_1 = \{ w \in \Sigma^* \mid w = \text{SYN}^3 \}$
- **State Progression:**
  1. $\delta(\text{START}, \text{SYN}) = \text{SYN\_SENT}$
  2. $\delta(\text{SYN\_SENT}, \text{SYN}) = \text{SYN\_SENT}$
  3. $\delta(\text{SYN\_SENT}, \text{SYN}) = \text{ALERT}$
- **Formal Trace:**
  $$\text{START} \xrightarrow{\text{SYN}} \text{SYN\_SENT} \xrightarrow{\text{SYN}} \text{SYN\_SENT} \xrightarrow{\text{SYN}} \text{ALERT}$$
- **Severity:** `Critical`
- **Underlying Vulnerability:** Exhaustion of the kernel's half-open TCP connection backlog queue (SYN queue).

### Pattern 2: Authentication Brute Force Attack
- **Attack Grammar:** $L_2 = \{ w \in \Sigma^* \mid w = (\text{LOGIN\_FAIL})^k \text{LOGIN\_SUCCESS}, k \ge 3 \}$
- **State Progression:**
  1. $\delta(\text{START}, \text{LOGIN\_FAIL}) = \text{FAILED}$
  2. $\delta(\text{FAILED}, \text{LOGIN\_FAIL}) = \text{FAILED}$
  3. $\delta(\text{FAILED}, \text{LOGIN\_FAIL}) = \text{FAILED}$
  4. $\delta(\text{FAILED}, \text{LOGIN\_SUCCESS}) = \text{ALERT}$
- **Formal Trace:**
  $$\text{START} \xrightarrow{\text{LOGIN\_FAIL}} \text{FAILED} \xrightarrow{\text{LOGIN\_FAIL}} \text{FAILED} \xrightarrow{\text{LOGIN\_FAIL}} \text{FAILED} \xrightarrow{\text{LOGIN\_SUCCESS}} \text{ALERT}$$
- **Severity:** `Critical`
- **Underlying Vulnerability:** Automated dictionary attacks and credential stuffing tools.

### Pattern 3: Reconnaissance Port Scanning
- **Attack Grammar:** $L_3 = \{ w \in \Sigma^* \mid w = (\text{PORT\_SCAN})^4 \}$
- **State Progression:**
  1. $\delta(\text{START}, \text{PORT\_SCAN}) = \text{SYN\_SENT}$
  2. $\delta(\text{SYN\_SENT}, \text{PORT\_SCAN}) = \text{SYN\_SENT}$
  3. $\delta(\text{SYN\_SENT}, \text{PORT\_SCAN}) = \text{SYN\_SENT}$
  4. $\delta(\text{SYN\_SENT}, \text{PORT\_SCAN}) = \text{ALERT}$
- **Severity:** `High`
- **Underlying Vulnerability:** Network topology mapping by malicious actors prior to payload delivery.

### Pattern 4: Abnormal Connection Pattern
- **Attack Grammar:** $L_4 = \{ w \in \Sigma^* \mid w = (\text{CONNECT } \text{DISCONNECT})^2 \text{CONNECT} \}$
- **State Progression:**
  1. $\delta(\text{START}, \text{CONNECT}) = \text{CONNECTION}$
  2. $\delta(\text{CONNECTION}, \text{DISCONNECT}) = \text{START}$
  3. $\delta(\text{START}, \text{CONNECT}) = \text{CONNECTION}$
  4. $\delta(\text{CONNECTION}, \text{DISCONNECT}) = \text{START}$
  5. $\delta(\text{START}, \text{CONNECT}) = \text{ALERT}$
- **Severity:** `Medium`
- **Underlying Vulnerability:** Covert command-and-control beaconing or Slowloris socket exhaustion.

---

## 4. Why Deterministic Automata Outperform Stateless Firewalls
1. **Temporal Memory:** Stateless firewalls only check port and packet flags in isolation. They cannot distinguish a single legitimate SYN from the 3rd SYN in a rapid burst.
2. **Minimal Computing Overhead:** State evaluation requires a single array/hash lookup ($O(1)$) per incoming packet, preserving wire-speed throughput without machine learning latency.
3. **Formal Verifiability:** Because regular languages can be mathematically proven using the Pumping Lemma and Myhill-Nerode theorem, false-positive boundaries are mathematically determinable.
