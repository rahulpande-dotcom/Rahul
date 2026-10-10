import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TokenCard } from "@/components/queue/TokenCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Ticket, PlusCircle, Clock, CheckCircle2 } from "lucide-react";

export default async function MyTokensPage() {
  const user = await getCurrentUser();
  const allTokens = await db.getTokens();

  const myTokens = allTokens.filter(
    (t) =>
      (user?.id && t.patientId === user.id) ||
      (user?.name && t.patientName.toLowerCase() === user.name.toLowerCase())
  );

  const activeTokens = myTokens.filter(
    (t) => t.status === "WAITING" || t.status === "CALLED" || t.status === "IN_CONSULTATION"
  );
  const pastTokens = myTokens.filter(
    (t) => t.status === "COMPLETED" || t.status === "CANCELLED" || t.status === "NO_SHOW"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-blue-600" />
            My Hospital Tokens
          </h1>
          <p className="text-xs text-slate-500">
            View active OPD queue numbers and past token consultations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/patient/queue-status">
            <Button variant="outline" size="sm" className="font-bold text-xs">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Live Queue Tracker
            </Button>
          </Link>
          <Link href="/patient/book-appointment">
            <Button size="sm" className="font-bold text-xs shadow-xs">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Book New Token
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Tokens */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          Active In-Queue Tokens ({activeTokens.length})
        </h2>

        {activeTokens.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="p-8 text-center text-xs text-slate-500">
              You currently have no active tokens in the OPD queue. Click &quot;Book New Token&quot; above to schedule one.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTokens.map((token) => (
              <TokenCard key={token.id} token={token} isCurrentPatient={true} />
            ))}
          </div>
        )}
      </div>

      {/* Past Tokens */}
      <div className="space-y-3 pt-6 border-t border-slate-200">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-slate-400" />
          Past Tokens & Completed Encounters ({pastTokens.length})
        </h2>

        {pastTokens.length === 0 ? (
          <div className="text-xs text-slate-400 py-3">No past completed tokens on file.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastTokens.map((token) => (
              <TokenCard key={token.id} token={token} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
