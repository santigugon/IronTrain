import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CheckSquare, ChartPie } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/today", label: "Today", icon: CheckSquare },
  { href: "/summary", label: "Summary", icon: ChartPie },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md px-4 pb-[max(env(safe-area-inset-bottom),12px)]">
      <div className="glass flex items-center justify-between rounded-2xl px-3 py-2 shadow-lg">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs transition",
                active
                  ? "bg-white/15 text-foreground"
                  : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

