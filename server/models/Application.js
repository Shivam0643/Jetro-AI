const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  candidateName: { type: String, required: true },
  role: { type: String, required: true },
  company: { type: String },
  status: { type: String, default: 'Applied' },
  dateApplied: { type: Date, required: true, default: Date.now },
  salaryRange: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'INR' }
  },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', ApplicationSchema);
