import {
  Activity,
  Atom,
  FileBadge,
  Hash,
  KeyRound,
  Lock,
  Network,
  Orbit,
  Package,
  PenLine,
  ShieldCheck,
  SquareTerminal,
  Terminal,
  Users,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  aes: Lock,
  rsa: KeyRound,
  ecc: Orbit,
  hachage: Hash,
  signature: PenLine,
  pki: FileBadge,
  tls: ShieldCheck,
  "post-quantique": Atom,
  linux: Terminal,
  bash: SquareTerminal,
  reseau: Network,
  paquets: Package,
  supervision: Activity,
  comptes: Users,
};

/** Pictogramme d'un thème de cours (repli : bouclier). */
export function TopicIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = ICONS[slug] ?? ShieldCheck;
  return <Icon className={className} aria-hidden />;
}
