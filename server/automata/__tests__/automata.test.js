/**
 * Standalone Unit Tests for Automata Engine
 * Verifies all 4 Intrusion Detection Rules and FSM Transitions
 */

const assert = require('assert');
const { AutomataDetector } = require('../detector');
const { STATES } = require('../FSM');

console.log('🧪 Starting Automata Engine Unit Tests...\n');

let totalTests = 0;
let passedTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${description}`);
  } catch (err) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(err);
  }
}

// 1. Test SYN Flood
test('Rule 1: SYN -> SYN -> SYN triggers Possible SYN Flood Attack', () => {
  const detector = new AutomataDetector();
  const ip = '192.168.1.100';

  const e1 = detector.processEvent({ timestamp: '2026-11-10T10:00:00Z', sourceIP: ip, destinationIP: '10.0.0.1', protocol: 'TCP', port: 80, action: 'SYN' });
  assert.strictEqual(e1.triggeredAlerts.length, 0);
  assert.strictEqual(e1.annotatedEvent.fsmState, STATES.SYN_SENT);

  const e2 = detector.processEvent({ timestamp: '2026-11-10T10:00:01Z', sourceIP: ip, destinationIP: '10.0.0.1', protocol: 'TCP', port: 80, action: 'SYN' });
  assert.strictEqual(e2.triggeredAlerts.length, 0);
  assert.strictEqual(e2.annotatedEvent.fsmState, STATES.SYN_SENT);

  const e3 = detector.processEvent({ timestamp: '2026-11-10T10:00:02Z', sourceIP: ip, destinationIP: '10.0.0.1', protocol: 'TCP', port: 80, action: 'SYN' });
  assert.strictEqual(e3.triggeredAlerts.length, 1);
  assert.strictEqual(e3.triggeredAlerts[0].attackType, 'Possible SYN Flood Attack');
  assert.strictEqual(e3.triggeredAlerts[0].severity, 'Critical');
  assert.deepStrictEqual(e3.triggeredAlerts[0].stateTrace, [STATES.START, STATES.SYN_SENT, STATES.SYN_SENT, STATES.ALERT]);
});

// 2. Test Brute Force
test('Rule 2: LOGIN_FAIL x3 -> LOGIN_SUCCESS triggers Brute Force Attack', () => {
  const detector = new AutomataDetector();
  const ip = '172.16.0.45';

  detector.processEvent({ timestamp: '2026-11-10T11:00:00Z', sourceIP: ip, destinationIP: '10.0.0.2', protocol: 'SSH', port: 22, action: 'LOGIN_FAIL' });
  detector.processEvent({ timestamp: '2026-11-10T11:00:01Z', sourceIP: ip, destinationIP: '10.0.0.2', protocol: 'SSH', port: 22, action: 'LOGIN_FAIL' });
  const e3 = detector.processEvent({ timestamp: '2026-11-10T11:00:02Z', sourceIP: ip, destinationIP: '10.0.0.2', protocol: 'SSH', port: 22, action: 'LOGIN_FAIL' });
  assert.strictEqual(e3.triggeredAlerts.length, 0);
  assert.strictEqual(e3.annotatedEvent.fsmState, STATES.FAILED);

  const e4 = detector.processEvent({ timestamp: '2026-11-10T11:00:03Z', sourceIP: ip, destinationIP: '10.0.0.2', protocol: 'SSH', port: 22, action: 'LOGIN_SUCCESS' });
  assert.strictEqual(e4.triggeredAlerts.length, 1);
  assert.strictEqual(e4.triggeredAlerts[0].attackType, 'Brute Force Attack');
  assert.strictEqual(e4.triggeredAlerts[0].severity, 'Critical');
  assert.deepStrictEqual(e4.triggeredAlerts[0].stateTrace, [STATES.START, STATES.FAILED, STATES.FAILED, STATES.FAILED, STATES.ALERT]);
});

// 3. Test Port Scan
test('Rule 3: PORT_SCAN x4 triggers Port Scanning Attack', () => {
  const detector = new AutomataDetector();
  const ip = '198.51.100.22';

  for (let i = 0; i < 3; i++) {
    const res = detector.processEvent({ timestamp: `2026-11-10T12:00:0${i}Z`, sourceIP: ip, destinationIP: '10.0.0.5', protocol: 'TCP', port: 1000 + i, action: 'PORT_SCAN' });
    assert.strictEqual(res.triggeredAlerts.length, 0);
  }

  const res4 = detector.processEvent({ timestamp: '2026-11-10T12:00:04Z', sourceIP: ip, destinationIP: '10.0.0.5', protocol: 'TCP', port: 1004, action: 'PORT_SCAN' });
  assert.strictEqual(res4.triggeredAlerts.length, 1);
  assert.strictEqual(res4.triggeredAlerts[0].attackType, 'Port Scanning');
  assert.strictEqual(res4.triggeredAlerts[0].severity, 'High');
});

// 4. Test Abnormal Connection Pattern
test('Rule 4: CONNECT -> DISCONNECT -> CONNECT -> DISCONNECT -> CONNECT triggers Abnormal Connection Pattern', () => {
  const detector = new AutomataDetector();
  const ip = '203.0.113.88';

  const sequence = ['CONNECT', 'DISCONNECT', 'CONNECT', 'DISCONNECT'];
  sequence.forEach((act, idx) => {
    const r = detector.processEvent({ timestamp: `2026-11-10T13:00:0${idx}Z`, sourceIP: ip, destinationIP: '10.0.0.10', protocol: 'HTTPS', port: 443, action: act });
    assert.strictEqual(r.triggeredAlerts.length, 0);
  });

  const finalRes = detector.processEvent({ timestamp: '2026-11-10T13:00:05Z', sourceIP: ip, destinationIP: '10.0.0.10', protocol: 'HTTPS', port: 443, action: 'CONNECT' });
  assert.strictEqual(finalRes.triggeredAlerts.length, 1);
  assert.strictEqual(finalRes.triggeredAlerts[0].attackType, 'Abnormal Connection Pattern');
  assert.strictEqual(finalRes.triggeredAlerts[0].severity, 'Medium');
});

// 5. Test Safe Normal Traffic
test('Legitimate normal traffic remains SAFE without false positives', () => {
  const detector = new AutomataDetector();
  const ip = '192.168.1.50';

  const normalEvents = [
    { timestamp: '2026-11-10T14:00:00Z', sourceIP: ip, destinationIP: '8.8.8.8', protocol: 'DNS', port: 53, action: 'DNS_QUERY' },
    { timestamp: '2026-11-10T14:00:01Z', sourceIP: ip, destinationIP: '93.184.216.34', protocol: 'TCP', port: 80, action: 'SYN' },
    { timestamp: '2026-11-10T14:00:02Z', sourceIP: ip, destinationIP: '93.184.216.34', protocol: 'TCP', port: 80, action: 'ACK' },
    { timestamp: '2026-11-10T14:00:03Z', sourceIP: ip, destinationIP: '93.184.216.34', protocol: 'HTTP', port: 80, action: 'DATA' },
    { timestamp: '2026-11-10T14:00:04Z', sourceIP: ip, destinationIP: '93.184.216.34', protocol: 'TCP', port: 80, action: 'FIN' }
  ];

  const batch = detector.processBatch(normalEvents);
  assert.strictEqual(batch.alerts.length, 0);
  assert.strictEqual(batch.summary.safeEvents, 5);
  assert.strictEqual(batch.summary.suspiciousEvents, 0);
  assert.strictEqual(batch.summary.detectionAccuracy, 100);
});

console.log(`\nAutomata Unit Tests Completed: ${passedTests}/${totalTests} Passed.\n`);
if (passedTests !== totalTests) {
  process.exit(1);
}
