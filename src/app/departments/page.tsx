"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import {
  Activity,
  Heart,
  Baby,
  Bone,
  Brain,
  AlertTriangle,
  Sparkles,
  Eye,
  Smile,
  ShieldPlus,
  Stethoscope,
  Scissors,
  Search,
  Filter,
  Clock,
  UserCheck,
  Building,
  CheckCircle2,
} from "lucide-react";
import { Department, Doctor } from "@/lib/types";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [deptRes, docRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/doctors"),
        ]);
        const deptData = await deptRes.json();
        const docData = await docRes.json();
        if (Array.isArray(deptData)) setDepartments(deptData);
        if (Array.isArray(docData)) setDoctors(docData);
      } catch (err) {
        console.error("Failed to load departments:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const floors = ["ALL", ...Array.from(new Set(departments.map((d) => d.floor.split(" (")[0])))];

  const filtered = departments.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFloor = selectedFloor === "ALL" || d.floor.includes(selectedFloor);
    return matchesSearch && matchesFloor;
  });

  const getDeptIcon = (code: string) => {
    switch (code) {
      case "CAR":
        return <Heart className="w-6 h-6 text-rose-500" />;
      case "PED":
        return <Baby className="w-6 h-6 text-amber-500" />;
      case "ORT":
        return <Bone className="w-6 h-6 text-blue-500" />;
      case "NEU":
        return <Brain className="w-6 h-6 text-purple-500" />;
      case "EMG":
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case "DER":
      case "TRI":
        return <Sparkles className="w-6 h-6 text-pink-500" />;
      case "OPH":
        return <Eye className="w-6 h-6 text-teal-500" />;
      case "DEN":
        return <Smile className="w-6 h-6 text-cyan-500" />;
      case "SUR":
        return <Scissors className="w-6 h-6 text-indigo-500" />;
      default:
        return <Stethoscope className="w-6 h-6 text-emerald-500" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <Building className="w-3.5 h-3.5" />
            20 Comprehensive Hospital Departments
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Specialized Clinical Departments & OPD Suites
          </h1>
          <p className="text-sm text-slate-600">
            Browse our clinical departments with transparent consultation fees in Indian Rupees (₹), verified specialist schedules, consultation rooms, and estimated waiting times.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by department name, specialty, or condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500 shrink-0">Floor:</span>
            {floors.slice(0, 5).map((fl) => (
              <button
                key={fl}
                onClick={() => setSelectedFloor(fl)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                  selectedFloor === fl
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {fl}
              </button>
            ))}
          </div>
        </div>

        {/* Departments Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
            <Building className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No matching departments found</h3>
            <p className="text-xs text-slate-500">Try adjusting your search query or floor filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((dept) => {
              const deptDoctors = doctors.filter((d) => d.departmentId === dept.id);
              return (
                <div
                  key={dept.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                        {getDeptIcon(dept.code)}
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          OPD FEE
                        </span>
                        <span className="text-base font-extrabold text-emerald-600">
                          ₹{(dept.standardFee || 1500).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {dept.name}
                        </h3>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {dept.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dept.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{dept.floor}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{deptDoctors.length || dept.activeDoctorsCount} Specialists</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>~{dept.avgConsultationMinutes} mins / visit</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{dept.roomNumbers ? dept.roomNumbers[0] : "Room 101"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDept(dept)}
                      className="flex-1 text-xs py-2 px-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-center"
                    >
                      Department Info
                    </button>
                    <Link
                      href={`/patient/book-appointment?departmentId=${dept.id}`}
                      className="flex-1 text-xs py-2 px-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-center shadow-sm"
                    >
                      Book Visit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Department Detail Modal */}
        {selectedDept && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    {getDeptIcon(selectedDept.code)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{selectedDept.name}</h2>
                    <span className="text-xs font-semibold text-emerald-700">
                      Standard OPD Consultation Fee: ₹{(selectedDept.standardFee || 1500).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDept(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{selectedDept.description}</p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Location Floor:</span>
                  <span className="font-bold text-slate-800">{selectedDept.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Designated Consultation Rooms:</span>
                  <span className="font-bold text-slate-800">{selectedDept.roomNumbers?.join(", ") || "Room 101, Room 102"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Average Consultation Duration:</span>
                  <span className="font-bold text-slate-800">{selectedDept.avgConsultationMinutes} Minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Licensed Specialists:</span>
                  <span className="font-bold text-emerald-700">
                    {doctors.filter((d) => d.departmentId === selectedDept.id).length || 4} Doctors on Duty
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedDept(null)}>
                  Close
                </Button>
                <Link
                  href={`/patient/book-appointment?departmentId=${selectedDept.id}`}
                  className="flex-1"
                >
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Select Doctor & Book
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
