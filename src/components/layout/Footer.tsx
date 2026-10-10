import React from "react";
import Link from "next/link";
import { PhoneCall, ShieldCheck, Heart, MapPin, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <div className="absolute w-1 h-3.5 bg-white rounded-xs"></div>
                  <div className="absolute w-3.5 h-1 bg-white rounded-xs"></div>
                </div>
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                QueueLess <span className="text-blue-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transforming hospital waiting rooms into intelligent, digitized patient journeys. Zero physical queues, instant tokens, and HIPAA-ready EHR retrieval.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-md w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HIPAA Compliant • 99.9% Uptime</span>
            </div>
          </div>

          {/* Patient Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Patient Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/register" className="hover:text-blue-400 transition-colors">
                  Online Token Booking
                </Link>
              </li>
              <li>
                <Link href="/patient/queue-status" className="hover:text-blue-400 transition-colors">
                  Live Queue Tracker
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="hover:text-red-400 text-red-300 transition-colors font-medium">
                  Emergency Triage Walk-In
                </Link>
              </li>
              <li>
                <Link href="/patient/my-reports" className="hover:text-blue-400 transition-colors">
                  Download Clinical Reports
                </Link>
              </li>
            </ul>
          </div>

          {/* Hospital Staff & Portals */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Hospital Staff & Administration
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login?role=staff" className="hover:text-blue-400 transition-colors">
                  OPD Staff & Reception Login
                </Link>
              </li>
              <li>
                <Link href="/login?role=doctor" className="hover:text-blue-400 transition-colors">
                  Doctor Consultation Console
                </Link>
              </li>
              <li>
                <Link href="/login?role=admin" className="hover:text-blue-400 transition-colors">
                  Hospital Executive Admin Portal
                </Link>
              </li>
              <li>
                <Link href="/admin/audit-logs" className="hover:text-blue-400 transition-colors">
                  Security Audit Logs
                </Link>
              </li>
            </ul>
          </div>

          {/* Hospital 24x7 Helpline */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              24/7 Emergency Support
            </h4>
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-xs space-y-1">
              <div className="font-bold text-red-400 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" /> Trauma & Ambulance: +1 (800) 911-HELP
              </div>
              <p className="text-[11px] text-slate-400">
                Direct hotline to triage station and ER bay dispatch.
              </p>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>450 Healthcare Boulevard, Suite 100, Metro City</span>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} QueueLess AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-400 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/unauthorized" className="hover:text-slate-400 transition-colors">
              Access Matrix
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
