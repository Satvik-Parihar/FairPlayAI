// controllers/reportsController.js
const Report = require('../models/Reports');

exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Check if user has permission to view this report
    if (report.user_id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(report);
  } catch (err) {
    next(err);
  }
};

exports.createReport = async (req, res, next) => {
  try {
    const reportData = {
      ...req.body,
      user_id: req.user.id // Attach user ID from auth middleware
    };
    
    const newReport = new Report(reportData);
    const savedReport = await newReport.save();
    
    res.status(201).json(savedReport);
  } catch (err) {
    next(err);
  }
};