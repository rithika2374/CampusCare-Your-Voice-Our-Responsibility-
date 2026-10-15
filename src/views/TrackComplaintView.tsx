import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Building,
  User,
  Star,
  Send,
  AlertCircle,
  Copy,
  Check,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Complaint, ComplaintStatus, User as UserType } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate } from '../utils/constants';
import { CategoryIcon } from '../components/CategoryIcon';
import { api } from '../services/api';

interface TrackComplaintViewProps {
  initialId?: string;
  currentUser: UserType | null;
  onOpenSubmit: () => void;
  onComplaintUpdated?: (updated: Complaint) => void;
}

export const TrackComplaintView: React.FC<TrackComplaintViewProps> = ({
  initialId,
  currentUser,
  onOpenSubmit,
  onComplaintUpdated,
}) => {
  const [ticketId, setTicketId] = useState(initialId || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Student feedback state
  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const sampleIds = [
    { id: 'CC-2025-1001', label: 'Wi-Fi (In Progress)' },
    { id: 'CC-2025-1002', label: 'Projector (Resolved)' },
    { id: 'CC-2025-1003', label: 'Water Cooler (Under Review)' },
    { id: 'CC-2025-1004', label: 'Chemistry Lab (Submitted)' },
    { id: 'CC-2025-1006', label: 'Hostel Geyser (Resolved)' },
  ];

  const handleSearch = async (idToSearch: string) => {
    const cleanId = idToSearch.trim().toUpperCase();
    if (!cleanId) {
      setErrorMessage('Please enter a Complaint ID to track.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const data = await api.getComplaintById(cleanId);
      setComplaint(data);
      if (data.feedback) {
        setRating(data.feedback.rating);
        setFeedbackComment(data.feedback.comment);
      }
    } catch (err: any) {
      setComplaint(null);
      setErrorMessage(
        err.message || `No record found for ticket #${cleanId}. Please check the ID and try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      setTicketId(initialId);
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleCopy = () => {
    if (complaint) {
      navigator.clipboard.writeText(complaint.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;

    setIsSubmittingFeedback(true);
    setFeedbackSuccess(null);

    try {
      const updated = await api.submitFeedback(complaint.id, rating, feedbackComment);
      setComplaint(updated);
      setFeedbackSuccess('Feedback recorded successfully! Thank you for rating the resolution.');
      if (onComplaintUpdated) onComplaintUpdated(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const statuses: ComplaintStatus[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Real-Time Grievance Tracker
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Track Your Complaint Status
        </h1>
        <p className="text-sm text-slate-600">
          Enter your unique Complaint ID to check current status, assigned technicians, and official
          college updates.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(ticketId);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value.toUpperCase())}
              placeholder="Enter Complaint ID (e.g. CC-2025-1001)..."
              className="w-full pl-11 pr-4 py-3 text-sm font-mono uppercase border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {isLoading ? 'Searching...' : 'Track Ticket'}
          </button>
        </form>

        {/* Demo Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
          <span className="font-semibold text-slate-600">Click to test:</span>
          {sampleIds.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTicketId(item.id);
                handleSearch(item.id);
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 rounded-lg font-mono text-[11px] transition-colors cursor-pointer"
            >
              {item.id} <span className="text-[10px] text-slate-400">({item.label})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Record Not Found</div>
            <p className="text-xs text-rose-600 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* COMPLAINT DETAILS DISPLAY */}
      {complaint && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in duration-200 space-y-6">
          {/* Top banner */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <CategoryIcon category={complaint.category} className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {complaint.id}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                    title="Copy ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{complaint.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold border ${PRIORITY_CONFIG[complaint.priority].badge}`}
              >
                {complaint.priority} Priority
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold border ${STATUS_CONFIG[complaint.status].bg} ${STATUS_CONFIG[complaint.status].text} ${STATUS_CONFIG[complaint.status].border}`}
              >
                {complaint.status}
              </span>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-6">
            {/* Progress Stepper */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Resolution Stepper
              </div>
              <div className="grid grid-cols-4 gap-2 relative">
                {statuses.map((step, idx) => {
                  const stepIdx = statuses.indexOf(step);
                  const currentIdx = statuses.indexOf(complaint.status);
                  const isPassed = stepIdx <= currentIdx;
                  const isCurrent = step === complaint.status;

                  return (
                    <div key={step} className="flex flex-col items-center text-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isPassed && !isCurrent ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium ${
                          isCurrent
                            ? 'text-blue-700 font-bold'
                            : isPassed
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Location & Timing
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>
                    Location: <strong className="text-slate-900">{complaint.location}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Submitted: {formatDate(complaint.createdAt)}</span>
                </div>
                {complaint.assignedDepartment && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Building className="w-4 h-4 text-indigo-500" />
                    <span>Assigned Section: <strong className="text-slate-900">{complaint.assignedDepartment}</strong></span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Student & Category
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CategoryIcon category={complaint.category} className="w-4 h-4 text-blue-600" />
                  <span>Category: <strong className="text-slate-900">{complaint.category}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Reported By: <strong className="text-slate-900">{complaint.studentName}</strong> ({complaint.studentDepartment || 'General'})</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Problem Description
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {complaint.description}
              </p>
            </div>

            {/* Official Admin Remark */}
            {complaint.adminResponse ? (
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-blue-900">
                  <Shield className="w-4 h-4 text-blue-700" /> Official Administration Remark
                </div>
                <p className="text-sm text-blue-950 italic leading-relaxed">
                  "{complaint.adminResponse}"
                </p>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500 italic flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Ticket is actively queued for review by the campus facility supervisor.</span>
              </div>
            )}

            {/* Timeline */}
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" /> Ticket Progress Timeline
              </div>
              <div className="relative pl-6 space-y-3 border-l-2 border-slate-200 ml-2">
                {complaint.timeline.map((ev, idx) => (
                  <div key={ev.id || idx} className="relative">
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600" />
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{ev.title}</span>
                        <span className="text-[11px] text-slate-400">{formatDate(ev.timestamp)}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{ev.description}</p>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">By: {ev.updatedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Feedback Form (If Resolved) */}
            {complaint.status === 'Resolved' && (
              <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Star className="w-4 h-4 text-amber-600 fill-amber-400" /> Student Satisfaction Feedback
                  </div>
                  {complaint.feedback && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Feedback Recorded
                    </span>
                  )}
                </div>

                {complaint.feedback ? (
                  <div className="bg-white p-4 rounded-lg border border-amber-200 space-y-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <Star
                          key={st}
                          className={`w-4 h-4 ${
                            st <= complaint.feedback!.rating
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {complaint.feedback.rating}/5 Stars
                      </span>
                    </div>
                    {complaint.feedback.comment && (
                      <p className="text-xs text-slate-700 italic">"{complaint.feedback.comment}"</p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                    <p className="text-xs text-slate-600">
                      This issue was marked as Resolved. How would you rate the resolution quality and speed?
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-700">Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setRating(st)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                st <= rating ? 'text-amber-500 fill-amber-400' : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Add brief remarks (e.g. 'Projector lamp is working clearly now')..."
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingFeedback}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSubmittingFeedback ? 'Submitting...' : 'Submit Satisfaction Rating'}
                    </button>
                  </form>
                )}

                {feedbackSuccess && (
                  <p className="text-xs text-emerald-700 font-semibold">{feedbackSuccess}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
