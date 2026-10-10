import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Lock, FileText } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 sm:p-10 space-y-8">
        <div className="space-y-2 border-b border-slate-200 pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Healthcare Data Security
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Patient Privacy Policy & HIPAA Compliance Notice
          </h1>
          <p className="text-xs text-slate-500">
            Effective Date: October 2026 • QueueLess AI Smart Hospital Network
          </p>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Overview and Protected Health Information (PHI)</h2>
            <p>
              QueueLess AI is dedicated to safeguarding the privacy and confidentiality of your medical information. All records created during registration, appointment booking, token queue allocation, and doctor consultations are handled strictly in compliance with applicable healthcare privacy standards, including HIPAA and applicable national data protection frameworks.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. How We Collect & Use Your Information</h2>
            <p>
              We collect demographic details (name, age, contact info, blood group, emergency contact) and clinical encounter notes (vitals, symptoms, doctor diagnosis, and prescribed medications). This data is strictly utilized for:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Managing digital hospital queue tokens and calculating estimated wait times.</li>
              <li>Enabling attending physicians and clinical staff to review your medical history.</li>
              <li>Generating verified, downloadable patient consultation reports (PDFs).</li>
              <li>Triaging emergency trauma patients at ER counters without delay.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Security & Access Control</h2>
            <p>
              Our database architecture incorporates Row Level Security (RLS) policies within PostgreSQL. Medical records are restricted to the verified patient and attending clinical staff. Administrative audit logs maintain an immutable record of all data modifications and token progressions.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
