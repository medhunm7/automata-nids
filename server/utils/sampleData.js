/**
 * Sample Network Data Generator
 * Produces 100 legitimate baseline events and 20 targeted suspicious attack sequences.
 */

function generateSampleEvents() {
  const events = [];
  const baseTime = new Date('2026-11-10T08:00:00Z').getTime();

  const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'FTP', 'SSH', 'DNS', 'SMTP'];
  const safeIps = [
    '192.168.1.15', '192.168.1.22', '192.168.1.48', '192.168.1.99',
    '10.0.1.12', '10.0.1.84', '172.16.2.10', '172.16.2.55'
  ];
  const safeDestIps = [
    '8.8.8.8', '1.1.1.1', '142.250.190.46', '151.101.65.140',
    '10.0.0.1', '10.0.0.5', '192.168.1.1', '172.217.16.206'
  ];
  const safeActions = {
    TCP: ['SYN', 'ACK', 'DATA', 'FIN'],
    UDP: ['UDP_PACKET', 'DATA'],
    HTTP: ['GET', 'POST', 'DATA', 'ACK'],
    HTTPS: ['TLS_CLIENT_HELLO', 'DATA', 'ACK'],
    FTP: ['CONNECT', 'DATA', 'DISCONNECT'],
    SSH: ['CONNECT', 'DATA', 'DISCONNECT'],
    DNS: ['DNS_QUERY', 'DATA'],
    SMTP: ['CONNECT', 'DATA', 'DISCONNECT']
  };

  const portMap = {
    TCP: 80,
    UDP: 53,
    HTTP: 80,
    HTTPS: 443,
    FTP: 21,
    SSH: 22,
    DNS: 53,
    SMTP: 25
  };

  // 1. Generate 100 safe events spread out in time
  for (let i = 0; i < 100; i++) {
    const proto = protocols[i % protocols.length];
    const actionsList = safeActions[proto];
    const action = actionsList[i % actionsList.length];
    const src = safeIps[i % safeIps.length];
    const dst = safeDestIps[i % safeDestIps.length];
    const timeOffset = i * 45000 + Math.floor(Math.random() * 10000); // spread over several hours

    events.push({
      timestamp: new Date(baseTime + timeOffset).toISOString(),
      sourceIP: src,
      destinationIP: dst,
      protocol: proto,
      port: portMap[proto] || 80,
      action: action,
      status: 'SAFE',
      fsmState: 'START'
    });
  }

  // 2. Generate 20 suspicious events matching the 4 automata rules
  const suspiciousTimeBase = baseTime + 100 * 45000 + 60000;

  // Attack 1: SYN Flood (3 events)
  const synFloodIp = '185.220.101.5';
  for (let i = 0; i < 3; i++) {
    events.push({
      timestamp: new Date(suspiciousTimeBase + i * 200).toISOString(),
      sourceIP: synFloodIp,
      destinationIP: '10.0.0.1',
      protocol: 'TCP',
      port: 80,
      action: 'SYN',
      status: 'SUSPICIOUS',
      fsmState: i === 2 ? 'ALERT' : 'SYN_SENT'
    });
  }

  // Attack 2: Second SYN Flood cycle (3 events)
  for (let i = 0; i < 3; i++) {
    events.push({
      timestamp: new Date(suspiciousTimeBase + 2000 + i * 150).toISOString(),
      sourceIP: '185.220.101.99',
      destinationIP: '10.0.0.1',
      protocol: 'TCP',
      port: 443,
      action: 'SYN',
      status: 'SUSPICIOUS',
      fsmState: i === 2 ? 'ALERT' : 'SYN_SENT'
    });
  }

  // Attack 3: Brute Force (4 events: LOGIN_FAIL, LOGIN_FAIL, LOGIN_FAIL, LOGIN_SUCCESS)
  const bruteForceIp = '45.142.195.12';
  const bfActions = ['LOGIN_FAIL', 'LOGIN_FAIL', 'LOGIN_FAIL', 'LOGIN_SUCCESS'];
  for (let i = 0; i < 4; i++) {
    events.push({
      timestamp: new Date(suspiciousTimeBase + 5000 + i * 1000).toISOString(),
      sourceIP: bruteForceIp,
      destinationIP: '10.0.0.2',
      protocol: 'SSH',
      port: 22,
      action: bfActions[i],
      status: 'SUSPICIOUS',
      fsmState: i === 3 ? 'ALERT' : 'FAILED'
    });
  }

  // Attack 4: Port Scan (5 events: sequential PORT_SCAN)
  const portScanIp = '194.26.29.112';
  const scanPorts = [21, 22, 80, 443, 8080];
  for (let i = 0; i < 5; i++) {
    events.push({
      timestamp: new Date(suspiciousTimeBase + 12000 + i * 500).toISOString(),
      sourceIP: portScanIp,
      destinationIP: '10.0.0.5',
      protocol: 'TCP',
      port: scanPorts[i],
      action: 'PORT_SCAN',
      status: 'SUSPICIOUS',
      fsmState: i >= 3 ? 'ALERT' : 'SYN_SENT'
    });
  }

  // Attack 5: Abnormal Connection Pattern (5 events: CONNECT, DISCONNECT, CONNECT, DISCONNECT, CONNECT)
  const abnormalIp = '103.152.18.44';
  const connActions = ['CONNECT', 'DISCONNECT', 'CONNECT', 'DISCONNECT', 'CONNECT'];
  for (let i = 0; i < 5; i++) {
    events.push({
      timestamp: new Date(suspiciousTimeBase + 18000 + i * 800).toISOString(),
      sourceIP: abnormalIp,
      destinationIP: '10.0.0.8',
      protocol: 'HTTPS',
      port: 443,
      action: connActions[i],
      status: 'SUSPICIOUS',
      fsmState: i === 4 ? 'ALERT' : (connActions[i] === 'CONNECT' ? 'CONNECTION' : 'START')
    });
  }

  // Total: 100 safe events + 3 + 3 + 4 + 5 + 5 = 20 suspicious events = 120 events total!
  return events;
}

module.exports = {
  generateSampleEvents
};
