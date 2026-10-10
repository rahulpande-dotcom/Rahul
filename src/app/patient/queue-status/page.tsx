"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Token } from "@/lib/types";
import { playHospitalChime } from "@/lib/sound";
import { LiveQueueBoard } from "@/components/queue/LiveQueueBoard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Clock,
  Ticket,
  Bell,
  Stethoscope,
  MapPin,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Volume2,
} from "lucide-react";

export default function QueueStatusPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPlayedChime, setHasPlayedChime] = useState(false);

  const fetchData = async () => {
    try {
      const [uRes, tRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/tokens"),
      ]);
      const [uData, tData] = await Promise.all([uRes.json(), tRes.json()]);

      if (uData.user) setCurrentUser(uData.user);
      if (Array.isArray(tData)) setTokens(tData);
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

  const myActiveToken = tokens.find(
    (t) =>
      ((currentUser?.id && t.patientId === currentUser.id) ||
        (currentUser?.name && t.patientName.toLowerCase() === currentUser.name.toLowerCase())) &&
      (t.status === "WAITING" || t.status === "CALLED" || t.status === "IN_CONSULTATION")
  );

  useEffect(() => {
    // When token becomes CALLED, automatically ring the pleasant audio chime!
    if (myActiveToken && myActiveToken.status === "CALLED" && !hasPlayedChime) {
      playHospitalChime();
      setHasPlayedChime(true);
    }
  }, [myActiveToken, hasPlayedChime]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Live Queue Tracker & Audio Chime
          </h1>
          <p className="text-xs text-slate-500">
            Real-time synchronization with the hospital OPD calling desk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => playHospitalChime()}
            className="text-xs font-semibold flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-600" />
            Test Hospital Chime
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            className="text-xs font-semibold border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Sync Now
          </Button>
        </div>
      </div>

      {/* Prominent Active Patient Status Banner */}
      {myActiveToken ? (
        <div
          className={`rounded-2xl p-6 sm:p-8 border shadow-lg transition-all ${
            myActiveToken.status === "CALLED"
              ? "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white border-blue-400 ring-4 ring-blue-400/30 animate-pulse"
              : myActiveToken.status === "IN_CONSULTATION"
              ? "bg-purple-900 text-white border-purple-600"
              : "bg-white text-slate-900 border-blue-200 ring-2 ring-blue-500/10"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                    myActiveToken.status === "CALLED"
                      ? "bg-amber-400 text-slate-950 font-black animate-bounce"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {myActiveToken.status === "CALLED"
                    ? "★ YOUR TOKEN IS CALLED — ENTER ROOM NOW ★"
                    : `Status: ${myActiveToken.status}`}
                </span>
                <span className="text-xs opacity-75 font-semibold">
                  {myActiveToken.departmentName}
                </span>
              </div>

              <div className="text-4xl sm:text-6xl font-black font-mono tracking-wider">
                {myActiveToken.tokenNumber}
              </div>

              <div className="text-sm font-semibold flex items-center gap-2">
                <Stethoscope className="w-4 h-4 opacity-80" />
                <span>
                  Consulting: {myActiveToken.doctorName || "Assigned Doctor"} • <strong>{myActiveToken.roomNumber || "Desk"}</strong>
                </span>
              </div>
            </div>

            {/* Wait Stats Counter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-950/20 p-5 rounded-xl border border-white/10 shrink-0">
              {myActiveToken.status === "WAITING" && (
                <>
                  <div className="text-center sm:text-left">
                    <span className="text-xs opacity-75 block font-medium">Estimated Wait</span>
                    <span className="text-3xl font-black">
                      ~{myActiveToken.estimatedWaitMinutes} <span className="text-sm font-normal">mins</span>
                    </span>
                  </div>
                  <div className="w-px h-10 bg-white/20 hidden sm:block" />
                  <div className="text-center sm:text-left">
                    <span className="text-xs opacity-75 block font-medium">Queue Position</span>
                    <span className="text-3xl font-black">
                      #{myActiveToken.queuePosition}
                    </span>
                  </div>
                </>
              )}

              {myActiveToken.status === "CALLED" && (
                <div className="text-center sm:text-left space-y-1">
                  <div className="text-2xl font-black text-amber-300 flex items-center gap-2">
                    <Bell className="w-6 h-6 animate-spin text-amber-400" />
                    Doctor Calling!
                  </div>
                  <div className="text-xs text-blue-100">
                    Proceed immediately to <strong>{myActiveToken.roomNumber}</strong>.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Active Token In-Flight
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have a waiting token in today's OPD queues. Book an online token below to enter the live queue.
            </p>
            <Link href="/patient/book-appointment">
              <Button size="sm" className="font-bold text-xs mt-1">
                Book a Token Online
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Hospital-Wide Live OPD Queue Monitor */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          All Hospital Departments Live Board
        </h2>
        <LiveQueueBoard />
      </div>
    </div>
  );
}
