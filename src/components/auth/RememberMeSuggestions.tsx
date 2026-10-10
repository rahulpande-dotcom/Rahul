"use client";

import React, { useEffect, useState } from "react";
import { UserRole } from "@/lib/types";
import { History, UserCheck, Sparkles } from "lucide-react";

interface AccountSuggestion {
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}

const PRELOADED_ACCOUNTS: AccountSuggestion[] = [
  { email: "patient@queueless.ai", name: "Rahul Sharma", role: "patient", password: "Patient@123" },
  { email: "staff@queueless.ai", name: "Clara Oswald (Nurse)", role: "staff", password: "Staff@123" },
  { email: "doctor@queueless.ai", name: "Dr. Sarah Mitchell", role: "doctor", password: "Doctor@123" },
  { email: "admin@queueless.ai", name: "Hospital Admin", role: "admin", password: "Admin@123" },
];

interface Props {
  onSelectAccount: (account: AccountSuggestion) => void;
  activeRole: UserRole;
}

export function RememberMeSuggestions({ onSelectAccount, activeRole }: Props) {
  const [remembered, setRemembered] = useState<AccountSuggestion | null>(null);

  useEffect(() => {
    try {
      const match = document.cookie.match(new RegExp("(^| )queueless_remember=([^;]+)"));
      if (match && match[2]) {
        const decoded = JSON.parse(decodeURIComponent(match[2]));
        if (decoded?.email) {
          setRemembered(decoded);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="space-y-2.5 pt-2 border-t border-slate-100">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Quick Switch / Previously Used
        </span>
        {remembered && (
          <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <History className="w-3 h-3" /> Remembered
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PRELOADED_ACCOUNTS.map((acc) => {
          const isCurrentRole = acc.role === activeRole;
          return (
            <button
              key={acc.email}
              type="button"
              onClick={() => onSelectAccount(acc)}
              className={`p-2 rounded-lg text-left text-xs transition-all border flex flex-col justify-between ${
                isCurrentRole
                  ? "bg-blue-50/80 border-blue-200 text-blue-900 shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="font-semibold flex items-center justify-between">
                <span>{acc.name}</span>
                <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded">
                  {acc.role}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">{acc.email}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
