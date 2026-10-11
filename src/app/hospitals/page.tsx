"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Building2,
  MapPin,
  PhoneCall,
  ShieldCheck,
  Search,
  ExternalLink,
  Stethoscope,
  Siren,
  Building,
} from "lucide-react";
import { Hospital } from "@/lib/types";

export default function HospitalsDirectoryPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHospitals() {
      try {
        const res = await fetch("/api/hospitals");
        const data = await res.json();
        if (Array.isArray(data)) setHospitals(data);
      } catch (err) {
        console.error("Failed to load hospitals:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHospitals();
  }, []);

  const filtered = hospitals.filter((h) => {
    const matchesDistrict =
      selectedDistrict === "ALL" || h.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.locality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            Karnataka Regional Healthcare Network
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verified Hospital Directory — Bengaluru & Tumakuru
          </h1>
          <p className="text-sm text-slate-600">
            Official multi-tenant hospital directory spanning Bengaluru Urban and Tumakuru districts with real emergency hotlines, OPD queue connectivity, and verified clinical accreditations.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by hospital name or locality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {["ALL", "Bengaluru Urban", "Tumakuru"].map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistrict(dist)}
                className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-colors ${
                  selectedDistrict === dist
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {dist === "ALL" ? "All Districts" : dist}
              </button>
            ))}
          </div>
        </div>

        {/* Hospital Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-60 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No hospitals found</h3>
            <p className="text-xs text-slate-500">Try modifying your filter or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((hosp) => (
              <div
                key={hosp.id}
                className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  hosp.isPrimary
                    ? "border-blue-400 ring-2 ring-blue-500/10 bg-gradient-to-br from-blue-50/30 to-white"
                    : "border-slate-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">{hosp.name}</h2>
                        {hosp.isPrimary && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white tracking-wide">
                            PRIMARY HUB
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-blue-700 font-semibold block mt-0.5">
                        {hosp.code} • {hosp.locality}, {hosp.city} ({hosp.district})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {hosp.verificationStatus}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{hosp.tagline}</p>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{hosp.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Contact: {hosp.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Siren className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="font-bold text-red-600">
                        24x7 Emergency: {hosp.emergencyHotline}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{hosp.activeDepartmentsCount || 20} Departments</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                      <span>{hosp.totalDoctorsCount || 80} Specialists</span>
                    </div>
                  </div>

                  {hosp.verificationSource && (
                    <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 italic truncate">
                      Source: {hosp.verificationSource}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                  <a
                    href={`tel:${hosp.emergencyHotline}`}
                    className="flex-1 text-xs py-2 px-3 rounded-xl font-bold bg-red-50 hover:bg-red-100 text-red-700 transition-colors text-center border border-red-200"
                  >
                    Emergency Call
                  </a>
                  <Link
                    href={`/departments`}
                    className="flex-1 text-xs py-2 px-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors text-center shadow-sm"
                  >
                    Explore OPD Suites
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
