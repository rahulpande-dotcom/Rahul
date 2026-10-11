"use client";

import React, { useState, useEffect } from "react";
import { Doctor } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Stethoscope,
  Building2,
  MapPin,
  CheckCircle2,
  Search,
  Filter,
  GraduationCap,
  Award,
  Users,
} from "lucide-react";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDoctors(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const departments = Array.from(new Set(doctors.map((d) => d.departmentName))).sort();

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "ALL" || doc.departmentName === selectedDept;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            Physicians & OPD Consultation Rooms ({doctors.length})
          </h1>
          <p className="text-xs text-slate-500">
            Assigned doctors, room/desk allocation, consultation fee (INR ₹), and active OPD schedules.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by physician name, specialty, room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="sm:w-64">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="ALL">All Departments ({departments.length})</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading doctor directory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5 hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {doc.departmentName}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 pt-1.5">{doc.name}</h3>
                    <p className="text-xs text-slate-500">{doc.specialization}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded">
                      {doc.roomNumber}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Available
                    </span>
                  </div>
                </div>

                {doc.qualifications && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.qualifications}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2.5 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Consultation Fee:</span>
                  <span className="font-mono font-bold text-slate-900">₹{doc.consultationFee.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Daily OPD Capacity:</span>
                  <span className="font-semibold text-slate-700">{doc.appointmentCapacityPerDay || 40} patients/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Duty Days:</span>
                  <span className="text-slate-700 truncate">{doc.availableDays.slice(0, 3).join(", ")}...</span>
                </div>
              </div>
            </div>
          ))}

          {filteredDoctors.length === 0 && (
            <div className="col-span-full text-center py-12 text-xs text-slate-400">
              No physicians match the selected search or department filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
