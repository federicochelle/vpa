"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FolderKanban, LayoutDashboard, Mail, Settings } from "lucide-react";
import { logoutAction } from "@/features/auth/auth.actions";
import { adminNavigation } from "@/lib/navigation";
import { siteName } from "@/lib/site";
import type { Database } from "@/lib/supabase/types";

const icons = {
  "/admin": LayoutDashboard,
  "/admin/propiedades": Building2,
  "/admin/proyectos": FolderKanban,
  "/admin/consultas": Mail,
  "/admin/configuracion": Settings,
};

interface AdminSidebarProps {
  profile: Database["public"]["Tables"]["profiles"]["Row"];
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-primary/20 bg-primary lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/15 bg-primary px-6 py-6">
          <p className="font-display text-2xl tracking-[0.08em] text-white">{siteName}</p>
          <p className="mt-2 text-sm font-medium tracking-[0.06em] text-white/90">
            Panel administrativo
          </p>
          <div className="mt-4 space-y-1">
            <p className="text-sm font-semibold text-white">
              {profile.full_name ?? "Usuario administrador"}
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
              {profile.role}
            </p>
          </div>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {adminNavigation.map((item) => {
            const Icon = icons[item.href];
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-semibold text-white transition-colors ${
                  isActive
                    ? "bg-white/16 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] hover:bg-white/22"
                    : "hover:bg-white/12 hover:text-white"
                }`}
                href={item.href}
              >
                <Icon className="h-[18px] w-[18px] stroke-[2.3] text-white" />
                <span className="text-white">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/15 p-4">
          <form action={logoutAction}>
            <button
              className="flex w-full justify-center rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/14"
              type="submit"
            >
              Cerrar sesion
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
