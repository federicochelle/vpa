"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FolderKanban,
  LayoutDashboard,
  Mail,
  Newspaper,
  Settings,
} from "lucide-react";
import logoVpaCorto from "../../../logovpacorto.webp";
import { logoutAction } from "@/features/auth/auth.actions";
import { adminNavigation } from "@/lib/navigation";
import type { Database } from "@/lib/supabase/types";

const icons = {
  "/admin": LayoutDashboard,
  "/admin/propiedades": Building2,
  "/admin/proyectos": FolderKanban,
  "/admin/noticias": Newspaper,
  "/admin/consultas": Mail,
  "/admin/configuracion": Settings,
};

interface AdminSidebarProps {
  newInquiriesCount: number;
  profile: Database["public"]["Tables"]["profiles"]["Row"];
}

export function AdminSidebar(_props: AdminSidebarProps) {
  void _props;
  const pathname = usePathname();

  return (
    <aside className="border-b border-primary/20 bg-primary lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/15 bg-primary px-6 py-6">
          <div className="flex justify-center">
            <Image
              alt="VPA"
              className="h-auto w-44"
              priority
              src={logoVpaCorto}
            />
          </div>
          <p className="mt-5 text-center text-sm font-bold uppercase tracking-[0.16em] text-white">
            Panel Administrativo
          </p>
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
                    ? "hover:bg-white/12 lg:bg-white/16 lg:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] lg:hover:bg-white/22"
                    : "hover:bg-white/12 hover:text-white"
                }`}
                href={item.href}
              >
                <Icon className="h-[18px] w-[18px] stroke-[2.3] text-white" />
                <span className="text-white">{item.label}</span>
                {item.href === "/admin/consultas" && _props.newInquiriesCount > 0 ? (
                  <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[11px] font-bold leading-none text-primary">
                    {_props.newInquiriesCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4">
          <div>
            <Link
              aria-label="Ir al sitio web"
              className="flex w-full items-center justify-center gap-3 px-2 py-2 text-sm font-semibold text-white/88 transition-colors hover:text-white"
              href="/"
              rel="noreferrer"
              target="_blank"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7 17 17 7M9 7h8v8"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Ir al sitio web</span>
            </Link>
          </div>
          <div className="my-4 border-t border-white/15" />
          <form action={logoutAction}>
            <button
              className="flex w-full justify-center rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/14"
              type="submit"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
