import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Clock,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Activity,
  Heart,
  Baby,
  Bone,
  Brain,
  Sparkles,
  Smartphone,
  FileCheck,
  Stethoscope,
  Users,
  ShieldCheck,
  PhoneCall,
  BellRing,
} from "lucide-react";
import { LiveQueueBoard } from "@/components/queue/LiveQueueBoard";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Hero Content */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold border border-blue-200/60 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Next-Gen Smart Hospital OPD Flow</span>
                  <span className="text-blue-400">•</span>
                  <span className="text-blue-600 font-bold">100% Paperless Tokens</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Zero Waiting Lines.{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
                    Smarter Patient Journeys.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                  QueueLess AI transforms overcrowded hospital waiting rooms into seamless digital workflows. Book online tokens, monitor live queue status from your phone, receive audio chime alerts, and retrieve verified clinical reports with one click.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto text-base font-bold shadow-md shadow-blue-500/20">
                      Book a Token Online
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>

                  <Link href="/emergency" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-red-300 text-red-700 hover:bg-red-50 font-bold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                      Emergency Walk-In (No Login)
                    </Button>
                  </Link>
                </div>

                {/* Trust Metrics */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                  <div>
                    <div className="text-2xl font-black text-slate-900">82%</div>
                    <div className="text-xs text-slate-500 font-medium">Wait Time Reduced</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-blue-600">0</div>
                    <div className="text-xs text-slate-500 font-medium">Paper Slip Wastage</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-slate-900">24/7</div>
                    <div className="text-xs text-slate-500 font-medium">Emergency Triage</div>
                  </div>
                </div>
              </div>

              {/* Right Hero Interactive Snapshot */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Live OPD Display Board
                      </span>
                    </div>
                    <span className="text-[11px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">
                      Main Campus
                    </span>
                  </div>

                  {/* Sample Active Token Card */}
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                        Current Serving
                      </span>
                      <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Now Inside
                      </span>
                    </div>
                    <div className="text-4xl font-black font-mono tracking-wider">
                      OPD-GEN-101
                    </div>
                    <div className="pt-2 border-t border-blue-500/60 flex items-center justify-between text-xs text-blue-100">
                      <span>General Medicine</span>
                      <span className="font-bold text-white">Room 101 • Dr. Mitchell</span>
                    </div>
                  </div>

                  {/* Sample Upcoming Queue Item */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Your Token (Position #2)</span>
                      <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                        Waiting ~10 mins
                      </span>
                    </div>
                    <div className="text-xl font-bold text-slate-800 font-mono">
                      OPD-GEN-102
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <BellRing className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
                      <span>Audio chime notification will ring when called</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Emergency Hotline: <strong>+1 (800) 911-HELP</strong></span>
                    <Link href="/patient/queue-status" className="text-blue-600 font-bold hover:underline">
                      View Live →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. EMERGENCY ACCESS CALLOUT */}
        <section className="bg-red-500 text-white py-4 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm font-semibold">
                <strong>Emergency Assistance Mode:</strong> Critical trauma or acute cases can register immediately without account creation or login. Red priority token allocated within 5 seconds.
              </p>
            </div>
            <Link href="/emergency">
              <Button size="sm" className="bg-white text-red-700 hover:bg-red-50 font-extrabold shadow-sm text-xs shrink-0">
                Go to Emergency Intake
              </Button>
            </Link>
          </div>
        </section>

        {/* 3. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Seamless Patient Flow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                How QueueLess AI Eliminates Physical Lines
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                A digitized healthcare loop from remote registration to consultation checkout.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 relative space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  01
                </div>
                <h3 className="text-base font-bold text-slate-900">1. Register & Identity</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Register in seconds with CAPTCHA verification. Receive a permanent Unique Health ID (UHID) to maintain your complete medical history.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 relative space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  02
                </div>
                <h3 className="text-base font-bold text-slate-900">2. Book Digital Token</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Select your department (Cardiology, General, Pediatrics, Ortho) and preferred doctor. Instant digital token number generated.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 relative space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  03
                </div>
                <h3 className="text-base font-bold text-slate-900">3. Live Queue Tracking</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Track live queue position and estimated wait times from home or cafeteria. Pleasant audio chime chimes when your doctor calls your token.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 relative space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
                  04
                </div>
                <h3 className="text-base font-bold text-slate-900">4. Consultation & PDF Report</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Doctor logs vitals, diagnosis, and digital prescription. One-click PDF report generation immediately available on patient and staff portals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. BENEFITS: FOR PATIENTS & STAFF */}
        <section id="benefits" className="py-20 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Mutual Value
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Designed for Patients & Hospital Staff
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Enhancing patient convenience while streamlining clinical and administrative productivity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* For Patients Card */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-700">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">For Patients</h3>
                    <p className="text-xs text-slate-500">Dignified, stress-free hospital visits</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Zero physical waiting lines:</strong> Arrive exactly when your token is called.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Live queue countdown:</strong> See position in queue and accurate doctor wait minutes.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Audio chime alerts:</strong> Web Audio API chimes immediately notify you when called.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>One-click PDF medical reports:</strong> Download verified consultation summaries instantly.</span>
                  </li>
                </ul>
              </div>

              {/* For Staff Card */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-teal-100 rounded-xl text-teal-700">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">For Doctors & Hospital Staff</h3>
                    <p className="text-xs text-slate-500">Automated triage and streamlined OPD load</p>
                  </div>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Priority-aware calling:</strong> Automatic prioritization for Emergency & Senior Citizens.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Unified clinical encounter:</strong> Record vitals, diagnosis & prescription in seconds.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Walk-in kiosk desk:</strong> Fast patient registration with instant digital token generation.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Audit trail & analytics:</strong> Real-time hospital metrics, load charts, and security logs.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5. LIVE OPD QUEUE PREVIEW */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Interactive Hospital Monitor
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Live Public OPD Queue Board
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Patients and hospital visitors can view the real-time queue status across departments below.
              </p>
            </div>

            <LiveQueueBoard />
          </div>
        </section>

        {/* 6. CALL TO ACTION & PORTAL ENTRY POINTS */}
        <section className="bg-slate-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Experience QueueLess Healthcare?
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto text-sm">
              Access the patient portal to book tokens or select your staff credential to manage the hospital OPD flow.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/register">
                <Button size="lg" className="font-bold">
                  Patient Register & Book
                </Button>
              </Link>
              <Link href="/login?role=patient">
                <Button variant="secondary" size="lg" className="font-bold">
                  Patient Sign In
                </Button>
              </Link>
              <Link href="/login?role=staff">
                <Button variant="outline" size="lg" className="text-white border-slate-700 hover:bg-slate-800 font-bold">
                  Staff & Doctor Console
                </Button>
              </Link>
              <Link href="/login?role=admin">
                <Button variant="outline" size="lg" className="text-white border-slate-700 hover:bg-slate-800 font-bold">
                  Admin Executive Portal
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
