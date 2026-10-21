import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Forum" };

export default function Page() {
  return <ComingSoon title="Forum" step={6} summary="Sujets par catégorie et par tag, votes, réponse acceptée, Markdown, code et LaTeX." />;
}
