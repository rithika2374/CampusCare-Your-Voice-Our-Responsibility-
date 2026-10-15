import React, { useState } from 'react';
import {
  PlusCircle,
  MapPin,
  AlertTriangle,
  FileText,
  User,
  Send,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Info,
  Sparkles,
  HelpCircle,
  Tag,
  Clock,
} from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintPriority, User as UserType } from '../types';
import { COMPLAINT_CATEGORIES, PRIORITY_CONFIG } from '../utils/constants';
import { CategoryIcon } from '../components/CategoryIcon';
import { api } from '../services/api';

interface SubmitComplaintViewProps {
  currentUser: UserType | null;
  onComplaintCreated: (complaint: Complaint) => void;
  onTrackComplaint: (id: string) => void;
  onNavigateTab: (tab: 'home' | 'student-dashboard' | 'track') => void;
  onOpenAuth: () => void;
  initialCategory?: string;
}

export const SubmitComplaintView: React.FC<SubmitComplaintViewProps> = ({
  currentUser,
  onComplaintCreated,
  onTrackComplaint,
  onNavigateTab,
  onOpenAuth,
  initialCategory,
}) => {
  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>(
    (initialCategory as ComplaintCategory) || 'Classroom'
  );
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');

  // Guest student fields (if not logged in)
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestRollNo, setGuestRollNo] = useState('');
  const [guestDept, setGuestDept] = useState('Computer Science & Engineering');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdComplaint, setCreatedComplaint] = useState<Complaint | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Quick suggestion chips based on selected category
  const getSuggestions = (cat: ComplaintCategory): string[] => {
    switch (cat) {
      case 'Classroom':
        return ['HDMI Projector bulb flickering', 'AC not cooling in Room 204', 'Broken writing bench row 3'];
      case 'Laboratory':
        return ['Digital multimeter calibration error', 'Shortage of test tubes in Lab 3', 'Computer terminal 14 blue screen'];
      case 'Transport':
        return ['Bus route 5 morning delay', 'Overcrowding at campus north bus shelter', 'Driver route modification query'];
      case 'Canteen':
        return ['UPI QR scanner connection timeout', 'Water dispenser empty at lunch counter', 'Unhygienic food serving tray'];
      case 'Hostel':
        return ['Solar water geyser breaker trip in Block C', 'Ceiling fan regulator sparking', 'Wi-Fi router down in corridor 2'];
      case 'Drinking Water':
        return ['RO water cooler filter blinking red', 'Low water pressure on 3rd floor', 'Water tap leaking near library hall'];
      case 'Restroom':
        return ['Flush valve stuck open in washroom 2', 'Soap dispenser empty in Block A', 'Water leakage on hallway tiles'];
      case 'Fees':
        return ['Fee receipt not generated after Net Banking', 'Fine erroneously charged on ERP', 'Scholarship adjustment request'];
      case 'Academics':
        return ['Time clash between two core electives', 'Classroom reassignment needed', 'Lab manual PDF link broken on LMS'];
      case 'Internet/Wi-Fi':
        return ['Campus 5G Wi-Fi dropping in Library', 'Hostel LAN port inactive in room 302', 'High latency during online lab tests'];
      default:
        return ['Street lamp not working near gate 2', 'Bicycle parking shed roof leaking'];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please provide a descriptive complaint title.');
      return;
    }
    if (!description.trim() || description.trim().length < 15) {
      setErrorMessage('Please provide a detailed description (at least 15 characters) so technicians can understand the issue.');
      return;
    }
    if (!location.trim()) {
      setErrorMessage('Please enter the specific campus location (Block, Floor, Room).');
      return;
    }

    if (!currentUser && (!guestName.trim() || !guestEmail.trim())) {
      setErrorMessage('Please enter your name and college email so administration can link the ticket.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        title,
        category,
        description,
        location,
        priority,
      };

      if (!currentUser) {
        payload.guestStudent = {
          name: guestName,
          email: guestEmail,
          studentId: guestRollNo || 'GST-2025',
          department: guestDept,
          year: 'Student',
        };
      }

      const complaint = await api.createComplaint(payload);
      setCreatedComplaint(complaint);
      onComplaintCreated(complaint);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyComplaintId = () => {
    if (createdComplaint) {
      navigator.clipboard.writeText(createdComplaint.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setCreatedComplaint(null);
  };

  // SUCCESS CONFIRMATION MODAL / SCREEN
  if (createdComplaint) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Grievance Registered Successfully
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
              Complaint Lodged & Assigned to Queue
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Your issue has been recorded in the central CampusCare database and queued for departmental review.
            </p>
          </div>

          {/* Ticket ID Box */}
          <div className="p-4 bg-slate-50 border-2 border-dashed border-blue-200 rounded-2xl max-w-md mx-auto space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Unique Complaint Tracking ID
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-mono font-extrabold text-blue-700">
                {createdComplaint.id}
              </span>
              <button
                type="button"
                onClick={copyComplaintId}
                className="p-2 text-slate-500 hover:text-blue-700 hover:bg-white rounded-lg transition-colors cursor-pointer border border-slate-200"
                title="Copy ID to clipboard"
              >
                {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Save this ID to track live maintenance progress anytime from the Track page.
            </p>
          </div>

          {/* Summary Preview */}
          <div className="text-left bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Title:</span>
              <span className="font-semibold text-slate-800 text-right">{createdComplaint.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800">{createdComplaint.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="font-semibold text-slate-800">{createdComplaint.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Priority:</span>
              <span className="font-semibold text-slate-800">{createdComplaint.priority}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onTrackComplaint(createdComplaint.id)}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Track This Ticket Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('student-dashboard')}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Go to My Dashboard
            </button>
            <button
              onClick={resetForm}
              className="w-full sm:w-auto px-4 py-3 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Student Redressal System
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Submit a Campus Complaint
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Report infrastructure defects, classroom issues, hostel problems, or academic grievances.
          Our team logs every ticket with an institutional SLA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          {!currentUser && (
            <div className="mb-6 p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-xs text-blue-950">
                  <span className="font-bold">Not signed in?</span> You can sign in to automatically link
                  this ticket to your student record, or submit as guest below.
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                Sign In Now
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Grid Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                1. Select Complaint Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {COMPLAINT_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/90 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <CategoryIcon category={cat.name} className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Common {category} issues:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {getSuggestions(category).map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setTitle(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Complaint Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                2. Complaint Title / Subject <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Broken overhead projector lamp in Seminar Hall 1"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              />
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                3. Urgency / Priority Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['Low', 'Medium', 'High'] as ComplaintPriority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? p === 'High'
                            ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-400/30'
                            : p === 'Medium'
                            ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-400/30'
                            : 'border-slate-500 bg-slate-100 text-slate-800 ring-2 ring-slate-400/30'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{p} Priority</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {p === 'High'
                          ? 'Hazard / Exam blocker'
                          : p === 'Medium'
                          ? 'Standard issue'
                          : 'Minor request'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                4. Exact Campus Location <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Science Complex, Block B, 2nd Floor, Chemistry Lab 204"
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Include building name, floor number, and room/corridor identifier.
              </p>
            </div>

            {/* Detailed Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  5. Detailed Description <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {description.length} characters (min 15)
                </span>
              </div>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the problem in detail: when it started, how many students are impacted, specific machine/appliance details, or any safety concerns..."
                className="w-full p-3.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed"
              />
            </div>

            {/* Guest Details (If user is not logged in) */}
            {!currentUser && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" /> Student Verification Info
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">College Email</label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="e.g. rahul.sharma@campus.edu"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Roll / Student ID</label>
                    <input
                      type="text"
                      value={guestRollNo}
                      onChange={(e) => setGuestRollNo(e.target.value)}
                      placeholder="e.g. 2023CS104"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={guestDept}
                      onChange={(e) => setGuestDept(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Registering Complaint in Database...' : 'Submit Campus Complaint'}
            </button>
          </form>
        </div>

        {/* Right Live Preview Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Live Preview
              </span>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                CC-2025-XXXX
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                  <CategoryIcon category={category} className="w-3.5 h-3.5" />
                  {category}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${PRIORITY_CONFIG[priority].badge}`}>
                  {priority} Priority
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                {title || 'Complaint title will appear here...'}
              </h4>

              <p className="text-xs text-slate-500 line-clamp-3">
                {description || 'Detailed description of the issue will appear here...'}
              </p>

              <div className="text-[11px] text-slate-600 flex items-center gap-1 pt-2 border-t border-slate-100">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate">{location || 'Specific location...'}</span>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>By: {currentUser?.name || guestName || 'Student'}</span>
                <span className="text-blue-600 font-semibold">Status: Submitted</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Unique Ticket ID generated immediately</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Trackable without login using Complaint ID</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Feedback rating unlocked upon resolution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
