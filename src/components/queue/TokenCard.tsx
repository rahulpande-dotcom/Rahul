"use client";

import React, { useEffect } from "react";
import { Token } from "@/lib/types";
import { getStatusBadgeClass, getPriorityBadgeClass, formatTimeOnly } from "@/lib/utils";
import { Clock, MapPin, Stethoscope, AlertTriangle, User, Bell } from "lucide-react";
import { playHospitalChime } from "@/lib/sound";

interface TokenCardProps {
  token: Token;
  isCurrentPatient?: boolean;
}

export function TokenCard({ token, isCurrentPatient = false }: TokenCardProps) {
  useEffect(() => {
    // If this is the current patient and their token is called, play hospital chime!
    if (isCurrentPatient && token.status === "CALLED") {
      playHospitalChime();
    }
  }, [token.status, isCurrentPatient]);

  const isEmergency = token.isEmergency || token.priority === "EMERGENCY";

  return (
    <div
      className={`rounded-xl border p-5 transition-all shadow-xs ${
        token.status === "CALLED"
          ? "border-blue-400 bg-blue-50/70 ring-2 ring-blue-500/30 animate-pulse"
          : isEmergency
          ? "border-red-400 bg-red-50/60"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {token.departmentName}
          </span>
          <div className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{token.tokenNumber}</span>
            {isEmergency && (
              <span className="text-xs bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full animate-bounce">
                CRITICAL ER
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold border ${getStatusBadgeClass(token.status)}`}
          >
            {token.status.replace("_", " ")}
          </span>
          {token.priority !== "NORMAL" && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getPriorityBadgeClass(
                token.priority
              )}`}
            >
              {token.priority.replace("_", " ")}
            </span>
          )}
        </div>
      </div>

      {/* Patient & Doctor Details */}
      <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px] font-medium">Patient Name</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {token.patientName}
          </span>
        </div>

        <div>
          <span className="text-slate-400 block text-[11px] font-medium">Doctor & Room</span>
          <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
            <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
            {token.doctorName || "Assigned On Duty"} ({token.roomNumber || "Desk"})
          </span>
        </div>
      </div>

      {/* Queue Metrics & Estimated Time */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {token.status === "COMPLETED"
              ? "Completed"
              : token.status === "IN_CONSULTATION"
              ? "In Doctor Room"
              : token.status === "CALLED"
              ? "Please Proceed to Room"
              : `Wait: ~${token.estimatedWaitMinutes} mins`}
          </span>
        </div>

        {token.status === "WAITING" && (
          <div className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
            Position #{token.queuePosition} in Queue
          </div>
        )}

        {token.status === "CALLED" && (
          <div className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
            <Bell className="w-3 h-3 text-blue-600 animate-spin" />
            CALLED NOW
          </div>
        )}
      </div>
    </div>
  );
}
