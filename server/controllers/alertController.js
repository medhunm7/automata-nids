const Alert = require('../models/Alert');

exports.getAlerts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const { search, severity, attackType, ip, startDate, endDate, sortBy, sortOrder } = req.query;
    const query = {};

    if (severity && severity !== 'ALL') {
      query.severity = severity;
    }

    if (attackType && attackType !== 'ALL') {
      query.attackType = new RegExp(attackType, 'i');
    }

    if (ip) {
      query.$or = [
        { sourceIP: new RegExp(ip, 'i') },
        { destinationIP: new RegExp(ip, 'i') }
      ];
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { alertId: searchRegex },
        { attackType: searchRegex },
        { sourceIP: searchRegex },
        { destinationIP: searchRegex },
        { protocol: searchRegex },
        { description: searchRegex }
      ];
    }

    const sortField = sortBy || 'timestamp';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const total = await Alert.countDocuments(query);
    const alerts = await Alert.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      alerts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve security alerts.',
      error: error.message
    });
  }
};

exports.getAlertById = async (req, res) => {
  try {
    const { id } = req.params;
    const alert = await Alert.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Security alert not found.'
      });
    }

    return res.status(200).json({
      success: true,
      alert
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching alert details',
      error: error.message
    });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Alert.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found or already removed.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Alert ${deleted.alertId || id} removed successfully.`,
      deletedId: id
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete alert record.',
      error: error.message
    });
  }
};

exports.exportCSV = async (req, res) => {
  try {
    const alerts = await Alert.find({}).sort({ timestamp: -1 });

    const headers = ['Alert ID', 'Attack Type', 'Severity', 'Timestamp', 'Source IP', 'Destination IP', 'Protocol', 'Port', 'Action', 'Description', 'Recommended Action'];
    const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

    const rows = alerts.map(a => [
      escapeCsv(a.alertId),
      escapeCsv(a.attackType),
      escapeCsv(a.severity),
      escapeCsv(new Date(a.timestamp).toISOString()),
      escapeCsv(a.sourceIP),
      escapeCsv(a.destinationIP),
      escapeCsv(a.protocol),
      escapeCsv(a.port),
      escapeCsv(a.action),
      escapeCsv(a.description),
      escapeCsv(a.recommendedAction)
    ].join(','));

    const csvOutput = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="nids_alerts_${Date.now()}.csv"`);
    return res.send(csvOutput);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to export alerts CSV',
      error: error.message
    });
  }
};
