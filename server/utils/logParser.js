/**
 * Network Log Parser Utility
 * Parses CSV, TXT, and JSON formatted log streams into normalized event records.
 */

const fs = require('fs');
const readline = require('readline');

function normalizeRecord(raw) {
  let timestamp = raw.timestamp || raw.Timestamp || raw.time || raw.Date || new Date().toISOString();
  // Ensure valid date
  if (isNaN(new Date(timestamp).getTime())) {
    timestamp = new Date().toISOString();
  } else {
    timestamp = new Date(timestamp).toISOString();
  }

  const sourceIP = raw.sourceIP || raw['Source IP'] || raw.src_ip || raw.src || raw.source || '127.0.0.1';
  const destinationIP = raw.destinationIP || raw['Destination IP'] || raw.dest_ip || raw.dst || raw.destination || '10.0.0.1';
  const protocol = (raw.protocol || raw.Protocol || raw.proto || 'TCP').toUpperCase().trim();
  const port = parseInt(raw.port || raw.Port || raw.dst_port || 80, 10) || 80;
  const action = (raw.action || raw.Action || raw.event || raw.flag || 'DATA').toUpperCase().trim();

  return {
    timestamp,
    sourceIP: String(sourceIP).trim(),
    destinationIP: String(destinationIP).trim(),
    protocol,
    port,
    action
  };
}

async function parseCSVorTXT(filePath) {
  const records = [];
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  let hasHeaders = false;
  let headers = [];

  for await (const rawLine of rl) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    // Check for delimiter: comma, tab, or semicolon
    let parts = [];
    if (line.includes(',')) {
      parts = line.split(',').map(p => p.trim());
    } else if (line.includes('\t')) {
      parts = line.split('\t').map(p => p.trim());
    } else {
      parts = line.split(/\s+/).map(p => p.trim());
    }

    if (parts.length < 5) continue;

    if (isFirstLine) {
      isFirstLine = false;
      const lower0 = parts[0].toLowerCase();
      // Detect if first line is a header row
      if (lower0.includes('time') || lower0.includes('date') || lower0.includes('source') || lower0.includes('timestamp')) {
        hasHeaders = true;
        headers = parts.map(h => h.toLowerCase().replace(/[\s_]/g, ''));
        continue;
      }
    }

    let record = {};
    if (hasHeaders) {
      parts.forEach((val, idx) => {
        const header = headers[idx];
        if (!header) return;
        if (header.includes('time')) record.timestamp = val;
        else if (header.includes('src') || header.includes('source')) record.sourceIP = val;
        else if (header.includes('dst') || header.includes('dest')) record.destinationIP = val;
        else if (header.includes('proto')) record.protocol = val;
        else if (header.includes('port')) record.port = val;
        else if (header.includes('action') || header.includes('event')) record.action = val;
      });
    } else {
      // Standard ordering: Timestamp, Source IP, Destination IP, Protocol, Port, Action
      // Handle timestamp that might contain space: e.g. "2026-11-10 10:12:00,192.168.1.10,..."
      record = {
        timestamp: parts[0],
        sourceIP: parts[1],
        destinationIP: parts[2],
        protocol: parts[3],
        port: parts[4],
        action: parts[5] || parts[parts.length - 1]
      };
    }

    records.push(normalizeRecord(record));
  }

  return records;
}

async function parseJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (err) {
    // Check if line-delimited JSON
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    data = lines.map(l => JSON.parse(l));
  }

  if (!Array.isArray(data)) {
    data = [data];
  }

  return data.map(normalizeRecord);
}

async function parseLogFile(filePath, originalname = '') {
  const ext = (originalname.split('.').pop() || '').toLowerCase();

  if (ext === 'json') {
    return await parseJSON(filePath);
  } else {
    return await parseCSVorTXT(filePath);
  }
}

module.exports = {
  parseLogFile,
  normalizeRecord
};
