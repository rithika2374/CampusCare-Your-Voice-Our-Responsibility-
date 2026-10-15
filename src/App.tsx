import React, { useState, useEffect } from 'react';
import { User, Complaint, StatsSummary } from './types';
import { api, getStoredUser, clearStoredAuth } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { HomeView } from './views/HomeView';
import { StudentDashboardView } from './views/StudentDashboardView';
import { SubmitComplaintView } from './views/SubmitComplaintView';
import { TrackComplaintView } from './views/TrackComplaintView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AboutProjectView } from './views/AboutProjectView';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    'home' | 'student-dashboard' | 'submit' | 'track' | 'admin' | 'about'
  >('home');

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(getStoredUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<
    'student-login' | 'student-register' | 'admin-login'
  >('student-login');

  // Data states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [trackTargetId, setTrackTargetId] = useState<string>('');
  const [initialCategoryForSubmit, setInitialCategoryForSubmit] = useState<string>('Classroom');

  // Toast / notification
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load initial data
  const loadData = async () => {
    try {
      const [fetchedComplaints, fetchedStats] = await Promise.all([
        api.getComplaints(),
        api.getStats().catch(() => null),
      ]);
      setComplaints(fetchedComplaints);
      if (fetchedStats) setStats(fetchedStats);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Verify current user session if token exists
    api.getMe()
      .then((user) => setCurrentUser(user))
      .catch(() => {
        // Token might have expired or wasn't set
      });
  }, []);

  const handleOpenAuth = (mode: 'student-login' | 'student-register' | 'admin-login' = 'student-login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    loadData();
    showToast(`Welcome back, ${user.name}! Signed in as ${user.role === 'admin' ? 'Administrator' : 'Student'}.`);
    if (user.role === 'admin') {
      setCurrentTab('admin');
    } else {
      setCurrentTab('student-dashboard');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    loadData();
    showToast('You have been signed out successfully.', 'info');
    setCurrentTab('home');
  };

  const handleSwitchPersona = async (role: 'student' | 'admin') => {
    try {
      if (role === 'admin') {
        const res = await api.login('admin@campuscare.edu', 'Admin@123');
        setCurrentUser(res.user);
        setCurrentTab('admin');
        showToast('Switched to Administrator Persona: Dr. Arvind Rao');
      } else {
        const res = await api.login('rahul.sharma@campus.edu', 'Student@123');
        setCurrentUser(res.user);
        setCurrentTab('student-dashboard');
        showToast('Switched to Student Persona: Rahul Sharma (Computer Science)');
      }
      loadData();
    } catch (err: any) {
      alert(`Persona switch failed: ${err.message}`);
    }
  };

  const handleSelectComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setDetailModalOpen(true);
  };

  const handleTrackById = (id: string) => {
    setTrackTargetId(id);
    setCurrentTab('track');
  };

  const handleComplaintUpdated = (updated: Complaint) => {
    setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedComplaint(updated);
    api.getStats().then(setStats).catch(() => {});
    showToast(`Complaint #${updated.id} updated to ${updated.status}.`);
  };

  const handleComplaintCreated = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    api.getStats().then(setStats).catch(() => {});
    showToast(`Complaint #${newComplaint.id} registered successfully.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span className="font-medium">{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onSwitchPersona={handleSwitchPersona}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            stats={stats}
            onNavigateTab={setCurrentTab}
            onTrackId={handleTrackById}
            onSelectCategoryFilter={(cat) => {
              setInitialCategoryForSubmit(cat);
              setCurrentTab('submit');
            }}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            recentComplaints={complaints}
            onSelectComplaint={handleSelectComplaint}
          />
        )}

        {currentTab === 'student-dashboard' && (
          <StudentDashboardView
            currentUser={currentUser}
            complaints={complaints}
            onOpenSubmit={() => setCurrentTab('submit')}
            onOpenAuth={() => handleOpenAuth('student-login')}
            onSelectComplaint={handleSelectComplaint}
          />
        )}

        {currentTab === 'submit' && (
          <SubmitComplaintView
            currentUser={currentUser}
            onComplaintCreated={handleComplaintCreated}
            onTrackComplaint={handleTrackById}
            onNavigateTab={setCurrentTab}
            onOpenAuth={() => handleOpenAuth('student-login')}
            initialCategory={initialCategoryForSubmit}
          />
        )}

        {currentTab === 'track' && (
          <TrackComplaintView
            initialId={trackTargetId}
            currentUser={currentUser}
            onOpenSubmit={() => setCurrentTab('submit')}
            onComplaintUpdated={handleComplaintUpdated}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardView
            currentUser={currentUser}
            complaints={complaints}
            stats={stats}
            onOpenAuth={() => handleOpenAuth('admin-login')}
            onSelectComplaint={handleSelectComplaint}
            onRefreshData={loadData}
            onComplaintUpdated={handleComplaintUpdated}
          />
        )}

        {currentTab === 'about' && <AboutProjectView onRefreshData={loadData} />}
      </main>

      {/* Institutional Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setInitialCategoryForSubmit(cat);
          setCurrentTab('submit');
        }}
        onNavigateTab={setCurrentTab}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />

      {/* Complaint Detail & Admin Action Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        currentUser={currentUser}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onComplaintUpdated={handleComplaintUpdated}
      />
    </div>
  );
}
