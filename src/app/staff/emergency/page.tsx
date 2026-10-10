"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EmergencyCase } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ShieldAlert, PhoneCall, AlertTriangle, Activity, Bell, Siren, ArrowRight } from "lucide-react";
import { playEmergencyAlarm } from "@/lib/sound";

export default function StaffEmergencyDeskPage() {
  const [cases, setCases] = useState<EmergencyCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCases = async () => {
    try {
      const res = await fetch("/api/emergency");
      const data = await res.json();
      if (Array.isArray(data)) setCases(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    const interval = setInterval(fetchCases, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            Emergency & Trauma Triage Station
          </h1>
          <p className="text-xs text-slate-500">
            Real-time ER trauma monitoring, bay allocations, and resuscitation status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => playEmergencyAlarm()}
            className="text-xs font-bold text-red-700 border-red-300 hover:bg-red-50"
          >
            <Siren className="w-3.5 h-3.5 mr-1 text-red-600" />
            Sound ER Alert
          </Button>
          <Link href="/emergency">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 font-bold text-xs shadow-md">
              + New Emergency Intake
            </Button>
          </Link>
        </div>
      </div>

      {/* Emergency Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cases.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border-2 border-red-400 p-5 shadow-sm space-y-4 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded">
                  {c.triageLevel.replace("_", " ")}
                </span>
                <div className="text-3xl font-black font-mono text-red-700 mt-1">
                  {c.tokenNumber}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                  {c.assignedBay}
                </span>
                <span className="text-[11px] text-slate-500 block mt-1 font-semibold">
                  {c.status}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900">{c.patientName}</h3>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {c.chiefComplaint}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Arrival: {c.arrivalType}</span>
              <span className="font-semibold text-slate-700">{c.consciousness}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
