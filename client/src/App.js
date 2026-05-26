import React, { useEffect, useMemo, useState } from 'react';
import Dashboard from './components/Dashboard';
import ApplicationForm from './components/ApplicationForm';
import KanbanBoard from './components/KanbanBoard';
import API from './api';

const navItems = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'applications', label: 'Applications', icon: '📋' },
  { id: 'questions', label: 'Interview Prep', icon: '💬' }
];

export default function App() {
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/applications');
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to load applications', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totals = { all: applications.length, interviews: 0, offers: 0, rejected: 0 };
    applications.forEach((app) => {
      if (app.status === 'Offer') totals.offers += 1;
      if (app.status === 'Rejected') totals.rejected += 1;
      if (app.status === 'Round 1' || app.status === 'Round 2') totals.interviews += 1;
    });
    return totals;
  }, [applications]);

  return (
    <div className="min-h-screen grid grid-cols-12 bg-gray-950 text-white">
      <aside className="col-span-12 md:col-span-3 lg:col-span-2 bg-gray-950 text-white p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white">AI</div>
            <div>
              <div className="font-semibold text-white">Job Manager</div>
              <div className="text-sm text-gray-300">MERN Portal</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${activeTab === item.id ? 'bg-emerald-700 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-emerald-400'}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="text-sm text-gray-300">Built with Tailwind — responsive and accessible.</div>
      </aside>

      <main className="col-span-12 md:col-span-9 lg:col-span-10 p-8 bg-gray-950">
        <header className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-emerald-500 uppercase">AI Job Application Manager</p>
            <h1 className="text-3xl font-bold text-white">Recruitment Pipeline</h1>
          </div>
          <button onClick={fetchApps} disabled={loading} className="rounded-lg px-4 py-2 bg-emerald-600 text-white transition-all duration-200 hover:bg-emerald-500 hover:scale-105">
            {loading ? <span className="inline-block w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" /> : 'Refresh data'}
          </button>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800 text-white p-6 rounded-2xl shadow-lg hover:border-emerald-500 hover:shadow-emerald-500/20 hover:shadow-lg transition-all duration-200">
            <div className="text-sm text-gray-300">Total Applications</div>
            <div className="text-2xl font-bold mt-2">{stats.all}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 text-white p-6 rounded-2xl shadow-lg hover:border-emerald-500 hover:shadow-emerald-500/20 hover:shadow-lg transition-all duration-200">
            <div className="text-sm text-gray-300">Interviews</div>
            <div className="text-2xl font-bold mt-2">{stats.interviews}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 text-white p-6 rounded-2xl shadow-lg hover:border-emerald-500 hover:shadow-emerald-500/20 hover:shadow-lg transition-all duration-200">
            <div className="text-sm text-gray-300">Offers</div>
            <div className="text-2xl font-bold mt-2">{stats.offers}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 text-white p-6 rounded-2xl shadow-lg hover:border-emerald-500 hover:shadow-emerald-500/20 hover:shadow-lg transition-all duration-200">
            <div className="text-sm text-gray-300">Rejected</div>
            <div className="text-2xl font-bold mt-2">{stats.rejected}</div>
          </div>
        </section>

        <section>
          {(activeTab === 'overview' || activeTab === 'questions') && (
            <Dashboard applications={applications} activeTab={activeTab} />
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-300">Applications</p>
                  <h2 className="text-2xl font-bold text-white">Full kanban board</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-500 hover:scale-105"
                >
                  Add Application
                </button>
              </div>

              <KanbanBoard applications={applications} setApplications={setApplications} />

              {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                  <div className="w-full max-w-2xl rounded-3xl bg-gray-900 border border-gray-800 p-6 shadow-2xl">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-emerald-500">New Application</p>
                        <h3 className="text-2xl font-bold text-white">Create an application card</h3>
                      </div>
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 transition-all duration-200 hover:bg-gray-700 hover:text-white"
                      >
                        Close
                      </button>
                    </div>
                    <ApplicationForm
                      onCreated={() => {
                        fetchApps();
                        setShowAddModal(false);
                      }}
                      onClose={() => setShowAddModal(false)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
