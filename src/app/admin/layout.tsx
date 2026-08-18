import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { requireAdminSession } from "@/lib/supabase/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-surface lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row">
        <AdminSidebar profile={session.profile} />
        <main className="flex-1 lg:ml-72 lg:h-screen lg:overflow-y-auto">
          <div className="shell py-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
