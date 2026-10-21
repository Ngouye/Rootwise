import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Blog et veille" };

export default function Page() {
  return <ComingSoon title="Blog et veille" step={8} summary="Articles de fond de la communauté et flux d'actualités cybersécurité." />;
}
