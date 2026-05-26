const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Application = require('./models/Application');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shivamlashkari246_db_user:shivam06@cluster0.uoel9fb.mongodb.net/jetro-ai';

const sampleApplications = [
  {
    candidateName: 'Aisha Patel',
    role: 'Software Engineer',
    company: 'Google',
    status: 'Applied',
    dateApplied: new Date('2026-05-01'),
    salaryRange: { min: 3200000, max: 4200000, currency: 'INR' },
    notes: 'Applied through referral; awaiting recruiter response.'
  },
  {
    candidateName: 'Rohan Sharma',
    role: 'Cloud Software Engineer',
    company: 'Microsoft',
    status: 'Applied',
    dateApplied: new Date('2026-05-03'),
    salaryRange: { min: 3000000, max: 3800000, currency: 'INR' },
    notes: 'Submitted application via careers portal.'
  },
  {
    candidateName: 'Meera Joshi',
    role: 'Frontend Engineer',
    company: 'Flipkart',
    status: 'Applied',
    dateApplied: new Date('2026-05-05'),
    salaryRange: { min: 2200000, max: 2800000, currency: 'INR' },
    notes: 'Portfolio and cover letter attached.'
  },
  {
    candidateName: 'Nikhil Verma',
    role: 'Backend Engineer',
    company: 'Swiggy',
    status: 'Round 1',
    dateApplied: new Date('2026-05-06'),
    salaryRange: { min: 2400000, max: 3100000, currency: 'INR' },
    notes: 'Phone screen scheduled for next week.'
  },
  {
    candidateName: 'Priya Singh',
    role: 'Full Stack Engineer',
    company: 'Razorpay',
    status: 'Round 1',
    dateApplied: new Date('2026-05-08'),
    salaryRange: { min: 2600000, max: 3300000, currency: 'INR' },
    notes: 'Technical screen completed; awaits assignment details.'
  },
  {
    candidateName: 'Aditya Rao',
    role: 'Software Development Engineer',
    company: 'Zepto',
    status: 'Round 2',
    dateApplied: new Date('2026-05-10'),
    salaryRange: { min: 2800000, max: 3500000, currency: 'INR' },
    notes: 'Round 2 interview with engineering manager booked.'
  },
  {
    candidateName: 'Kavya Menon',
    role: 'Payment Systems Engineer',
    company: 'CRED',
    status: 'Offer',
    dateApplied: new Date('2026-05-12'),
    salaryRange: { min: 3400000, max: 4300000, currency: 'INR' },
    notes: 'Offer received; evaluating compensation package.'
  },
  {
    candidateName: 'Sahil Kapoor',
    role: 'Product Engineer',
    company: 'Meesho',
    status: 'Rejected',
    dateApplied: new Date('2026-05-02'),
    salaryRange: { min: 2000000, max: 2500000, currency: 'INR' },
    notes: 'Rejected after Round 1 debrief.'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', MONGODB_URI);

    await Application.deleteMany({});
    console.log('Cleared existing applications.');

    await Application.insertMany(sampleApplications);
    console.log('Inserted sample applications:', sampleApplications.length);
  } catch (err) {
    console.error('Seed failed', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
