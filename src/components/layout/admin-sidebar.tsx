"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  Building2,
  FolderKanban,
  Mail,
  Newspaper,
  UserRound,
} from "lucide-react";
import logoVpa from "../../../logovpa.webp";
import logoVpaCorto from "../../../logovpacorto.webp";
import { logoutAction } from "@/features/auth/auth.actions";
import { MobileTopbarMenu } from "@/components/layout/mobile-topbar-menu";
import { adminNavigation } from "@/lib/navigation";
import type { Database } from "@/lib/supabase/types";

const icons = {
  "/admin/propiedades": Building2,
  "/admin/proyectos": FolderKanban,
  "/admin/asesores": UserRound,
  "/admin/noticias": Newspaper,
  "/admin/consultas": Mail,
};

interface AdminSidebarProps {
  newInquiriesCount: number;
  profile: Database["public"]["Tables"]["profiles"]["Row"];
}

export function AdminSidebar(_props: AdminSidebarProps) {
  void _props;
  const pathname = usePathname();
  const activeHref = useMemo(
    () =>
      adminNavigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
        ?.href ?? null,
    [pathname],
  );

  return (
    <>
      <MobileTopbarMenu
        closeOnPanelInteract
        closeLabel="Cerrar menu admin"
        headerClassName="!fixed inset-x-0 top-0 !z-50"
        key={pathname}
        lockScroll
        logo={
          <Link className="flex items-center" href="/admin/propiedades">
            <Image
              alt="VPA"
              className="h-auto w-64"
              priority
              src={logoVpa}
            />
          </Link>
        }
        openLabel="Abrir menu admin"
        overlayClassName="fixed inset-x-0 top-20 z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-white/15 bg-primary/98 backdrop-blur"
        panel={
          <div className="shell py-4">
            <div className="border-b border-white/15 pb-4">
              <p className="type-body-compact text-center font-bold uppercase tracking-[0.16em] text-white">
                Panel Administrativo
              </p>
            </div>
            <nav className="flex flex-col gap-2 py-4">
              {adminNavigation.map((item) => {
                const Icon = icons[item.href];
                const isActive = activeHref === item.href;

                return (
                  <Link
                    key={item.href}
                    className={`type-button flex items-center gap-3 rounded-2xl px-4 py-3 text-white transition-colors ${
                      isActive
                        ? "bg-white/16 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                        : "hover:bg-white/10 hover:text-white/78"
                    }`}
                    href={item.href}
                  >
                    <Icon className="h-[18px] w-[18px] stroke-[2.3] text-white" />
                    <span className="text-white">{item.label}</span>
                    {item.href === "/admin/consultas" && _props.newInquiriesCount > 0 ? (
                      <span className="type-micro ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 font-bold leading-none text-primary">
                        {_props.newInquiriesCount}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-white/15 pt-4">
              <Link
                aria-label="Ir al sitio web"
                className="type-button flex w-full items-center justify-center gap-3 px-2 py-2 text-white/88 transition-colors hover:text-white"
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
              <div className="my-4 border-t border-white/15" />
              <form action={logoutAction}>
                <button
                  className="type-button flex w-full justify-center rounded-full border border-white/20 bg-white/8 px-6 py-3 text-white transition-colors hover:bg-white/14"
                  type="submit"
                >
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        }
      />

      <aside className="hidden border-b border-primary/20 bg-primary lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex h-full w-full flex-col">
          <div className="border-b border-white/15 bg-primary px-6 py-6">
            <div className="flex justify-center">
              <Image
                alt="VPA"
                className="h-auto w-44"
                priority
                src={logoVpaCorto}
              />
            </div>
            <p className="type-body-compact mt-5 text-center font-bold uppercase tracking-[0.16em] text-white">
              Panel Administrativo
            </p>
          </div>
          <nav className="flex flex-col gap-2 p-4">
            {adminNavigation.map((item) => {
              const Icon = icons[item.href];
              const isActive = activeHref === item.href;

              return (
                <Link
                  key={item.href}
                  className={`type-button flex items-center gap-3 rounded-2xl px-4 py-3 text-white transition-colors ${
                    isActive
                      ? "hover:bg-white/12 lg:bg-white/16 lg:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] lg:hover:bg-white/22"
                      : "hover:bg-white/12 hover:text-white"
                  }`}
                  href={item.href}
                >
                  <Icon className="h-[18px] w-[18px] stroke-[2.3] text-white" />
                  <span className="text-white">{item.label}</span>
                  {item.href === "/admin/consultas" && _props.newInquiriesCount > 0 ? (
                    <span className="type-micro ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 font-bold leading-none text-primary">
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
                className="type-button flex w-full items-center justify-center gap-3 px-2 py-2 text-white/88 transition-colors hover:text-white"
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
                className="type-button flex w-full justify-center rounded-full border border-white/20 bg-white/8 px-6 py-3 text-white transition-colors hover:bg-white/14"
                type="submit"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
