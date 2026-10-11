import { describe, it, expect } from "vitest";
import { db } from "../src/lib/db";
import { Bill, BillItem } from "../src/lib/types";

describe("Itemized Billing & Financial Ledger (INR ₹)", () => {
  it("retrieves seeded initial bills with correct currency and totals", async () => {
    const bills = await db.getBills();
    expect(bills.length).toBeGreaterThanOrEqual(1);

    const firstBill = bills[0];
    expect(firstBill.currency).toBe("INR");
    expect(firstBill.totalAmount).toBeGreaterThan(0);
    expect(firstBill.items.length).toBeGreaterThan(0);
  });

  it("calculates line items, taxes, discounts, and balance due accurately on the server", async () => {
    const testItems: BillItem[] = [
      {
        id: "bi-test-1",
        billId: "",
        category: "CONSULTATION",
        description: "Specialist OPD Consultation",
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500,
      },
      {
        id: "bi-test-2",
        billId: "",
        category: "DIAGNOSTIC_LAB",
        description: "Complete Blood Count (CBC) with ESR",
        quantity: 1,
        unitPrice: 650,
        totalPrice: 650,
      },
      {
        id: "bi-test-3",
        billId: "",
        category: "PHARMACY",
        description: "Essential Antibiotic Course",
        quantity: 2,
        unitPrice: 200,
        totalPrice: 400,
      },
    ];

    const createdBill = await db.createBill({
      billNumber: `TEST-BILL-${Date.now()}`,
      patientId: "usr-patient",
      patientName: "Rahul Sharma",
      hospitalId: "hosp-queueless-blr",
      hospitalName: "QueueLess Medical Center & Research Institute",
      departmentName: "General Medicine",
      items: testItems,
      discountAmount: 250,
      discountReason: "Senior Citizen Hospital Subsidy",
      taxAmount: 0,
    });

    // Subtotal: 1500 + 650 + 400 = 2550
    expect(createdBill.subtotal).toBe(2550);
    // Total: 2550 - 250 = 2300
    expect(createdBill.totalAmount).toBe(2300);
    expect(createdBill.amountPaid).toBe(0);
    expect(createdBill.balanceDue).toBe(2300);
    expect(createdBill.status).toBe("PENDING");
  });

  it("records bill payment and updates status from PENDING to PAID or PARTIALLY_PAID", async () => {
    const bills = await db.getBills();
    const pendingBill = bills.find((b) => b.status === "PENDING") || bills[0];

    const partialPayment = await db.recordBillPayment(pendingBill.id, 500);
    expect(partialPayment).toBeDefined();
    if (partialPayment && partialPayment.balanceDue > 0) {
      expect(partialPayment.status).toMatch(/PARTIAL/);
    }

    const fullPayment = await db.recordBillPayment(pendingBill.id, partialPayment ? partialPayment.balanceDue : pendingBill.totalAmount!);
    expect(fullPayment).toBeDefined();
    if (fullPayment) {
      expect(fullPayment.balanceDue).toBe(0);
      expect(fullPayment.status).toBe("PAID");
    }
  });
});
