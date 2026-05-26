import React, { useMemo, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import api from '../api';

Chart.register(...registerables);

const questionType = (text) => {
  const behavioral = /experience|team|challenge|story|behavior|culture|soft skill|communication/i;
  return behavioral.test(text) ? 'Behavioral' : 'Technical';
};

const normalizeText = (raw) => {
  const text = Array.isArray(raw) ? raw.join('\n') : String(raw || '');
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`/g, '')
    .replace(/^[>#\-\*\+\u2022]+\s*/gm, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/\n{2,}/g, '\n')
    .trim();
};

const parseQuestions = (raw) => {
  const normalized = normalizeText(raw);
  const lines = normalized.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const intro = /^(interview questions|questions for|please answer|here are|below are|thank you|thanks)/i;

  return lines
    .map((line) => line.replace(/^\d+[\).]?\s*/, '').trim())
    .map((line) => line.replace(/^(question|q)[:\s]*/i, ''))
    .map((line) => line.replace(/^[>\*\+\u2022\-]\s*/g, '').trim())
    .filter((line) => line.length > 12)
    .filter((line) => !intro.test(line))
    .filter((line) => line.includes('?') || /^(what|why|how|when|where|who|which|would|could|should|can|is|are|do|does|tell|describe|explain)\b/i.test(line));
};

export default function Dashboard({ applications, activeTab }) {
  const [role, setRole] = useState('Software Engineer');
  const [company, setCompany] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const counts = useMemo(() => {
    const map = { Applied: 0, 'Round 1': 0, 'Round 2': 0, Offer: 0, Rejected: 0 };
    applications.forEach((app) => {
      map[app.status] = (map[app.status] || 0) + 1;
    });
    return map;
  }, [applications]);

  const effectiveCounts = useMemo(() => {
    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    if (total === 0) {
      return { Applied: 8, 'Round 1': 5, 'Round 2': 3, Offer: 4, Rejected: 2 };
    }
    return counts;
  }, [counts]);

  const chartData = {
    labels: Object.keys(effectiveCounts),
    datasets: [{
      data: Object.values(effectiveCounts),
      backgroundColor: ['#2563eb', '#7c3aed', '#f97316', '#22c55e', '#ef4444'],
      borderColor: ['#1d4ed8', '#6d28d9', '#ea580c', '#16a34a', '#dc2626'],
      borderWidth: 2,
      hoverOffset: 8
    }]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          boxWidth: 14,
          padding: 12
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.formattedValue}`
        }
      }
    }
  };

  const onGenerate = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await api.post('/ai/questions', { role, company });
      const parsed = parseQuestions(res.data.questions || '');
      const formatted = parsed.map((text) => ({ text, type: questionType(text) }));
      setQuestions(formatted);
      setCurrentQuestionIndex(0);
    } catch (error) {
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setAiError(error.response?.data?.error || error.message || 'Failed to generate questions.');
    } finally {
      setAiLoading(false);
    }
  };

  const copyQuestion = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const showQuestionFlow = activeTab === 'questions' && questions.length > 0;
  const currentQuestion = questions[currentQuestionIndex];
  const questionCount = questions.length;
  const isDone = questionCount > 0 && currentQuestionIndex >= questionCount;
  const progressPercent = questionCount === 0 ? 0 : Math.min((currentQuestionIndex / questionCount) * 100, 100);

  const handlePrev = () => {
    setCurrentQuestionIndex((index) => Math.max(index - 1, 0));
  };

  const handleNext = () => {
    setCurrentQuestionIndex((index) => Math.min(index + 1, questionCount));
  };

  const handleRestart = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
  };

  return (
    <section id="overview" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-500 uppercase">Pipeline Overview</p>
          <h2 className="text-2xl font-bold text-white">Application health and interview prep</h2>
        </div>
        <div className="text-sm text-gray-300">{activeTab === 'questions' ? 'Interview Prep' : 'Overview'}</div>
      </div>

      {showQuestionFlow ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl">
            <div className="mb-4">
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            {isDone ? (
              <div className="text-center py-16">
                <div className="text-3xl font-bold text-white">Done! You're prepared 🎉</div>
                <p className="mt-3 text-gray-400">Review again anytime or restart the question flow.</p>
                <button onClick={handleRestart} className="mt-8 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-500">
                  Restart
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="inline-flex items-center rounded-full bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-300">Question {currentQuestionIndex + 1}</span>
                  <span className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white ${currentQuestion?.type === 'Technical' ? 'bg-emerald-600' : 'bg-emerald-500'}`}>
                    {currentQuestion?.type}
                  </span>
                </div>
                <div className="rounded-[2rem] bg-gray-950 border border-gray-800 p-10 shadow-xl">
                  <p className="text-2xl font-semibold leading-tight text-white" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentQuestion?.text}
                  </p>
                  <button
                    onClick={() => copyQuestion(currentQuestion?.text)}
                    className="mt-8 w-full rounded-2xl bg-gray-800 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-700"
                  >
                    Copy question
                  </button>
                </div>
                <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="w-full rounded-2xl bg-gray-700 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    Previous
                  </button>
                  <div className="text-sm text-gray-300">
                    Question {Math.min(currentQuestionIndex + 1, questionCount)} of {questionCount}
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'questions' ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-200 hover:border-emerald-500 hover:shadow-emerald-500/20">
            <div className="text-sm text-gray-300">AI Interview Questions</div>
            <h3 className="text-lg font-semibold mt-1 text-white">Generate targeted questions</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300">Job role</label>
                <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Software Engineer" className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Company</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <button onClick={onGenerate} disabled={aiLoading} className="w-full rounded-lg bg-emerald-600 text-white py-2 transition-all duration-200 hover:bg-emerald-500 disabled:opacity-70">
                {aiLoading ? <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create questions'}
              </button>
              {aiError && <div className="text-sm text-red-500">{aiError}</div>}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-200 hover:border-emerald-500 hover:shadow-emerald-500/20">
          <div className="text-sm text-gray-400">Current funnel</div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl text-center">
              <div className="text-xs text-gray-400">Total</div>
              <div className="text-xl font-bold text-white">{applications.length}</div>
            </div>
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl text-center">
              <div className="text-xs text-gray-400">Applied</div>
              <div className="text-xl font-bold text-white">{counts.Applied}</div>
            </div>
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl text-center">
              <div className="text-xs text-gray-400">Interviews</div>
              <div className="text-xl font-bold text-white">{counts['Round 1'] + counts['Round 2']}</div>
            </div>
          </div>
          <div className="h-64 mt-6">
            <Pie data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </section>
  );
}
