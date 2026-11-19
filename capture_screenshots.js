const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const userDataDir = '/tmp/chrome-nids-capture-' + Date.now();
const outputDir = '/Users/medhun/.gemini/antigravity/scratch/automata-nids/Screenshots/captured';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZmViNTgwMDNjODIwOWUyMzZjZDY5YiIsImVtYWlsIjoiYWRtaW5Abmlkcy5sb2NhbCIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJTZWN1cml0eSBBZG1pbiIsImlhdCI6MTc5NTA3OTI2MSwiZXhwIjoxNzk1Njg0MDYxfQ.AlZOgUw7xOWyDpVHkciJPSeJF8ihFYRG7DEnJT_AeCo';
const USER = JSON.stringify({
  id: '6afeb58003c8209e236cd69b',
  name: 'Security Admin',
  email: 'admin@nids.local',
  role: 'admin'
});

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--window-size=1440,900',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);

  // Wait 1.5 seconds for Chrome to start
  await new Promise(r => setTimeout(r, 1500));

  let targets;
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json');
      targets = await res.json();
      break;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const wsUrl = pageTarget.webSocketDebuggerUrl;
  console.log('Connecting to Chrome CDP:', wsUrl);

  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      const cb = callbacks.get(msg.id);
      callbacks.delete(msg.id);
      cb(msg);
    }
  };

  await new Promise(resolve => ws.onopen = resolve);

  function sendCommand(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      callbacks.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');

  async function navigateAndScreenshot(url, filename, waitMs = 2500, preEval = null) {
    console.log(`Navigating to ${url}...`);
    await sendCommand('Page.navigate', { url });
    await new Promise(r => setTimeout(r, waitMs));

    if (preEval) {
      await sendCommand('Runtime.evaluate', { expression: preEval });
      await new Promise(r => setTimeout(r, 1000));
    }

    const { result } = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(result.data, 'base64');
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`Saved screenshot: ${filePath} (${buffer.length} bytes)`);
  }

  // 1. Login page
  await navigateAndScreenshot('https://automata-nids.vercel.app/login', '00_login_page.png', 2000);

  // Set auth tokens in localStorage
  const setAuthScript = `
    localStorage.setItem('nids_token', '${TOKEN}');
    localStorage.setItem('nids_user', '${USER.replace(/'/g, "\\'")}');
  `;
  await sendCommand('Runtime.evaluate', { expression: setAuthScript });

  // 2. Dashboard
  await navigateAndScreenshot('https://automata-nids.vercel.app/', '01_dashboard_telemetry.png', 3500);

  // 3. Alerts Management Console
  await navigateAndScreenshot('https://automata-nids.vercel.app/alerts', '03_alerts_management_console.png', 3000);

  // 4. Log File Upload
  await navigateAndScreenshot('https://automata-nids.vercel.app/upload', '04_log_file_upload.png', 3000);

  // 5. Traffic Analytics Recharts
  await navigateAndScreenshot('https://automata-nids.vercel.app/analytics', '05_traffic_analytics_recharts.png', 3500);

  // 6. Automata Interactive Simulator / Engine Status
  await navigateAndScreenshot('https://automata-nids.vercel.app/simulator', '06_automata_interactive_simulator.png', 3000);
  fs.copyFileSync(path.join(outputDir, '06_automata_interactive_simulator.png'), path.join(outputDir, '02_automata_engine_status.png'));

  // 7. Forensic Report
  await navigateAndScreenshot('https://automata-nids.vercel.app/reports', '07_pdf_forensic_report.png', 3000);

  // 8. Events Table
  await navigateAndScreenshot('https://automata-nids.vercel.app/events', '08_network_events_table.png', 3000);

  ws.close();
  chrome.kill();
  console.log('All screenshots captured successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
