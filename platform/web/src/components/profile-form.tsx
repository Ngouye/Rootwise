"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, CheckCircle2, LoaderCircle, Trash2 } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiFetch, apiUpload } from "@/lib/client-api";

type Profile = { displayName: string; headline: string | null; bio: string | null; avatarUrl: string | null };

/** Photo de profil, nom affiché, titre et présentation (visibles sur les cours d'un formateur). */
export function ProfileForm({ initial }: { initial: Profile }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function changePhoto(file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ ok: false, text: "La photo dépasse 5 Mo." });
      return;
    }
    setUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const updated = await apiUpload<Profile>("/me/avatar", form);
      setProfile((current) => ({ ...current, avatarUrl: updated.avatarUrl }));
      setMessage({ ok: true, text: "Photo mise à jour." });
      router.refresh();
    } catch (error) {
      setMessage({ ok: false, text: error instanceof ApiError ? error.message : "Envoi impossible." });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function removePhoto() {
    setUploading(true);
    try {
      await apiFetch("/me/avatar", { method: "DELETE" });
      setProfile((current) => ({ ...current, avatarUrl: null }));
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setErrors({});
    try {
      await apiFetch("/me/profile", {
        method: "PUT",
        body: { displayName: profile.displayName, headline: profile.headline, bio: profile.bio },
      });
      setMessage({ ok: true, text: "Profil enregistré." });
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors);
        setMessage({ ok: false, text: error.message });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <span className="relative rounded-full bg-gradient-to-br from-primary to-[oklch(0.7_0.12_205)] p-1">
          <Avatar name={profile.displayName} src={profile.avatarUrl} className="size-24 text-2xl ring-4 ring-card" />
          {uploading && (
            <span className="absolute inset-1 flex items-center justify-center rounded-full bg-black/45 text-white">
              <LoaderCircle className="size-6 animate-spin" aria-label="Envoi en cours" />
            </span>
          )}
        </span>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold">Photo de profil</p>
          <p className="text-xs text-muted-foreground">PNG, JPEG ou WebP, 5 Mo au plus. Elle s&apos;affiche sur vos cours et vos leçons.</p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              id="photo"
              onChange={(event) => changePhoto(event.target.files?.[0])}
            />
            <Button type="button" variant="outline" className="rounded-xl" disabled={uploading} onClick={() => fileInput.current?.click()}>
              <Camera aria-hidden /> {profile.avatarUrl ? "Changer la photo" : "Ajouter une photo"}
            </Button>
            {profile.avatarUrl && (
              <Button type="button" variant="ghost" className="rounded-xl text-muted-foreground" disabled={uploading} onClick={removePhoto}>
                <Trash2 aria-hidden /> Retirer
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom affiché" id="displayName" error={errors.displayName}>
          <Input
            id="displayName"
            value={profile.displayName}
            maxLength={50}
            required
            onChange={(event) => setProfile({ ...profile, displayName: event.target.value })}
          />
        </Field>
        <Field label="Titre professionnel" id="headline" error={errors.headline}>
          <Input
            id="headline"
            value={profile.headline ?? ""}
            maxLength={120}
            placeholder="Ex. : Ingénieur sécurité, formateur Linux"
            onChange={(event) => setProfile({ ...profile, headline: event.target.value })}
          />
        </Field>
      </div>
      <Field label="Présentation" id="bio" error={errors.bio} hint={`${(profile.bio ?? "").length} / 600`}>
        <Textarea
          id="bio"
          rows={5}
          maxLength={600}
          value={profile.bio ?? ""}
          placeholder="Quelques lignes sur votre parcours et votre façon d'enseigner."
          onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" className="h-11 rounded-xl px-6" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer le profil"}
        </Button>
        {message && (
          <p role="status" className={message.ok ? "flex items-center gap-1.5 text-sm text-primary" : "text-sm text-destructive"}>
            {message.ok && <CheckCircle2 className="size-4" aria-hidden />}
            {message.text}
          </p>
        )}
      </div>
    </form>
  );
}

function Field({ label, id, error, hint, children }: { label: string; id: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
