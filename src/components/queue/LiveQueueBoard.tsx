"use client";

import React, { useState, useEffect } from "react";
import { Token, Department } from "@/lib/types";
import { TokenCard } from "./TokenCard";
import { RotateCcw, AlertTriangle, Stethoscope, Clock, Users, Bell, Sparkles } from "lucide-react";
import { playHospitalChime } from "@/lib/sound";

export function LiveQueueBoard() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const fetchData = async () => {
    try {
      const [tokRes, deptRes] = await Promise.all([
        fetch("/api/tokens"),
        fetch("/api/departments"),
      ]);
      const [tokData, deptData] = await Promise.all([tokRes.json(), deptRes.json()]);

      if (Array.isArray(tokData)) {
        setTokens(tokData);
      }
      if (Array.isArray(deptData)) {
        setDepartments(deptData);
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Queue board fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 6000); // 6s polling for real-time queue
    return () => clearInterval(interval);
  }, []);

  const filteredTokens = tokens.filter((t) => {
    if (selectedDept === "ALL") return true;
    return t.departmentId === selectedDept;
  });

  const calledOrActive = filteredTokens.filter(
    (t) => t.status === "CALLED" || t.status === "IN_CONSULTATION"
  );
  const waitingTokens = filteredTokens.filter((t) => t.status === "WAITING");
  const emergencyTokens = filteredTokens.filter(
    (t) => (t.isEmergency || t.priority === "EMERGENCY") && t.status !== "COMPLETED"
  );

  return (
    <div className="space-y-6">
      {/* Emergency Alert Banner if Active ER cases */}
      {emergencyTokens.length > 0 && (
        <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <div className="font-extrabold text-sm sm:text-base">
                CRITICAL EMERGENCY INTAKE ACTIVE ({emergencyTokens.length} Case{emergencyTokens.length > 1 ? "s" : ""})
              </div>
              <div className="text-xs text-red-100">
                Priority 1 trauma resuscitation protocol engaged in Emergency Bay 1.
              </div>
            </div>
          </div>
          <button
            onClick={() => playHospitalChime()}
            className="px-3 py-1.5 bg-white text-red-700 font-bold text-xs rounded-lg shadow-sm hover:bg-red-50 shrink-0"
          >
            Chime Alert
          </button>
        </div>
      )}

      {/* Control Bar: Department Filter & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedDept("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              selectedDept === "ALL"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All OPD Wings
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDept(d.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedDept === d.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
          <span>Synced: {lastRefreshed || "Just now"}</span>
          <button
            onClick={fetchData}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 border border-slate-200"
            title="Refresh queue"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Digital OPD TV Screen Simulator: NOW SERVING */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 className="font-extrabold text-base tracking-wide uppercase text-slate-200">
              NOW SERVING • LIVE CONSULTATION ROOMS
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800">
            AUTO-SYNC 6s
          </span>
        </div>

        {calledOrActive.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">
            No patients currently called into consultation. Next tokens will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calledOrActive.map((t) => (
              <div
                key={t.id}
                className="bg-slate-800/90 rounded-xl p-4 border border-blue-500/40 relative overflow-hidden group hover:border-blue-400 transition-all shadow-md"
              >
                <div className="absolute top-0 right-0 bg-blue-600 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-bl">
                  {t.status === "CALLED" ? "PROCEED TO ROOM" : "IN CONSULTATION"}
                </div>
                <div className="text-3xl font-black text-amber-400 font-mono tracking-wider">
                  {t.tokenNumber}
                </div>
                <div className="text-xs text-slate-300 font-bold mt-1">
                  {t.patientName}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-700/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-emerald-400 font-bold">{t.roomNumber || "Desk"}</span>
                  <span className="truncate">{t.doctorName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Waiting Queue List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Next In Line ({waitingTokens.length} Waiting)
          </h4>
        </div>

        {waitingTokens.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            Queue is currently clear for this selection. New check-ins will display automatically.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waitingTokens.map((token) => (
              <TokenCard key={token.id} token={token} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
