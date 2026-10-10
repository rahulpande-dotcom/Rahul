"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Lock, Shield, KeyRound, Smartphone, CheckCircle2 } from "lucide-react";

export default function PatientSecurityPage() {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass && newPass === confirmPass) {
      setSuccess(true);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Lock className="w-6 h-6 text-blue-600" />
          Security & Account Protection
        </h1>
        <p className="text-xs text-slate-500">
          Manage your hospital portal credentials, session tokens, and authentication safeguards.
        </p>
      </div>

      {/* Change Password Card */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            Change Portal Password
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Current Password</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">New Password</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <Button type="submit" size="md" className="font-bold text-xs">
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 2FA Toggle & Active Session */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Two-Factor Authentication & Active Session
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-xs text-slate-800 block">
                Two-Factor SMS Verification
              </span>
              <span className="text-[11px] text-slate-500">
                Receive an OTP code on your registered mobile when booking tokens.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTwoFactor(!twoFactor)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                twoFactor ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  twoFactor ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="text-xs text-slate-500 pt-2 flex items-center justify-between border-t border-slate-100">
            <span>Current Device Session: <strong>Active (Secure HTTP-Only Cookie)</strong></span>
            <span className="text-emerald-600 font-bold">Encrypted</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
