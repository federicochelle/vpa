import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireAdminSession } from "@/lib/supabase/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-surface">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar profile={session.profile} />
        <main className="flex-1">
          <div className="shell py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
