import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Chat" };

export default function Page() {
  return <ComingSoon title="Chat" step={5} summary="Salons #general, #aide-crypto, #veille-secu et #annonces, messages privés et présence en temps réel." />;
}
