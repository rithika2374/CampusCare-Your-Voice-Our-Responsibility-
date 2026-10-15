import React, { useState } from 'react';
import {
  Shield,
  User as UserIcon,
  LogOut,
  PlusCircle,
  Search,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Info,
  CheckCircle,
  GraduationCap,
  Building,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentTab: 'home' | 'student-dashboard' | 'submit' | 'track' | 'admin' | 'about';
  setCurrentTab: (tab: 'home' | 'student-dashboard' | 'submit' | 'track' | 'admin' | 'about') => void;
  currentUser: User | null;
  onOpenAuth: (mode?: 'student-login' | 'student-register' | 'admin-login') => void;
  onLogout: () => void;
  onSwitchPersona: (role: 'student' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onSwitchPersona,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (tab: 'home' | 'student-dashboard' | 'submit' | 'track' | 'admin' | 'about') => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Top micro-bar for quick demo role switcher & institutional helpline */}
      <div className="bg-slate-900 text-slate-300 text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-slate-200">
            CampusCare System Active • 24x7 Student Grievance Helpline: 1800-CAMPUS-CARE
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-slate-400">Quick Demo Switcher:</span>
          <button
            onClick={() => onSwitchPersona('student')}
            className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
              currentUser?.role === 'student'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Student: Rahul
          </button>
          <button
            onClick={() => onSwitchPersona('admin')}
            className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
              currentUser?.role === 'admin'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Admin: Dr. Rao
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  Campus<span className="text-blue-600">Care</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                  Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Student Problem Management System
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'home'
                  ? 'text-blue-700 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth('student-login');
                } else {
                  handleNavClick('student-dashboard');
                }
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'student-dashboard'
                  ? 'text-blue-700 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Student Dashboard
            </button>

            <button
              onClick={() => handleNavClick('submit')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'submit'
                  ? 'text-blue-700 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Submit Complaint
            </button>

            <button
              onClick={() => handleNavClick('track')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'track'
                  ? 'text-blue-700 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4 text-slate-500" />
              Track Complaint
            </button>

            <button
              onClick={() => {
                if (currentUser?.role === 'admin') {
                  handleNavClick('admin');
                } else {
                  onOpenAuth('admin-login');
                }
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'admin'
                  ? 'text-indigo-700 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              Admin Portal
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentTab === 'about'
                  ? 'text-blue-700 bg-blue-50 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              About Project
            </button>
          </nav>

          {/* Right Action / User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                >
                  <img
                    src={
                      currentUser.avatarUrl ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80'
                    }
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 capitalize flex items-center gap-1">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-blue-600'
                        }`}
                      />
                      {currentUser.role === 'admin' ? 'College Admin' : `Student (${currentUser.studentId || 'ID'})`}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      {currentUser.department && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{currentUser.department}</p>
                      )}
                    </div>

                    <div className="py-1">
                      {currentUser.role === 'student' ? (
                        <button
                          onClick={() => {
                            handleNavClick('student-dashboard');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          My Student Complaints
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleNavClick('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Building className="w-4 h-4 text-indigo-600" />
                          Admin Overview
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onSwitchPersona(currentUser.role === 'admin' ? 'student' : 'admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Switch to {currentUser.role === 'admin' ? 'Student View' : 'Admin View'}
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('student-login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  Student Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('admin-login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-300" />
                  Admin Login
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {currentUser && (
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-1 rounded-full border border-blue-500/30"
              >
                <img
                  src={
                    currentUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&q=80'
                  }
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'home' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => {
              if (!currentUser) onOpenAuth('student-login');
              else handleNavClick('student-dashboard');
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'student-dashboard' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            Student Dashboard
          </button>
          <button
            onClick={() => handleNavClick('submit')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'submit' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            Submit Complaint
          </button>
          <button
            onClick={() => handleNavClick('track')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'track' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            Track Complaint
          </button>
          <button
            onClick={() => {
              if (currentUser?.role === 'admin') handleNavClick('admin');
              else onOpenAuth('admin-login');
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'admin' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'
            }`}
          >
            Admin Portal
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'about' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
            }`}
          >
            About Project & Tech Stack
          </button>

          {!currentUser ? (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenAuth('student-login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-xs font-semibold bg-blue-600 text-white rounded-lg"
              >
                Student Sign In
              </button>
              <button
                onClick={() => {
                  onOpenAuth('admin-login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-xs font-semibold bg-slate-900 text-white rounded-lg"
              >
                Admin Sign In
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
              >
                Sign Out ({currentUser.name})
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
