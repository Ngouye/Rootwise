"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "cn";
import { siteConfig } from "@/config/site";

/** Liens principaux ; la pastille de la page active glisse d'un lien à l'autre. */
export function NavLinks({ vertical = false }: { vertical?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation principale" className={cn("flex gap-1", vertical && "flex-col")}>
      {siteConfig.nav.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
              active && "text-primary hover:text-primary",
              vertical && "rounded-xl px-3 py-3 text-base",
            )}
          >
            {active && (
              <motion.span
                layoutId={vertical ? "nav-pill-mobile" : "nav-pill"}
                className="absolute inset-0 -z-10 rounded-[inherit] bg-primary/10"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="flex items-center justify-between gap-3">
              {item.label}
              {!item.ready && vertical && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">Bientôt</span>
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
