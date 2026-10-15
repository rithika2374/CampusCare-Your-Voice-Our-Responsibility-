import React from 'react';
import { Shield, Phone, Mail, MapPin, Heart, ExternalLink, CheckCircle } from 'lucide-react';
import { COMPLAINT_CATEGORIES } from '../utils/constants';

interface FooterProps {
  onSelectCategory?: (category: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onNavigateTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Campus<span className="text-blue-400">Care</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong>“Your Voice, Our Responsibility.”</strong>
              <br />
              An official campus problem redressal & grievance management platform connecting
              students directly with college authorities for fast, accountable problem resolution.
            </p>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>24x7 Helpline: 1800-CAMPUS-CARE</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>support@campuscare.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Dean of Student Affairs, Academic Block 1</span>
              </div>
            </div>
          </div>

          {/* Col 2: Key Categories */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Grievance Categories
            </h4>
            <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
              {COMPLAINT_CATEGORIES.slice(0, 8).map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                  className="text-left py-1 hover:text-white transition-colors truncate cursor-pointer hover:underline"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Col 3: Portal Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('student-dashboard')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Student Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('submit')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Submit New Complaint
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('track')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Track Complaint by ID
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('admin')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Administrator Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Project & Architecture
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional Assurance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Institutional SLA
            </h4>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle className="w-4 h-4" /> Guaranteed 48-Hour Response
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Every ticket registered on CampusCare is systematically assigned to the concerned
                department with automated escalation for high-priority safety or academic issues.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright & accreditation */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            © {new Date().getFullYear()} CampusCare – Student Problem Management System. Built for Higher Education Institutions.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>College Code of Conduct</span>
            <span>•</span>
            <span>AICTE / UGC Grievance Guidelines Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
