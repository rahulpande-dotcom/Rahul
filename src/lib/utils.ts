import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Token, TokenPriority, TokenStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUHID(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `QL-${year}-${random}`;
}

export function generateTokenNumber(departmentCode: string, isEmergency = false, priority: TokenPriority = "NORMAL"): string {
  const randomNum = Math.floor(100 + Math.random() * 900);
  if (isEmergency || priority === "EMERGENCY") {
    return `EMG-${Math.floor(10 + Math.random() * 90)}`;
  }
  return `OPD-${departmentCode.toUpperCase()}-${randomNum}`;
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString?: string): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function calculateWaitTime(
  queuePosition: number,
  avgConsultationMins: number = 12,
  priority: TokenPriority = "NORMAL"
): number {
  if (priority === "EMERGENCY") return 0;
  if (queuePosition <= 1) return 2;
  const positionFactor = priority === "SENIOR_CITIZEN" ? Math.max(1, queuePosition - 2) : queuePosition - 1;
  return Math.max(2, positionFactor * avgConsultationMins);
}

export function getStatusBadgeClass(status: TokenStatus): string {
  switch (status) {
    case "WAITING":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "CALLED":
      return "bg-blue-100 text-blue-800 border-blue-300 animate-pulse";
    case "IN_CONSULTATION":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "CANCELLED":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "NO_SHOW":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export function getPriorityBadgeClass(priority: TokenPriority): string {
  switch (priority) {
    case "EMERGENCY":
      return "bg-red-600 text-white font-bold animate-pulse";
    case "SENIOR_CITIZEN":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "NORMAL":
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}
