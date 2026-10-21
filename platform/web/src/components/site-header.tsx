import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeaderShell } from "@/components/header-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser, isCreator } from "@/lib/api";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <HeaderShell
      actions={
        <>
          <ThemeToggle />
          {user ? (
            <UserMenu
              displayName={user.displayName}
              username={user.username}
              avatarUrl={user.avatarUrl}
              creator={isCreator(user)}
            />
          ) : (
            <>
              <Link href="/connexion" className={buttonVariants({ variant: "ghost", className: "hidden rounded-full px-4 sm:inline-flex" })}>
                Connexion
              </Link>
              <Link href="/inscription" className={buttonVariants({ className: "group hidden rounded-full px-4 sm:inline-flex" })}>
                Commencer
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" data-icon="inline-end" aria-hidden />
              </Link>
            </>
          )}
        </>
      }
      mobileExtra={
        user ? null : (
          <div className="grid grid-cols-2 gap-2 border-t pt-3">
            <Link href="/connexion" className={buttonVariants({ variant: "outline", size: "lg", className: "rounded-xl" })}>
              Connexion
            </Link>
            <Link href="/inscription" className={buttonVariants({ size: "lg", className: "rounded-xl" })}>
              Créer un compte
            </Link>
          </div>
        )
      }
    />
  );
}
