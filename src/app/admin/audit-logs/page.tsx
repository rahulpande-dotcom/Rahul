import React from "react";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/Card";
import { History, ShieldCheck, Search } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function AdminAuditLogsPage() {
  const auditLogs = await db.getAuditLogs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Security & Compliance Audit Trail ({auditLogs.length})
          </h1>
          <p className="text-xs text-slate-500">
            Immutable system logs recording user logins, token state changes, emergency intakes, and medical records.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3">Action Type</th>
                  <th className="px-5 py-3">Actor / Role</th>
                  <th className="px-5 py-3">Entity Type & ID</th>
                  <th className="px-5 py-3">Audit Details</th>
                  <th className="px-5 py-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 text-slate-500 font-sans">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">
                      {log.action}
                    </td>
                    <td className="px-5 py-3 font-sans">
                      <div className="font-semibold text-slate-800">{log.actorEmail}</div>
                      <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-50 px-1.5 py-0.2 rounded">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-sans">
                      <span className="font-bold text-slate-700">{log.entityType}</span>
                      <div className="text-[11px] text-slate-400 font-mono">{log.entityId}</div>
                    </td>
                    <td className="px-5 py-3 font-sans text-slate-600 max-w-sm">
                      {log.details}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-400 font-mono">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
