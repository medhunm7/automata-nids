# Problem Statement: Automata-Based Network Intrusion Detection System

## 1. Introduction
In modern computer networks, distributed organizations face relentless, sophisticated cyber threats ranging from automated port scanning and volumetric Denial of Service (DoS) attacks to targeted credential brute-forcing and covert exfiltration channels. Traditional intrusion detection approaches rely either on simple stateless threshold counters or heavy machine-learning heuristics:
- **Stateless Packet Filters:** Inspect packets in isolation, completely failing to detect multi-stage attacks that unfold across sequences of actions over time (e.g., repeated connection attempts, half-open handshake exhaustion).
- **Deep Neural Heuristics:** Require immense compute overhead, lack mathematical explainability, and suffer from unpredictable false-positive rates that overwhelm Security Operations Center (SOC) personnel.

## 2. The Core Problem
There exists a critical need for a deterministic, computationally lightweight, and formally verifiable intrusion detection architecture capable of:
1. Maintaining state across temporal packet sequences per network session.
2. Formally classifying suspicious communication sequences using the rigorous mathematical principles of **Finite Automata (FSM / DFA)**.
3. Operating with $O(1)$ state transition overhead per ingested packet.
4. Providing 100% transparent audit traces showing the exact state progression ($q_0 \to q_1 \to \dots \to q_F$) that prompted a threat alert.

## 3. Project Objectives
- **Formal Grammar Modeling:** Define a Deterministic Finite Automaton $M = (Q, \Sigma, \delta, q_0, F)$ modeling four threat classes:
  - TCP SYN Flood Attacks (`SYN` $\to$ `SYN` $\to$ `SYN`)
  - Authentication Brute Force Attacks (`LOGIN_FAIL` $\times 3 \to$ `LOGIN_SUCCESS`)
  - Reconnaissance Port Scanning (`PORT_SCAN` $\times 4$)
  - Abnormal Connection Pattern / Beaconing (`CONNECT` $\to$ `DISCONNECT` $\to$ `CONNECT` $\to$ `DISCONNECT` $\to$ `CONNECT`)
- **Full-Stack Implementation:** Deliver an end-to-end web system featuring log ingestion (CSV, TXT, JSON), real-time visualization, security alert triage, and report generation.
- **Academic Assessment Compliance:** Provide complete documentation, formal transition matrices, SQL relational parity schemas, and interactive test simulation for comprehensive engineering capstone evaluation.
