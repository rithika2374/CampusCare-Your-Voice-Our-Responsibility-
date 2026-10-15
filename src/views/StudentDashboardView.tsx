import React, { useState } from 'react';
import {
  PlusCircle,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  ChevronRight,
  User as UserIcon,
  Calendar,
  MapPin,
  Sparkles,
  FileText,
  Building,
} from 'lucide-react';
import { Complaint, ComplaintStatus, User } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate } from '../utils/constants';
import { CategoryIcon } from '../components/CategoryIcon';

interface StudentDashboardViewProps {
  currentUser: User | null;
  complaints: Complaint[];
  onOpenSubmit: () => void;
  onOpenAuth: (mode?: 'student-login') => void;
  onSelectComplaint: (complaint: Complaint) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  currentUser,
  complaints,
  onOpenSubmit,
  onOpenAuth,
  onSelectComplaint,
}) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Student Portal Sign In Required</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Sign in with your student college account to view your complaint records, track real-time
          resolutions, and give feedback to management.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('student-login')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md cursor-pointer"
          >
            Sign In with College Email
          </button>
        </div>
      </div>
    );
  }

  // Filter complaints belonging to this student
  const studentComplaints = complaints.filter(
    (c) => c.studentId === currentUser.id || c.studentEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  // Compute student stats
  const total = studentComplaints.length;
  const pending = studentComplaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;
  const inProgress = studentComplaints.filter((c) => c.status === 'In Progress').length;
  const resolved = studentComplaints.filter((c) => c.status === 'Resolved').length;

  // Filtered list
  const filtered = studentComplaints.filter((c) => {
    if (selectedStatusTab === 'Pending' && c.status !== 'Submitted' && c.status !== 'Under Review') {
      return false;
    }
    if (selectedStatusTab === 'In Progress' && c.status !== 'In Progress') {
      return false;
    }
    if (selectedStatusTab === 'Resolved' && c.status !== 'Resolved') {
      return false;
    }
    if (selectedCategory !== 'All' && c.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Welcome Header Card */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={
              currentUser.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80'
            }
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{currentUser.name}</h1>
              <span className="text-xs bg-blue-500/30 text-blue-100 px-2 py-0.5 rounded-full border border-blue-400/30">
                {currentUser.year || '3rd Year'}
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>
                Roll No: <strong className="font-mono">{currentUser.studentId || '2023CS104'}</strong>
              </span>
              <span>•</span>
              <span>{currentUser.department || 'Computer Science & Engineering'}</span>
              <span>•</span>
              <span>{currentUser.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSubmit}
          className="px-5 py-3 bg-white text-blue-800 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-blue-600" />
          File New Complaint
        </button>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div
          onClick={() => setSelectedStatusTab('All')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatusTab === 'All'
              ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Total Submitted</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1">All complaints filed by you</div>
        </div>

        {/* Pending */}
        <div
          onClick={() => setSelectedStatusTab('Pending')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatusTab === 'Pending'
              ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-500/20 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-purple-700 mb-2">
            <span>Pending Review</span>
            <AlertCircle className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-purple-900">{pending}</div>
          <div className="text-[11px] text-slate-400 mt-1">Submitted or under evaluation</div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => setSelectedStatusTab('In Progress')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatusTab === 'In Progress'
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700 mb-2">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-800">{inProgress}</div>
          <div className="text-[11px] text-slate-400 mt-1">Maintenance team working</div>
        </div>

        {/* Resolved */}
        <div
          onClick={() => setSelectedStatusTab('Resolved')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            selectedStatusTab === 'Resolved'
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/20 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 mb-2">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-800">{resolved}</div>
          <div className="text-[11px] text-slate-400 mt-1">Fixed & verified issues</div>
        </div>
      </div>

      {/* FILTERS & SEARCH TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Pending', 'In Progress', 'Resolved'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedStatusTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatusTab === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, keyword, location..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* COMPLAINTS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            My Submitted Tickets ({filtered.length})
          </h2>
          <span className="text-xs text-slate-400">Click any card to view timeline & official remarks</span>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No complaints found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedStatusTab !== 'All'
                ? 'Try adjusting your search query or status filter.'
                : "You haven't filed any complaints yet. Notice something broken or inefficient on campus? Let college authorities know!"}
            </p>
            <button
              onClick={onOpenSubmit}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              File Your First Complaint
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filtered.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status];
              const priorityCfg = PRIORITY_CONFIG[item.priority];

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectComplaint(item)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0 mt-0.5">
                      <CategoryIcon category={item.category} className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">{item.category}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${priorityCfg.badge}`}
                        >
                          {item.priority}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" /> {item.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Filed {formatDate(item.createdAt)}
                        </span>
                        {item.assignedDepartment && (
                          <span className="flex items-center gap-1 text-indigo-600">
                            <Building className="w-3.5 h-3.5" /> Assigned: {item.assignedDepartment}
                          </span>
                        )}
                      </div>

                      {item.adminResponse && (
                        <div className="p-2 bg-blue-50/70 rounded-lg text-xs text-blue-900 border border-blue-100 flex items-start gap-1.5">
                          <span className="font-bold shrink-0">Admin Update:</span>
                          <span className="line-clamp-1 italic">{item.adminResponse}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action / Feedback Indicator */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                    {item.status === 'Resolved' && !item.feedback && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md flex items-center gap-1 animate-pulse">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Feedback Pending
                      </span>
                    )}

                    {item.feedback && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span>{item.feedback.rating}/5 Rated</span>
                      </div>
                    )}

                    <div className="text-xs text-blue-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
