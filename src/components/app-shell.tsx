"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertTriangle, Factory, LayoutDashboard, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/matrizes", label: "Matrizes", icon: Factory },
  { href: "/matrizes/nova", label: "Cadastro", icon: PlusSquare },
  { href: "/alertas", label: "Alertas", icon: AlertTriangle },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#134e4a_0%,#07111f_38%,#020617_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 lg:px-6">
        <header className="mb-6 flex flex-col gap-5 rounded-3xl border border-white/10 bg-slate-950/70 px-6 py-5 shadow-[0_12px_60px_rgba(0,0,0,0.24)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
              <Activity className="size-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                MoldGuard
              </p>
              <h1 className="text-2xl font-semibold text-white">
                Monitoramento industrial de matrizes
              </h1>
            </div>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            Plataforma de hackathon para leitura por ciclo, vida util, saude do ativo,
            OEE e alertas operacionais em tempo quase real.
          </p>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-white/10 bg-slate-950/65 p-4 shadow-[0_12px_50px_rgba(0,0,0,0.2)]">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-cyan-400/15 text-cyan-200"
                        : "text-slate-300 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
