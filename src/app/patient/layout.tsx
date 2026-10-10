import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PortalLayout } from "@/components/layout/PortalLayout";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If no session, redirect to login
  if (!user) {
    redirect("/login?role=patient");
  }

  return (
    <PortalLayout role="patient" user={user}>
      {children}
    </PortalLayout>
  );
}
