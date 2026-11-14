-- ==============================================================================
-- AUTOMATA NIDS SAMPLE SEED DATA (SQL Documentation)
-- Populates 100 Safe Baseline Events, 20 Suspicious Events, and Default Users
-- ==============================================================================

-- 1. Default Users
-- Passwords hashed using bcrypt (cost 10)
-- admin@nids.local / Admin@12345
-- analyst@nids.local / Analyst@12345
INSERT INTO users (id, name, email, password_hash, role) VALUES
('usr_admin_001', 'Security Admin', 'admin@nids.local', '$2a$10$wK1k6O1l7xJq4Xm3Qp6BveQe1aO9xM2G5x7L1s0K3aBcDeFgHiJkL', 'admin'),
('usr_analyst_001', 'Cyber Defense Analyst', 'analyst@nids.local', '$2a$10$7Z8x9c0v1b2n3m4k5j6h7g8f9d0s1a2z3x4c5v6b7n8m9k0j1h2g3', 'analyst');

-- 2. Sample Suspicious Security Alerts
INSERT INTO security_alerts (
    id, alert_id, attack_type, rule_id, severity, timestamp, source_ip, destination_ip, protocol, port, action, description, recommended_action, state_trace, matched_events_count
) VALUES
(
    'alt_001', 'ALT-2026-SYN01', 'Possible SYN Flood Attack', 'RULE_SYN_FLOOD', 'Critical', 
    '2026-11-10 10:12:02+00', '185.220.101.5', '10.0.0.1', 'TCP', 80, 'SYN',
    'Consecutive rapid TCP SYN handshake requests detected without acknowledgment completion.',
    'Enable TCP SYN cookies on network ingress edge, lower tcp_synack_retries, and enforce strict IP rate-limiting.',
    ARRAY['START', 'SYN_SENT', 'SYN_SENT', 'ALERT'], 3
),
(
    'alt_002', 'ALT-2026-BF001', 'Brute Force Attack', 'RULE_BRUTE_FORCE', 'Critical', 
    '2026-11-10 10:15:03+00', '45.142.195.12', '10.0.0.2', 'SSH', 22, 'LOGIN_SUCCESS',
    'Multiple consecutive failed authentication attempts followed by login success.',
    'Immediately invalidate active session token, mandate password reset, and implement IP ban.',
    ARRAY['START', 'FAILED', 'FAILED', 'FAILED', 'ALERT'], 4
),
(
    'alt_003', 'ALT-2026-SCAN1', 'Port Scanning', 'RULE_PORT_SCAN', 'High', 
    '2026-11-10 10:20:04+00', '194.26.29.112', '10.0.0.5', 'TCP', 443, 'PORT_SCAN',
    'Sequential rapid probes targeting multiple listening ports from a single source host.',
    'Drop incoming packets from originating IP address and silence ICMP port unreachables.',
    ARRAY['START', 'SYN_SENT', 'SYN_SENT', 'SYN_SENT', 'ALERT'], 4
),
(
    'alt_004', 'ALT-2026-CONN1', 'Abnormal Connection Pattern', 'RULE_ABNORMAL_CONN', 'Medium', 
    '2026-11-10 10:25:05+00', '103.152.18.44', '10.0.0.8', 'HTTPS', 443, 'CONNECT',
    'Rapid oscillation between connection establishment and immediate teardown without sustained data transfer.',
    'Inspect TLS handshake renegotiation limits and verify web server keep-alive timeouts.',
    ARRAY['START', 'CONNECTION', 'START', 'CONNECTION', 'START', 'ALERT'], 5
);

-- 3. Sample Network Events (Extract of baseline safe events and suspicious transitions)
INSERT INTO network_events (id, timestamp, source_ip, destination_ip, protocol, port, action, status, fsm_state, matched_rule, alert_triggered_id) VALUES
-- Safe Baseline Packets
('evt_001', '2026-11-10 08:00:00+00', '192.168.1.15', '8.8.8.8', 'DNS', 53, 'DNS_QUERY', 'SAFE', 'START', NULL, NULL),
('evt_002', '2026-11-10 08:00:45+00', '192.168.1.22', '142.250.190.46', 'TCP', 80, 'SYN', 'SAFE', 'SYN_SENT', NULL, NULL),
('evt_003', '2026-11-10 08:00:46+00', '192.168.1.22', '142.250.190.46', 'TCP', 80, 'ACK', 'SAFE', 'START', NULL, NULL),
('evt_004', '2026-11-10 08:00:47+00', '192.168.1.22', '142.250.190.46', 'HTTP', 80, 'DATA', 'SAFE', 'START', NULL, NULL),
('evt_005', '2026-11-10 08:01:30+00', '10.0.1.12', '1.1.1.1', 'HTTPS', 443, 'TLS_CLIENT_HELLO', 'SAFE', 'START', NULL, NULL),
-- Suspicious Attack Sequence 1: SYN Flood
('evt_101', '2026-11-10 10:12:00+00', '185.220.101.5', '10.0.0.1', 'TCP', 80, 'SYN', 'SUSPICIOUS', 'SYN_SENT', 'SYN Flood Detection', NULL),
('evt_102', '2026-11-10 10:12:01+00', '185.220.101.5', '10.0.0.1', 'TCP', 80, 'SYN', 'SUSPICIOUS', 'SYN_SENT', 'SYN Flood Detection', NULL),
('evt_103', '2026-11-10 10:12:02+00', '185.220.101.5', '10.0.0.1', 'TCP', 80, 'SYN', 'SUSPICIOUS', 'ALERT', 'SYN Flood Detection', 'ALT-2026-SYN01'),
-- Suspicious Attack Sequence 2: Brute Force
('evt_104', '2026-11-10 10:15:00+00', '45.142.195.12', '10.0.0.2', 'SSH', 22, 'LOGIN_FAIL', 'SUSPICIOUS', 'FAILED', 'Authentication Brute Force Detection', NULL),
('evt_105', '2026-11-10 10:15:01+00', '45.142.195.12', '10.0.0.2', 'SSH', 22, 'LOGIN_FAIL', 'SUSPICIOUS', 'FAILED', 'Authentication Brute Force Detection', NULL),
('evt_106', '2026-11-10 10:15:02+00', '45.142.195.12', '10.0.0.2', 'SSH', 22, 'LOGIN_FAIL', 'SUSPICIOUS', 'FAILED', 'Authentication Brute Force Detection', NULL),
('evt_107', '2026-11-10 10:15:03+00', '45.142.195.12', '10.0.0.2', 'SSH', 22, 'LOGIN_SUCCESS', 'SUSPICIOUS', 'ALERT', 'Authentication Brute Force Detection', 'ALT-2026-BF001');
