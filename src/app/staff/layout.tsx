import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PortalLayout } from "@/components/layout/PortalLayout";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Guard: allow staff, doctor, or admin
  if (!user || (user.role !== "staff" && user.role !== "doctor" && user.role !== "admin")) {
    redirect("/login?role=staff");
  }

  return (
    <PortalLayout role={user.role === "doctor" ? "doctor" : "staff"} user={user}>
      {children}
    </PortalLayout>
  );
}
