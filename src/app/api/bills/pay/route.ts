import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { billId, amount, paymentMethod, paymentReference, notes } = body;

    if (!billId || typeof amount !== "number" || amount <= 0 || !paymentMethod) {
      return NextResponse.json(
        { error: "billId, valid numeric amount > 0, and paymentMethod are required" },
        { status: 400 }
      );
    }

    const updatedBill = await db.recordBillPayment(billId, {
      amount,
      paymentMethod,
      paymentReference,
      notes,
    });

    return NextResponse.json(updatedBill);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record payment" }, { status: 400 });
  }
}
