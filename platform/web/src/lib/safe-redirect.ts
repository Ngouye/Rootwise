/** N'accepte qu'un chemin interne (« /compte »), jamais une URL externe (« //site.com », « https:… »). */
export function safeRedirect(value: string | string[] | undefined, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
