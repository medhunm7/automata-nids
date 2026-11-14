/**
 * Automata Rule Definitions
 * Encapsulates the transition logic and attack metadata for each intrusion pattern.
 */

const { STATES } = require('./FSM');

const RULES = [
  {
    id: 'RULE_SYN_FLOOD',
    attackType: 'Possible SYN Flood Attack',
    name: 'SYN Flood Detection',
    severity: 'Critical',
    targetSymbol: 'SYN',
    description: 'Consecutive rapid TCP SYN handshake requests detected without acknowledgment completion, indicative of resource exhaustion denial of service.',
    recommendedAction: 'Enable TCP SYN cookies on network ingress edge, lower tcp_synack_retries, and enforce strict IP rate-limiting at firewall.',
    sequence: ['SYN', 'SYN', 'SYN'],
    /**
     * Evaluates state transition for SYN Flood
     */
    evaluate(currentState, symbol, step, event) {
      if (symbol === 'SYN') {
        if (step === 0 && (currentState === STATES.START || currentState === STATES.SYN_SENT)) {
          return { matched: true, nextState: STATES.SYN_SENT, nextStep: 1, reset: false };
        }
        if (step === 1 && currentState === STATES.SYN_SENT) {
          return { matched: true, nextState: STATES.SYN_SENT, nextStep: 2, reset: false };
        }
        if (step === 2 && currentState === STATES.SYN_SENT) {
          return { matched: true, nextState: STATES.ALERT, nextStep: 3, reset: false };
        }
      }
      // If packet is normal ACK or FIN, reset the half-open SYN state
      if (symbol === 'ACK' || symbol === 'FIN' || symbol === 'DISCONNECT') {
        return { matched: false, reset: true };
      }
      return { matched: false, reset: false };
    }
  },
  {
    id: 'RULE_BRUTE_FORCE',
    attackType: 'Brute Force Attack',
    name: 'Authentication Brute Force Detection',
    severity: 'Critical',
    targetSymbol: 'LOGIN',
    description: 'Multiple consecutive failed authentication attempts followed by login success, characteristic of automated password spraying or credential stuffing.',
    recommendedAction: 'Immediately invalidate active session token, mandate password reset, implement IP temporary ban, and enforce multi-factor authentication (MFA).',
    sequence: ['LOGIN_FAIL', 'LOGIN_FAIL', 'LOGIN_FAIL', 'LOGIN_SUCCESS'],
    evaluate(currentState, symbol, step, event) {
      if (symbol === 'LOGIN_FAIL') {
        if (step === 0) {
          return { matched: true, nextState: STATES.FAILED, nextStep: 1, reset: false };
        }
        if (step === 1 && currentState === STATES.FAILED) {
          return { matched: true, nextState: STATES.FAILED, nextStep: 2, reset: false };
        }
        if (step === 2 && currentState === STATES.FAILED) {
          return { matched: true, nextState: STATES.FAILED, nextStep: 3, reset: false };
        }
        // Additional fails stay in FAILED step 3 waiting for success or timeout
        if (step >= 3 && currentState === STATES.FAILED) {
          return { matched: true, nextState: STATES.FAILED, nextStep: 3, reset: false };
        }
      }
      if (symbol === 'LOGIN_SUCCESS') {
        if (step >= 3 && currentState === STATES.FAILED) {
          return { matched: true, nextState: STATES.ALERT, nextStep: 4, reset: false };
        }
        // Legitimate login without prior failures resets
        return { matched: false, reset: true };
      }
      return { matched: false, reset: false };
    }
  },
  {
    id: 'RULE_PORT_SCAN',
    attackType: 'Port Scanning',
    name: 'Horizontal/Vertical Port Scan Detection',
    severity: 'High',
    targetSymbol: 'PORT_SCAN',
    description: 'Sequential rapid probes targeting multiple listening ports from a single source host, indicating pre-attack reconnaissance scanning.',
    recommendedAction: 'Drop incoming packets from originating IP address, drop stealth scan packets (XMAS/NULL/SYN-FIN), and silence ICMP port unreachables.',
    sequence: ['PORT_SCAN', 'PORT_SCAN', 'PORT_SCAN', 'PORT_SCAN'],
    evaluate(currentState, symbol, step, event) {
      if (symbol === 'PORT_SCAN' || symbol === 'SCAN') {
        if (step === 0) {
          return { matched: true, nextState: STATES.SYN_SENT, nextStep: 1, reset: false };
        }
        if (step === 1) {
          return { matched: true, nextState: STATES.SYN_SENT, nextStep: 2, reset: false };
        }
        if (step === 2) {
          return { matched: true, nextState: STATES.SYN_SENT, nextStep: 3, reset: false };
        }
        if (step === 3) {
          return { matched: true, nextState: STATES.ALERT, nextStep: 4, reset: false };
        }
      }
      return { matched: false, reset: false };
    }
  },
  {
    id: 'RULE_ABNORMAL_CONN',
    attackType: 'Abnormal Connection Pattern',
    name: 'Connection Churn & Oscillation Detection',
    severity: 'Medium',
    targetSymbol: 'CONNECT_CYCLE',
    description: 'Rapid oscillation between connection establishment and immediate teardown without sustained data transfer, indicating keep-alive evasion or beaconing.',
    recommendedAction: 'Inspect TLS handshake renegotiation limits, verify web server keep-alive timeouts, and inspect host socket allocation.',
    sequence: ['CONNECT', 'DISCONNECT', 'CONNECT', 'DISCONNECT', 'CONNECT'],
    evaluate(currentState, symbol, step, event) {
      if (step === 0 && symbol === 'CONNECT') {
        return { matched: true, nextState: STATES.CONNECTION, nextStep: 1, reset: false };
      }
      if (step === 1 && symbol === 'DISCONNECT') {
        return { matched: true, nextState: STATES.START, nextStep: 2, reset: false };
      }
      if (step === 2 && symbol === 'CONNECT') {
        return { matched: true, nextState: STATES.CONNECTION, nextStep: 3, reset: false };
      }
      if (step === 3 && symbol === 'DISCONNECT') {
        return { matched: true, nextState: STATES.START, nextStep: 4, reset: false };
      }
      if (step === 4 && symbol === 'CONNECT') {
        return { matched: true, nextState: STATES.ALERT, nextStep: 5, reset: false };
      }
      // If sustained normal data transfer occurs, reset pattern
      if (symbol === 'DATA' || symbol === 'ACK') {
        return { matched: false, reset: true };
      }
      return { matched: false, reset: false };
    }
  }
];

module.exports = { RULES };
