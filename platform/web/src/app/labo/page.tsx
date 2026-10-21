import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Labo crypto" };

export default function Page() {
  return <ComingSoon title="Labo crypto" step={7} summary="Génération de clés, chiffrement AES et RSA, hachage et signatures, sans rien stocker." />;
}
