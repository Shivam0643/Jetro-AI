import React, { useState } from 'react';
import API from '../api';

export default function ApplicationForm({ onCreated, onClose }) {
  const [form, setForm] = useState({
    candidateName: '',
    role: '',
    company: '',
    status: 'Applied',
    dateApplied: new Date().toISOString().slice(0, 10),
    salaryMin: '',
    salaryMax: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/api/applications', {
        candidateName: form.candidateName,
        role: form.role,
        company: form.company,
        status: form.status,
        dateApplied: form.dateApplied,
        salaryRange: {
          min: form.salaryMin ? Number(form.salaryMin) : undefined,
          max: form.salaryMax ? Number(form.salaryMax) : undefined,
          currency: 'INR'
        },
        notes: form.notes
      });
      setForm({
        candidateName: '',
        role: '',
        company: '',
        status: 'Applied',
        dateApplied: new Date().toISOString().slice(0, 10),
        salaryMin: '',
        salaryMax: '',
        notes: ''
      });
      onCreated();
    } catch (err) {
      console.error('Create failed', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-lg">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Candidate name</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              value={form.candidateName}
              onChange={(e) => setForm({ ...form, candidateName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Role</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Company</label>
            <input
              className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Status</label>
            <select
              className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option>Applied</option>
              <option>Round 1</option>
              <option>Round 2</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-300">Date applied</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              value={form.dateApplied}
              onChange={(e) => setForm({ ...form, dateApplied: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Salary min</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              value={form.salaryMin}
              onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
              placeholder="e.g. 2000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Salary max</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
              value={form.salaryMax}
              onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
              placeholder="e.g. 2800000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Notes</label>
          <textarea
            className="mt-1 w-full rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 transition-all duration-200 hover:bg-gray-700 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-500 disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Create application'}
          </button>
        </div>
      </form>
    </section>
  );
}
