import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PortalLayout } from "@/components/layout/PortalLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Server-side authorization check: Admin only
  if (!user || user.role !== "admin") {
    redirect("/login?role=admin");
  }

  return (
    <PortalLayout role="admin" user={user}>
      {children}
    </PortalLayout>
  );
}
