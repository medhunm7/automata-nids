/**
 * End-to-End API Integration Verification Test
 * Invokes Express request pipeline directly to test all required REST APIs.
 */

const assert = require('assert');
const { app } = require('../server');
const { seedDatabase } = require('../utils/seeder');

// Minimal Express in-process caller for sandboxed testing
function mockRequest(app, method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const { EventEmitter } = require('events');
    const req = new EventEmitter();
    req.method = method.toUpperCase();
    req.url = url;
    req.headers = {
      'content-type': 'application/json',
      ...headers
    };
    req.body = body;

    const res = new EventEmitter();
    res.statusCode = 200;
    res.headers = {};
    res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res.headers[k.toLowerCase()];
    res.removeHeader = (k) => { delete res.headers[k.toLowerCase()]; };
    res.status = (code) => { res.statusCode = code; return res; };

    let resBody = '';
    res.send = (data) => {
      resBody = data;
      resolve({ statusCode: res.statusCode, body: resBody, headers: res.headers });
    };
    res.json = (data) => {
      resBody = data;
      resolve({ statusCode: res.statusCode, body: resBody, headers: res.headers });
    };
    res.end = (chunk) => {
      if (chunk) resBody += chunk;
      resolve({ statusCode: res.statusCode, body: resBody, headers: res.headers });
    };
    res.download = (filePath, name) => {
      resolve({ statusCode: 200, downloadedFile: filePath, filename: name });
    };

    app.handle(req, res);
  });
}

async function runApiTests() {
  console.log('🧪 Starting REST API Endpoints Verification...\n');
  await seedDatabase(true);

  let token = null;

  // 0. GET /health (Render Health Check)
  console.log('0. Testing GET /health...');
  const healthRes = await mockRequest(app, 'GET', '/health');
  assert.strictEqual(healthRes.statusCode, 200, 'Health check must return 200');
  assert.strictEqual(healthRes.body.status, 'OK', 'Health check status must be OK');
  console.log('  ✅ GET /health verified successfully. Response: {"status":"OK"}.');

  // 1. POST /login
  console.log('1. Testing POST /login...');
  const loginRes = await mockRequest(app, 'POST', '/login', {
    email: 'admin@nids.local',
    password: 'Admin@12345'
  });
  assert.strictEqual(loginRes.statusCode, 200, `Login status should be 200, got ${loginRes.statusCode}`);
  assert.strictEqual(loginRes.body.success, true);
  assert.ok(loginRes.body.token, 'Should return JWT token');
  token = loginRes.body.token;
  console.log('  ✅ POST /login verified successfully. Token acquired.');

  // 2. POST /register
  console.log('2. Testing POST /register...');
  const regEmail = `analyst_${Date.now()}@test.local`;
  const regRes = await mockRequest(app, 'POST', '/register', {
    name: 'Test Analyst',
    email: regEmail,
    password: 'Password@123',
    role: 'analyst'
  });
  assert.strictEqual(regRes.statusCode, 201);
  assert.strictEqual(regRes.body.success, true);
  console.log('  ✅ POST /register verified successfully.');

  // 3. GET /dashboard
  console.log('3. Testing GET /dashboard...');
  const dashRes = await mockRequest(app, 'GET', '/dashboard');
  assert.strictEqual(dashRes.statusCode, 200);
  assert.strictEqual(dashRes.body.success, true);
  assert.ok(dashRes.body.stats.totalEvents >= 100, 'Should have >= 100 events');
  assert.ok(dashRes.body.stats.suspiciousEvents >= 1, 'Should have suspicious events');
  assert.ok(dashRes.body.protocolDistribution.length === 8, 'Should distribute 8 protocols');
  console.log(`  ✅ GET /dashboard verified. Total events: ${dashRes.body.stats.totalEvents}, Accuracy: ${dashRes.body.stats.detectionAccuracy}%`);

  // 4. GET /events
  console.log('4. Testing GET /events...');
  const eventsRes = await mockRequest(app, 'GET', '/events?page=1&limit=10');
  assert.strictEqual(eventsRes.statusCode, 200);
  assert.strictEqual(eventsRes.body.success, true);
  assert.strictEqual(eventsRes.body.events.length, 10);
  console.log(`  ✅ GET /events verified. Returned page 1 with 10 records.`);

  // 5. GET /alerts
  console.log('5. Testing GET /alerts...');
  const alertsRes = await mockRequest(app, 'GET', '/alerts');
  assert.strictEqual(alertsRes.statusCode, 200);
  assert.strictEqual(alertsRes.body.success, true);
  assert.ok(alertsRes.body.alerts.length > 0, 'Should return alerts');
  const sampleAlertId = alertsRes.body.alerts[0].alertId;
  console.log(`  ✅ GET /alerts verified. Returned ${alertsRes.body.alerts.length} alerts. Sample: ${sampleAlertId}`);

  // 6. DELETE /alerts/:id
  console.log('6. Testing DELETE /alerts/:id...');
  const delRes = await mockRequest(app, 'DELETE', `/alerts/${sampleAlertId}`);
  assert.strictEqual(delRes.statusCode, 200);
  assert.strictEqual(delRes.body.success, true);
  console.log(`  ✅ DELETE /alerts/:id verified. Alert ${sampleAlertId} dismissed.`);

  // 7. GET /events/download/sample/csv
  console.log('7. Testing sample file download...');
  const sampleRes = await mockRequest(app, 'GET', '/events/download/sample/csv');
  assert.strictEqual(sampleRes.statusCode, 200);
  console.log('  ✅ GET /events/download/sample/csv verified.');

  console.log('\n🎉 ALL 7 API ENDPOINTS VERIFIED & WORKING 100% SUCCESSFULLY!\n');
}

runApiTests().catch(err => {
  console.error('API Test Error:', err);
  process.exit(1);
});
