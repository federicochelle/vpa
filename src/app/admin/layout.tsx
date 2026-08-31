import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { listAdminInquiries } from "@/features/inquiries/inquiries.data";
import { requireAdminSession } from "@/lib/supabase/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [session, inquiriesResult] = await Promise.all([
    requireAdminSession(),
    listAdminInquiries(),
  ]);
  const newInquiriesCount = inquiriesResult.ok
    ? inquiriesResult.data.filter((inquiry) => inquiry.status === "new").length
    : 0;

  return (
    <div className="min-h-dvh bg-surface">
      <div className="flex min-h-dvh flex-col lg:flex-row">
        <AdminSidebar newInquiriesCount={newInquiriesCount} profile={session.profile} />
        <main className="admin-panel min-h-0 flex-1 lg:ml-72">
          <div className="shell py-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
