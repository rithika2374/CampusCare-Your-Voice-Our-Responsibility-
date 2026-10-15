import React, { useState } from 'react';
import {
  Shield,
  Search,
  PlusCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Building,
  Users,
  Star,
  Check,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { StatsSummary, Complaint, User } from '../types';
import { COMPLAINT_CATEGORIES, STATUS_CONFIG } from '../utils/constants';
import { CategoryIcon } from '../components/CategoryIcon';

interface HomeViewProps {
  stats: StatsSummary | null;
  onNavigateTab: (tab: 'home' | 'student-dashboard' | 'submit' | 'track' | 'admin' | 'about') => void;
  onTrackId: (id: string) => void;
  onSelectCategoryFilter: (category: string) => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'student-login' | 'student-register' | 'admin-login') => void;
  recentComplaints: Complaint[];
  onSelectComplaint: (complaint: Complaint) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  onNavigateTab,
  onTrackId,
  onSelectCategoryFilter,
  currentUser,
  onOpenAuth,
  recentComplaints,
  onSelectComplaint,
}) => {
  const [quickTrackInput, setQuickTrackInput] = useState('');
  const [trackError, setTrackError] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTrackInput.trim()) {
      setTrackError('Please enter a Complaint ID');
      return;
    }
    setTrackError('');
    onTrackId(quickTrackInput.trim());
  };

  const sampleTrackIds = ['CC-2025-1001', 'CC-2025-1002', 'CC-2025-1006', 'CC-2025-1005'];

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Official College Grievance & Facility Portal
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            CampusCare – <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300">
              “Your Voice, Our Responsibility.”
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            A comprehensive, digital solution for college students to report problems, track real-time
            maintenance progress, and enable college administration to resolve campus issues with
            speed, transparency, and accountability.
          </p>

          {/* Quick Track Input Bar */}
          <div className="max-w-2xl mx-auto pt-4">
            <form
              onSubmit={handleTrackSubmit}
              className="relative flex flex-col sm:flex-row items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl"
            >
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-slate-300 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={quickTrackInput}
                  onChange={(e) => setQuickTrackInput(e.target.value)}
                  placeholder="Enter Complaint ID (e.g. CC-2025-1001)..."
                  className="w-full pl-11 pr-4 py-3 bg-white/10 text-white placeholder-slate-300 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 border border-white/10"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Track Complaint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {trackError && (
              <p className="text-xs text-rose-300 mt-2 text-left pl-3 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {trackError}
              </p>
            )}

            {/* Quick Demo Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-300">
              <span className="text-slate-400">Quick track demo tickets:</span>
              {sampleTrackIds.map((id) => (
                <button
                  key={id}
                  onClick={() => onTrackId(id)}
                  className="font-mono text-[11px] px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md text-blue-200 border border-white/10 transition-colors cursor-pointer"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigateTab('submit')}
              className="px-6 py-3.5 bg-white text-blue-900 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Submit a Problem Now
            </button>

            <button
              onClick={() => {
                if (!currentUser) onOpenAuth('student-login');
                else onNavigateTab('student-dashboard');
              }}
              className="px-6 py-3.5 bg-blue-700/60 hover:bg-blue-700 border border-blue-400/40 text-white font-semibold text-sm rounded-xl transition-all backdrop-blur-xs flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              Student Dashboard
            </button>

            <button
              onClick={() => {
                if (currentUser?.role === 'admin') onNavigateTab('admin');
                else onOpenAuth('admin-login');
              }}
              className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-indigo-400" />
              Admin Portal
            </button>
          </div>
        </div>
      </section>

      {/* METRICS OVERVIEW CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{stats?.total || 10}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Complaints
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-amber-700">
                {(stats?.submitted || 0) + (stats?.underReview || 0) + (stats?.inProgress || 0)}
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active / In Progress
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-emerald-700">{stats?.resolved || 4}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Resolved & Verified
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200/80 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-indigo-700">
                {stats?.resolutionRate || 85}%
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Resolution Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLAINT CATEGORIES DIRECTORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Issue Classification
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Report Any Campus Problem
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Select a category to view guidelines, report an issue, or filter recent updates.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('submit')}
            className="mt-4 md:mt-0 text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Open Complaint Form</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {COMPLAINT_CATEGORIES.map((cat) => {
            const count = stats?.categoryCounts?.[cat.name] || 0;
            return (
              <div
                key={cat.name}
                onClick={() => {
                  onSelectCategoryFilter(cat.name);
                  onNavigateTab('submit');
                }}
                className="group relative bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                    <CategoryIcon category={cat.name} className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">{count} reported</span>
                  <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Report &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW CAMPUSCARE WORKS (3-STEP PROCESS) */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Transparent Redressal Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How CampusCare Works
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From the instant you report a problem to on-site resolution and post-fix feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-blue-500/20">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Student Submits Issue</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log in and describe the issue with photos, exact campus location (Block, Floor, Room),
                and priority. A permanent unique ticket ID (e.g. <code>CC-2025-1049</code>) is instantly
                generated.
              </p>
              <div className="text-[11px] font-semibold text-blue-700 bg-blue-50 p-2 rounded-lg">
                Instant Ticket ID & Real-Time Tracking
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-indigo-500/20">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Admin Reviews & Assigns</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                College authorities (Dean of Student Affairs, Estate Officers, IT cell) review the
                ticket, assign field technicians, update progress, and post official progress remarks.
              </p>
              <div className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 p-2 rounded-lg">
                Departmental Assignment & Audit Log
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-emerald-500/20">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">3. Resolution & Feedback</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Once repaired, the ticket is marked <em>Resolved</em>. The student receives verification
                and rates the work with star ratings and feedback to ensure high quality campus standards.
              </p>
              <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
                Verified Resolution & 5-Star Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENTLY RESOLVED / AUDIT SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Transparency & Results
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Recent Campus Resolutions
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Real problems solved across our faculties, dormitories, and common areas.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('track')}
            className="mt-4 sm:mt-0 text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Track Any Ticket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentComplaints
            .filter((c) => c.status === 'Resolved' || c.adminResponse)
            .slice(0, 3)
            .map((complaint) => {
              const statusCfg = STATUS_CONFIG[complaint.status];
              return (
                <div
                  key={complaint.id}
                  onClick={() => onSelectComplaint(complaint)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {complaint.id}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {complaint.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{complaint.title}</h4>

                    <p className="text-xs text-slate-500 line-clamp-2">{complaint.description}</p>

                    {complaint.adminResponse && (
                      <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900">
                        <span className="font-semibold block text-blue-800">Admin Action:</span>
                        <span className="italic line-clamp-2">"{complaint.adminResponse}"</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px] text-slate-400">{complaint.location}</span>
                    {complaint.feedback && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="font-bold text-slate-700 text-xs">
                          {complaint.feedback.rating}/5
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Facing an issue on campus right now?
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Don't wait in long physical office queues. File a complaint online in less than 2
              minutes, receive SMS/email updates, and track every step until it is resolved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('submit')}
              className="px-6 py-3.5 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all shadow-md cursor-pointer text-center"
            >
              Submit Complaint
            </button>
            <button
              onClick={() => onNavigateTab('about')}
              className="px-6 py-3.5 bg-blue-800/80 hover:bg-blue-800 border border-blue-400/30 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer text-center"
            >
              View System Specs
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
