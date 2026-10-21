import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

/** URL interne de l'API Spring Boot, lue uniquement côté serveur. */
const API_URL = process.env.API_URL ?? "http://localhost:8080";

/**
 * Délai des appels qui interrogent la base (hébergée chez Supabase, donc à distance) : assez long
 * pour qu'un réseau lent ralentisse la page au lieu de la faire échouer, assez court pour ne pas
 * bloquer le rendu si l'API est réellement indisponible.
 */
const DATA_TIMEOUT_MS = 12_000;

export type ApiHealth = "UP" | "DOWN" | "UNREACHABLE";

export type CurrentUser = {
  id: number;
  username: string;
  displayName: string;
  email: string;
  expertiseLevel: "BEGINNER" | "INTERMEDIATE" | "EXPERT";
  roles: string[];
  emailVerified: boolean;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

export async function getApiHealth(): Promise<ApiHealth> {
  try {
    const res = await fetch(`${API_URL}/actuator/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    const body = (await res.json()) as { status?: string };
    return body.status === "UP" ? "UP" : "DOWN";
  } catch {
    return "UNREACHABLE";
  }
}

/** Membre connecté pour la requête en cours (null si anonyme) ; un seul appel par rendu. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const accessToken = (await cookies()).get("access_token")?.value;
  if (!accessToken) return null;
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { cookie: `access_token=${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(DATA_TIMEOUT_MS),
    });
    return res.ok ? ((await res.json()) as CurrentUser) : null;
  } catch {
    return null;
  }
});

/**
 * Lecture côté serveur (composants serveur) : transmet le cookie de session du membre.
 * Renvoie null pour 401/403/404 ; lève une erreur pour les autres échecs.
 */
export async function apiGet<T>(path: string): Promise<T | null> {
  const accessToken = (await cookies()).get("access_token")?.value;
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: accessToken ? { cookie: `access_token=${accessToken}` } : {},
    cache: "no-store",
    signal: AbortSignal.timeout(DATA_TIMEOUT_MS),
  });
  if ([401, 403, 404].includes(res.status)) return null;
  if (!res.ok) throw new Error(`API ${path} : ${res.status}`);
  return (await res.json()) as T;
}

export function isAdmin(user: CurrentUser | null): boolean {
  return !!user && user.roles.includes("ADMIN");
}

export function isCreator(user: CurrentUser | null): boolean {
  return !!user && (user.roles.includes("CREATOR") || user.roles.includes("ADMIN"));
}

/** Fournisseurs OAuth configurés côté API (« google », « github »). */
export async function getAuthProviders(): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/api/auth/providers`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    return res.ok ? ((await res.json()) as string[]) : [];
  } catch {
    return [];
  }
}
