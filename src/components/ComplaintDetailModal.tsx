import React, { useState } from 'react';
import {
  X,
  Calendar,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Star,
  Send,
  Building,
  Shield,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { Complaint, ComplaintStatus, User as UserType } from '../types';
import { STATUS_CONFIG, PRIORITY_CONFIG, formatDate } from '../utils/constants';
import { CategoryIcon } from './CategoryIcon';
import { api } from '../services/api';

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  currentUser: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onComplaintUpdated: (updated: Complaint) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  currentUser,
  isOpen,
  onClose,
  onComplaintUpdated,
}) => {
  if (!isOpen || !complaint) return null;

  const isAdmin = currentUser?.role === 'admin';
  const isOwner = currentUser && currentUser.id === complaint.studentId;

  // Admin update form states
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>(complaint.status);
  const [adminResponse, setAdminResponse] = useState<string>(complaint.adminResponse || '');
  const [assignedDept, setAssignedDept] = useState<string>(complaint.assignedDepartment || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState<string | null>(null);

  // Student feedback form states
  const [rating, setRating] = useState<number>(complaint.feedback?.rating || 5);
  const [feedbackComment, setFeedbackComment] = useState<string>(complaint.feedback?.comment || '');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);

  const statusConfig = STATUS_CONFIG[complaint.status];
  const priorityConfig = PRIORITY_CONFIG[complaint.priority];

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingStatus(true);
    setStatusSuccessMsg(null);

    try {
      const updated = await api.updateComplaintStatus(complaint.id, {
        status: selectedStatus,
        adminResponse,
        assignedDepartment: assignedDept,
      });
      setStatusSuccessMsg('Status and official remark saved successfully.');
      onComplaintUpdated(updated);
      setTimeout(() => setStatusSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update complaint status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStudentFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    setFeedbackSuccessMsg(null);

    try {
      const updated = await api.submitFeedback(complaint.id, rating, feedbackComment);
      setFeedbackSuccessMsg('Feedback submitted. Thank you for rating the resolution!');
      onComplaintUpdated(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const statuses: ComplaintStatus[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <CategoryIcon category={complaint.category} className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {complaint.id}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${priorityConfig.badge}`}
                >
                  {complaint.priority} Priority
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                >
                  {complaint.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-800 mt-1 line-clamp-1">{complaint.title}</h2>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              title="Print complaint ticket"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Progress Tracker Stepper */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Resolution Progress
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
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
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
                      className={`text-xs mt-1.5 font-medium ${
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

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Problem Specifications
              </div>
              <div className="text-xs flex items-center gap-2 text-slate-600">
                <CategoryIcon category={complaint.category} className="w-4 h-4 text-blue-600" />
                <span>
                  Category: <strong className="text-slate-800">{complaint.category}</strong>
                </span>
              </div>
              <div className="text-xs flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  Location: <strong className="text-slate-800">{complaint.location}</strong>
                </span>
              </div>
              <div className="text-xs flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Filed: {formatDate(complaint.createdAt)}</span>
              </div>
              {complaint.assignedDepartment && (
                <div className="text-xs flex items-center gap-2 text-slate-600">
                  <Building className="w-4 h-4 text-indigo-500" />
                  <span>
                    Department In-Charge: <strong className="text-slate-800">{complaint.assignedDepartment}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2.5">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Reported By Student
              </div>
              <div className="text-xs flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4 text-slate-400" />
                <span>
                  Student: <strong className="text-slate-800">{complaint.studentName}</strong>
                </span>
              </div>
              <div className="text-xs text-slate-600 pl-6">
                Roll No: <span className="font-mono font-medium text-slate-700">{complaint.studentRollNo || 'N/A'}</span>
              </div>
              <div className="text-xs text-slate-600 pl-6">
                Department: <span className="text-slate-700">{complaint.studentDepartment || 'General'}</span>
              </div>
              <div className="text-xs text-slate-600 pl-6">
                Email: <span className="text-slate-700">{complaint.studentEmail}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Detailed Description
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
          </div>

          {/* Admin Response Box */}
          {complaint.adminResponse ? (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-blue-900">
                <Shield className="w-4 h-4 text-blue-700" /> Official Administration Remark
              </div>
              <p className="text-sm text-blue-950 leading-relaxed italic">
                "{complaint.adminResponse}"
              </p>
              {complaint.resolvedAt && (
                <div className="text-[11px] text-blue-700 mt-2 font-mono">
                  Marked Resolved on: {formatDate(complaint.resolvedAt)}
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500 italic flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Pending official administrator response or task assignment.</span>
            </div>
          )}

          {/* Timeline History */}
          <div>
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" /> Activity & Resolution Timeline
            </div>
            <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 ml-2">
              {complaint.timeline.map((event, idx) => (
                <div key={event.id || idx} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow-xs" />
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{event.title}</span>
                      <span className="text-[11px] text-slate-400">{formatDate(event.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{event.description}</p>
                    <div className="text-[10px] text-slate-400 mt-1">Logged by: {event.updatedBy}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Feedback Display */}
          {complaint.feedback && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> Student Feedback & Rating
                </span>
                <span className="text-[11px] text-emerald-700">
                  {formatDate(complaint.feedback.submittedAt)}
                </span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= complaint.feedback!.rating
                        ? 'text-amber-500 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-700 ml-1.5">
                  {complaint.feedback.rating} out of 5 stars
                </span>
              </div>
              {complaint.feedback.comment && (
                <p className="text-xs text-emerald-950 italic">
                  "{complaint.feedback.comment}"
                </p>
              )}
            </div>
          )}

          {/* Student Feedback Submission Form (When Resolved and current user is owner without feedback yet) */}
          {complaint.status === 'Resolved' && !complaint.feedback && isOwner && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-2">
                <Star className="w-4 h-4 text-amber-600 fill-amber-400" />
                This complaint is marked Resolved. How satisfied are you with the resolution?
              </div>
              {feedbackSuccessMsg ? (
                <div className="text-xs text-emerald-700 font-medium p-2 bg-emerald-100 rounded-lg">
                  {feedbackSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleStudentFeedback} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setRating(num)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              num <= rating
                                ? 'text-amber-500 fill-amber-400'
                                : 'text-slate-300'
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
                    placeholder="Share brief remarks on resolution speed and quality (optional)..."
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
            </div>
          )}

          {/* ADMIN MANAGEMENT PANEL (Visible only to administrators) */}
          {isAdmin && (
            <div className="p-4 bg-indigo-50/70 border-2 border-indigo-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                  <Shield className="w-4 h-4 text-indigo-700" /> Administrator Action Console
                </div>
                <span className="text-[11px] font-mono text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  Admin: {currentUser.name}
                </span>
              </div>

              {statusSuccessMsg && (
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {statusSuccessMsg}
                </div>
              )}

              <form onSubmit={handleAdminUpdate} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-950 mb-1">
                      Update Ticket Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as ComplaintStatus)}
                      className="w-full px-3 py-2 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
                    >
                      <option value="Submitted">Submitted (Received)</option>
                      <option value="Under Review">Under Review (Evaluating)</option>
                      <option value="In Progress">In Progress (Active Work)</option>
                      <option value="Resolved">Resolved (Completed)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-indigo-950 mb-1">
                      Assign Department / Section
                    </label>
                    <input
                      type="text"
                      value={assignedDept}
                      onChange={(e) => setAssignedDept(e.target.value)}
                      placeholder="e.g. IT & Network cell, Estate Office"
                      className="w-full px-3 py-2 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-indigo-950 mb-1">
                    Official Admin Remark / Resolution Report
                  </label>
                  <textarea
                    rows={2}
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Provide details on action taken, technician dispatch, or repair ETA for student visibility..."
                    className="w-full p-2.5 text-xs bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs rounded-lg transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isUpdatingStatus ? 'Saving...' : 'Save & Publish Update'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          <span className="font-mono text-[11px]">CampusCare Grievance Portal</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
