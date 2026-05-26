const Application = require('../models/Application');

exports.list = async (req, res) => {
  const apps = await Application.find().sort({ createdAt: -1 });
  res.json(apps);
};

exports.get = async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) return res.status(404).json({ message: 'Not found' });
  res.json(app);
};

exports.create = async (req, res) => {
  const app = new Application(req.body);
  await app.save();
  res.status(201).json(app);
};

exports.update = async (req, res) => {
  const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!app) return res.status(404).json({ message: 'Not found' });
  res.json(app);
};

exports.remove = async (req, res) => {
  const app = await Application.findByIdAndDelete(req.params.id);
  if (!app) return res.status(404).json({ message: 'Not found' });
  res.json({ success: true });
};
