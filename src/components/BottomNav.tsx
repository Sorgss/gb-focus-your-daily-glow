import { Link } from "@tanstack/react-router";
import { Flame, ListChecks, Dumbbell, Apple, Wallet } from "lucide-react";

const tabs = [
  { to: "/", label: "Hábitos", icon: Flame },
  { to: "/tarefas", label: "Metas", icon: ListChecks },
  { to: "/treinos", label: "Treinos", icon: Dumbbell },
  { to: "/dieta", label: "Dieta", icon: Apple },
  { to: "/financas", label: "Finanças", icon: Wallet },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors"
              activeProps={{ className: "!text-primary" }}
            >
              <Icon className="size-5" strokeWidth={2.2} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
