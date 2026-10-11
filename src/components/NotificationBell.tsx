"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Clock, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";
import { AppNotification } from "@/lib/types";

interface NotificationBellProps {
  userId?: string;
  role?: string;
}

export function NotificationBell({ userId = "usr-patient", role = "patient" }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s auto refresh
    return () => clearInterval(interval);
  }, [userId, role]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
    } catch {
      // ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "TOKEN_CALLED":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "EMERGENCY_ALERT":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "BILL_GENERATED":
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="In-App Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-900">In-App Notifications</span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {unreadCount} Unread
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-600">All caught up!</p>
                  <p>No new notifications right now.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 text-xs transition-colors flex items-start justify-between gap-3 ${
                      !n.isRead ? "bg-blue-50/40" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white border border-slate-100 shadow-2xs mt-0.5">
                        {getIcon(n.type)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${!n.isRead ? "text-blue-900" : "text-slate-900"}`}>
                            {n.title}
                          </span>
                          {n.priority === "URGENT" && (
                            <span className="text-[9px] font-black uppercase px-1 rounded bg-red-100 text-red-700">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400 block pt-0.5">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead(n.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 shrink-0"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
