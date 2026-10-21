"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, LogOut, PencilRuler, UserRound } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch } from "@/lib/client-api";

type UserMenuProps = { displayName: string; username: string; avatarUrl: string | null; creator: boolean };

export function UserMenu({ displayName, username, avatarUrl, creator }: UserMenuProps) {
  const router = useRouter();

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({
          variant: "outline",
          className: "h-9 gap-2 rounded-full bg-card pr-3 pl-1 shadow-soft",
        })}
      >
        <Avatar name={displayName} src={avatarUrl} className="size-7 text-[0.65rem]" />
        <span className="hidden max-w-32 truncate sm:inline">{displayName}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {/* Base UI : un libellé de menu doit appartenir à un groupe. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-mono text-xs text-muted-foreground">@{username}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/mes-cours")}>
            <GraduationCap aria-hidden /> Mes cours
          </DropdownMenuItem>
          {creator && (
            <DropdownMenuItem onClick={() => router.push("/studio")}>
              <PencilRuler aria-hidden /> Studio
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => router.push("/compte")}>
            <UserRound aria-hidden /> Mon compte
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>
            <LogOut aria-hidden /> Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
