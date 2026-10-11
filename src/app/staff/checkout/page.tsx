import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  ClipboardList,
  Download,
  CheckCircle2,
  Clock,
  Printer,
  Receipt,
  FileText,
  CreditCard,
  Building2,
} from "lucide-react";
import { formatTimeOnly } from "@/lib/utils";

export default async function StaffCheckoutPage() {
  const [visits, bills] = await Promise.all([
    db.getVisits(),
    db.getBills(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          Discharge & Itemized Billing Checkout Desk
        </h1>
        <p className="text-xs text-slate-500">
          Verify consultation timestamps, generate itemized bills (INR ₹), and print official discharge summaries and certified invoices.
        </p>
      </div>

      {/* Itemized Bills Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Active Hospital Invoices & Itemized Bills ({bills.length})
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Standard Currency: INR (₹)
          </span>
        </div>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Bill # & Date</th>
                    <th className="px-5 py-3">Patient Name & ID</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Line Items</th>
                    <th className="px-5 py-3">Total Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">PDF Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="font-mono font-bold text-blue-600">{bill.billNumber}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(bill.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-900">{bill.patientName}</div>
                        <div className="font-mono text-slate-400 text-[11px]">{bill.patientId}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-700 font-medium">
                        {bill.departmentName}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        <span className="font-semibold">{bill.items.length} items</span>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {bill.items.map((i) => i.itemDescription || (i as any).description || "Service").join(", ")}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-mono font-black text-slate-900">
                          ₹{(bill.totalPayable ?? bill.totalAmount ?? 0).toLocaleString("en-IN")}
                        </div>
                        {bill.balanceDue > 0 ? (
                          <div className="text-[10px] text-rose-600 font-semibold">
                            Due: ₹{(bill.balanceDue || 0).toLocaleString("en-IN")}
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-semibold">Fully Paid</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[10px] border ${
                            bill.status === "PAID"
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : bill.status === "PARTIALLY_PAID"
                              ? "text-amber-700 bg-amber-50 border-amber-200"
                              : "text-rose-700 bg-rose-50 border-rose-200"
                          }`}
                        >
                          {bill.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <a
                          href={`/api/reports/generate-pdf?type=bill&billId=${bill.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline" className="text-xs font-bold py-1 px-2.5 h-auto text-indigo-700 border-indigo-200 hover:bg-indigo-50">
                            <Download className="w-3.5 h-3.5 mr-1" />
                            Bill PDF
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))}
                  {bills.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-6 text-center text-slate-400 text-xs">
                        No billing invoices recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Encounters & Discharge Summaries */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">
            Clinical Encounters & Discharge Summaries ({visits.length})
          </h2>
        </div>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-5 py-3">Visit & Token #</th>
                    <th className="px-5 py-3">Patient Name & UHID</th>
                    <th className="px-5 py-3">Attending Doctor</th>
                    <th className="px-5 py-3">Clinical Diagnosis</th>
                    <th className="px-5 py-3">Timestamps (In → Consult → Out)</th>
                    <th className="px-5 py-3">Consultation Fee</th>
                    <th className="px-5 py-3 text-right">Certified Reports</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visits.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-900">{v.visitNumber}</div>
                        <div className="font-mono text-blue-600 text-[11px]">{v.tokenNumber}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-bold text-slate-900">{v.patientName}</div>
                        <div className="font-mono text-slate-400 text-[11px]">{v.uhid}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-700 font-medium">
                        {v.doctorName}
                      </td>
                      <td className="px-5 py-3 text-slate-600 max-w-xs truncate">
                        {v.diagnosis}
                      </td>
                      <td className="px-5 py-3 text-slate-500 font-mono text-[11px]">
                        {formatTimeOnly(v.checkInTimestamp)} → {formatTimeOnly(v.consultationTimestamp)} → {formatTimeOnly(v.checkoutTimestamp)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                          ₹{v.billingAmount} {v.billingStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/api/reports/generate-pdf?type=encounter&visitId=${v.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" className="text-[11px] font-bold py-1 px-2 h-auto text-blue-700 border-blue-200">
                              <Download className="w-3 h-3 mr-1" />
                              Encounter
                            </Button>
                          </a>
                          <a
                            href={`/api/reports/generate-pdf?type=discharge&visitId=${v.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" className="text-[11px] font-bold py-1 px-2 h-auto text-purple-700 border-purple-200">
                              <Download className="w-3 h-3 mr-1" />
                              Discharge
                            </Button>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {visits.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-6 text-center text-slate-400 text-xs">
                        No clinical visits recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
