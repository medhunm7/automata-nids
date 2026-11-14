const path = require('path');
const fs = require('fs');
const NetworkEvent = require('../models/NetworkEvent');
const Alert = require('../models/Alert');
const { parseLogFile } = require('../utils/logParser');
const { AutomataDetector } = require('../automata/detector');

exports.uploadLogs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No log file provided. Please upload a CSV, TXT, or JSON file.'
      });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    // 1. Parse records
    const records = await parseLogFile(filePath, originalName);
    if (!records || records.length === 0) {
      // Clean up uploaded file
      try { fs.unlinkSync(filePath); } catch (e) {}
      return res.status(400).json({
        success: false,
        message: 'The uploaded file does not contain valid network event records.'
      });
    }

    const batchId = `BATCH-${Date.now().toString(36).toUpperCase()}`;

    // 2. Execute Automata Intrusion Detection
    const detector = new AutomataDetector();
    const recordsWithBatch = records.map(r => ({ ...r, batchId }));
    const { processedEvents, alerts, summary } = detector.processBatch(recordsWithBatch);

    // 3. Store processed records into MongoDB
    await NetworkEvent.insertMany(processedEvents);

    // 4. Store any triggered alerts into MongoDB
    if (alerts.length > 0) {
      await Alert.insertMany(alerts);
    }

    // Clean up temporary file
    try { fs.unlinkSync(filePath); } catch (e) {}

    return res.status(200).json({
      success: true,
      message: `Successfully analyzed ${processedEvents.length} events. ${alerts.length} intrusion alerts detected.`,
      batchId,
      summary: {
        totalUploaded: processedEvents.length,
        safeEvents: summary.safeEvents,
        suspiciousEvents: summary.suspiciousEvents,
        alertsDetected: alerts.length,
        detectionAccuracy: summary.detectionAccuracy
      },
      alerts
    });
  } catch (error) {
    console.error('Upload logs error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to process and analyze log file.',
      error: error.message
    });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { search, protocol, status, fsmState, ip } = req.query;
    const query = {};

    if (protocol && protocol !== 'ALL') {
      query.protocol = protocol.toUpperCase();
    }

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    if (fsmState && fsmState !== 'ALL') {
      query.fsmState = fsmState.toUpperCase();
    }

    if (ip) {
      query.$or = [
        { sourceIP: new RegExp(ip, 'i') },
        { destinationIP: new RegExp(ip, 'i') }
      ];
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { sourceIP: searchRegex },
        { destinationIP: searchRegex },
        { action: searchRegex },
        { protocol: searchRegex }
      ];
    }

    const total = await NetworkEvent.countDocuments(query);
    const events = await NetworkEvent.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch network events.',
      error: error.message
    });
  }
};

exports.simulateEvent = async (req, res) => {
  try {
    const { timestamp, sourceIP, destinationIP, protocol, port, action } = req.body;

    if (!sourceIP || !protocol || !action) {
      return res.status(400).json({
        success: false,
        message: 'sourceIP, protocol, and action are required.'
      });
    }

    const eventRecord = {
      timestamp: timestamp || new Date().toISOString(),
      sourceIP: sourceIP.trim(),
      destinationIP: (destinationIP || '10.0.0.1').trim(),
      protocol: protocol.toUpperCase().trim(),
      port: Number(port) || 80,
      action: action.toUpperCase().trim()
    };

    const detector = new AutomataDetector();
    const { annotatedEvent, triggeredAlerts } = detector.processEvent(eventRecord);

    await NetworkEvent.create(annotatedEvent);

    if (triggeredAlerts.length > 0) {
      await Alert.insertMany(triggeredAlerts);
    }

    return res.status(201).json({
      success: true,
      event: annotatedEvent,
      alerts: triggeredAlerts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Simulation error',
      error: error.message
    });
  }
};

exports.downloadSample = (req, res) => {
  const format = (req.params.format || 'csv').toLowerCase();
  const filePath = path.join(__dirname, `../data/sample_traffic.${format}`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Sample file not found.' });
  }

  res.download(filePath, `sample_traffic.${format}`);
};
