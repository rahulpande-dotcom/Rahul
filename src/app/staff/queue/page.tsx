"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Token, Department, Doctor } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Ticket,
  Bell,
  Stethoscope,
  Building2,
  CheckCircle2,
  Clock,
  UserX,
  RotateCcw,
  AlertTriangle,
  Play,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { playHospitalChime, playEmergencyAlarm } from "@/lib/sound";
import { getStatusBadgeClass, getPriorityBadgeClass } from "@/lib/utils";

export default function StaffQueueControlPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const [selectedDeptId, setSelectedDeptId] = useState("ALL");
  const [selectedDoctorId, setSelectedDoctorId] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isCallingNext, setIsCallingNext] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const fetchData = async () => {
    try {
      const [tRes, dRes, docRes] = await Promise.all([
        fetch("/api/tokens"),
        fetch("/api/departments"),
        fetch("/api/doctors"),
      ]);
      const [tData, dData, docData] = await Promise.all([tRes.json(), dRes.json(), docRes.json()]);

      if (Array.isArray(tData)) setTokens(tData);
      if (Array.isArray(dData)) setDepartments(dData);
      if (Array.isArray(docData)) setDoctors(docData);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredTokens = tokens.filter((t) => {
    if (selectedDeptId !== "ALL" && t.departmentId !== selectedDeptId) return false;
    if (selectedDoctorId !== "ALL" && t.doctorId !== selectedDoctorId) return false;
    return true;
  });

  const calledTokens = filteredTokens.filter((t) => t.status === "CALLED");
  const inConsultationTokens = filteredTokens.filter((t) => t.status === "IN_CONSULTATION");
  const waitingTokens = filteredTokens.filter((t) => t.status === "WAITING");

  const handleCallNext = async () => {
    setIsCallingNext(true);
    setActionMessage("");

    try {
      const res = await fetch("/api/tokens/call-next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: selectedDeptId !== "ALL" ? selectedDeptId : undefined,
          doctorId: selectedDoctorId !== "ALL" ? selectedDoctorId : undefined,
        }),
      });

      const data = await res.json();

      if (data.token) {
        playHospitalChime();
        setActionMessage(`Called token ${data.token.tokenNumber} (${data.token.patientName})!`);
        fetchData();
      } else {
        setActionMessage(data.message || "No waiting patients in this queue.");
      }
    } catch {
      setActionMessage("Error while calling next patient.");
    } finally {
      setIsCallingNext(false);
    }
  };

  const handleUpdateStatus = async (tokenId: string, status: string) => {
    try {
      await fetch(`/api/tokens/${tokenId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-600" />
            Live OPD Queue Control Desk
          </h1>
          <p className="text-xs text-slate-500">
            Real-time calling board with priority triage queue management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleCallNext}
            size="lg"
            isLoading={isCallingNext}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md"
          >
            <Bell className="w-4 h-4 mr-2" />
            CALL NEXT PATIENT
          </Button>

          <Button variant="ghost" size="sm" onClick={fetchData} className="border border-slate-200">
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Department:</span>
          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Doctor:</span>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value="ALL">All Doctors</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.roomNumber})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:ml-auto text-xs text-slate-500 font-medium">
          {waitingTokens.length} Waiting • {calledTokens.length + inConsultationTokens.length} Active
        </div>
      </div>

      {/* Currently Called / In-Consultation Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
          Now Called / Inside Doctor Room ({calledTokens.length + inConsultationTokens.length})
        </h2>

        {calledTokens.length === 0 && inConsultationTokens.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
            No patient currently called. Click &quot;CALL NEXT PATIENT&quot; above to call the next waiting token.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...calledTokens, ...inConsultationTokens].map((token) => (
              <div
                key={token.id}
                className="bg-white rounded-xl border-2 border-blue-400 p-5 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {token.departmentName}
                    </span>
                    <div className="text-3xl font-black font-mono text-blue-700">
                      {token.tokenNumber}
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-1">
                      {token.patientName} {token.patientAge ? `(${token.patientAge}y)` : ""}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(
                        token.status
                      )}`}
                    >
                      {token.status}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">{token.roomNumber}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span>Symptoms: {token.symptoms || "Standard OPD"}</span>
                </div>

                {/* Control Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  {token.status === "CALLED" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(token.id, "IN_CONSULTATION")}
                      className="text-xs font-bold bg-purple-600 hover:bg-purple-700"
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      Start Consultation
                    </Button>
                  )}

                  <Link href={`/staff/visits?tokenId=${token.id}&patientName=${encodeURIComponent(token.patientName)}`}>
                    <Button size="sm" variant="outline" className="text-xs font-bold text-blue-700 border-blue-200">
                      <ClipboardList className="w-3.5 h-3.5 mr-1" />
                      Prescribe & Complete
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => playHospitalChime()}
                    className="text-xs font-semibold text-slate-600"
                  >
                    <Bell className="w-3.5 h-3.5 mr-1" />
                    Recall Chime
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUpdateStatus(token.id, "NO_SHOW")}
                    className="text-xs font-semibold text-amber-700 hover:bg-amber-50"
                  >
                    <UserX className="w-3.5 h-3.5 mr-1" />
                    No-Show
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Waiting Tokens Table */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Waiting Queue ({waitingTokens.length})
        </h2>

        {waitingTokens.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
            No patients currently waiting in this queue.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Pos #</th>
                  <th className="px-4 py-3">Token #</th>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Est. Wait</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {waitingTokens.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-bold text-slate-900">#{t.queuePosition}</td>
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{t.tokenNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{t.patientName}</td>
                    <td className="px-4 py-3 text-slate-600">{t.departmentName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getPriorityBadgeClass(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t.doctorName || "Any Available"}</td>
                    <td className="px-4 py-3 text-slate-600">~{t.estimatedWaitMinutes} mins</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(t.id, "CALLED")}
                        className="text-xs font-bold py-1 px-2.5 h-auto"
                      >
                        Call
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
