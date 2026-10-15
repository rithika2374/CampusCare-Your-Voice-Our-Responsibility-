import React, { useState } from 'react';
import {
  Shield,
  Server,
  Database,
  Layers,
  Code2,
  CheckCircle2,
  Cpu,
  Terminal,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Lock,
  Globe,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../services/api';

interface AboutProjectViewProps {
  onRefreshData: () => void;
}

export const AboutProjectView: React.FC<AboutProjectViewProps> = ({ onRefreshData }) => {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleResetData = async () => {
    if (!window.confirm('Reset database to clean pre-seeded demo complaints and users?')) return;
    setResetting(true);
    try {
      await api.resetDatabase();
      onRefreshData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset database.');
    } finally {
      setResetting(false);
    }
  };

  const copySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
          <Layers className="w-3.5 h-3.5 text-blue-600" /> Technical Documentation & Project Overview
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          CampusCare – Student Problem Management System
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          A full-stack higher education grievance redressal platform engineered to bridge the
          communication gap between university students and college administration.
        </p>
      </div>

      {/* CORE OBJECTIVES & ARCHITECTURE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">1. Student Empowerment</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Students can report physical infrastructure faults, academic timetable clashes, transport delays,
            and hygiene problems without red tape. Each submission receives an immutable Complaint ID
            with real-time status tracking.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">2. College Admin Dispatch</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deans, Wardens, and Maintenance supervisors manage tickets through a unified command
            center with priority triage, department assignment, official responses, and recurring hotspot
            identification.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">3. Persistent Storage & SLAs</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All records persist across sessions and page refreshes via an atomic file-backed JSON engine
            and MongoDB-ready schema. Role-based security ensures student privacy while offering college-wide analytics.
          </p>
        </div>
      </div>

      {/* SYSTEM TECH STACK */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" /> Technical Architecture & Stack
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 text-sm">Frontend</div>
            <div className="text-blue-700 font-semibold">React 19 + TypeScript</div>
            <p className="text-slate-500 text-[11px]">
              Vite build system, Tailwind CSS v4, Lucide icons, responsive design.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 text-sm">Backend Engine</div>
            <div className="text-indigo-700 font-semibold">Node.js + Express.js</div>
            <p className="text-slate-500 text-[11px]">
              RESTful API architecture, JSON body parsers, bearer auth verification.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 text-sm">Database</div>
            <div className="text-emerald-700 font-semibold">Persistent JSON / MongoDB</div>
            <p className="text-slate-500 text-[11px]">
              Auto-saved atomic JSON data store with optional MongoDB Atlas connection string.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900 text-sm">Security & Auth</div>
            <div className="text-purple-700 font-semibold">Salted Scrypt Hashing</div>
            <p className="text-slate-500 text-[11px]">
              Node.js crypto scrypt hashing, role-based access control (Student vs Admin).
            </p>
          </div>
        </div>
      </div>

      {/* REST API ENDPOINTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-600" /> REST API Endpoints Specification
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-4">Method</th>
                <th className="py-2.5 px-4">Endpoint</th>
                <th className="py-2.5 px-4">Access Level</th>
                <th className="py-2.5 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-2 px-4 text-emerald-600 font-bold">POST</td>
                <td className="py-2 px-4 text-slate-800">/api/auth/register</td>
                <td className="py-2 px-4 font-sans text-slate-600">Public</td>
                <td className="py-2 px-4 font-sans text-slate-600">Register new student account</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-emerald-600 font-bold">POST</td>
                <td className="py-2 px-4 text-slate-800">/api/auth/login</td>
                <td className="py-2 px-4 font-sans text-slate-600">Public</td>
                <td className="py-2 px-4 font-sans text-slate-600">Login for student or admin</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-blue-600 font-bold">GET</td>
                <td className="py-2 px-4 text-slate-800">/api/complaints</td>
                <td className="py-2 px-4 font-sans text-slate-600">Authenticated</td>
                <td className="py-2 px-4 font-sans text-slate-600">Filtered complaints (own or all if admin)</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-emerald-600 font-bold">POST</td>
                <td className="py-2 px-4 text-slate-800">/api/complaints</td>
                <td className="py-2 px-4 font-sans text-slate-600">Student / Guest</td>
                <td className="py-2 px-4 font-sans text-slate-600">Create new complaint & generate unique ID</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-blue-600 font-bold">GET</td>
                <td className="py-2 px-4 text-slate-800">/api/complaints/:id</td>
                <td className="py-2 px-4 font-sans text-slate-600">Public / Track</td>
                <td className="py-2 px-4 font-sans text-slate-600">Detailed ticket status and audit trail</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-amber-600 font-bold">PATCH</td>
                <td className="py-2 px-4 text-slate-800">/api/complaints/:id/status</td>
                <td className="py-2 px-4 font-sans text-indigo-700 font-bold">Admin Only</td>
                <td className="py-2 px-4 font-sans text-slate-600">Update status, remarks & assign department</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-emerald-600 font-bold">POST</td>
                <td className="py-2 px-4 text-slate-800">/api/complaints/:id/feedback</td>
                <td className="py-2 px-4 font-sans text-slate-600">Student (Ticket Owner)</td>
                <td className="py-2 px-4 font-sans text-slate-600">Submit star rating & resolution remarks</td>
              </tr>
              <tr>
                <td className="py-2 px-4 text-blue-600 font-bold">GET</td>
                <td className="py-2 px-4 text-slate-800">/api/stats</td>
                <td className="py-2 px-4 font-sans text-slate-600">Public / Admin</td>
                <td className="py-2 px-4 font-sans text-slate-600">System metrics, hotspots, resolution rate</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* DEPLOYMENT GUIDE */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-indigo-600" /> Deployment & Hosting Guide
        </h2>

        <div className="space-y-4 text-xs text-slate-600">
          <p>
            CampusCare is designed as an executable full-stack application that bundles both the React
            client and Express API server into a single portable package.
          </p>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Option A: Deploy to Render / Railway / Cloud Run</h4>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs relative">
              <button
                onClick={() =>
                  copySnippet(
                    `# 1. Clone & install\ngit clone <repo-url>\ncd campuscare\nnpm install\n\n# 2. Build frontend assets\nnpm run build\n\n# 3. Start full-stack server\nnpm start`,
                    'deploy1'
                  )
                }
                className="absolute right-3 top-3 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"
                title="Copy commands"
              >
                {copiedCode === 'deploy1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <pre className="overflow-x-auto leading-relaxed">
{`# 1. Install dependencies
npm install

# 2. Build React client
npm run build

# 3. Start unified Node server
npm start`}
              </pre>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-slate-800 text-sm">Option B: Connect External MongoDB Database</h4>
            <p className="text-[11px] text-slate-500">
              By default, CampusCare uses its atomic file-based persistent database in <code>data/campuscare_store.json</code>.
              To connect external MongoDB Atlas, set the following environment variable:
            </p>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs">
              <code>MONGODB_URI="mongodb+srv://&lt;user&gt;:&lt;pass&gt;@cluster0.mongodb.net/campuscare?retryWrites=true&w=majority"</code>
            </div>
          </div>
        </div>
      </div>

      {/* DEMO DATA RE-SEEDING TOOL */}
      <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-1.5">
            <RefreshCw className="w-4 h-4 text-blue-600" /> Reset Demo Seed Data
          </h4>
          <p className="text-xs text-slate-500">
            Reset all complaints, user credentials, and resolution timestamps back to default demo data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {resetSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
              Demo Data Reset!
            </span>
          )}
          <button
            onClick={handleResetData}
            disabled={resetting}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {resetting ? 'Resetting...' : 'Reset to Sample Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
