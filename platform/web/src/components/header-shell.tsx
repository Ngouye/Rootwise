"use client";

import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "cn";
import { BrandLogo } from "@/components/brand-logo";
import { NavLinks } from "@/components/nav-links";

type HeaderShellProps = {
  /** Actions à droite (thème, connexion ou menu du membre). */
  actions: ReactNode;
  /** Liens supplémentaires du menu mobile (connexion, inscription…). */
  mobileExtra?: ReactNode;
};

/** En-tête collant : transparent en haut de page, verre dépoli et ombre dès qu'on défile. */
export function HeaderShell({ actions, mobileExtra }: HeaderShellProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState(pathname);

  // Le menu mobile se referme quand on change de page (état dérivé, sans effet).
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300",
        scrolled || open ? "border-border bg-background/80 shadow-soft backdrop-blur-xl" : "border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center gap-4">
        <BrandLogo />
        <div className="hidden flex-1 justify-center md:flex">
          <NavLinks />
        </div>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {actions}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="flex size-9 items-center justify-center rounded-full border bg-card text-foreground shadow-soft md:hidden"
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            key="menu-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t md:hidden"
          >
            <div className="container-page flex flex-col gap-3 py-4">
              <NavLinks vertical />
              {mobileExtra}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
