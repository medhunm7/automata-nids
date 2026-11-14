# Future Enhancements

While the Automata-Based NIDS successfully satisfies all requirements for an Engineering College Comprehensive Assessment, several prospective enhancements could further expand its enterprise readiness:

## 1. Nondeterministic Finite Automata (NFA) with $\epsilon$-Transitions
- Implementing NFAs will allow parallel evaluation of overlapping threat signatures without state explosion.
- Subsequent conversion to DFAs via the Powerset Construction algorithm can maintain deterministic execution speed.

## 2. Timed Automata (Alur-Dill Model)
- Augmenting pure grammatical transitions with real-valued clocks ($C = \{x, y\}$).
- Enables precise temporal constraints: e.g., triggering SYN flood only if 3 `SYN` packets arrive within $\Delta t \le 500\text{ms}$.

## 3. Real-Time Packet Sniffing via Libpcap / Raw Sockets
- Integrating `pcap` or `libpcap` native C bindings in Node.js to capture physical network adapter frames directly in promiscuous mode rather than relying on ingested log files.

## 4. Automated Active Mitigation Hooks (IPS Mode)
- Upgrading from Intrusion *Detection* (NIDS) to Intrusion *Prevention* (NIPS):
- Automatically pushing dynamic iptables or nftables drop rules via SSH or local system commands upon reaching state `ALERT`.

## 5. Distributed FSM State Synchronization (Redis Pub/Sub)
- Distributing session state machines across multiple edge worker nodes using Redis or Kafka stream partitions for multi-gigabit campus enterprise networks.
