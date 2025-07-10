// models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  dataset_name: String,
  model_name: String,
  upload_date: String,
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  overall_fairness_score: Number,
  sensitive_attributes: [String],
  metrics: {
    demographic_parity: Number,
    equalized_odds: Number,
    calibration: Number,
    individual_fairness: Number
  },
  bias_detected: [{
    attribute: String,
    severity: String,
    score: Number
  }],
  suggestions: [{
    type: String,
    priority: String,
    description: String
  }],
  models_comparison: [{
    name: String,
    accuracy: Number,
    f1_score: Number,
    demographic_parity: Number,
    equalized_odds: Number,
    calibration: Number,
    individual_fairness: Number,
    overall_score: Number
  }],
  visualizations: {
    fairness_plot: String,
    bias_plot: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Add indexes for better query performance
reportSchema.index({ user_id: 1 });
reportSchema.index({ created_at: -1 });
reportSchema.index({ status: 1 });

module.exports = mongoose.model('Report', reportSchema);