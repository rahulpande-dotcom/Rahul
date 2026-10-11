"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { PasswordInput } from "@/components/ui/PasswordInput";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  Heart,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "male",
    bloodGroup: "O+",
    emergencyContact: "",
    address: "",
    password: "",
    confirmPassword: "",
    acceptTerms: true,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberedAccounts, setRememberedAccounts] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [doctorSearch, setDoctorSearch] = useState("");

  React.useEffect(() => {
    // Device-only remembered accounts (never storing passwords/tokens)
    try {
      const raw = localStorage.getItem("queueless_remembered_accounts");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRememberedAccounts(parsed);
      }
    } catch {}

    // Load doctors for preview
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDoctorsList(data);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!formData.acceptTerms) {
      setErrorMessage("You must agree to the Terms of Service and Privacy Notice.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Registration failed.");
        setIsLoading(false);
        return;
      }

      // Save device-only remembered account (never storing password or tokens)
      try {
        const updated = [
          { name: formData.name, email: formData.email, role: "patient", lastLogin: new Date().toISOString() },
          ...rememberedAccounts.filter((a) => a.email.toLowerCase() !== formData.email.toLowerCase()),
        ].slice(0, 5);
        localStorage.setItem("queueless_remembered_accounts", JSON.stringify(updated));
      } catch {}

      window.location.href = "/patient/dashboard";
    } catch (err) {
      setErrorMessage("Network error occurred during registration. Please retry.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Digitize Your Hospital Journey
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Patient Registration
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your permanent health profile to book digital tokens, check live queues, and download medical records.
            </p>
          </div>

          {/* Remembered Accounts on this Device */}
          {rememberedAccounts.length > 0 && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-800 block">
                Remembered Accounts on this Device
              </span>
              <div className="flex flex-wrap gap-2">
                {rememberedAccounts.map((acc, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, email: acc.email, name: acc.name }));
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-xs text-slate-800 hover:bg-blue-100 transition-colors shadow-2xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                      {acc.name.charAt(0)}
                    </div>
                    <span className="font-semibold">{acc.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({acc.email})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Card className="shadow-lg border-slate-200">
            <CardContent className="p-6 space-y-5">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Phone & Age */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Age</label>
                    <input
                      type="number"
                      name="age"
                      min={1}
                      max={120}
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="35"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Blood Group & Emergency Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Emergency Contact</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      placeholder="Kin name & phone"
                      className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>

                {/* Residential Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Residential Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, City, Postal Code"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Password *</label>
                    <PasswordInput
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 chars"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Confirm Password *</label>
                    <PasswordInput
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                    />
                  </div>
                </div>

                {/* Terms agreement */}
                <div className="pt-2">
                  <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => setFormData((prev) => ({ ...prev, acceptTerms: e.target.checked }))}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                    />
                    <span>
                      I agree to the QueueLess AI{" "}
                      <Link href="/terms" className="text-blue-600 underline font-semibold">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 underline font-semibold">
                        Health Data Privacy Notice
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                <Button type="submit" size="lg" className="w-full font-bold shadow-md" isLoading={isLoading}>
                  Create Health ID & Register
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-slate-500">
            Already registered?{" "}
            <Link href="/login" className="font-bold text-blue-600 hover:underline">
              Sign In to Patient Portal →
            </Link>
          </div>

          {/* Searchable Doctor Directory Near Registration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  Explore Hospital Doctors & OPD Fees (INR)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Find our 80 active specialists across 20 departments before registering.
                </p>
              </div>
              <Link
                href="/departments"
                className="text-xs font-bold text-blue-600 hover:underline shrink-0"
              >
                View 20 Departments →
              </Link>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search doctors by name or specialization..."
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 text-xs">
              {doctorsList
                .filter(
                  (d) =>
                    !doctorSearch ||
                    d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
                    d.specialization.toLowerCase().includes(doctorSearch.toLowerCase()) ||
                    d.departmentName.toLowerCase().includes(doctorSearch.toLowerCase())
                )
                .slice(0, 6)
                .map((doc) => (
                  <div key={doc.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {doc.name} {doc.qualifications ? `(${doc.qualifications})` : ""}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {doc.departmentName} • {doc.specialization} • Room {doc.roomNumber}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-emerald-700 block">
                        ₹{(doc.consultationFee || 1500).toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-400">per visit</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
