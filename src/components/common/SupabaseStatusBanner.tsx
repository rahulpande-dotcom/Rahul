"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Database, CheckCircle2, Info, X, ExternalLink } from "lucide-react";

export function SupabaseStatusBanner() {
  const [status, setStatus] = useState<{ supabaseConnected: boolean; mode: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.databaseStatus) {
          setStatus(data.databaseStatus);
        }
      })
      .catch(() => {});
  }, []);

  if (!status || dismissed) return null;

  return (
    <div
      className={`mb-6 p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
        status.supabaseConnected
          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
          : "bg-blue-50 border-blue-200 text-blue-900"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`p-1.5 rounded-lg ${
            status.supabaseConnected ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          <Database className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold mr-1.5">Database Engine:</span>
          <span>{status.mode}</span>
          {!status.supabaseConnected && (
            <span className="text-slate-600 block sm:inline sm:ml-2">
              (All operations, tokens, appointments & emergency cases persist reliably. To connect live Supabase, check{" "}
              <Link href="/admin/settings" className="underline font-semibold text-blue-700 hover:text-blue-900">
                Admin Settings
              </Link>
              ).
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
