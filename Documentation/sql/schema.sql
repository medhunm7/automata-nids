-- ==============================================================================
-- AUTOMATA-BASED NETWORK INTRUSION DETECTION SYSTEM (NIDS)
-- Relational Database Schema Specification (SQL Documentation)
-- Compatible with PostgreSQL 14+, MySQL 8.0+, SQLite 3
-- ==============================================================================

-- 1. Users Table (Role-Based Access Control)
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'analyst' CHECK (role IN ('analyst', 'admin', 'auditor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- 2. Security Alerts Table
CREATE TABLE security_alerts (
    id VARCHAR(64) PRIMARY KEY,
    alert_id VARCHAR(64) NOT NULL UNIQUE,
    attack_type VARCHAR(128) NOT NULL,
    rule_id VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source_ip VARCHAR(45) NOT NULL,
    destination_ip VARCHAR(45) NOT NULL,
    protocol VARCHAR(32) NOT NULL,
    port INTEGER NOT NULL CHECK (port BETWEEN 1 AND 65535),
    action VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    state_trace TEXT[] NOT NULL,
    matched_events_count INTEGER DEFAULT 0,
    status VARCHAR(32) DEFAULT 'Active' CHECK (status IN ('Active', 'Investigating', 'Resolved', 'Dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_timestamp ON security_alerts(timestamp DESC);
CREATE INDEX idx_alerts_severity ON security_alerts(severity);
CREATE INDEX idx_alerts_source_ip ON security_alerts(source_ip);
CREATE INDEX idx_alerts_attack_type ON security_alerts(attack_type);

-- 3. Network Events Table (Audit Stream)
CREATE TABLE network_events (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source_ip VARCHAR(45) NOT NULL,
    destination_ip VARCHAR(45) NOT NULL,
    protocol VARCHAR(32) NOT NULL,
    port INTEGER NOT NULL CHECK (port BETWEEN 1 AND 65535),
    action VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SAFE' CHECK (status IN ('SAFE', 'SUSPICIOUS')),
    fsm_state VARCHAR(32) NOT NULL DEFAULT 'START' CHECK (fsm_state IN ('START', 'SYN_SENT', 'CONNECTION', 'FAILED', 'ALERT')),
    matched_rule VARCHAR(128),
    alert_triggered_id VARCHAR(64) REFERENCES security_alerts(alert_id) ON DELETE SET NULL,
    batch_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_timestamp ON network_events(timestamp DESC);
CREATE INDEX idx_events_source_ip ON network_events(source_ip);
CREATE INDEX idx_events_destination_ip ON network_events(destination_ip);
CREATE INDEX idx_events_protocol ON network_events(protocol);
CREATE INDEX idx_events_status ON network_events(status);
CREATE INDEX idx_events_fsm_state ON network_events(fsm_state);

-- 4. Analytical Views for Reporting

-- View: Protocol Distribution Summary
CREATE VIEW v_protocol_distribution AS
SELECT 
    protocol,
    COUNT(*) AS total_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM network_events
GROUP BY protocol
ORDER BY total_count DESC;

-- View: Alert Severity Summary
CREATE VIEW v_alert_severity_summary AS
SELECT 
    severity,
    COUNT(*) AS total_alerts
FROM security_alerts
GROUP BY severity
ORDER BY 
    CASE severity
        WHEN 'Critical' THEN 1
        WHEN 'High' THEN 2
        WHEN 'Medium' THEN 3
        WHEN 'Low' THEN 4
    END;

-- View: Top Attacking Source Hosts
CREATE VIEW v_top_attackers AS
SELECT 
    source_ip,
    COUNT(*) AS total_attacks,
    STRING_AGG(DISTINCT attack_type, ', ') AS observed_attack_types
FROM security_alerts
GROUP BY source_ip
ORDER BY total_attacks DESC
LIMIT 10;
