"use client";

import Link from "next/link";
import type { Route } from "next";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  X,
} from "lucide-react";
import { navigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

function Brand() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 focus-visible:outline-primary rounded-xl"
      aria-label="GO Admin home"
    >
      <div className="go-logo-wrap"><Image src="/GO LOGO LIGHT.webp" alt="GO" width={40} height={40} className="go-logo go-logo-light" priority/><Image src="/GO LOGO DARK.webp" alt="" width={40} height={40} className="go-logo go-logo-dark" aria-hidden="true"/></div>
      <div>
        <strong className="block text-base font-bold tracking-tight text-navy">
          GO Admin
        </strong>
        <span className="text-xs font-medium text-muted">Operations & Intel</span>
      </div>
    </Link>
  );
}

export function AdminShell({ children, viewer }: { children: React.ReactNode; viewer: {name: string; email: string} }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => { document.documentElement.dataset.theme = themeMode; }, [themeMode]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMobileOpen(false);
        setNotificationsOpen(false);
        setUserOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const nav = (
    <nav aria-label="Primary" className="mt-6 flex-1 space-y-1">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "group flex min-h-11 items-center gap-3.5 rounded-2xl px-4 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary text-white shadow-[0_6px_18px_rgba(9,95,199,0.25)] font-semibold"
                : "text-muted hover:bg-surface-subtle hover:text-navy"
            )}
          >
            <Icon
              className={cn(
                "size-[18px] transition-transform group-hover:scale-110",
                active ? "text-white" : "text-muted group-hover:text-primary"
              )}
              aria-hidden="true"
            />
            {!sidebarCollapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className={cn("min-h-dvh bg-background lg:grid", sidebarCollapsed ? "lg:grid-cols-[84px_1fr]" : "lg:grid-cols-[260px_1fr]")}>
      {/* Desktop Sidebar */}
      <aside className={cn("hidden min-h-dvh flex-col justify-between border-r border-border bg-white py-6 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:overflow-y-auto scrollbar",sidebarCollapsed?"px-3":"px-5")}>
        <div>
          <div className="flex items-center justify-between pb-3">
            {!sidebarCollapsed && <Brand />}
            <button
              type="button"
              className="grid size-7 place-items-center rounded-full border border-border text-muted hover:border-slate-300 hover:text-navy transition"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setSidebarCollapsed((value) => !value)}
            >
            <ChevronLeft className={cn("size-4 transition-transform",sidebarCollapsed&&"rotate-180")} />
            </button>
          </div>
          {nav}
        </div>

        {/* Bottom utility links & Theme Switch */}
        <div className="mt-8 border-t border-border-subtle pt-5 space-y-3">
          <Link
            href="/docs"
            className="flex items-center gap-3.5 rounded-xl px-3.5 py-2 text-sm font-medium text-muted hover:bg-surface-subtle hover:text-navy transition"
          >
            <HelpCircle className="size-4 text-muted" />
            <span>Help & Docs</span>
          </Link>
          <Link
            href={"/auth/signout" as Route}
            className="flex items-center gap-3.5 rounded-xl px-3.5 py-2 text-sm font-medium text-muted hover:bg-surface-subtle hover:text-navy transition"
          >
            <LogOut className="size-4 text-muted" />
            <span>Log out</span>
          </Link>

          {/* Light / Dark Mode Toggle Pill */}
          <div className="pt-2">
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface-subtle p-1 w-fit">
              <button
                type="button"
                onClick={() => setThemeMode("light")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full transition-all",
                  themeMode === "light"
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted hover:text-navy"
                )}
                aria-label="Light mode"
              >
                <Sun className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setThemeMode("dark")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-full transition-all",
                  themeMode === "dark"
                    ? "bg-navy text-white shadow-sm"
                    : "text-muted hover:text-navy"
                )}
                aria-label="Dark mode"
              >
                <Moon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="flex h-full w-[min(86vw,300px)] flex-col justify-between overflow-y-auto bg-white px-5 py-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <Brand />
                <button
                  className="rounded-full p-2 text-muted hover:bg-surface-subtle"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="size-5" />
                </button>
              </div>
              {nav}
            </div>
            <div className="border-t border-border-subtle pt-4">
              <Link
                href="/docs"
                className="flex items-center gap-3 py-2 text-sm font-medium text-muted hover:text-navy"
              >
                <HelpCircle className="size-4" />
                <span>Help & Docs</span>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-border-subtle bg-white/90 px-5 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3 flex-1">
            <button
              className="grid size-10 place-items-center rounded-full border border-border text-muted hover:bg-surface-subtle lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>

            {/* Quick Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-full max-w-xs items-center gap-2.5 rounded-full border border-border bg-surface-subtle/70 px-4 text-left text-xs font-medium text-muted shadow-xs transition hover:bg-surface-subtle hover:border-slate-300 md:max-w-sm"
            >
              <Search className="size-4 text-muted" />
              <span className="truncate">Search records, events, members…</span>
              <kbd className="ml-auto hidden rounded-full border border-border bg-white px-2 py-0.5 font-mono text-[10px] text-muted sm:block">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Manage & Add Widget Action Buttons */}
            <div className="hidden items-center gap-2.5 sm:flex">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-surface-subtle transition active:scale-95"
              >
                <LayoutGrid className="size-3.5 text-muted" />
                <span>Manage widgets</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(9,95,199,0.28)] hover:bg-primary-hover transition active:scale-95"
              >
                <Plus className="size-3.5" />
                <span>Add new widget</span>
              </button>
            </div>

            {/* Circular Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen((open) => !open);
                  setUserOpen(false);
                }}
                className="grid size-10 place-items-center rounded-full border border-border bg-white text-muted hover:border-slate-300 hover:text-navy transition shadow-xs"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell className="size-4" />
                <span className="absolute top-2 right-2 size-2 rounded-full bg-danger ring-2 ring-white" />
              </button>
              {notificationsOpen && (
                <div
                  role="dialog"
                  aria-label="Notifications"
                  className="absolute right-0 top-12 w-80 rounded-2xl border border-border bg-white p-5 shadow-2xl z-50 animate-in fade-in zoom-in-95"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <h2 className="font-semibold text-navy text-sm">Notifications</h2>
                    <span className="text-[11px] rounded-full bg-primary-subtle px-2 py-0.5 font-bold text-primary">
                      1 unread
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="rounded-xl bg-surface-subtle p-3 text-xs">
                      <p className="font-semibold text-foreground">Welcome to GO Workspace</p>
                      <p className="text-muted mt-1">
                        Your GO workspace is ready for operations.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserOpen((open) => !open);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-3 rounded-full border border-border bg-white p-1.5 pr-3 hover:border-slate-300 transition shadow-xs"
                aria-label="Open user menu"
                aria-expanded={userOpen}
              >
                <div className="grid size-8 place-items-center rounded-full bg-navy text-xs font-bold text-white shadow-xs">
                  {viewer.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden text-left sm:block">
                  <strong className="block text-xs font-semibold leading-tight text-foreground">
                    {viewer.name}
                  </strong>
                  <span className="text-[11px] text-muted">{viewer.email}</span>
                </div>
                <ChevronDown className="size-3.5 text-muted ml-0.5" />
              </button>
              {userOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 w-60 rounded-2xl border border-border bg-white p-2 text-sm shadow-2xl z-50"
                >
                  <div className="px-3 py-2 border-b border-border-subtle">
                    <p className="font-semibold text-xs text-navy">{viewer.name}</p>
                    <p className="text-[11px] text-muted">GO workspace operator</p>
                  </div>
                  <Link
                    role="menuitem"
                    href="/settings"
                    className="block rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-subtle mt-1"
                  >
                    Account settings
                  </Link>
                  <Link
                    role="menuitem"
                    href={"/auth/signout" as Route}
                    className="block rounded-xl px-3 py-2 text-xs font-medium text-primary hover:bg-surface-subtle"
                  >
                    Switch account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 md:px-8 md:py-8"
        >
          {children}
        </main>
      </div>

      {/* Global Search Dialog */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-center bg-slate-950/40 p-4 pt-[12vh] backdrop-blur-xs"
          role="presentation"
          onClick={() => setSearchOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Workspace search"
            className="h-fit w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-white shadow-2xl animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-5">
              <Search className="size-5 text-muted" />
              <input
                autoFocus
                className="h-14 w-full text-sm outline-none placeholder:text-muted"
                placeholder="Search articles, campaigns, subscribers, settings…"
                aria-label="Search query"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-full bg-surface-subtle px-2.5 py-1 text-xs font-medium text-muted hover:bg-slate-200"
              >
                Esc
              </button>
            </div>
            <div className="p-6 text-center text-xs text-muted">
              <p className="font-medium text-foreground text-sm">Quick navigation</p>
              <p className="mt-1">
                Type any keyword to instantly filter reports, subscribers, or operational assets.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
