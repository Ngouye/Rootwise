import { cn } from "cn";

type AvatarProps = {
  name: string;
  src?: string | null;
  className?: string;
};

/** Photo de profil ronde ; à défaut, les initiales sur un dégradé de la marque. */
export function Avatar({ name, src, className }: AvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- image servie par l'API
    <img src={src} alt={name} className={cn("size-10 shrink-0 rounded-full object-cover", className)} />
  ) : (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[oklch(0.45_0.08_240)] text-sm font-bold text-primary-foreground",
        className,
      )}
    >
      {initials || "?"}
    </span>
  );
}
