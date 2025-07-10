// routers/reports.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Reports');

// Get report by ID
router.get('/:id', async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    next(err);
  }
});

// Create new report
router.post('/', async (req, res, next) => {
  try {
    const newReport = new Report(req.body);
    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (err) {
    next(err);
  }
});

module.exports = router;