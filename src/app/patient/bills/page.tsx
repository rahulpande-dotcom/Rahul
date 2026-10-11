"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Bill } from "@/lib/types";

export default function PatientBillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const fetchBills = async () => {
    try {
      const res = await fetch("/api/bills?patientId=usr-patient");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBills(data);
      }
    } catch (err) {
      console.error("Failed to fetch bills:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handlePayNow = async (billId: string, amount: number) => {
    setPayingBillId(billId);
    setPaymentSuccess(null);
    try {
      const res = await fetch("/api/bills/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId,
          amount,
          paymentMethod: "UPI",
          paymentReference: `UPI-PAT-${Math.floor(100000 + Math.random() * 900000)}`,
          notes: "Digital self-service payment via patient portal",
        }),
      });
      if (res.ok) {
        setPaymentSuccess(`Payment of ₹${amount.toLocaleString("en-IN")} completed successfully!`);
        fetchBills();
      }
    } catch {
      // ignore
    } finally {
      setPayingBillId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            Itemized Medical Bills & Invoices
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            View transparent encounter billing breakdown in Indian Rupees (₹), verified consultation fees, and download official PDF tax invoices.
          </p>
        </div>
      </div>

      {paymentSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{paymentSuccess}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No medical bills found</h3>
          <p className="text-xs text-slate-500">You do not have any invoices pending or generated yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => {
            const isExpanded = expandedBillId === bill.id;
            return (
              <div
                key={bill.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-slate-900">{bill.billNumber}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          bill.paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : bill.paymentStatus === "PARTIAL"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {bill.paymentStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      {bill.departmentName} • {bill.attendingDoctorName} • Date: {bill.billDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">TOTAL PAYABLE</span>
                      <span className="text-lg font-black text-slate-900">
                        ₹{bill.totalPayable.toLocaleString("en-IN")}
                      </span>
                      {bill.balanceDue > 0 && (
                        <span className="text-[11px] font-bold text-red-600 block">
                          Due: ₹{bill.balanceDue.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/reports/generate-pdf?type=bill&billId=${bill.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        title="Download PDF Bill"
                      >
                        <Download className="w-4 h-4 text-emerald-600" />
                        <span className="hidden sm:inline">PDF</span>
                      </a>

                      {bill.balanceDue > 0 && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white"
                          disabled={payingBillId === bill.id}
                          onClick={() => handlePayNow(bill.id, bill.balanceDue)}
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1" />
                          Pay ₹{bill.balanceDue.toLocaleString("en-IN")}
                        </Button>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedBillId(isExpanded ? null : bill.id)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Itemized Breakdown */}
                {isExpanded && (
                  <div className="bg-slate-50/80 border-t border-slate-100 p-5 space-y-4 text-xs">
                    <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Itemized Encounter Charges Breakdown
                    </div>

                    <div className="divide-y divide-slate-200/60 bg-white rounded-xl border border-slate-200 overflow-hidden">
                      {bill.items.map((it, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-slate-700">
                          <div>
                            <span className="font-bold text-slate-900 block">{it.itemDescription}</span>
                            <span className="text-[10px] text-slate-400">
                              Category: {it.category} • Qty: {it.quantity} @ ₹{it.unitPrice.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <span className="font-extrabold text-slate-900">
                            ₹{it.totalPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-500 pt-2 gap-2">
                      <div>
                        {bill.discountAmount > 0 && (
                          <span className="text-emerald-700 font-semibold block">
                            Discount applied: -₹{bill.discountAmount.toLocaleString("en-IN")} ({bill.discountReason || "Authorized Waiver"})
                          </span>
                        )}
                        <span>Subtotal: ₹{bill.subtotal.toLocaleString("en-IN")} • GST: ₹{bill.taxAmount} (Exempt healthcare)</span>
                      </div>
                      <div className="font-bold text-slate-700">
                        Paid: ₹{bill.amountPaid.toLocaleString("en-IN")} | Balance: ₹{bill.balanceDue.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
