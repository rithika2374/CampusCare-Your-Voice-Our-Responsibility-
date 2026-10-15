import React, { useState } from 'react';
import {
  Shield,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart3,
  PieChart,
  RefreshCw,
  Star,
  Zap,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Complaint,
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  StatsSummary,
  User as UserType,
} from '../types';
import {
  COMPLAINT_CATEGORIES,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  formatDate,
  formatRelativeTime,
} from '../utils/constants';
import { CategoryIcon } from '../components/CategoryIcon';
import { api } from '../services/api';

interface AdminDashboardViewProps {
  currentUser: UserType | null;
  complaints: Complaint[];
  stats: StatsSummary | null;
  onOpenAuth: (mode?: 'admin-login') => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onRefreshData: () => void;
  onComplaintUpdated: (updated: Complaint) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  complaints,
  stats,
  onOpenAuth,
  onSelectComplaint,
  onRefreshData,
  onComplaintUpdated,
}) => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');

  // Quick inline update modal
  const [quickUpdateComplaint, setQuickUpdateComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [adminResponseText, setAdminResponseText] = useState('');
  const [assignedDeptText, setAssignedDeptText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // If not logged in as Admin, show access gate with 1-click Admin sign in
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Administrator Access Required</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          The Admin Portal is reserved for College Deans, Department Heads, and Estate Maintenance
          supervisors to monitor all student complaints and dispatch solutions.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onOpenAuth('admin-login')}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Sign In with Administrator Credentials
          </button>
        </div>
      </div>
    );
  }

  // Filter complaints
  const filtered = complaints.filter((c) => {
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;
    if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = c.id.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchStudent = c.studentName.toLowerCase().includes(q);
      const matchRoll = c.studentRollNo && c.studentRollNo.toLowerCase().includes(q);
      const matchLoc = c.location.toLowerCase().includes(q);
      const matchDept = c.studentDepartment && c.studentDepartment.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchStudent && !matchRoll && !matchLoc && !matchDept) {
        return false;
      }
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === 'priority') {
      const weight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      return (weight[b.priority] || 0) - (weight[a.priority] || 0);
    }
    if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Export complaints to CSV
  const exportToCSV = () => {
    const headers = ['Complaint ID', 'Title', 'Category', 'Priority', 'Status', 'Location', 'Student Name', 'Roll No', 'Department', 'Date', 'Admin Response'];
    const rows = filtered.map((c) => [
      `"${c.id}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.priority}"`,
      `"${c.status}"`,
      `"${c.location.replace(/"/g, '""')}"`,
      `"${c.studentName}"`,
      `"${c.studentRollNo || ''}"`,
      `"${c.studentDepartment || ''}"`,
      `"${formatDate(c.createdAt)}"`,
      `"${(c.adminResponse || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusCare_Complaints_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenQuickUpdate = (c: Complaint, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickUpdateComplaint(c);
    setNewStatus(c.status);
    setAdminResponseText(c.adminResponse || '');
    setAssignedDeptText(c.assignedDepartment || '');
  };

  const handleSaveQuickUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUpdateComplaint) return;

    setIsUpdating(true);
    try {
      const updated = await api.updateComplaintStatus(quickUpdateComplaint.id, {
        status: newStatus,
        adminResponse: adminResponseText,
        assignedDepartment: assignedDeptText,
      });
      onComplaintUpdated(updated);
      setQuickUpdateComplaint(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update complaint status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">College Administration Portal</h1>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                Dean of Student Affairs
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Logged in as: <strong className="text-white">{currentUser.name}</strong> • Comprehensive
              campus problem dispatch, monitoring, and resolution management.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onRefreshData}
            title="Refresh Complaints Data"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* KPI STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
            <span>Total Logged</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{stats?.total || complaints.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">All student grievances</div>
        </div>

        {/* Needs Review (Submitted) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-700 mb-1.5">
            <span>Needs Review</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          </div>
          <div className="text-3xl font-extrabold text-blue-700">{stats?.submitted || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">Fresh unreviewed tickets</div>
        </div>

        {/* Under Review / In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700 mb-1.5">
            <span>In Work Queue</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-800">
            {(stats?.underReview || 0) + (stats?.inProgress || 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Technicians dispatched</div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 mb-1.5">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-800">{stats?.resolved || 0}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {stats?.resolutionRate || 80}% Resolution Rate
          </div>
        </div>

        {/* Urgent High Priority */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-2xs bg-rose-50/20 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 mb-1.5">
            <span>High Priority</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-extrabold text-rose-800">{stats?.highPriorityPending || 0}</div>
          <div className="text-[11px] text-rose-600 mt-1">Requires urgent action</div>
        </div>
      </div>

      {/* ANALYTICS & FREQUENTLY REPORTED HOTSPOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" /> Category Distribution
            </h3>
            <span className="text-[11px] text-slate-400">Total {complaints.length} issues</span>
          </div>

          <div className="space-y-2.5">
            {COMPLAINT_CATEGORIES.slice(0, 6).map((cat) => {
              const count = stats?.categoryCounts?.[cat.name] || 0;
              const percent = stats?.total ? Math.round((count / stats.total) * 100) : 0;

              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <CategoryIcon category={cat.name} className="w-3.5 h-3.5 text-slate-500" />
                      {cat.name}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percent, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution Pie / Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-600" /> Status Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">Current Workflows</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Submitted', count: stats?.submitted || 0, color: 'bg-blue-500', text: 'text-blue-700' },
              { label: 'Under Review', count: stats?.underReview || 0, color: 'bg-purple-500', text: 'text-purple-700' },
              { label: 'In Progress', count: stats?.inProgress || 0, color: 'bg-amber-500', text: 'text-amber-700' },
              { label: 'Resolved', count: stats?.resolved || 0, color: 'bg-emerald-500', text: 'text-emerald-700' },
            ].map((st) => {
              const pct = stats?.total ? Math.round((st.count / stats.total) * 100) : 0;
              return (
                <div key={st.label} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${st.color}`} />
                    <span className="font-semibold text-slate-800">{st.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{st.count}</span>
                    <span className="text-[11px] font-mono text-slate-400 w-10 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Avg. Resolution Speed:</span>
            <span className="font-bold text-slate-800 font-mono">
              {stats?.avgResolutionDays || 1.8} days
            </span>
          </div>
        </div>

        {/* FREQUENTLY REPORTED PROBLEMS & HOTSPOTS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" /> Problem Hotspots
            </h3>
            <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Recurring Areas
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Locations with repeated grievances requiring comprehensive preventive maintenance.
          </p>

          <div className="space-y-2.5">
            {(stats?.recentHotspots && stats.recentHotspots.length > 0
              ? stats.recentHotspots
              : [
                  { location: 'Central Library, 2nd Floor Reading Hall', count: 3, category: 'Internet/Wi-Fi' },
                  { location: 'Boys Hostel Block C', count: 2, category: 'Hostel' },
                  { location: 'Science Complex, Lab 204', count: 2, category: 'Laboratory' },
                  { location: 'Aryabhatta Block, 3rd Floor', count: 1, category: 'Drinking Water' },
                ]
            ).map((hotspot, idx) => (
              <div
                key={hotspot.location + idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 truncate">{hotspot.location}</div>
                  <div className="text-[11px] text-slate-500">{hotspot.category}</div>
                </div>
                <div className="shrink-0 text-right">
                  <span className="font-bold font-mono text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    {hotspot.count} {hotspot.count === 1 ? 'ticket' : 'tickets'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, keyword, student, location..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Categories ({complaints.length})</option>
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority Only</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted (Fresh)</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Sort and summary row */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
          <div>
            Showing <strong className="text-slate-900">{filtered.length}</strong> of{' '}
            <strong className="text-slate-900">{complaints.length}</strong> complaints
            {(categoryFilter !== 'All' || priorityFilter !== 'All' || statusFilter !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setCategoryFilter('All');
                  setPriorityFilter('All');
                  setStatusFilter('All');
                  setSearchQuery('');
                }}
                className="ml-2 text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
            </span>
            <button
              onClick={() => setSortBy('date')}
              className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                sortBy === 'date' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'
              }`}
            >
              Date
            </button>
            <button
              onClick={() => setSortBy('priority')}
              className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                sortBy === 'priority' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'
              }`}
            >
              Priority
            </button>
            <button
              onClick={() => setSortBy('status')}
              className={`px-2 py-1 rounded text-[11px] font-semibold cursor-pointer ${
                sortBy === 'status' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'
              }`}
            >
              Status
            </button>
          </div>
        </div>
      </div>

      {/* COMPLAINTS MANAGEMENT TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Problem Subject</th>
                <th className="py-3 px-4">Category & Priority</th>
                <th className="py-3 px-4">Student & Dept</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No complaints match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const statusCfg = STATUS_CONFIG[item.status];
                  const priorityCfg = PRIORITY_CONFIG[item.priority];

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectComplaint(item)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Ticket ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {item.id}
                      </td>

                      {/* Title & Preview */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.description}
                        </div>
                        {item.adminResponse && (
                          <div className="text-[10px] text-indigo-700 italic mt-0.5 truncate">
                            Admin: "{item.adminResponse}"
                          </div>
                        )}
                      </td>

                      {/* Category & Priority */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                          <CategoryIcon category={item.category} className="w-3.5 h-3.5 text-blue-600" />
                          <span>{item.category}</span>
                        </div>
                        <span
                          className={`inline-block mt-1 text-[10px] px-2 py-0.2 rounded-full font-semibold border ${priorityCfg.badge}`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      {/* Student & Department */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{item.studentName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {item.studentRollNo || 'Student'} • {item.studentDepartment || 'General'}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 max-w-[180px]">
                        <div className="text-slate-700 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {formatRelativeTime(item.createdAt)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {item.status}
                        </span>
                        {item.assignedDepartment && (
                          <div className="text-[10px] text-slate-400 mt-1 truncate">
                            {item.assignedDepartment}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => handleOpenQuickUpdate(item, e)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer border border-indigo-200"
                          >
                            Update
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => onSelectComplaint(item)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                            title="View Full Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK INLINE STATUS UPDATE MODAL */}
      {quickUpdateComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {quickUpdateComplaint.id}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-1">
                  Manage Complaint Status & Official Remarks
                </h3>
              </div>
              <button
                onClick={() => setQuickUpdateComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2">
              <strong className="text-slate-800">{quickUpdateComplaint.title}</strong> — {quickUpdateComplaint.location}
            </p>

            <form onSubmit={handleSaveQuickUpdate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Set New Status <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Submitted', 'Under Review', 'In Progress', 'Resolved'] as ComplaintStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        newStatus === st
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assign Department / Supervisor
                </label>
                <input
                  type="text"
                  value={assignedDeptText}
                  onChange={(e) => setAssignedDeptText(e.target.value)}
                  placeholder="e.g. IT & Network Cell, Sanitation, Estate Office"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Admin Response / Action Taken
                </label>
                <textarea
                  rows={3}
                  value={adminResponseText}
                  onChange={(e) => setAdminResponseText(e.target.value)}
                  placeholder="Explain action taken, technician dispatch details, or ETA so student can see real progress..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setQuickUpdateComplaint(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isUpdating ? 'Saving...' : 'Apply Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
